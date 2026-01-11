const surveyModel = require("../models/surveyModel");
const surveyResponseModel = require("../models/surveyResponseModel");
const { Account } = require("../models/accountModel");
const UserError = require("../other/error");
const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');
const fs = require('fs');
const path = require('path');
const appConfig = require("../appConfig");
const datetime = require("../other/datetime");

exports.getAllSurveys = async (req, res, next) => {
    try {
        const surveys = await surveyModel.find()
            .populate('createdBy', 'email')
            .sort({ createdAt: -1 });
        
        res.json({ success: true, surveys });
    } catch (err) {
        next(err);
    }
};

exports.createSurvey = async (req, res, next) => {
    try {
        if (!req.session.user_id) {
            throw new UserError('Не авторизован', 'json');
        }

        const surveyData = {
            ...req.body,
            createdBy: req.session.user_id,
            status: req.body.status || 'draft'
        };

        const survey = new surveyModel(surveyData);
        await survey.save();

        res.json({ success: true, survey, surveyId: survey._id });
    } catch (err) {
        next(err);
    }
};

exports.getSurveyById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const survey = await surveyModel.findById(id)
            .populate('createdBy', 'email');
        
        if (!survey) {
            throw new UserError('Опрос не найден', 'json');
        }

        res.json({ success: true, survey });
    } catch (err) {
        next(err);
    }
};

exports.updateSurvey = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const survey = await surveyModel.findById(id);
        if (!survey) {
            throw new UserError('Опрос не найден', 'json');
        }

        Object.assign(survey, req.body);
        survey.updatedAt = Date.now();

        await survey.save();

        res.json({ success: true, survey });
    } catch (err) {
        next(err);
    }
};

exports.deleteSurvey = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        await Promise.all([
            surveyModel.deleteOne({ _id: id }),
            surveyResponseModel.deleteMany({ surveyId: id })
        ]);

        res.json({ success: true });
    } catch (err) {
        next(err);
    }
};

exports.getSurveyStats = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const survey = await surveyModel.findById(id);
        if (!survey) {
            throw new UserError('Опрос не найден', 'json');
        }

        const responses = await surveyResponseModel.find({ surveyId: id });

        const questionStats = {};
        
        survey.questions.forEach(question => {
            questionStats[question.id] = {
                question: question.question,
                type: question.type,
                totalAnswers: 0,
                answers: {}
            };

            if (['radio', 'checkbox', 'dropdown'].includes(question.type)) {
                question.options.forEach(option => {
                    questionStats[question.id].answers[option] = 0;
                });
            } else if (question.type === 'rating' || question.type === 'scale') {
                questionStats[question.id].values = [];
            } else {
                questionStats[question.id].responses = [];
            }
        });

        responses.forEach(response => {
            response.answers.forEach(answer => {
                if (questionStats[answer.questionId]) {
                    questionStats[answer.questionId].totalAnswers++;

                    if (answer.questionType === 'checkbox' && Array.isArray(answer.answer)) {
                        answer.answer.forEach(value => {
                            if (questionStats[answer.questionId].answers[value] !== undefined) {
                                questionStats[answer.questionId].answers[value]++;
                            }
                        });
                    } else if (['radio', 'dropdown'].includes(answer.questionType)) {
                        if (questionStats[answer.questionId].answers[answer.answer] !== undefined) {
                            questionStats[answer.questionId].answers[answer.answer]++;
                        }
                    } else if (answer.questionType === 'rating' || answer.questionType === 'scale') {
                        questionStats[answer.questionId].values.push(Number(answer.answer));
                    } else {
                        questionStats[answer.questionId].responses.push(answer.answer);
                    }
                }
            });
        });

        Object.keys(questionStats).forEach(qId => {
            if (questionStats[qId].values) {
                const values = questionStats[qId].values;
                if (values.length > 0) {
                    questionStats[qId].average = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
                    questionStats[qId].min = Math.min(...values);
                    questionStats[qId].max = Math.max(...values);
                }
            }
        });

        res.json({
            success: true,
            survey: {
                id: survey._id,
                title: survey.title,
                description: survey.description,
                questions: survey.questions,
                settings: survey.settings,
                totalResponses: responses.length,
                lastResponseAt: survey.stats.lastResponseAt
            },
            questionStats,
            responses: responses.map(r => ({
                id: r._id,
                submittedAt: r.submittedAt,
                email: r.respondent.email,
                isAnonymous: r.respondent.isAnonymous,
                completionTime: r.completionTime,
                answers: r.answers
            }))
        });
    } catch (err) {
        next(err);
    }
};

exports.getSurveyForResponse = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const survey = await surveyModel.findById(id);
        
        if (!survey) {
            throw new UserError('Опрос не найден', 'json');
        }

        if (survey.status !== 'published') {
            throw new UserError('Опрос недоступен', 'json');
        }

        const now = new Date();
        if (survey.settings.startDate && now < survey.settings.startDate) {
            throw new UserError('Опрос еще не начался', 'json');
        }
        if (survey.settings.endDate && now > survey.settings.endDate) {
            throw new UserError('Опрос уже завершен', 'json');
        }

        if (survey.access.type === 'closed' && !req.session.user_id) {
            throw new UserError('Опрос доступен только для зарегистрированных пользователей', 'json');
        }

        if (req.session.user_id && !survey.access.allowMultipleResponses) {
            const existingResponse = await surveyResponseModel.findOne({
                surveyId: id,
                'respondent.userId': req.session.user_id
            });

            if (existingResponse) {
                throw new UserError('Вы уже прошли этот опрос', 'json');
            }
        }

        res.json({
            success: true,
            survey: {
                id: survey._id,
                title: survey.title,
                description: survey.description,
                questions: survey.questions,
                settings: survey.settings,
                access: survey.access
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.submitSurveyResponse = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { answers, completionTime, email } = req.body;

        const survey = await surveyModel.findById(id);
        
        if (!survey) {
            throw new UserError('Опрос не найден', 'json');
        }

        if (survey.status !== 'published') {
            throw new UserError('Опрос недоступен для ответов', 'json');
        }

        if (survey.access.type === 'closed' && !req.session.user_id) {
            throw new UserError('Опрос доступен только для зарегистрированных пользователей', 'json');
        }

        if (req.session.user_id && !survey.access.allowMultipleResponses) {
            const existingResponse = await surveyResponseModel.findOne({
                surveyId: id,
                'respondent.userId': req.session.user_id
            });

            if (existingResponse) {
                throw new UserError('Вы уже прошли этот опрос', 'json');
            }
        }

        const requiredQuestions = survey.questions.filter(q => q.required);
        for (const question of requiredQuestions) {
            const answer = answers.find(a => a.questionId === question.id);
            if (!answer || !answer.answer || (Array.isArray(answer.answer) && answer.answer.length === 0)) {
                throw new UserError(`Вопрос "${question.question}" обязателен для ответа`, 'json');
            }
        }

        const response = new surveyResponseModel({
            surveyId: id,
            respondent: {
                userId: req.session.user_id || null,
                email: email || null,
                isAnonymous: !req.session.user_id,
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.headers['user-agent']
            },
            answers: answers,
            completionTime: completionTime || 0,
            isComplete: true
        });

        await response.save();

        survey.stats.totalResponses = (survey.stats.totalResponses || 0) + 1;
        survey.stats.lastResponseAt = new Date();
        await survey.save();

        res.json({ 
            success: true, 
            message: survey.settings.successMessage || 'Спасибо! Ваш ответ записан.',
            responseId: response._id
        });
    } catch (err) {
        next(err);
    }
};

exports.exportToPDF = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const survey = await surveyModel.findById(id);
        if (!survey) {
            throw new UserError('Опрос не найден', 'json');
        }

        const responses = await surveyResponseModel.find({ surveyId: id })
            .sort({ submittedAt: -1 });

        const time = datetime.getTime(':');
        const date = datetime.getDate('-');

        const font_fat = `${appConfig.fonts_path}timesbd.ttf`;
        const font_default = `${appConfig.fonts_path}times.ttf`;

        const pdfDoc = new PDFDocument({ margin: 50 });
        const filename = `survey-report-${survey._id}-${date}.pdf`;
        const filepath = `${appConfig.reports_path}${filename}`;
        
        const write = pdfDoc.pipe(fs.createWriteStream(filepath));

        pdfDoc.font(font_fat).fontSize(18).text(`Отчет по опросу: ${survey.title}`, { align: 'center' });
        pdfDoc.moveDown();
        pdfDoc.font(font_default).fontSize(12);
        pdfDoc.text(`Дата формирования отчета: ${date} ${time}`);
        pdfDoc.text(`Всего ответов: ${responses.length}`);
        pdfDoc.text(`Статус опроса: ${survey.status}`);
        pdfDoc.moveDown(2);

        pdfDoc.font(font_fat).fontSize(14).text('Результаты по вопросам:', { underline: true });
        pdfDoc.moveDown();

        survey.questions.forEach((question, index) => {
            pdfDoc.font(font_fat).fontSize(12).text(`${index + 1}. ${question.question}`);
            pdfDoc.font(font_default).fontSize(11);

            const questionAnswers = responses.map(r => 
                r.answers.find(a => a.questionId === question.id)
            ).filter(Boolean);

            if (['radio', 'checkbox', 'dropdown'].includes(question.type)) {
                const answerCounts = {};
                question.options.forEach(opt => answerCounts[opt] = 0);

                questionAnswers.forEach(answer => {
                    if (Array.isArray(answer.answer)) {
                        answer.answer.forEach(val => {
                            if (answerCounts[val] !== undefined) answerCounts[val]++;
                        });
                    } else {
                        if (answerCounts[answer.answer] !== undefined) answerCounts[answer.answer]++;
                    }
                });

                Object.entries(answerCounts).forEach(([option, count]) => {
                    const percentage = questionAnswers.length > 0 
                        ? ((count / questionAnswers.length) * 100).toFixed(1) 
                        : 0;
                    pdfDoc.text(`   ${option}: ${count} (${percentage}%)`);
                });
            } else if (question.type === 'rating' || question.type === 'scale') {
                const values = questionAnswers.map(a => Number(a.answer)).filter(v => !isNaN(v));
                if (values.length > 0) {
                    const average = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
                    pdfDoc.text(`   Средний балл: ${average}`);
                    pdfDoc.text(`   Минимум: ${Math.min(...values)}, Максимум: ${Math.max(...values)}`);
                }
            } else {
                pdfDoc.text(`   Получено ответов: ${questionAnswers.length}`);
            }

            pdfDoc.moveDown();
        });

        pdfDoc.addPage();
        pdfDoc.font(font_fat).fontSize(14).text('Детальные ответы респондентов:', { underline: true });
        pdfDoc.moveDown();

        responses.forEach((response, idx) => {
            if (idx > 0 && idx % 3 === 0) {
                pdfDoc.addPage();
            }

            pdfDoc.font(font_fat).fontSize(11).text(`Ответ #${idx + 1}`);
            pdfDoc.font(font_default).fontSize(10);
            pdfDoc.text(`Дата: ${new Date(response.submittedAt).toLocaleString('ru-RU')}`);
            if (response.respondent.email) {
                pdfDoc.text(`Email: ${response.respondent.email}`);
            }
            pdfDoc.moveDown(0.5);

            response.answers.forEach(answer => {
                const question = survey.questions.find(q => q.id === answer.questionId);
                if (question) {
                    pdfDoc.text(`${question.question}`, { continued: false });
                    const answerText = Array.isArray(answer.answer) 
                        ? answer.answer.join(', ') 
                        : String(answer.answer);
                    pdfDoc.text(`Ответ: ${answerText}`, { indent: 20 });
                }
            });

            pdfDoc.moveDown();
            pdfDoc.moveTo(50, pdfDoc.y).lineTo(pdfDoc.page.width - 50, pdfDoc.y).stroke();
            pdfDoc.moveDown(0.5);
        });

        pdfDoc.end();

        write.on('finish', () => {
            res.download(filepath, filename, (err) => {
                if (err) {
                    console.error('Error downloading file:', err);
                }
                try {
                    fs.unlinkSync(filepath);
                } catch (e) {
                    console.error('Error deleting temp file:', e);
                }
            });
        });
    } catch (err) {
        next(err);
    }
};

exports.exportToWord = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const survey = await surveyModel.findById(id);
        if (!survey) {
            throw new UserError('Опрос не найден', 'json');
        }

        const responses = await surveyResponseModel.find({ surveyId: id })
            .sort({ submittedAt: -1 });

        const time = datetime.getTime(':');
        const date = datetime.getDate('-');

        // Создаём массив параграфов для Word документа
        const children = [];

        // Заголовок
        children.push(
            new Paragraph({
                text: "ОТЧЕТ ПО ОПРОСУ",
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 }
            })
        );

        // Информация об опросе
        children.push(
            new Paragraph({
                children: [
                    new TextRun({ text: "Название: ", bold: true }),
                    new TextRun({ text: survey.title })
                ],
                spacing: { after: 100 }
            })
        );

        children.push(
            new Paragraph({
                children: [
                    new TextRun({ text: "Описание: ", bold: true }),
                    new TextRun({ text: survey.description || 'Нет описания' })
                ],
                spacing: { after: 100 }
            })
        );

        children.push(
            new Paragraph({
                children: [
                    new TextRun({ text: "Дата формирования отчета: ", bold: true }),
                    new TextRun({ text: `${date} ${time}` })
                ],
                spacing: { after: 100 }
            })
        );

        children.push(
            new Paragraph({
                children: [
                    new TextRun({ text: "Всего ответов: ", bold: true }),
                    new TextRun({ text: String(responses.length) })
                ],
                spacing: { after: 100 }
            })
        );

        children.push(
            new Paragraph({
                children: [
                    new TextRun({ text: "Статус опроса: ", bold: true }),
                    new TextRun({ text: survey.status })
                ],
                spacing: { after: 200 }
            })
        );

        // Разделитель
        children.push(
            new Paragraph({
                text: "=".repeat(80),
                spacing: { after: 200 }
            })
        );

        // Результаты по вопросам
        children.push(
            new Paragraph({
                text: "РЕЗУЛЬТАТЫ ПО ВОПРОСАМ",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 200 }
            })
        );

        survey.questions.forEach((question, index) => {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: `${index + 1}. `, bold: true }),
                        new TextRun({ text: question.question, bold: true })
                    ],
                    spacing: { before: 100, after: 100 }
                })
            );

            if (question.description) {
                children.push(
                    new Paragraph({
                        children: [
                            new TextRun({ text: "   Описание: ", bold: true }),
                            new TextRun({ text: question.description })
                        ],
                        spacing: { after: 100 }
                    })
                );
            }

            const questionAnswers = responses.map(r => 
                r.answers.find(a => a.questionId === question.id)
            ).filter(Boolean);

            if (['radio', 'checkbox', 'dropdown'].includes(question.type)) {
                const answerCounts = {};
                question.options.forEach(opt => answerCounts[opt] = 0);

                questionAnswers.forEach(answer => {
                    if (Array.isArray(answer.answer)) {
                        answer.answer.forEach(val => {
                            if (answerCounts[val] !== undefined) answerCounts[val]++;
                        });
                    } else {
                        if (answerCounts[answer.answer] !== undefined) answerCounts[answer.answer]++;
                    }
                });

                Object.entries(answerCounts).forEach(([option, count]) => {
                    const percentage = questionAnswers.length > 0 
                        ? ((count / questionAnswers.length) * 100).toFixed(1) 
                        : 0;
                    children.push(
                        new Paragraph({
                            text: `   - ${option}: ${count} ответов (${percentage}%)`,
                            spacing: { after: 50 }
                        })
                    );
                });
            } else if (question.type === 'rating' || question.type === 'scale') {
                const values = questionAnswers.map(a => Number(a.answer)).filter(v => !isNaN(v));
                if (values.length > 0) {
                    const average = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({ text: "   Средний балл: ", bold: true }),
                                new TextRun({ text: average })
                            ],
                            spacing: { after: 50 }
                        })
                    );
                    children.push(
                        new Paragraph({
                            text: `   Минимум: ${Math.min(...values)}, Максимум: ${Math.max(...values)}`,
                            spacing: { after: 50 }
                        })
                    );
                    children.push(
                        new Paragraph({
                            text: `   Всего ответов: ${values.length}`,
                            spacing: { after: 100 }
                        })
                    );
                }
            } else {
                children.push(
                    new Paragraph({
                        text: `   Получено ответов: ${questionAnswers.length}`,
                        spacing: { after: 100 }
                    })
                );
                if (questionAnswers.length > 0 && questionAnswers.length <= 10) {
                    children.push(
                        new Paragraph({
                            text: "   Примеры ответов:",
                            spacing: { after: 50 }
                        })
                    );
                    questionAnswers.slice(0, 5).forEach(a => {
                        const answerText = String(a.answer).substring(0, 100);
                        children.push(
                            new Paragraph({
                                text: `   - ${answerText}${a.answer.length > 100 ? '...' : ''}`,
                                spacing: { after: 50 }
                            })
                        );
                    });
                }
            }

            children.push(new Paragraph({ text: "" }));
        });

        // Разделитель
        children.push(
            new Paragraph({
                text: "=".repeat(80),
                spacing: { before: 200, after: 200 }
            })
        );

        // Детальные ответы
        children.push(
            new Paragraph({
                text: "ДЕТАЛЬНЫЕ ОТВЕТЫ РЕСПОНДЕНТОВ",
                heading: HeadingLevel.HEADING_2,
                spacing: { after: 200 }
            })
        );

        responses.forEach((response, idx) => {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({ text: `Ответ #${idx + 1}`, bold: true })
                    ],
                    spacing: { before: 100, after: 100 }
                })
            );

            children.push(
                new Paragraph({
                    text: `Дата: ${new Date(response.submittedAt).toLocaleString('ru-RU')}`,
                    spacing: { after: 50 }
                })
            );

            if (response.respondent.email) {
                children.push(
                    new Paragraph({
                        text: `Email: ${response.respondent.email}`,
                        spacing: { after: 50 }
                    })
                );
            }

            if (response.completionTime) {
                children.push(
                    new Paragraph({
                        text: `Время заполнения: ${Math.floor(response.completionTime / 60)} мин ${response.completionTime % 60} сек`,
                        spacing: { after: 100 }
                    })
                );
            }

            response.answers.forEach(answer => {
                const question = survey.questions.find(q => q.id === answer.questionId);
                if (question) {
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({ text: "Q: ", bold: true }),
                                new TextRun({ text: question.question })
                            ],
                            spacing: { after: 50 }
                        })
                    );
                    const answerText = Array.isArray(answer.answer) 
                        ? answer.answer.join(', ') 
                        : String(answer.answer);
                    children.push(
                        new Paragraph({
                            children: [
                                new TextRun({ text: "A: ", bold: true }),
                                new TextRun({ text: answerText })
                            ],
                            spacing: { after: 100 }
                        })
                    );
                }
            });

            children.push(
                new Paragraph({
                    text: "-".repeat(80),
                    spacing: { before: 100, after: 100 }
                })
            );
        });

        // Создаём документ
        const doc = new Document({
            sections: [{
                children: children
            }]
        });

        // Генерируем файл
        const buffer = await Packer.toBuffer(doc);
        const filename = `survey-report-${survey._id}-${date}.docx`;
        const filepath = `${appConfig.reports_path}${filename}`;
        
        fs.writeFileSync(filepath, buffer);

        res.download(filepath, filename, (err) => {
            if (err) {
                console.error('Error downloading file:', err);
            }
            try {
                fs.unlinkSync(filepath);
            } catch (e) {
                console.error('Error deleting temp file:', e);
            }
        });
    } catch (err) {
        next(err);
    }
};

// Получение статистики по годам для гистограмм
exports.getYearlyStats = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { startYear, endYear } = req.query;
        
        const survey = await surveyModel.findById(id);
        if (!survey) {
            throw new UserError('Опрос не найден', 'json');
        }

        // Определяем диапазон годов
        const currentYear = new Date().getFullYear();
        const yearStart = parseInt(startYear) || currentYear - 1;
        const yearEnd = parseInt(endYear) || currentYear;

        // Получаем ответы за указанный период
        const startDate = new Date(yearStart, 0, 1);
        const endDate = new Date(yearEnd, 11, 31, 23, 59, 59);

        const responses = await surveyResponseModel.find({
            surveyId: id,
            submittedAt: { $gte: startDate, $lte: endDate }
        }).sort({ submittedAt: 1 });

        // Группируем ответы по годам
        const yearlyData = {};
        for (let year = yearStart; year <= yearEnd; year++) {
            yearlyData[year] = {
                totalResponses: 0,
                questionStats: {}
            };
        }

        responses.forEach(response => {
            const year = new Date(response.submittedAt).getFullYear();
            if (yearlyData[year]) {
                yearlyData[year].totalResponses++;

                response.answers.forEach(answer => {
                    const questionId = answer.questionId;
                    if (!yearlyData[year].questionStats[questionId]) {
                        yearlyData[year].questionStats[questionId] = {
                            answers: {},
                            values: [],
                            count: 0
                        };
                    }

                    yearlyData[year].questionStats[questionId].count++;

                    if (answer.questionType === 'checkbox' && Array.isArray(answer.answer)) {
                        answer.answer.forEach(val => {
                            yearlyData[year].questionStats[questionId].answers[val] = 
                                (yearlyData[year].questionStats[questionId].answers[val] || 0) + 1;
                        });
                    } else if (['radio', 'dropdown'].includes(answer.questionType)) {
                        yearlyData[year].questionStats[questionId].answers[answer.answer] = 
                            (yearlyData[year].questionStats[questionId].answers[answer.answer] || 0) + 1;
                    } else if (['rating', 'scale', 'number'].includes(answer.questionType)) {
                        yearlyData[year].questionStats[questionId].values.push(Number(answer.answer));
                    }
                });
            }
        });

        // Вычисляем статистику для числовых вопросов
        Object.keys(yearlyData).forEach(year => {
            Object.keys(yearlyData[year].questionStats).forEach(qId => {
                const stats = yearlyData[year].questionStats[qId];
                if (stats.values && stats.values.length > 0) {
                    stats.average = (stats.values.reduce((a, b) => a + b, 0) / stats.values.length).toFixed(2);
                    stats.min = Math.min(...stats.values);
                    stats.max = Math.max(...stats.values);
                }
            });
        });

        // Формируем данные для гистограмм
        const chartData = {
            years: Object.keys(yearlyData).map(Number),
            responseCounts: Object.values(yearlyData).map(d => d.totalResponses),
            questionCharts: {}
        };

        // Для каждого вопроса формируем данные графиков
        survey.questions.forEach(question => {
            if (['radio', 'checkbox', 'dropdown'].includes(question.type)) {
                chartData.questionCharts[question.id] = {
                    question: question.question,
                    type: question.type,
                    options: question.options || [],
                    yearlyDistribution: {}
                };

                chartData.years.forEach(year => {
                    const qStats = yearlyData[year].questionStats[question.id] || { answers: {} };
                    chartData.questionCharts[question.id].yearlyDistribution[year] = {};
                    
                    (question.options || []).forEach(opt => {
                        chartData.questionCharts[question.id].yearlyDistribution[year][opt] = 
                            qStats.answers[opt] || 0;
                    });
                });
            } else if (['rating', 'scale', 'number'].includes(question.type)) {
                chartData.questionCharts[question.id] = {
                    question: question.question,
                    type: question.type,
                    yearlyAverages: {}
                };

                chartData.years.forEach(year => {
                    const qStats = yearlyData[year].questionStats[question.id];
                    chartData.questionCharts[question.id].yearlyAverages[year] = 
                        qStats ? parseFloat(qStats.average) || 0 : 0;
                });
            }
        });

        res.json({
            success: true,
            survey: {
                id: survey._id,
                title: survey.title,
                description: survey.description,
                questions: survey.questions
            },
            yearlyData,
            chartData,
            dateRange: { startYear: yearStart, endYear: yearEnd }
        });
    } catch (err) {
        next(err);
    }
};

// Экспорт PDF с гистограммами
exports.exportToPDFWithCharts = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { startYear, endYear } = req.query;
        
        const survey = await surveyModel.findById(id);
        if (!survey) {
            throw new UserError('Опрос не найден', 'json');
        }

        const currentYear = new Date().getFullYear();
        const yearStart = parseInt(startYear) || currentYear - 1;
        const yearEnd = parseInt(endYear) || currentYear;

        const startDate = new Date(yearStart, 0, 1);
        const endDate = new Date(yearEnd, 11, 31, 23, 59, 59);

        const responses = await surveyResponseModel.find({
            surveyId: id,
            submittedAt: { $gte: startDate, $lte: endDate }
        }).sort({ submittedAt: 1 });

        // Группируем по годам
        const yearlyData = {};
        for (let year = yearStart; year <= yearEnd; year++) {
            yearlyData[year] = {
                totalResponses: 0,
                questionStats: {}
            };
        }

        responses.forEach(response => {
            const year = new Date(response.submittedAt).getFullYear();
            if (yearlyData[year]) {
                yearlyData[year].totalResponses++;

                response.answers.forEach(answer => {
                    const questionId = answer.questionId;
                    if (!yearlyData[year].questionStats[questionId]) {
                        yearlyData[year].questionStats[questionId] = {
                            answers: {},
                            values: [],
                            count: 0
                        };
                    }

                    yearlyData[year].questionStats[questionId].count++;

                    if (answer.questionType === 'checkbox' && Array.isArray(answer.answer)) {
                        answer.answer.forEach(val => {
                            yearlyData[year].questionStats[questionId].answers[val] = 
                                (yearlyData[year].questionStats[questionId].answers[val] || 0) + 1;
                        });
                    } else if (['radio', 'dropdown'].includes(answer.questionType)) {
                        yearlyData[year].questionStats[questionId].answers[answer.answer] = 
                            (yearlyData[year].questionStats[questionId].answers[answer.answer] || 0) + 1;
                    } else if (['rating', 'scale', 'number'].includes(answer.questionType)) {
                        yearlyData[year].questionStats[questionId].values.push(Number(answer.answer));
                    }
                });
            }
        });

        const time = datetime.getTime(':');
        const date = datetime.getDate('-');

        const font_fat = `${appConfig.fonts_path}timesbd.ttf`;
        const font_default = `${appConfig.fonts_path}times.ttf`;

        const pdfDoc = new PDFDocument({ margin: 50, size: 'A4' });
        const filename = `survey-report-charts-${survey._id}-${date}.pdf`;
        const filepath = `${appConfig.reports_path}${filename}`;
        
        const write = pdfDoc.pipe(fs.createWriteStream(filepath));

        // Заголовок отчёта
        pdfDoc.font(font_fat).fontSize(16).text('ОТЧЕТ С ГИСТОГРАММАМИ РАСПРЕДЕЛЕНИЯ', { align: 'center' });
        pdfDoc.moveDown(0.5);
        pdfDoc.font(font_fat).fontSize(14).text(`${survey.title}`, { align: 'center' });
        pdfDoc.moveDown();
        pdfDoc.font(font_default).fontSize(11);
        pdfDoc.text(`Дата формирования: ${date} ${time}`);
        pdfDoc.text(`Период анализа: ${yearStart} - ${yearEnd} гг.`);
        pdfDoc.text(`Всего ответов за период: ${responses.length}`);
        pdfDoc.moveDown(2);

        // Гистограмма количества ответов по годам
        pdfDoc.font(font_fat).fontSize(12).text('Распределение количества ответов по годам', { underline: true });
        pdfDoc.moveDown();

        const years = Object.keys(yearlyData).map(Number);
        const maxResponses = Math.max(...years.map(y => yearlyData[y].totalResponses), 1);
        
        const chartX = 80;
        const chartY = pdfDoc.y;
        const chartWidth = 400;
        const chartHeight = 150;
        const barWidth = chartWidth / years.length - 20;
        
        // Рисуем оси
        pdfDoc.strokeColor('#333333').lineWidth(1);
        pdfDoc.moveTo(chartX, chartY).lineTo(chartX, chartY + chartHeight).stroke();
        pdfDoc.moveTo(chartX, chartY + chartHeight).lineTo(chartX + chartWidth, chartY + chartHeight).stroke();

        // Рисуем столбцы гистограммы
        const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6'];
        years.forEach((year, i) => {
            const barHeight = (yearlyData[year].totalResponses / maxResponses) * (chartHeight - 20);
            const barX = chartX + 20 + i * (chartWidth / years.length);
            const barY = chartY + chartHeight - barHeight;

            pdfDoc.fillColor(colors[i % colors.length]);
            pdfDoc.rect(barX, barY, barWidth, barHeight).fill();

            // Подпись года
            pdfDoc.fillColor('#333333').font(font_default).fontSize(10);
            pdfDoc.text(String(year), barX, chartY + chartHeight + 5, { width: barWidth, align: 'center' });
            
            // Значение над столбцом
            pdfDoc.text(String(yearlyData[year].totalResponses), barX, barY - 15, { width: barWidth, align: 'center' });
        });

        pdfDoc.y = chartY + chartHeight + 40;
        pdfDoc.moveDown(2);

        // Гистограммы для каждого вопроса с вариантами ответов
        survey.questions.forEach((question, qIndex) => {
            if (['radio', 'checkbox', 'dropdown'].includes(question.type)) {
                // Проверка места на странице
                if (pdfDoc.y > 550) {
                    pdfDoc.addPage();
                }

                pdfDoc.font(font_fat).fontSize(11).fillColor('#333333');
                pdfDoc.text(`${qIndex + 1}. ${question.question}`, { underline: true });
                pdfDoc.moveDown(0.5);

                const options = question.options || [];
                if (options.length === 0) return;

                const qChartY = pdfDoc.y;
                const qChartHeight = 100;
                const qChartWidth = 450;
                const groupWidth = qChartWidth / options.length;
                const singleBarWidth = Math.min((groupWidth - 10) / years.length, 30);

                // Находим максимальное значение
                let maxVal = 1;
                options.forEach(opt => {
                    years.forEach(year => {
                        const val = yearlyData[year].questionStats[question.id]?.answers[opt] || 0;
                        if (val > maxVal) maxVal = val;
                    });
                });

                // Ось Y
                pdfDoc.strokeColor('#333333').lineWidth(0.5);
                pdfDoc.moveTo(chartX, qChartY).lineTo(chartX, qChartY + qChartHeight).stroke();
                pdfDoc.moveTo(chartX, qChartY + qChartHeight).lineTo(chartX + qChartWidth, qChartY + qChartHeight).stroke();

                // Рисуем сгруппированные столбцы
                options.forEach((opt, optIndex) => {
                    const groupX = chartX + 10 + optIndex * groupWidth;
                    
                    years.forEach((year, yearIndex) => {
                        const val = yearlyData[year].questionStats[question.id]?.answers[opt] || 0;
                        const barH = (val / maxVal) * (qChartHeight - 20);
                        const barX = groupX + yearIndex * singleBarWidth;
                        const barY = qChartY + qChartHeight - barH;

                        pdfDoc.fillColor(colors[yearIndex % colors.length]);
                        pdfDoc.rect(barX, barY, singleBarWidth - 2, barH).fill();

                        // Значение над столбцом
                        if (val > 0) {
                            pdfDoc.fillColor('#333333').font(font_default).fontSize(7);
                            pdfDoc.text(String(val), barX, barY - 10, { width: singleBarWidth, align: 'center' });
                        }
                    });

                    // Подпись варианта ответа (сокращаем если длинный)
                    const optLabel = opt.length > 15 ? opt.substring(0, 12) + '...' : opt;
                    pdfDoc.fillColor('#333333').font(font_default).fontSize(7);
                    pdfDoc.text(optLabel, groupX, qChartY + qChartHeight + 5, { width: groupWidth - 5, align: 'center' });
                });

                // Легенда
                pdfDoc.y = qChartY + qChartHeight + 25;
                pdfDoc.font(font_default).fontSize(8);
                let legendX = chartX;
                years.forEach((year, i) => {
                    pdfDoc.fillColor(colors[i % colors.length]);
                    pdfDoc.rect(legendX, pdfDoc.y, 10, 10).fill();
                    pdfDoc.fillColor('#333333');
                    pdfDoc.text(`${year} г.`, legendX + 15, pdfDoc.y, { continued: false });
                    legendX += 60;
                });

                pdfDoc.moveDown(2);
            } else if (['rating', 'scale', 'number'].includes(question.type)) {
                // Для числовых вопросов - график средних значений
                if (pdfDoc.y > 600) {
                    pdfDoc.addPage();
                }

                pdfDoc.font(font_fat).fontSize(11).fillColor('#333333');
                pdfDoc.text(`${qIndex + 1}. ${question.question} (средние значения)`, { underline: true });
                pdfDoc.moveDown(0.5);

                const avgChartY = pdfDoc.y;
                const avgChartHeight = 80;
                const avgBarWidth = 50;

                // Вычисляем средние
                const averages = years.map(year => {
                    const stats = yearlyData[year].questionStats[question.id];
                    if (stats && stats.values && stats.values.length > 0) {
                        return stats.values.reduce((a, b) => a + b, 0) / stats.values.length;
                    }
                    return 0;
                });

                const maxAvg = Math.max(...averages, 1);

                // Оси
                pdfDoc.strokeColor('#333333').lineWidth(0.5);
                pdfDoc.moveTo(chartX, avgChartY).lineTo(chartX, avgChartY + avgChartHeight).stroke();
                pdfDoc.moveTo(chartX, avgChartY + avgChartHeight).lineTo(chartX + 300, avgChartY + avgChartHeight).stroke();

                // Столбцы
                years.forEach((year, i) => {
                    const barH = (averages[i] / maxAvg) * (avgChartHeight - 15);
                    const barX = chartX + 20 + i * 70;
                    const barY = avgChartY + avgChartHeight - barH;

                    pdfDoc.fillColor(colors[i % colors.length]);
                    pdfDoc.rect(barX, barY, avgBarWidth, barH).fill();

                    pdfDoc.fillColor('#333333').font(font_default).fontSize(9);
                    pdfDoc.text(String(year), barX, avgChartY + avgChartHeight + 5, { width: avgBarWidth, align: 'center' });
                    pdfDoc.text(averages[i].toFixed(2), barX, barY - 12, { width: avgBarWidth, align: 'center' });
                });

                pdfDoc.y = avgChartY + avgChartHeight + 30;
                pdfDoc.moveDown();
            }
        });

        // Таблица сводных данных
        pdfDoc.addPage();
        pdfDoc.font(font_fat).fontSize(14).fillColor('#333333').text('Сводная таблица статистических показателей', { align: 'center' });
        pdfDoc.moveDown();

        pdfDoc.font(font_default).fontSize(10);
        
        // Заголовок таблицы
        let tableY = pdfDoc.y;
        const colWidths = [200, ...years.map(() => 80)];
        const rowHeight = 20;

        // Шапка таблицы
        pdfDoc.font(font_fat).fontSize(9);
        pdfDoc.rect(50, tableY, colWidths.reduce((a, b) => a + b, 0), rowHeight).stroke();
        pdfDoc.text('Показатель', 55, tableY + 5, { width: colWidths[0] - 10 });
        years.forEach((year, i) => {
            const x = 50 + colWidths.slice(0, i + 1).reduce((a, b) => a + b, 0);
            pdfDoc.text(String(year) + ' г.', x + 5, tableY + 5, { width: colWidths[i + 1] - 10, align: 'center' });
        });

        tableY += rowHeight;

        // Строка с количеством ответов
        pdfDoc.font(font_default).fontSize(9);
        pdfDoc.rect(50, tableY, colWidths.reduce((a, b) => a + b, 0), rowHeight).stroke();
        pdfDoc.text('Количество ответов', 55, tableY + 5, { width: colWidths[0] - 10 });
        years.forEach((year, i) => {
            const x = 50 + colWidths.slice(0, i + 1).reduce((a, b) => a + b, 0);
            pdfDoc.text(String(yearlyData[year].totalResponses), x + 5, tableY + 5, { width: colWidths[i + 1] - 10, align: 'center' });
        });

        tableY += rowHeight;

        // Добавляем строки для вопросов с вариантами
        survey.questions.forEach((question) => {
            if (['radio', 'dropdown'].includes(question.type)) {
                const options = question.options || [];
                options.forEach(opt => {
                    if (tableY > 750) {
                        pdfDoc.addPage();
                        tableY = 50;
                    }

                    pdfDoc.rect(50, tableY, colWidths.reduce((a, b) => a + b, 0), rowHeight).stroke();
                    const labelText = `${question.question}: ${opt}`.substring(0, 40);
                    pdfDoc.text(labelText, 55, tableY + 5, { width: colWidths[0] - 10 });
                    
                    years.forEach((year, i) => {
                        const x = 50 + colWidths.slice(0, i + 1).reduce((a, b) => a + b, 0);
                        const val = yearlyData[year].questionStats[question.id]?.answers[opt] || 0;
                        pdfDoc.text(String(val), x + 5, tableY + 5, { width: colWidths[i + 1] - 10, align: 'center' });
                    });

                    tableY += rowHeight;
                });
            }
        });

        pdfDoc.end();

        write.on('finish', () => {
            res.download(filepath, filename, (err) => {
                if (err) {
                    console.error('Error downloading file:', err);
                }
                try {
                    fs.unlinkSync(filepath);
                } catch (e) {
                    console.error('Error deleting temp file:', e);
                }
            });
        });
    } catch (err) {
        next(err);
    }
};

exports.getPublicSurveys = async (req, res, next) => {
    try {
        const now = new Date();
        
        let query = { status: 'published' };
        
        if (!req.session.user_id) {
            query['access.type'] = 'open';
        }

        const surveys = await surveyModel.find(query)
            .select('title description createdAt stats access settings.startDate settings.endDate')
            .sort({ createdAt: -1 });

        const availableSurveys = surveys.filter(survey => {
            if (survey.settings.startDate && now < survey.settings.startDate) return false;
            if (survey.settings.endDate && now > survey.settings.endDate) return false;
            return true;
        });

        res.json({ success: true, surveys: availableSurveys });
    } catch (err) {
        next(err);
    }
};


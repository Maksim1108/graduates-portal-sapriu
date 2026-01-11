const mongoose = require('mongoose');
const surveyModel = require('../models/surveyModel');
const surveyResponseModel = require('../models/surveyResponseModel');
const appConfig = require('../appConfig');
require('dotenv').config();

const SURVEY_ID = '6940f887e5dad58d7874ff66';

// Тестовые данные для ответов
const testResponses = [
    {
        fio: 'Иванов Иван Иванович',
        birthYear: 1998,
        group: '1234',
        city: 'Санкт-Петербург',
        direction: 'Информатика и вычислительная техника',
        specialization: 'Системы автоматизированного проектирования',
        educationForm: 'Очная',
        graduationYear: 2020,
        stillStudying: 'Нет',
        employed: 'Да',
        unemploymentReason: null,
        employmentForm: 'Полная занятость',
        organization: 'ООО "Технологии будущего", г. Санкт-Петербург',
        position: 'Инженер-программист',
        responsibilities: 'Разработка ПО, проектирование систем',
        salary: 'От 50000 руб. до 100000 руб.',
        internship: 'Да',
        researchWork: 'Да',
        departmentHelp: 'Да',
        helpDetails: 'Помощь в трудоустройстве через контакты кафедры',
        careerGuidance: 'Да',
        improvements: ['Предоставление информации о профильных работодателях', 'Экскурсии на профильные предприятия'],
        trudvsem: 'Да',
        submittedAt: new Date('2024-03-15T10:30:00Z')
    },
    {
        fio: 'Петрова Мария Сергеевна',
        birthYear: 1999,
        group: '1235',
        city: 'Москва',
        direction: 'Информатика и вычислительная техника',
        specialization: 'Системы автоматизированного проектирования',
        educationForm: 'Очная',
        graduationYear: 2021,
        stillStudying: 'Нет',
        employed: 'Да',
        unemploymentReason: null,
        employmentForm: 'Полная занятость',
        organization: 'АО "Инновации", г. Москва',
        position: 'Системный аналитик',
        responsibilities: 'Анализ требований, проектирование архитектуры',
        salary: 'Более 100000 руб.',
        internship: 'Да',
        researchWork: 'Нет',
        departmentHelp: 'Нет',
        helpDetails: null,
        careerGuidance: 'Нет',
        improvements: ['Встречи с представителями работодателей', 'Дни карьеры'],
        trudvsem: 'Нет',
        submittedAt: new Date('2024-05-20T14:15:00Z')
    },
    {
        fio: 'Сидоров Алексей Владимирович',
        birthYear: 1997,
        group: '1233',
        city: 'Новосибирск',
        direction: 'Информатика и вычислительная техника',
        specialization: 'Системы автоматизированного проектирования',
        educationForm: 'Заочная',
        graduationYear: 2019,
        stillStudying: 'Да',
        employed: 'Да',
        unemploymentReason: null,
        employmentForm: 'ИП',
        organization: 'ИП Сидоров, г. Новосибирск',
        position: 'Разработчик',
        responsibilities: 'Разработка веб-приложений',
        salary: 'От 50000 руб. до 100000 руб.',
        internship: 'Нет',
        researchWork: 'Нет',
        departmentHelp: 'Да',
        helpDetails: 'Консультации по вопросам трудоустройства',
        careerGuidance: 'Да',
        improvements: ['Выполнение НИР и ВКР совместно с профильными организациями', 'Помощь при устройстве на практику и стажировку'],
        trudvsem: 'Да',
        submittedAt: new Date('2024-07-10T09:00:00Z')
    },
    {
        fio: 'Козлова Елена Дмитриевна',
        birthYear: 2000,
        group: '1236',
        city: 'Екатеринбург',
        direction: 'Информатика и вычислительная техника',
        specialization: 'Системы автоматизированного проектирования',
        educationForm: 'Очная',
        graduationYear: 2022,
        stillStudying: 'Нет',
        employed: 'Нет',
        unemploymentReason: 'В поиске',
        employmentForm: null,
        organization: null,
        position: null,
        responsibilities: null,
        salary: null,
        internship: 'Нет',
        researchWork: 'Нет',
        departmentHelp: 'Нет',
        helpDetails: null,
        careerGuidance: 'Нет',
        improvements: ['База стартовых профессиональных вакансий (не требующих опыта работы)', 'Помощь в написании мотивационных писем и составлении резюме'],
        trudvsem: 'Да',
        submittedAt: new Date('2024-09-05T16:45:00Z')
    },
    {
        fio: 'Морозов Дмитрий Андреевич',
        birthYear: 1996,
        group: '1232',
        city: 'Казань',
        direction: 'Информатика и вычислительная техника',
        specialization: 'Системы автоматизированного проектирования',
        educationForm: 'Очная',
        graduationYear: 2018,
        stillStudying: 'Нет',
        employed: 'Да',
        unemploymentReason: null,
        employmentForm: 'Договор ГПХ',
        organization: 'ООО "Цифровые решения", г. Казань',
        position: 'Консультант',
        responsibilities: 'Консультирование по внедрению САПР',
        salary: 'Более 100000 руб.',
        internship: 'Да',
        researchWork: 'Да',
        departmentHelp: 'Да',
        helpDetails: 'Рекомендации для трудоустройства',
        careerGuidance: 'Да',
        improvements: ['Предоставление информации о профильных работодателях', 'Экскурсии на профильные предприятия', 'Встречи с представителями работодателей'],
        trudvsem: 'Нет',
        submittedAt: new Date('2024-11-12T11:20:00Z')
    },
    {
        fio: 'Волкова Анна Павловна',
        birthYear: 2001,
        group: '1237',
        city: 'Санкт-Петербург',
        direction: 'Информатика и вычислительная техника',
        specialization: 'Системы автоматизированного проектирования',
        educationForm: 'Очная',
        graduationYear: 2023,
        stillStudying: 'Нет',
        employed: 'Да',
        unemploymentReason: null,
        employmentForm: 'Полная занятость',
        organization: 'ПАО "ТехноКомплекс", г. Санкт-Петербург',
        position: 'Младший инженер',
        responsibilities: 'Поддержка систем, тестирование',
        salary: 'Менее 50000 руб.',
        internship: 'Да',
        researchWork: 'Нет',
        departmentHelp: 'Да',
        helpDetails: 'Помощь в организации стажировки',
        careerGuidance: 'Да',
        improvements: ['Помощь при устройстве на практику и стажировку'],
        trudvsem: 'Да',
        submittedAt: new Date('2024-12-01T13:30:00Z')
    },
    {
        fio: 'Новиков Сергей Игоревич',
        birthYear: 1995,
        group: '1231',
        city: 'Нижний Новгород',
        direction: 'Информатика и вычислительная техника',
        specialization: 'Системы автоматизированного проектирования',
        educationForm: 'Заочная',
        graduationYear: 2017,
        stillStudying: 'Нет',
        employed: 'Да',
        unemploymentReason: null,
        employmentForm: 'Самозанятый',
        organization: null,
        position: 'Фрилансер',
        responsibilities: 'Разработка на заказ',
        salary: 'От 50000 руб. до 100000 руб.',
        internship: 'Нет',
        researchWork: 'Нет',
        departmentHelp: 'Нет',
        helpDetails: null,
        careerGuidance: 'Нет',
        improvements: ['База стартовых профессиональных вакансий (не требующих опыта работы)'],
        trudvsem: 'Нет',
        submittedAt: new Date('2024-06-18T15:00:00Z')
    },
    {
        fio: 'Соколова Ольга Викторовна',
        birthYear: 2002,
        group: '1238',
        city: 'Краснодар',
        direction: 'Информатика и вычислительная техника',
        specialization: 'Системы автоматизированного проектирования',
        educationForm: 'Очная',
        graduationYear: 2024,
        stillStudying: 'Да',
        employed: 'Нет',
        unemploymentReason: 'В поиске',
        employmentForm: null,
        organization: null,
        position: null,
        responsibilities: null,
        salary: null,
        internship: 'Нет',
        researchWork: 'Нет',
        departmentHelp: 'Нет',
        helpDetails: null,
        careerGuidance: 'Нет',
        improvements: ['Помощь в написании мотивационных писем и составлении резюме', 'База стартовых профессиональных вакансий (не требующих опыта работы)'],
        trudvsem: 'Да',
        submittedAt: new Date('2024-08-25T10:10:00Z')
    },
    {
        fio: 'Лебедев Павел Александрович',
        birthYear: 1994,
        group: '1230',
        city: 'Воронеж',
        direction: 'Информатика и вычислительная техника',
        specialization: 'Системы автоматизированного проектирования',
        educationForm: 'Очная',
        graduationYear: 2016,
        stillStudying: 'Нет',
        employed: 'Да',
        unemploymentReason: null,
        employmentForm: 'Полная занятость',
        organization: 'ООО "Инженерные системы", г. Воронеж',
        position: 'Ведущий инженер',
        responsibilities: 'Руководство проектами, разработка',
        salary: 'Более 100000 руб.',
        internship: 'Да',
        researchWork: 'Да',
        departmentHelp: 'Да',
        helpDetails: 'Помощь в трудоустройстве',
        careerGuidance: 'Да',
        improvements: ['Дни карьеры', 'Выполнение НИР и ВКР совместно с профильными организациями'],
        trudvsem: 'Да',
        submittedAt: new Date('2024-04-30T12:00:00Z')
    },
    {
        fio: 'Федорова Татьяна Николаевна',
        birthYear: 2003,
        group: '1239',
        city: 'Ростов-на-Дону',
        direction: 'Информатика и вычислительная техника',
        specialization: 'Системы автоматизированного проектирования',
        educationForm: 'Очная',
        graduationYear: 2025,
        stillStudying: 'Да',
        employed: 'Нет',
        unemploymentReason: 'В поиске',
        employmentForm: null,
        organization: null,
        position: null,
        responsibilities: null,
        salary: null,
        internship: 'Нет',
        researchWork: 'Нет',
        departmentHelp: 'Нет',
        helpDetails: null,
        careerGuidance: 'Нет',
        improvements: ['Помощь в написании мотивационных писем и составлении резюме'],
        trudvsem: 'Нет',
        submittedAt: new Date('2024-10-15T14:25:00Z')
    }
];

async function addTestData() {
    try {
        // Подключение к MongoDB
        await mongoose.connect(appConfig.db_url);
        console.log('Connected to MongoDB');

        // Находим опрос
        const survey = await surveyModel.findById(SURVEY_ID);
        if (!survey) {
            console.error('Survey not found!');
            process.exit(1);
        }

        console.log(`Found survey: ${survey.title}`);
        console.log(`Adding ${testResponses.length} test responses for 2024...`);

        // Создаём ответы
        for (const testData of testResponses) {
            const answers = [];

            // Формируем массив ответов на основе структуры опроса
            survey.questions.forEach(question => {
                let answer = null;

                switch (question.id) {
                    case 'q_fio':
                        answer = testData.fio;
                        break;
                    case 'q_birth_year':
                        answer = testData.birthYear;
                        break;
                    case 'q_group':
                        answer = testData.group;
                        break;
                    case 'q_city':
                        answer = testData.city;
                        break;
                    case 'q_direction':
                        answer = testData.direction;
                        break;
                    case 'q_specialization':
                        answer = testData.specialization;
                        break;
                    case 'q_education_form':
                        answer = testData.educationForm;
                        break;
                    case 'q_graduation_year':
                        answer = testData.graduationYear;
                        break;
                    case 'q_still_studying':
                        answer = testData.stillStudying;
                        break;
                    case 'q_employed':
                        answer = testData.employed;
                        break;
                    case 'q_unemployment_reason':
                        answer = testData.unemploymentReason;
                        break;
                    case 'q_employment_form':
                        answer = testData.employmentForm;
                        break;
                    case 'q_organization':
                        answer = testData.organization;
                        break;
                    case 'q_position':
                        answer = testData.position;
                        break;
                    case 'q_responsibilities':
                        answer = testData.responsibilities;
                        break;
                    case 'q_salary':
                        answer = testData.salary;
                        break;
                    case 'q_internship':
                        answer = testData.internship;
                        break;
                    case 'q_research_work':
                        answer = testData.researchWork;
                        break;
                    case 'q_department_help':
                        answer = testData.departmentHelp;
                        break;
                    case 'q_help_details':
                        answer = testData.helpDetails;
                        break;
                    case 'q_career_guidance':
                        answer = testData.careerGuidance;
                        break;
                    case 'q_improvements':
                        answer = testData.improvements;
                        break;
                    case 'q_trudvsem':
                        answer = testData.trudvsem;
                        break;
                }

                // Добавляем ответ только если он не null и вопрос обязателен, или если ответ есть
                if (answer !== null && answer !== undefined) {
                    answers.push({
                        questionId: question.id,
                        questionType: question.type,
                        answer: answer
                    });
                } else if (question.required) {
                    // Для обязательных вопросов добавляем дефолтное значение
                    if (question.type === 'radio' && question.options && question.options.length > 0) {
                        answers.push({
                            questionId: question.id,
                            questionType: question.type,
                            answer: question.options[0]
                        });
                    } else if (question.type === 'text') {
                        answers.push({
                            questionId: question.id,
                            questionType: question.type,
                            answer: 'Не указано'
                        });
                    } else if (question.type === 'number') {
                        answers.push({
                            questionId: question.id,
                            questionType: question.type,
                            answer: 2000
                        });
                    }
                }
            });

            // Создаём ответ
            const response = new surveyResponseModel({
                surveyId: SURVEY_ID,
                respondent: {
                    userId: null,
                    email: `test${Math.random().toString(36).substring(7)}@example.com`,
                    isAnonymous: true,
                    ipAddress: '127.0.0.1',
                    userAgent: 'Test Script'
                },
                answers: answers,
                submittedAt: testData.submittedAt,
                completionTime: Math.floor(Math.random() * 300) + 120, // 2-5 минут
                isComplete: true
            });

            await response.save();
            console.log(`Added response for ${testData.fio} (${testData.submittedAt.toISOString().split('T')[0]})`);
        }

        // Обновляем статистику опроса
        const totalResponses = await surveyResponseModel.countDocuments({ surveyId: SURVEY_ID });
        const lastResponse = await surveyResponseModel.findOne({ surveyId: SURVEY_ID })
            .sort({ submittedAt: -1 });

        survey.stats.totalResponses = totalResponses;
        survey.stats.lastResponseAt = lastResponse ? lastResponse.submittedAt : new Date();
        await survey.save();

        console.log(`\n✅ Successfully added ${testResponses.length} test responses for 2024`);
        console.log(`Total responses: ${totalResponses}`);

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

addTestData();


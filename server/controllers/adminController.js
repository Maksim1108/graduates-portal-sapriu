const accountModel = require("../models/accountModel.js");
const formModel = require("../models/formModel.js");
const newsModel = require("../models/newsModel.js");
const galleryModel = require("../models/galleryModel.js");
const partnerModel = require("../models/partnerModel.js");
const homeModel = require("../models/homesModel.js");

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const UserError = require("../other/error");
const sendMessageToEmail = require("../other/email").sendMessageToEmail
const datetime = require("../other/datetime");
const appConfig = require("../appConfig");

exports.index = (req, res) => res.render("admin.html", { [req.session.lang ?? 'ru']: true, isAuth: true, isAdmin: true })

exports.checkAuth = (req, res, next) => {
    if (req.session.user_id)
        accountModel.Account.findById(req.session.user_id)
            .then((acc) => {
                if (acc) next()
                else throw new UserError(req.session.lang == 'en' ? "You are not logged in!" : 'Вы не вошли в систему!', 'html')
            })
            .catch(err => next(err))
    else throw new UserError(req.session.lang == 'en' ? "You are not logged in!" : 'Вы не вошли в систему!', 'html')
}

exports.checkRole = (req, res, next) => {
    accountModel.Account.findById(req.session.user_id)
        .then((acc) => {
            if (acc.role != "admin") {
                throw new UserError(req.session.lang == 'en' ? "You are not logged in for this page!" : 'Вы не авторизованы для данной страницы!', 'html')
            }
            else next()
        })
        .catch(err => next(err))
}

exports.getForms = (req, res, next) => {

    let skip = req.query['page'] * 10

    need_fields = { _id: 1, photo: 1, name: 1, surname: 1, patronymic: 1, city: 1, phone_number: 1, status_verified: 1, update: 1 }

    formModel.find({}, need_fields, { skip: skip, limit: 10, sort: { status_verified: 1, update: -1 } })
        .then(forms => {
            let id_acc = []
            forms.forEach(form => id_acc.push(form['_id']))

            accountModel.Account.find({ _id: { $in: id_acc } }, { _id: 1, email: 1 })
                .then(accounts => {
                    forms.forEach(form => {
                        console.log(`${form['_doc'].name} ${form['_doc'].surname}`)
                        form['_doc'].email = accounts.find(acc => acc['_id'].toString() === form['_id'].toString())?.email
                    })

                    if (!skip)
                        formModel.countDocuments()
                            .then(count => res.json({ forms: forms, count_pages: Math.ceil(count / 10) }))
                    else
                        res.json({ forms: forms })
                })

        })
        .catch(err => next(err))
}

exports.updateStatuses = (req, res, next) => {

    var obj_statuses = JSON.parse(req.body.statuses_ver);
    var obj_updates = JSON.parse(req.body.statuses_upd);

    obj_statuses.forEach(el => {
        formModel.updateOne(
            { _id: el._id },
            { status_verified: el.status_verified },
        )
            .then(() => {
                if (el.status_verified)
                    sendMessageToEmail(el.email, `${el.name} ${el.patronymic}, ваша анкета была успешно одобрена администратором!`)
            })
            .then(() => {
                if (el.status_verified) {
                    return accountModel.Account.findById(el._id)
                        .then(user => {
                            if (user && user.role !== 'admin') {
                                return accountModel.Account.updateOne({ _id: el._id }, { role: 'user' })
                            }
                        })
                } else {
                    return accountModel.Account.findById(el._id)
                        .then(user => {
                            if (user && user.role !== 'admin') {
                                return accountModel.Account.updateOne({ _id: el._id }, { role: 'guest' })
                            }
                        })
                }
            })
            .catch(err => next(err))

    })

    obj_updates.forEach(el => {
        formModel.updateOne({ _id: el._id }, { update: el.update })
            .then()
            .catch(err => next(err))

    })
    res.sendStatus(200)

}

exports.updateHomepage = (req, res, next) => {
    homeModel.updateOne(
        { block: 'home' },
        req.body,
        { new: true, upsert: true }
    )
    .then(result => {
        console.log('Update result:', result);
        res.json({ success: true, result });
    })
    .catch(err => next(err));
}

exports.createReport = (req, res, next) => {

    let time = datetime.getTime(':')
    let date = datetime.getDate('-')

    let font_fat = `${appConfig.fonts_path}timesbd.ttf`;
    let font_incline = `${appConfig.fonts_path}timesi.ttf`;
    let font_default = `${appConfig.fonts_path}times.ttf`;
    let default_field = 'Не указано'

    let pdfDoc = new PDFDocument()
    let write = pdfDoc.pipe(fs.createWriteStream(`${appConfig.reports_path}report-${date}.pdf`));
    pdfDoc.font(font_default).text(`Отчёт от: ${date}`)
    pdfDoc.font(font_default).text(`Сформирован в: ${time}`)
    pdfDoc.moveDown(5).font(font_fat).fontSize(18).text(`Отчёт по всем анкетам кафедры САПРиУ`, { align: 'center' })
    pdfDoc.fontSize(12)

    formModel.find({})
        .then(forms =>
            accountModel.Account.find({})
                .then(account => {
                    forms.forEach(form => {

                        pdfDoc.addPage();
                        pdfDoc.moveTo(20, 30).lineTo(pdfDoc.page.width - 20, 30).stroke();

                        try {
                            pdfDoc.image(form['photo'], { width: 200, height: 200 })
                            pdfDoc.text('\n')
                        }
                        catch { }

                        pdfDoc.font(font_fat).text(`${(form['surname'])} ${(form['name'])} ${form['patronymic']}\n\n`);

                        pdfDoc.font(font_default).text(
                            `Дата рождения: ${form['birthday'] || default_field}\n` +
                            `Телефон: ${form['phone_number'] || default_field}\n` +
                            `Место проживания: ${form['city'] || default_field}\n` +
                            `Email: ${(account.find(acc => acc['_id'].toString() === form['_id'].toString())?.email)}\n`
                        )

                        pdfDoc.font(font_fat).text(`\nСоциальные сети: `, { continued: true })
                        if (form['social_network'].length > 0) {
                            pdfDoc.text('\n')
                            form['social_network'].forEach(net => {
                                pdfDoc.font(font_default).text(`${net['network_name']}: ${net['url']}`)
                            })
                        }
                        else pdfDoc.font(font_default).text(`${default_field}`)

                        pdfDoc.font(font_fat).text(`\nОбразование на кафедре САПРиУ: `, { continued: true });
                        if (form['education'].length > 0) {
                            form['education'].forEach(educ => {
                                pdfDoc.text('\n')
                                pdfDoc.font(font_default).text(
                                    `Год выпуска: ${educ['year_graduation'] || default_field}\n` +
                                    `Форма обучения: ${educ['educ_form'] || default_field}\n` +
                                    `Квалификация: ${educ['qualification'] || default_field}\n` +
                                    `Специальность: ${educ['specialty'] || default_field}\n` +
                                    `Направление подготовки: ${educ['dir_training'] || default_field}\n` +
                                    `Направленность: ${educ['focus'] || default_field}\n` +
                                    `Номер группы: ${educ['group'] || default_field}\n`
                                )
                            })
                        }
                        else pdfDoc.font(font_default).text(`${default_field}\n`)

                        pdfDoc.font(font_fat).text(`\nДругое образование: `, { continued: true });
                        if (form['another_education'].length > 0) {
                            form['another_education'].forEach(educ => {
                                pdfDoc.text('\n')
                                pdfDoc.font(font_default).text(
                                    `Город: ${educ['an_city'] || default_field}\n` +
                                    `Вуз: ${educ['an_uni'] || default_field}\n` +
                                    `Год окончания: ${educ['an_year_graduation'] || default_field}\n` +
                                    `Квалификация: ${educ['an_qualification'] || default_field}\n` +
                                    `Специальность: ${educ['an_specialty'] || default_field}\n` +
                                    `Направление подготовки: ${educ['an_dir_training'] || default_field}\n` +
                                    `Направленность: ${educ['an_focus'] || default_field}\n` +
                                    `Номер группы: ${educ['an_group'] || default_field}\n`
                                )
                            })
                        }
                        else pdfDoc.font(font_default).text(`${default_field}\n`)


                        pdfDoc.font(font_fat).text(`\nПреподаваемые дисциплины: `, { continued: true });
                        if (form['disciplines'].length > 0) {
                            pdfDoc.text('\n')
                            form['disciplines'].forEach(disc => {
                                pdfDoc.font(font_default).text(`Дисциплина: ${disc['value'] || default_field}\n`)
                            })
                        }
                        else pdfDoc.font(font_default).text(`${default_field}\n`)

                        pdfDoc.font(font_fat).text(`\nПартнёрство: `, { continued: true });
                        if (form['partner'] ? Object.keys(form['partner']).length != 0 : false) {
                            pdfDoc.text('\n')
                            try { pdfDoc.image(form['partner']['logo'], { width: 200, height: 200 }) }
                            catch { }
                            pdfDoc.font(font_default).text(
                                `Название компании: ${form['partner']['name'] || default_field}\n` +
                                `Год начала партнёрства: ${form['partner']['year'] || default_field}\n` +
                                `Совместные проекты: ${form['partner']['projects'] || default_field}\n` +
                                `О компании: ${form['partner']['about'] || default_field}\n` +
                                `Ссылка на сайт компании: ${form['partner']['link'] || default_field}\n`
                            )
                        }
                        else pdfDoc.font(font_default).text(`${default_field}\n`)


                        pdfDoc.font(font_fat).text(`\nДостижения: `, { continued: true });
                        if (form['achive_files'].length > 0) {
                            pdfDoc.text('\n')
                            form['achive_files'].forEach(file => {
                                // if (file.slice(11, 15) == 'jpeg')file = file.slice(0, 11) + 'jpg' + file.slice(15)
                                try { pdfDoc.image(file, { width: 200, height: 200 }) }
                                catch { }
                            })
                        }
                        else pdfDoc.font(font_default).text(`${default_field}\n`)


                        pdfDoc.font(font_default).text(`\n\nДополнительное образование: ${form['other_education'] || default_field}\n`)
                        pdfDoc.font(font_default).text(`Учёная степень: ${form['academ_degree'] || default_field}\n`)
                        pdfDoc.font(font_default).text(`Учёное звание: ${form['academ_rank'] || default_field}\n`)
                        pdfDoc.font(font_default).text(`Место работы в настоящее время: ${form['work_place'] || default_field}\n`)
                        pdfDoc.font(font_default).text(`Сфера деятельности: ${form['field_activety'] || default_field}\n`)
                        pdfDoc.font(font_default).text(`Занимаемая должность: ${form['position'] || default_field}\n`)
                        pdfDoc.font(font_default).text(`Хобби: ${form['hobby'] || default_field}\n`)
                        pdfDoc.font(font_default).text(`Best practices: ${form['best_practices'] || default_field}\n`)


                        pdfDoc.font(font_incline).text(`\n\nПоддерживаете ли Вы отношения с другими выпускниками СПбГТИ? Если да, то в каких формах?`);
                        pdfDoc.font(font_default).text(`${form['q1']?.join('; ') || default_field}`);
                        pdfDoc.font(font_incline).text(`\nЧем может быть полезен университет для Вашей деятельности?`)
                        pdfDoc.font(font_default).text(`${form['q2']?.join('; ') || default_field}`)
                        pdfDoc.font(font_incline).text(`\nЧем Ассоциация выпускников может быть Вам полезна?`)
                        pdfDoc.font(font_default).text(`${form['q3'] || default_field}`)
                        pdfDoc.font(font_incline).text(`\nМожете ли Вы оказать содействие в развитии университета? Если да, то в какой форме?`)
                        pdfDoc.font(font_default).text(`${form['q4']?.join('; ') || default_field}`)
                        pdfDoc.font(font_incline).text(`\nЕсть ли у вас материалы, которые могут быть использованы в музее истории университета? Если да, то какие?`)
                        pdfDoc.font(font_default).text(`${form['q5']?.join('; ') || default_field}`)
                        pdfDoc.font(font_incline).text(`\nКакие сведения Вы хотите сообщить о себе дополнительно?`)
                        pdfDoc.font(font_default).text(`${form['q6'] || default_field}`)
                        pdfDoc.font(font_incline).text(`\nГотовы ли вы принять участие в праздничном концерте, посвященном юбилею кафедры? И с чем?`)
                        pdfDoc.font(font_default).text(`${form['q7'] || default_field}`)

                    })
                    pdfDoc.end();

                    write.on('finish', () => res.download(`${path.dirname(__dirname)}/other/reports/report-${date}.pdf`, `/report-${date}.pdf`))
                })
        )
        .catch(err => next(err))
}

exports.statistic = (req, res) => res.render("adminStatistic.html", { [req.session.lang ?? 'ru']: true, isAuth: true, isAdmin: true })

exports.AddPartners = (req, res) => res.render("partners_admin.html", {
    [req.session.lang ?? 'ru']: true,
    isAuth: true,
    isAdmin: true,
    base_path: req.app.locals.base_path 
})

exports.EditPartners = (req, res) => res.render("partner_edit.html", {
    [req.session.lang ?? 'ru']: true,
    isAuth: true,
    isAdmin: true,
});



exports.statisticPartners = (req, res) => res.render("adminStatisticPartners.html", { [req.session.lang ?? 'ru']: true, isAuth: true, isAdmin: true })

exports.getStatistic = (req, res) => {

    let data_statistic = {
        'year_graduation': {},
        'educ_form': {},
        'qualification': {},
        'specialty': {},
        'dir_training': {},
        'focus': {},
        'group': {},
        'city': {},
    }

    const cities = [];

    formModel.find({})
        .then(forms => {
            forms.forEach(form => {
                form['education'].forEach(educ => {
                    for (key in data_statistic)
                        if (educ[key])
                            data_statistic[key][educ[key]] ? data_statistic[key][educ[key]]++ : data_statistic[key][educ[key]] = 1
                })
            })
            res.json(data_statistic)
        })
        .catch(err => next(err))
}

exports.getStatisticPartners = async (req, res) => {

    let sapr, other;
    let params = { isPartner: true };
    let data_statistic = {
        'ended': {
            САПР: await formModel.countDocuments({ isPartner: true, education: { $exists: true, $ne: [] } }, function (err, count) {
                if (err) return handleError(err);
                return count;
            }),
            Нет: await formModel.countDocuments(params, function (err, count) {
                if (err) return handleError(err);
                return count;
            })
        },
        'city': {},
        'field_activety': {},
        'count_users_company': {},
        'startPartnership': {},
        'endPartnership': {},
    }
    const cities = [];
    const start = {};
    const end = {};
    await partnerModel.find({})
        .then(partners => {
            partners.map((partner) => {
                cities.push({
                    'name_company': partner['companyName'],
                    'city': partner['country_city'],
                });
                if (partner['end_year']) end[partner['end_year']] = end[partner['end_year']] ? end[partner['end_year']] + 1 : 1;
                start[partner['year']] = start[partner['year']] ? start[partner['year']] + 1 : 1;
            });
        })
    data_statistic['city'] = [...new Set(cities)];
    data_statistic['startPartnership'] = { ...start };
    data_statistic['endPartnership'] = end;

    await formModel.find(params)
        .then(forms => {
            let arr = [];
            forms.forEach(form => {
                arr.push({
                    'name_company': form['partner'],
                    'city': form['city'],
                });

                if (form['field_activety'])
                    data_statistic['field_activety'][form['field_activety']] ? data_statistic['field_activety'][form['field_activety']]++ : data_statistic['field_activety'][form['field_activety']] = 1
                data_statistic['count_users_company'][form['partner']] ? data_statistic['count_users_company'][form['partner']]++ : data_statistic['count_users_company'][form['partner']] = 1
            })
            data_statistic['city'] = [...new Set(arr)];
            res.json(data_statistic)
        })
        .catch(err => next(err))

    data_statistic.ended = { sapr, other };

}

exports.stats = async (req, res, next) => {
    try {
        const [totalUsers, totalForms, totalNews, totalImages, totalPartners] = await Promise.all([
            accountModel.Account.countDocuments({}),
            formModel.countDocuments({}),
            newsModel.countDocuments({}),
            galleryModel.countDocuments({}),
            partnerModel.countDocuments({}),
        ])

        res.json({
            totalUsers,
            totalForms,
            totalNews,
            totalImages,
            totalPartners,
        })
    } catch (err) {
        next(err)
    }
}

exports.deletePartner = async (req, res, next) => {
    partnerModel.deleteOne({ _id: req.body.id })
        .then()
        .catch(err => next(err));

    res.sendStatus(200);
}

exports.getUsers = async (req, res, next) => {
    try {
        const users = await accountModel.Account.find({}, { password: 0, verify_hash: 0 })
        res.json({ users })
    } catch (err) {
        next(err)
    }
}

exports.toggleUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params
        const user = await accountModel.Account.findById(id)
        if (!user) return res.status(404).json({ success: false, msg: 'User not found' })
        user.active = !user.active
        await user.save()
        res.json({ success: true, active: user.active })
    } catch (err) {
        next(err)
    }
}

exports.deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params
        await Promise.all([
            accountModel.Account.deleteOne({ _id: id }),
            formModel.deleteOne({ _id: id }),
            galleryModel.deleteMany({ user_id: id })
        ])
        res.json({ success: true })
    } catch (err) {
        next(err)
    }
}

exports.getUserProfile = async (req, res, next) => {
    try {
        const { id } = req.params
        
        const user = await accountModel.Account.findById(id, { password: 0, verify_hash: 0 })
        if (!user) {
            return res.status(404).json({ success: false, msg: 'User not found' })
        }
        
        const form = await formModel.findById(id)
        
        res.json({ 
            success: true, 
            user: user,
            profile: form || null
        })
    } catch (err) {
        next(err)
    }
}

exports.getUsersWithProfiles = async (req, res, next) => {
    try {
        const users = await accountModel.Account.find({}, { password: 0, verify_hash: 0 })
        
        const usersWithProfiles = await Promise.all(
            users.map(async (user) => {
                const form = await formModel.findById(user._id)
                return {
                    ...user.toObject(),
                    profileStatus: form ? (form.status_verified ? 'verified' : 'pending') : 'no_profile'
                }
            })
        )
        
        res.json({ users: usersWithProfiles })
    } catch (err) {
        next(err)
    }
}

exports.verifyProfile = async (req, res, next) => {
    try {
        const { id } = req.params
        const { verified } = req.body
        
        const form = await formModel.findById(id)
        if (!form) {
            return res.status(404).json({ success: false, msg: 'Profile not found' })
        }
        
        form.status_verified = verified
        await form.save()
        
        const user = await accountModel.Account.findById(id)
        if (user && user.role !== 'admin') {
            user.role = verified ? 'user' : 'guest'
            await user.save()
        }
        
        res.json({ success: true, verified })
    } catch (err) {
        next(err)
    }
}
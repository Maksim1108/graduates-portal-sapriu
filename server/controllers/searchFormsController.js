const formModel = require("../models/formModel.js");

exports.index = (req, res) => res.render("search_graduate.html", {
    [req.session.lang ?? 'ru']: true,
    isAuth: Boolean(req.session.user_id),
    isAdmin: Boolean(req.session.role == "admin")
})

exports.searchForms = (req, res, next) => {

    name_fields = [
        'name',
        'surname',
        'patronymic',
        'education.group',
        'education.year_graduation',
        'education.specialty',
        'education.focus',
        'city',
    ]
    params = { status_verified: true }
    let skip = 0

    for (key in req.query) {
        if (name_fields.indexOf(key) != -1 && req.query[key])
            params[key] = req.query[key]
        else if (key == 'page')
            skip = parseInt(req.query[key], 10) * 10
    }
    need_fields = {
        '_id': 1,
        'photo': 1,
        'name': 1,
        'surname': 1,
        'patronymic': 1,
        'city': 1,
        'education.year_graduation': 1,
    }
    formModel.find(params, need_fields, { skip: skip, limit: 10 })
        .then(forms => {
            for (let i = 0; i < forms.length; i++) {
                if (forms[i]['education'].length > 0)
                    forms[i]['education'] = forms[i]['education'][forms[i]['education'].length - 1]

            }
            if (!skip) {
                formModel.find(params).countDocuments()
                    .then(count => res.json({ forms: forms, count_pages: Math.ceil(count / 10) }))
            }
            else res.json({ forms: forms })
        })
        .catch(err => next(err))
}

exports.getForm = (req, res, next) => {

    let need_fields = {}
    let full = true

    if (req.session.role === 'guest' || !req.session.role) {
        need_fields = { name: 1, surname: 1, patronymic: 1, photo: 1 }
        full = false
    }

    formModel.findById(req.params['id'], need_fields)
        .then(form => {
            if (!form) {
                var err = new Error('Not Found');
                err.status = 404;
                return next(err);
            }
            else {
            form = form._doc
            form.full = full

            res.render("account.html", {
                [req.session.lang ?? 'ru']: true,
                form: form, isAuth: Boolean(req.session.user_id),
                isAdmin: Boolean(req.session.role == "admin")
            })
            }
        })
        .catch(err => next(err))
}

exports.getFormData = (req, res, next) => {
    formModel.findById(req.params['id'])
        .then(form => {
            if (!form) {
                return res.status(404).json({ success: false, msg: 'Form not found' })
            }
            
            res.json({
                success: true,
                form: form
            })
        })
        .catch(err => next(err))
}


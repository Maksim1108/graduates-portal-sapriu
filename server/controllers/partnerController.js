const formModelPartner = require("../models/partnerModel.js");
const formModel = require("../models/formModel.js");

exports.index = (req, res) => {
  try {
    res.render("partners.html", {
      [req.session.lang ?? 'ru']: true,
      isAuth: Boolean(req.session.user_id),
      isAdmin: Boolean(req.session.role == "admin"),
      base_path: req.app.locals.base_path
    });
  } catch (err) {
    console.error('Ошибка в partnerController.index:', err);
    res.status(500).send(`<pre style='color:red'>${err && err.stack ? err.stack : err}</pre>`);
  }
};

exports.searchForms = (req, res, next) => {

  name_fields = [
    'companyName',
    'name',
    'partner.name',
    'year',
    'end_year',
  ]
  params = {}
  let skip = 0

  for (key in req.query) {
    if (name_fields.indexOf(key) != -1 && req.query[key]) {
      if (key == 'companyName') {
        params.$or = [
          { companyName: RegExp(req.query[key], "i") },
          { "forsearch.value": RegExp(req.query[key], "i") }
        ]
      }
      else
        params[key] = RegExp(req.query[key], "i")
    }
    else if (key == 'page')
      skip = parseInt(req.query[key], 10) * 10
  }

  need_fields = {
    '_id': 1,
    'logo': 1,
    'companyName': 1,
    'companyFullName': 1,
    'country_city': 1,
    'represent_name': 1,
    'year': 1,
    'end_year': 1,
    'projects': 1,
    'about': 1,
    'link': 1,
    'vacancies': 1,
  }

  formModelPartner.find(params, need_fields, { skip: skip, limit: 10 })
    .then(forms => {
      if (forms) {
        formModelPartner.find(params).countDocuments()
          .then(count => res.json({ partners: forms, count: count }))
      }
      else res.json({ partners: {} })
    })
    .catch(err => next(err))
}

exports.createPartner = (req, res, next) => {
  newPartner = req.body;

  formModelPartner.create(newPartner)
    .then((form) => {
      if (form) res.sendStatus(201);
    })
    .catch(err => next(err))
}

exports.updatePartner = (req, res, next) => {
  const { id } = req.params;
  newPartner = req.body;

  formModelPartner.updateOne({ _id: id }, newPartner)
    .then((partner) => {
      if (partner) res.status(200).json({ ...partner });
    })
    .catch(err => next(err))
}

exports.deletePartner = (req, res, next) => {
  const { id } = req.params;

  formModelPartner.deleteOne({ _id: id })
    .then((partner) => {
      if (partner) res.status(204).json({ ...partner });
    })
    .catch(err => next(err))
}

exports.getPartnersList = (req, res, next) => {
  formModelPartner.find({})
    .then((partners) => {
      if (partners.length) {
        res.status(200).json({ partnersList: partners.map((partner) => ({ id: partner.id, name: partner.companyName })) })
      }
    })
    .catch(err => next(err))
}

exports.getRepresentersList = (req, res, next) => {
  formModel.find({ isPartner: true })
    .then((users) => {
      const representersList = {};
      if (users.length) {
        users.map((user) => {
          if (!representersList[user.partner]) representersList[user.partner] = [];
        });

        users.map((user) => {
          representersList[user.partner].push({
            img: user.photo,
            name: `${user.name} ${user.patronymic} ${user.surname}`,
            partner: user.partner,
            city: user.city,
            id: user.id,
          });
        })
      }
      res.status(200).json({ representersList })
    })
    .catch(err => next(err))
}

exports.getPartner = (req, res, next) => {
  const { id } = req.params;

  formModelPartner.findOne({ _id: id })
    .then((partner) => {
      if (partner) {
        res.status(200).json(partner)
      }
    })
    .catch(err => next(err))
}

exports.getFormPartner = (req, res, next) => {

  let need_fields = {}
  let full = true

  if (req.session.role === 'guest' || !req.session.role) {
    need_fields = { name: 1, surname: 1, patronymic: 1, photo: 1 }
    full = false
  }

  formModel.findById(req.params['id'], need_fields)
    .then(form => {
      form = form._doc
      form.full = full

      res.render("account.html", {
        [req.session.lang ?? 'ru']: true,
        form: form, isAuth: Boolean(req.session.user_id),
        isAdmin: Boolean(req.session.role == "admin")
      })
    })
    .catch(err => next(err))

}

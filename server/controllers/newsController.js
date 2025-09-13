const newsModel = require("../models/newsModel.js");

exports.index = (req, res, next) => {
    newsModel.find().sort({ date: -1 })
        .then(news => {
            res.render("news.html", {
                [req.session.lang ?? 'ru']: true,
                isAuth: Boolean(req.session.user_id),
                isAdmin: Boolean(req.session.role == 'admin'),
                news
            });
        })
        .catch(err => next(err));
};

exports.AddNews = (req, res) => res.render("add_news.html", { [req.session.lang ?? 'ru']: true, isAuth: true, isAdmin: true })

exports.EditNews = (req, res) => res.render("edit_news.html", {
    [req.session.lang ?? 'ru']: true,
    isAuth: true,
    isAdmin: true,
});

exports.EditSection = (req, res) => res.render("edit_section.html", {
    [req.session.lang ?? 'ru']: true,
    isAuth: true,
    isAdmin: true,
});

exports.deleteNews = async (req, res, next) => {
  const { params: { id: _id } } = req;
  newsModel.deleteOne({ _id })
    .then((data) => { res.sendStatus(204); })
    .catch(err => next(err));
}

exports.searchForms = (req, res, next) => {

    name_fields = [
      'heading',
      'name',
      'partner.name',
      'year',
      'end_year',
    ]
    params = {}
    let skip = 0
  
    for (key in req.query) {
      if (name_fields.indexOf(key) != -1 && req.query[key]) {
        if (key == 'heading') {
          params.$or = [
            { heading: RegExp(req.query[key], "i") },
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
      'heading': 1,
      'text': 1,
      'full_text': 1,
      'date': 1,
    }
  
  newsModel.find(params, need_fields, { skip: skip, limit: 10 })
    .then(news => {
      if (news) {
          formModelPartner.find(params).countDocuments()
            .then(count => res.json({ news, count }))
        }
      else res.json({ news: {} })
      })
    .catch(err => next(err))
}

exports.create = (req, res, next) => {
  newsModel.create(req.body)
    .then((data) => { res.sendStatus(201); })
    .catch(err => next(err));
}

exports.read = (req, res, next) => {
  newsModel.find().sort({ date: -1 })
    .then((news) => { res.json({ news }); })
    .catch((err) => { res.sendStatus(400); console.log(err); });
}

exports.update = (req, res, next) => {
  const { params: { _id } } = req;
  newsModel.updateOne({ _id }, req.body)
    .then((data) => { res.sendStatus(200); })
    .catch(err => next(err));
}


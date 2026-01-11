const homesModel = require("../models/homesModel.js");

const index = (req, res, next) => res.render("index.html", {
  [req.session.lang ?? 'ru']: true,
  isAuth: Boolean(req.session.user_id),
  isAdmin: Boolean(req.session.role == 'admin')
});

const politic = (req, res, next) => res.render("politic.html", {
  [req.session.lang ?? 'ru']: true,
  isAuth: Boolean(req.session.user_id),
  isAdmin: Boolean(req.session.role == 'admin')
});

const setLang = (req, res) => {
  req.session.lang = req.body.lang
  res.sendStatus(200);
}

async function getHomepage(req, res, next) {
  try {
    const data = await homesModel.findOne({ block: 'home' }).lean()
    if (!data) {
      return res.status(200).json({
        block: 'home',
        title: '',
        titleru: '',
        about: '',
        aboutru: '',
        images: ['/graduate/images/photoUni.png']
      })
    }
    
    if (data.images && Array.isArray(data.images)) {
      data.images = data.images.map(img => {
        if (img && img.startsWith('/images/')) {
          return img.replace('/images/', '/graduate/images/')
        }
        return img
      })
    }
    
    return res.status(200).json(data)
  } catch (err) {
    console.error('getHomepage error:', err)
    return res.status(200).json({
      block: 'home',
      title: '',
      titleru: '',
      about: '',
      aboutru: '',
      images: ['/graduate/images/photoUni.png']
    })
  }
}

module.exports = { getHomepage, setLang, index, politic }

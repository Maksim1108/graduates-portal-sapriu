const editMainPageModel = require("../models/editMainPageModel.js")
const base64 = require("../other/workWithBS64")
const appConfig = require("../appConfig")

exports.admin = (req, res, next) => res.render("edit_main_page.html", {
    [req.session.lang ?? 'ru']: true,
    isAuth: Boolean(req.session.user_id),
    isAdmin: Boolean(req.session.role == 'admin')
});

exports.getTruePhotos = (req, res, next) => {

    need_fields = {}

    page = req.query.page
    skip = parseInt(page, 10) * 10

    galleryModel.find({ 'status': true }, {}, { skip: skip, limit: 10 })
        .then((photos => {
            photos.forEach((photo, i) =>
                photos[i]['_doc']['img'] = base64.readFile(`${appConfig.gallery_path}${photo.img_name}`)
            )
            if (!skip) {
                galleryModel.find({ 'status': true }).countDocuments()
                    .then(count => res.json({ photos: photos, count_pages: Math.ceil(count / 10) }))
            }
            else res.json({ photos: photos })
        }))
        .catch(err => next(err))
}

exports.getAllPhotos = (req, res, next) => {

    page = req.query.page
    skip = parseInt(page, 10) * 10

    galleryModel.find({}, {}, { skip: skip, limit: 10 })
        .then((photos => {
            photos.forEach((photo, i) =>
                photos[i]['_doc']['img'] = base64.readFile(`${appConfig.gallery_path}${photo.img_name}`)
            )
            if (!skip) {
                galleryModel.find({}).countDocuments()
                    .then(count => res.json({ photos: photos, count_pages: Math.ceil(count / 10) }))
            }
            else res.json({ photos: photos })
        }))
        .catch(err => next(err))
}

exports.updateStatuses = (req, res, next) => {

    statuses = req.body
    console.log(statuses)
    for (key in statuses) {
        galleryModel.updateOne(
            { _id: key },
            { status: statuses[key] },
        )
            .then()
            .catch(err => next(err))
    }
    res.sendStatus(200)
}
const galleryModel = require("../models/galleryModel.js")
const base64 = require("../other/workWithBS64")
const appConfig = require("../appConfig")
const fs = require('fs')
const multer = require('multer')
const path = require('path')

exports.index = (req, res, next) => res.render("gallery.html", {
    [req.session.lang ?? 'ru']: true,
    isAuth: Boolean(req.session.user_id),
    isAdmin: Boolean(req.session.role == 'admin')
})

exports.admin = (req, res, next) => res.render("gallery_admin.html", {
    [req.session.lang ?? 'ru']: true,
    isAuth: Boolean(req.session.user_id),
    isAdmin: Boolean(req.session.role == 'admin'),
    base_path: req.app.locals.base_path
})

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

exports.deletePhoto = (req, res, next) => {
    const { id } = req.params
    if (!id) return res.status(400).json({ success: false, msg: 'No id provided' })

    galleryModel.findByIdAndDelete(id)
        .then((doc) => {
            if (doc && doc.img_name) {
                const filePath = `${appConfig.gallery_path}${doc.img_name}`
                fs.unlink(filePath, (err) => {
                    if (err) console.error('Error deleting file:', err)
                })
            }
            return res.sendStatus(204)
        })
        .catch(err => next(err))
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = appConfig.gallery_path
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true })
        }
        cb(null, uploadPath)
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        const ext = path.extname(file.originalname)
        cb(null, `gallery-${uniqueSuffix}${ext}`)
    }
})

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true)
        } else {
            cb(new Error('Only image files are allowed'), false)
        }
    }
})

exports.uploadImages = [
    upload.array('images', 10),
    async (req, res, next) => {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No files uploaded'
                })
            }

            const userId = req.session.user_id
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                })
            }

            if (req.session.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Admin access required'
                })
            }

            const uploadedImages = []
            
            for (const file of req.files) {
                const imageData = {
                    user_id: userId,
                    img_name: file.filename,
                    status: true,
                    comment: req.body.comment || ''
                }

                const savedImage = await galleryModel.create(imageData)
                uploadedImages.push({
                    _id: savedImage._id,
                    img_name: savedImage.img_name,
                    status: savedImage.status,
                    comment: savedImage.comment
                })
            }

            res.json({
                success: true,
                message: `${uploadedImages.length} image(s) uploaded successfully`,
                images: uploadedImages
            })
        } catch (error) {
            console.error('Gallery upload error:', error)
            res.status(500).json({
                success: false,
                message: 'Error uploading images'
            })
        }
    }
]

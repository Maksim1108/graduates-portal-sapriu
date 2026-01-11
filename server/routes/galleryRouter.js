'use strict';
const express = require('express');
const galleryController = require("../controllers/galleryController.js");
const galleryRouter = express.Router();
const jsonParser = express.json();

galleryRouter.get('/', jsonParser, galleryController.index)
galleryRouter.get('/admin', jsonParser, galleryController.admin)

galleryRouter.get('/get_true', jsonParser, galleryController.getTruePhotos)
galleryRouter.get('/get_all', jsonParser, galleryController.getAllPhotos)
galleryRouter.post('/update_statuses', jsonParser, galleryController.updateStatuses)
galleryRouter.post('/upload', galleryController.uploadImages)
galleryRouter.delete('/:id', jsonParser, galleryController.deletePhoto)

module.exports = galleryRouter;
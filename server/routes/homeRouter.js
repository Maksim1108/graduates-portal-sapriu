'use strict';
const express = require('express');
const homeController = require("../controllers/homeController.js");
const homeRouter = express.Router();

homeRouter.get('/', homeController.index);
homeRouter.get('/politic', homeController.politic);
homeRouter.post('/set_lang', homeController.setLang);
homeRouter.get('/get_homepage', homeController.getHomepage)

module.exports = homeRouter;

'use strict';
const express = require('express');
const editMainPageRouterController = require("../controllers/editMainPageController");
const editMainPageRouter = express.Router();
const jsonParser = express.json();

editMainPageRouter.get('/admin', jsonParser, editMainPageRouterController.admin)

module.exports = editMainPageRouter;
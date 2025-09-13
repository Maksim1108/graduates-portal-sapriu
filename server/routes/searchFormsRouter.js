'use strict';
const express = require('express');
const searchFormsController = require("../controllers/searchFormsController.js");
const searchFormsRouter = express.Router();
const jsonParser = express.json();

searchFormsRouter.get('/', jsonParser, searchFormsController.index);
searchFormsRouter.get('/search', jsonParser, searchFormsController.searchForms);
searchFormsRouter.get('/get_form/:id', jsonParser, searchFormsController.getFormData);
searchFormsRouter.get('/:id', jsonParser, searchFormsController.getForm);

module.exports = searchFormsRouter;
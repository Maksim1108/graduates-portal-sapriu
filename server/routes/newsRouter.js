'use strict';
const express = require('express');
const newsController = require("../controllers/newsController.js");
const newsRouter = express.Router();
const jsonParser = express.json();

newsRouter.get('/', newsController.index);

// CRUD routes
newsRouter.post('/', jsonParser, newsController.create);
newsRouter.get('/get', jsonParser, newsController.read);
newsRouter.put('/:_id', jsonParser, newsController.update);

newsRouter.get('/add_news', jsonParser, newsController.AddNews)
newsRouter.get('/edit_news', jsonParser, newsController.EditNews)
newsRouter.get('/edit_section', jsonParser, newsController.EditSection)
newsRouter.delete('/:id', jsonParser, newsController.deleteNews);
newsRouter.get('/search', jsonParser, newsController.searchForms);

module.exports = newsRouter;

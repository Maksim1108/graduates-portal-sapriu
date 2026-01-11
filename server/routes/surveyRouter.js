'use strict'
const express = require('express')
const surveyController = require("../controllers/surveyController")
const adminController = require("../controllers/adminController")
const surveyRouter = express.Router()
const jsonParser = express.json()

surveyRouter.use('/admin/*', jsonParser, adminController.checkAuth, adminController.checkRole);

surveyRouter.get('/admin/surveys', surveyController.getAllSurveys);
surveyRouter.post('/admin/surveys', surveyController.createSurvey);
surveyRouter.get('/admin/surveys/:id', surveyController.getSurveyById);
surveyRouter.put('/admin/surveys/:id', surveyController.updateSurvey);
surveyRouter.delete('/admin/surveys/:id', surveyController.deleteSurvey);

surveyRouter.get('/admin/surveys/:id/stats', surveyController.getSurveyStats);
surveyRouter.get('/admin/surveys/:id/stats/yearly', surveyController.getYearlyStats);
surveyRouter.get('/admin/surveys/:id/export/pdf', surveyController.exportToPDF);
surveyRouter.get('/admin/surveys/:id/export/pdf-charts', surveyController.exportToPDFWithCharts);
surveyRouter.get('/admin/surveys/:id/export/word', surveyController.exportToWord);

surveyRouter.get('/public/surveys', jsonParser, surveyController.getPublicSurveys);

surveyRouter.get('/public/surveys/:id', jsonParser, surveyController.getSurveyForResponse);

surveyRouter.post('/public/surveys/:id/submit', jsonParser, surveyController.submitSurveyResponse);

module.exports = surveyRouter;


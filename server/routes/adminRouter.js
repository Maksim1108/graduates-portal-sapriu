'use strict'
const express = require('express')
const adminController = require("../controllers/adminController.js")
const adminRouter = express.Router()
const jsonParser = express.json()

adminRouter.get('/', jsonParser, adminController.checkAuth, adminController.checkRole, adminController.index)
adminRouter.get('/get_forms', jsonParser, adminController.checkAuth, adminController.checkRole, adminController.getForms)
adminRouter.get('/get_full_report', jsonParser, adminController.createReport)
adminRouter.get('/statistic/', jsonParser, adminController.statistic)
adminRouter.get('/statistic/get_statistic', jsonParser, adminController.getStatistic)
adminRouter.get('/statistic_partners/', jsonParser, adminController.statisticPartners)
adminRouter.get('/add_partners/', jsonParser, adminController.AddPartners)
adminRouter.get('/edit_partner/', jsonParser, adminController.EditPartners)
adminRouter.get('/statistic_partners/get_statistic', jsonParser, adminController.getStatisticPartners)
adminRouter.post('/update_statuses', jsonParser, adminController.updateStatuses)
adminRouter.delete('/delete_partner', jsonParser, adminController.deletePartner)
adminRouter.post('/update_homepage', jsonParser, adminController.updateHomepage)
adminRouter.get('/stats', jsonParser, adminController.stats)

adminRouter.get('/users', jsonParser, adminController.getUsers)
adminRouter.get('/users-with-profiles', jsonParser, adminController.getUsersWithProfiles)
adminRouter.get('/users/:id/profile', jsonParser, adminController.getUserProfile)
adminRouter.post('/verify-profile/:id', jsonParser, adminController.verifyProfile)
adminRouter.post('/users/:id/toggle-status', jsonParser, adminController.toggleUserStatus)
adminRouter.delete('/users/:id', jsonParser, adminController.deleteUser)


module.exports = adminRouter;


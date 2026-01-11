'use strict';
const express = require('express');
const partnerController = require("../controllers/partnerController.js");
const partnerRouter = express.Router();
const jsonParser = express.json();

partnerRouter.get('/', jsonParser, partnerController.index);
partnerRouter.get('/representers', jsonParser, partnerController.getRepresentersList);
partnerRouter.get('/list', jsonParser, partnerController.getPartnersList);
partnerRouter.get('/search', jsonParser, partnerController.searchForms);
partnerRouter.post('/', jsonParser, partnerController.createPartner);
partnerRouter.get('/:id', jsonParser, partnerController.getPartner);
partnerRouter.put('/:id', jsonParser, partnerController.updatePartner);
partnerRouter.delete('/:id', jsonParser, partnerController.deletePartner);

module.exports = partnerRouter;

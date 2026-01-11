'use strict';
const express = require('express');
const accountController = require("../controllers/accountController.js");
const accountRouter = express.Router();
const jsonParser = express.json();
const Recaptcha = require('express-recaptcha').RecaptchaV3;
const recaptcha = new Recaptcha('6LcDWFAbAAAAAIldozRSviiUw4s_MIbu2IFKjL0E', '6LcDWFAbAAAAAEyT-FBWTKcGthyG1e1Dlu0tFPTT',{callback:'cb'});

accountRouter.get('/', recaptcha.middleware.render, accountController.index);
accountRouter.get('/profile', jsonParser, accountController.checkRole, accountController.getProfile);
accountRouter.get("/confirm-email/:hash", jsonParser, accountController.confirmEmail);
accountRouter.get("/logout", jsonParser, accountController.logout);

accountRouter.post("/reg", jsonParser, accountController.checkBeforeReg, accountController.reg);

accountRouter.post("/login", jsonParser, recaptcha.middleware.verify, accountController.checkBeforeLogin, accountController.login);

accountRouter.post("/reset_pass/send_link", jsonParser, accountController.ReqResetPasswordHandler);
accountRouter.get("/reset_pass/:hash", jsonParser, accountController.inputNewPass);
accountRouter.post("/reset_pass", jsonParser, accountController.findReq, 
                                              accountController.resetPass)


accountRouter.get('/form', jsonParser, accountController.checkRole, 
                                       accountController.returnForm)

accountRouter.post('/form/get_data', jsonParser, accountController.checkRole,
                                                 accountController.getFormData)

accountRouter.post('/form', jsonParser, accountController.checkRole,
                                        accountController.createForm)
                                        
accountRouter.delete('/form', jsonParser, accountController.checkRole,
                                                accountController.deleteForm)

accountRouter.post('/change-password', jsonParser, accountController.checkRole,
                                                    accountController.changePassword)

accountRouter.delete('/delete', jsonParser, accountController.checkRole,
                                                accountController.deleteAccount)

accountRouter.post('/upload-avatar', accountController.checkRole,
                                    accountController.uploadAvatar)
                                        
module.exports = accountRouter;

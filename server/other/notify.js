const formModel = require("../models/formModel.js");
const sendNotifyToEmail = require("./email").sendMessageToEmail
const admin_email = require("../appConfig").admin_email;

exports.notifyForNewForms = () => {
    formModel.countDocuments( {$or : [{status_verified: false}, {update: true}]} )
    .then(count => {
        if (count) sendNotifyToEmail(admin_email, `На портале имеются непроверенные анкеты в количестве ${count} шт.`)
    })
}

module.exports = () => {
    const interval_obj = setInterval(() => {
        var hour = new Date().getHours();
        if (hour == 13) {
            clearInterval(interval_obj)
            this.notifyForNewForms()
            setInterval(this.notifyForNewForms, 1000 * 60 * 60 * 24)
        }
    }, 1000 * 60 * 30)
}


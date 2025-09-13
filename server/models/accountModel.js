const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const accountSchema = new Schema(
    {
        email: {type: String, required: true, unique: true},
        password: { type: String, required: true },
        active: {type: Boolean, required: true},
        verify_hash: {type: String, required: true},
        role: {type: String, required: true},
    },
    { versionKey: false }
);

const reqResetPassSchema = new Schema(
    {
        email: { type: String, required: true, unique: true},
        verify_hash: { type: String, required: true, unique: true },
    },
    { versionKey: false }
);

const ResetPass = mongoose.model("password_reset_requests", reqResetPassSchema);
const Account = mongoose.model("account", accountSchema);

module.exports = {
   Account,
   ResetPass
}
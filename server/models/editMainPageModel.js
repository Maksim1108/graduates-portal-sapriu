const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const editMainPageScheme = new Schema(
    {
        heading: { type: String },
        img_1: { type: String, required: true },
        img_2: { type: String, required: true },
        img_3: { type: String, required: true },
        about_us: { type: Boolean, required: true }
    },
    { versionKey: false }
);

module.exports = mongoose.model("editMainPage", editMainPageScheme);
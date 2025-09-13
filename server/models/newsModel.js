const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const NewsScheme = new Schema(
    {
        images: [{type: String}],
        heading: { type: String },
        date: { type: Date },
        text: { type: String },
        full_text: { type: String },
    },
    { versionKey: false }
);

module.exports = mongoose.model("news", NewsScheme);

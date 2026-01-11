const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const newsScheme = new Schema(
    {
        title: {type: String, required: true},
        text: {type: String, required: true},
        date: {type: String, required: true},
        image: {type: String, required: true}
    },
    { versionKey: false }
);

module.exports = mongoose.model("portal_news", newsScheme);


const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const newsScheme = new Schema(
    {
        user_id: { type: ObjectId},
        comment: {type: String},
        img_name: {type: String, required: true},
        status: {type: Boolean, required: true}
        
    },
    { versionKey: false }
);

module.exports = mongoose.model("archive_photos", newsScheme);

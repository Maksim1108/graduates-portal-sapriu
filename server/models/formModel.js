const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const formScheme = new Schema(
    {   
        _id: { type: ObjectId},
        status_verified: {type: Boolean},
        update: {type: Boolean},
        photo: {type: String},
        birthday: { type: String},
        phone_number: {type: String},
        city: {type: String},
        hobby: {type: String},
        other_education: {type: String},
        academ_degree: { type: String},
        academ_rank: { type: String},
        work_place: { type: String},
        field_activety: { type: String},
        position: { type: String},
        isLecturer: {type: Boolean},
        disciplines: [ {type: Object} ],
        isPartner: {type: Boolean},
        partner: {type: String},
        education: [ {type: Object} ],
        another_education: [ {type: Object} ],
        social_network: [ {type: Object} ],
        achive_files: [ {type: Object} ],
        best_practices: {type: String},
        name: { type: String},
        surname: { type: String},
        patronymic: {type: String},
        q1: [ { type: String} ],
        q2: [ { type: String} ],
        q3: { type: String},
        q4: [ { type: String} ],
        q5: [ { type: String} ],
        q6: { type: String},
        q7: { type: String},
    },
    { versionKey: false }
);

module.exports  = mongoose.model("forms", formScheme);

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const partnerScheme = new Schema(
    {
        logo: { type: String },
        companyFullName: { type: String },
        companyName: { type: String },
        country_city: { type: String },
        represent_name: { type: String },
        year: { type: String },
        end_year: { type: String },
        projects: { type: String },
        about: { type: String },
        link: { type: String },
        vacancies: [{ name: { type: String }, description: { type: String } }],
        forsearch: [{ value: { type: String } }],
    },
    { versionKey: false }
);

module.exports = mongoose.model("partners", partnerScheme);

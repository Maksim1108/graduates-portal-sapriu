const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const homesScheme = new Schema(
    {
        block: {type: String},
        titleru: {type: String, required: true},
        title: {type: String, required: true},
        images: [{type: String}],
        aboutru: {type: String, required: true},
        about: {type: String, required: true},
    },
    { collection: 'homes' }
);

mongoose.models = {};

const Home = mongoose.model('Home', homesScheme);

module.exports = Home;

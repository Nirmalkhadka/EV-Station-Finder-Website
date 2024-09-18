const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contactUs = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    }

});

module.exports = mongoose.model('ContactUs', contactUs);
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const signUpDetails2 = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: Number,
        required: true
    },
    stationName: {
        type: String,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    }, 
    latitude: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    }, 
    verificationToken: {
        type: String
    }, 
    tokenExpiration: {
        type: Date
    }
});

//encrypting password before saving
signUpDetails2.pre('save', async function(next){
    if(!this.isModified('password')){
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model('StationOwnerSignUpDetails', signUpDetails2);
const mongoose = require('mongoose');
const validator = require('validator');

const Notes = mongoose.model('feedback' , {
    firstname: {
        type:String,
        required:true,
        trim:true
    },
    lastname: {
        type:String,
        required:true,
        trim:true
    },
    email: {
        type:String,
        required:true,
        trim:true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error('Email is not valid');
            }

        }
    },
    feedback: {
        type:String,
        required:true,
        trim:true
    },
    
})


module.exports = Notes;
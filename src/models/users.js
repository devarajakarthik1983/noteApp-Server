const mongoose = require('mongoose');


const Users = mongoose.model('users' , {
    firstname: {
        type:String,
        required:true,
        trim:true
    },
    lastname:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true,
    }
})


module.exports = Users;
const mongoose = require('mongoose');



const Users = mongoose.model('users' , {
    username: {
        type:String,
        required:true,
        trim:true
    },
    email: {
        type:String,
        required:true,
        trim:true,
        unique:true
        
       
    },
    password:{
        type:String,
        required:true,
    },
    token:{
        type:String,
        default:null
    },
    active:{
        type:Boolean,
        default:false
    }
})




module.exports = Users;
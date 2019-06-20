const mongoose = require('mongoose');

const Notes = mongoose.model('notes' , {
    title: {
        type:String,
        required:true,
        trim:true
    },
    text:{
        type:String,
        required:true,
        trim:true
    },
    complete:{
        type:Boolean,
        default:false
    },
    createTime:{
        type:Date,
        default: Date.now
    },
    completedTime:{
        type:Date,
        default: Date.now
    }
})


module.exports = Notes;
const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/noteApp', {
    useNewUrlParser:true,
    useCreateIndex:true
})

// Users app model creation




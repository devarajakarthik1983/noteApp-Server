const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/notes', {
    useNewUrlParser:true,
    useCreateIndex:true
})

// notes app model creation




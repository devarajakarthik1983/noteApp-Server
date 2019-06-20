const express = require('express');
require('./db/mongoose');

const Notes = require('./models/notes')

const app = express();
const port = process.env.POST || 3001;

app.use(express.json());

app.post('/notes' , (req , res)=>{
    const notes = {
        title:req.body.title,
        text:req.body.text,
        createTime: new Date().getTime(),
        completedTime: new Date().getTime()
    }
    
    const newNotes = new Notes(notes);

    newNotes.save().then(()=>{
        res.status(200).send(notes);
    }).catch((e)=>{
        res.status(400).send(e);
    })
    
})

app.listen(port , ()=>{
    console.log('Server is running in port ' + port);
})
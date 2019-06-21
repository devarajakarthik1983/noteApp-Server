const express = require('express');
const mongoose = require('mongoose');

require('./db/mongoose');

const Notes = require('./models/notes')

const app = express();
const port = process.env.POST || 3001;

app.use(express.json());

//post notes

app.post('/notes' , (req , res)=>{
    const notes = {
        title:req.body.title,
        text:req.body.text,
        createTime: new Date().getTime(),
        completedTime: new Date().getTime()
    }
    
    const newNotes = new Notes(notes);

    newNotes.save().then(()=>{
        res.status(201).send(notes);
    }).catch((e)=>{
        res.status(400).send(e);
    })
    
})

//get all notes

app.get('/notes' , (req , res)=>{

    Notes.find({}).then((notes)=>{
        res.status(201).send(notes)
    }).catch((e) =>{
        res.status(500).send(e);
    });
});

//get notes by id

app.get('/notes/:id' , (req,res)=>{
    const _id =  req.params.id;

    const _newId = mongoose.Types.ObjectId.isValid(_id);
    console.log(_newId);

    if(_newId) {
        Notes.findById(_id).then((note)=>{
            if(!note) {
                res.status(404).send('Unable to find the user');
            }
            res.status(200).send(note);
        }).catch((e)=>{
            console.log(e);
        })
    }else{
        res.status(400).send('Bad ObjectID');
         }
})




app.listen(port , ()=>{
    console.log('Server is running in port ' + port);
})
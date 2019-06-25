const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const {ObjectID} = require('mongodb');


require('./db/mongoose');

const Notes = require('./models/notes')
const Users = require('./models/users')

const app = express();

const port = process.env.POST || 3001;

app.use(express.json());
app.use(cors({
    origin: '*',
    credentials: true
}));

//create new user

app.post('/users' , (req,res)=>{
    const users = {
        firstname:req.body.firstname,
        lastname:req.body.lastname,
        email:req.body.email,
        password:req.body.password 
    }

    const newUsers = new Users(users);

    newUsers.save().then((user)=>{
        res.status(201).send(user);
    }).catch((e)=>{
        res.status(400).send(e);
    })
    
})




//post notes

app.post('/notes' , (req , res)=>{
    const notes = {
        title:req.body.title,
        text:req.body.text, 
    }
    
    const newNotes = new Notes(notes);

    newNotes.save().then((note)=>{
        res.status(201).send(note);
    }).catch((e)=>{
        res.status(400).send(e);
    })
    
})

//get all newest Notes

app.get('/notes' ,(req , res)=>{

    Notes.find({}).sort({'createTime':'desc'}).then((notes)=>{
        res.status(201).send(notes)
    }).catch((e) =>{
        res.status(500).send(e);
    });
});

//get all oldest Notes

app.get('/notesoldest' ,(req , res)=>{

    Notes.find({}).sort({'createTime':'asc'}).then((notes)=>{
        res.status(201).send(notes)
    }).catch((e) =>{
        res.status(500).send(e);
    });
});

//get all the completed post

app.get('/notescompleted' ,(req , res)=>{

    Notes.find({'complete':'true'}).then((notes)=>{
        res.status(201).send(notes)
    }).catch((e) =>{
        res.status(500).send(e);
    });
});


//get all the Incompleted post

app.get('/notesnotcomplete' ,(req , res)=>{

    Notes.find({'complete':'false'}).then((notes)=>{
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
                res.status(404).send('Unable to find the note');
            }
            res.status(200).send(note);
        }).catch((e)=>{
            console.log(e);
        })
    }else{
        res.status(400).send('Bad ObjectID');
         }
})


//update notes by id

app.patch('/notes/:id',  (req, res) => {

    const updates = Object.keys(req.body);
    const allowUpdates = ['title', 'text' , 'complete']
     const isValidOperation = updates.every((update)=>allowUpdates.includes(update));

     if(!isValidOperation) {
        return res.status(400).send({error:'Invalid operation'})
    }

    let id = req.params.id;
    
  
    if (!ObjectID.isValid(id)) {
      return res.status(404).send('Invalid Object ID');
    }


        if(req.body.complete){
            req.body.completedTime = new Date().getTime();
        } else{
            req.body.complete= false;
            req.body.completedTime = null;
            
        }

   
        Notes.findByIdAndUpdate(id , req.body, {new:true,runValidators:true}).then((todo) => {
            if (!todo) {
              return res.status(404).send('Unable to find the id to update');
            }
        
            res.send({todo});
          }).catch((e) => {
            res.status(400).send('Bad request or filed is blank');
          })

    

   
  });


//delete notes by id

app.delete('/notes/:id' , (req , res)=>{

    const _id =  req.params.id;

    const _newId = mongoose.Types.ObjectId.isValid(_id);
    console.log(_newId);

    if(_newId) {
        Notes.findByIdAndDelete(_id).then((note)=>{
            if(!note) {
                res.status(404).send('Unable to find the note to delete');
            }
            res.status(200).send(note);
        }).catch((e)=>{
            console.log(e);
        })
    }else{
        res.status(400).send('Bad ObjectID');
         }


});



app.listen(port , ()=>{
    console.log('Server is running in port ' + port);
})
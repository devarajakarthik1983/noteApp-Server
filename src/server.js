const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passwordValidator = require('password-validator');
const validator = require('validator');
const crypto = require('crypto');

const {ObjectID} = require('mongodb');
const {sendActivationEmail , sendFeedbackEmail } = require('./emails/account');


require('./db/mongoose');

const Notes = require('./models/notes')
const Feedbacks = require('./models/feedback')
const Users = require('./models/users')


const app = express();

const port = process.env.POST || 3001;

app.use(express.json());
app.use(cors({
    origin: '*',
    credentials: true
}));



//register user

app.post('/register' , (req , res) =>{
    var token = crypto.randomBytes(20).toString('hex');
    const user = {
        username:req.body.username,
        email:req.body.email,
        password:req.body.password,
        token:token
    }

    
    var schema = new passwordValidator();
    schema
.is().min(8)                                    // Minimum length 8
.is().max(20)                                  // Maximum length 20
.has().uppercase()                              // Must have uppercase letters
.has().lowercase()                              // Must have lowercase letters
.has().digits()                                 // Must have digits
.has().not().spaces()                           // Should not have spaces
.has().symbols()
.is().not().oneOf(['Passw0rd', 'Password123', 'password']);

if(schema.validate(req.body.password) && validator.isEmail(req.body.email)){
    const newUser = new Users(user);
    newUser.save().then((user)=>{
       //sendActivationEmail(req.body.email , token, req.body.username)
        res.status(201).send(user);
    }).catch((e)=>{
        res.status(400).send(e);
    })
} else{
    //res.staus(404).send('email or password not meeting standards');
    throw new Error('Email or Password not meeting standards');
}
   
});

//activate a user

app.post('/newuser/:id/:id1' , (req ,res)=>{

    const username =  req.params.id;
    const token= req.params.id1

    Users.findOne({username}).then(user=>{
    

    if(token === user.token){
        return Users.findOneAndUpdate(user.username , {$set:{active:true , token:null}})
              .then(user=>{
                  res.status(200).send(user);
              }) 
            } else {
                res.status(404).send('token not matching');
            }
     }).catch(e=>{
        res.status(404).send(e);
     })
     })


     //forgot username endpoint

     app.get('/forgotusername/:id' , (req , res)=>{

        const email =  req.params.id;
        
        Users.findOne({email}).then((user)=>{
            if(!user) {
                res.status(404).send('Unable to find the note');
            }
            res.status(200).send(user.username);
        }).catch((e)=>{
            console.log(e);
        })
   
     })

  


//post feedback

app.post('/feedback' , (req , res)=>{
    const feedback = {
        firstname:req.body.firstname,
        lastname:req.body.lastname,
        email:req.body.email,
        feedback:req.body.feedback
    }
    
    const newFeedback = new Feedbacks(feedback);

    newFeedback.save().then((note)=>{
    //sendFeedbackEmail(req.body.email , req.body.firstname , req.body.lastname)
        res.status(201).send(note);
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
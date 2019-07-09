const express = require('express')
const Notes = require('../models/notes')
const auth = require('../middleware/auth')
const {ObjectID} = require('mongodb');
const router = new express.Router()

//post notes

router.post('/notes' , auth , (req , res)=>{
    const notes = {
        title:req.body.title,
        text:req.body.text, 
        owner: req.user._id
    }
    
    const newNotes = new Notes(notes);

    newNotes.save().then((note)=>{
        res.status(201).send(note);
    }).catch((e)=>{
        res.status(400).send(e);
    })
    
})

//get all newest Notes

router.get('/notes' , auth , (req , res)=>{

    let page = parseInt(req.query.page) || 0; 
    let limit = parseInt(req.query.limit) || 8;
   
    

    Notes.find({owner: req.user._id})
    .sort({'createTime':'desc'})
    .skip(page * limit)
    .limit(limit)
    .then(notes=>{
        return Notes.countDocuments({owner: req.user._id})
        .then (count=>{
            return res.json({
                total: count,
                page: page,
                per_page:limit,
                total_page: Math.ceil(count/limit),
                notes: notes

              });
        }).catch(e=>{
            return res.send('Unable to get count');
        })

        

    }).catch(e=>{
        return res.send('Unable to fetch document');
    })
});

//get all oldest Notes

router.get('/notesoldest' , auth ,(req , res)=>{

    let page = parseInt(req.query.page) || 0; 
    let limit = parseInt(req.query.limit) || 8;
    

    Notes.find({owner: req.user._id})
    .sort({'createTime':'asc'})
    .skip(page * limit)
    .limit(limit)
    .then(notes=>{
        return Notes.countDocuments({owner: req.user._id})
        .then (count=>{
            return res.json({
                total: count,
                page: page,
                per_page:limit,
                total_page: Math.ceil(count/limit),
                notes: notes

              });
        }).catch(e=>{
            return res.send('Unable to get count');
        })

    }).catch(e=>{
        return res.send('Unable to fetch document');
    })
});

//get all the completed post

router.get('/notescompleted' , auth ,(req , res)=>{

    let page = parseInt(req.query.page) || 0; 
    let limit = parseInt(req.query.limit) || 8;
    

    Notes.find({owner: req.user._id , 'complete':'true' })
    .sort({'createTime':'asc'})
    .skip(page * limit)
    .limit(limit)
    .then(notes=>{
        return Notes.countDocuments({owner: req.user._id ,  'complete':'true'})
        .then (count=>{
            return res.json({
                total: count,
                page: page,
                per_page:limit,
                total_page: Math.ceil(count/limit),
                notes: notes

              });
        }).catch(e=>{
            return res.send('Unable to get count');
        })

    }).catch(e=>{
        return res.send('Unable to fetch document');
    })

});


//get all the Incompleted post

router.get('/notesnotcomplete' , auth,(req , res)=>{

    let page = parseInt(req.query.page) || 0; 
    let limit = parseInt(req.query.limit) || 8;
    

    Notes.find({owner: req.user._id , 'complete':'false' })
    .sort({'createTime':'asc'})
    .skip(page * limit)
    .limit(limit)
    .then(notes=>{
        return Notes.countDocuments({owner: req.user._id ,  'complete':'false'})
        .then (count=>{
            return res.json({
                total: count,
                page: page,
                per_page:limit,
                total_page: Math.ceil(count/limit),
                notes: notes

              });
        }).catch(e=>{
            return res.send('Unable to get count');
        })

    }).catch(e=>{
        return res.send('Unable to fetch document');
    })
});




//get notes by id

router.get('/notes/:id', auth , (req,res)=>{
 
    Notes.findById({_id: req.params.id, owner: req.user._id}).then((note)=>{
            if(!note) {
                res.status(404).send('Unable to find the note');
            }
            res.status(200).send(note);
        }).catch((e)=>{
            res.send(e);
        })
    
})


//update notes by id

router.patch('/notes/:id', auth , (req, res) => {

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

   
        Notes.findByIdAndUpdate({_id: req.params.id, owner: req.user._id} , req.body, {new:true,runValidators:true}).then((todo) => {
            if (!todo) {
              return res.status(404).send('Unable to find the id to update');
            }
        
            res.send({todo});
          }).catch((e) => {
            res.status(400).send('Bad request or filed is blank');
          })

    

   
  });


//delete notes by id

router.delete('/notes/:id' , auth,  (req , res)=>{

        Notes.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        .then(note=>{
            res.send(note);
            if(note){
                res.status(404).send(note);
                    return ;
            }else {
                res.status(404).send('unable to find the note');
            }
        })
         
        });


module.exports = router
const express = require('express')
const Feedbacks = require('../models/feedback')
const { sendFeedbackEmail  } = require('../emails/account');
const router = new express.Router()


//post feedback

router.post('/feedback' , (req , res)=>{
    const feedback = {
        firstname:req.body.firstname,
        lastname:req.body.lastname,
        email:req.body.email,
        feedback:req.body.feedback
    }
    
    const newFeedback = new Feedbacks(feedback);

    newFeedback.save().then((note)=>{
        sendFeedbackEmail(req.body.email , req.body.firstname , req.body.lastname)
        res.status(201).send(note);
    }).catch((e)=>{
        res.status(400).send(e);
    })
    
})


module.exports = router

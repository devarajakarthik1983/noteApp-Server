const express = require('express')
const Users = require('../models/users');
const auth = require('../middleware/auth')
const passwordValidator = require('password-validator');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs')
const {sendActivationEmail , sendActivationPassword } = require('../emails/account');
const router = new express.Router()


//register user

router.post('/register' , (req , res) =>{
    var token = crypto.randomBytes(20).toString('hex');
    const encodedEmail = encodeURIComponent(req.body.email);
    const user = {
        username:req.body.username,
        email:req.body.email,
        password:req.body.password,
        activeToken:token
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
   Users.findOne({email:req.body.email})
   .then((user)=>{
       if(!user){
        
        newUser.save().then(user=>{
            sendActivationEmail(req.body.email,user.username,token,encodedEmail);
            newUser.generateAuthToken().then(token=>{
                res.send({user , token})
            }).catch(e=>{
                res.send('Unable to generate token');
            })
            
        })
       }else {
           res.send('user exist');
       }
   }).catch(e=>{
       res.send(e);
   })
} else{
    //res.staus(404).send('email or password not meeting standards');
    throw new Error('Email or Password not meeting standards');
}
   
});

//Login User
router.post('/login',  (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    Users.findOne({ email })
    .then(user=>{

        if (!user) {
           res.send('Unable to login')
           return ;
        }
    
    bcrypt.compare(password, user.password)
    .then(isMatch=>{

        if (!isMatch) {
            res.send('Unable to login');
            return ;
        }

        if(!user.active){
            res.send('Your account is not active. Please activate');
            return ;
        }

        user.generateAuthToken().then(token=>{
            res.send({ user, token })
        }).catch(e=>{
            res.send('Unable to genarate token')
            return ;
        })
        

    }).catch(e=>{
        res.send('Password not matching');
        return ;
    })
    

    }).catch(e=>{
        res.send('Server error');
        return ;
    })  
})


//logout user

router.post('/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})




//activate a user

router.post('/newuser/:id/:id1' , (req ,res)=>{

    const email =  req.params.id;
    const token= req.params.id1
    const decodedEmail = decodeURIComponent(email);
   

    Users.findOne({email:decodedEmail}).then(user=>{
    if(token === user.activeToken){
        return Users.findOneAndUpdate({email:decodedEmail} , {$set:{active:true , activeToken:null}})
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

  
   

    

     //Send password activation link

     router.post('/forgotpassword/:id' , (req , res)=>{

        const email =  req.params.id;
        const encodedUrlEmail =encodeURIComponent(email);
        var token = crypto.randomBytes(20).toString('hex');

        Users.find({email:email}).then((user)=>{
            if(user.length === 0) {
                res.status(404).send('Unable to find the username');
            }
            sendActivationPassword(email ,user[0].username ,token , encodedUrlEmail)
           
            res.status(200).send(user);
        }).catch((e)=>{
            res.send(e);
        })
   
     })


     //change password
     router.post('/newpasswordentry/:id' , async (req,res)=>{
        const email =  req.params.id;
        const password = await bcrypt.hash(req.body.password, 8);
           
            Users.findOne({email:email}).then(user=>{

                if(email === user.email){
                        return Users.findOneAndUpdate(user.email , {password:password})
                              .then(user=>{
                                
                                  res.status(200).send('Password Updated Successfully');
                              }) 
                            }
                     }).catch(e=>{
                        res.status(404).send('User does not exist');
                     })
                    })
            

    // send user activation link

    router.post('/sendactivelink/:id' , (req , res) =>{
        const email =  req.params.id;
        encodedEmail = encodeURIComponent(email);
        Users.findOne({email:email}).then(user=>{
            res.send(user);
            sendActivationEmail(email,user.username,user.activeToken,encodedEmail);
        }).catch(e=>{
            res.status(404).send('No user exist');
        })

    });

                
     module.exports = router
  
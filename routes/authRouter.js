const router = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../users.js')

router.get('/', (req, res) => {
    res.send('test')
})

router.post('/register',  (req, res) => {
    const hash =  bcrypt.hash(req.body.password, 10)
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hash,
    })

    const invalidEmail =  User.findOne({email: req.body.email})
    if (!invalidEmail) {
      res.status(200).json({message: 'creating user'})
      console.log(req.body.email + 'just joined')

       user.save()
    } else {
      res.status(400).json({error: 'email already exist'})
      console.log('error creating user')
    }
    
})

module.exports = router;
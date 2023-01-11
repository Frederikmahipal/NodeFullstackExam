const express = require('express');
const { checkAuthenticated } = require('../config/auth');
const Post = require('../models/Post');
const router = express.Router();
const User = require('../models/User')


router.get('/', (req, res) => {
    Post.find({}).populate('User').then(posts => {
      res.render('posts', { posts });
    });
  });


router.get('/create', checkAuthenticated, (req, res) => {
    res.render('createPost')
})

router.post('/create', (req, res) => {
    const { Title, Description } = req.body;
    const newPost = new Post({
        Title, 
        Description,
        User: req.user._id,
        date: Date.now()
    });
    newPost.save()
        .then(post => res.redirect('/homepage'))
        .catch(err => res.json(err));
});


module.exports = router;
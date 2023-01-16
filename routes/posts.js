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
    res.render('createPost', {user: req.user});
});

router.post('/:id/delete', checkAuthenticated, async (req, res) => {
  try {
      // Find the post by its ID
      const post = await Post.findById(req.params.id);
      // Check if the user is the author of the post
      if (post.User.toString() !== req.user._id.toString()) {
          req.flash('error_message', 'You are not authorized to delete this post');
          return res.redirect('/homepage');
      }
      // Delete the post
      await post.remove();
      req.flash('success_message', 'Post deleted');
      res.redirect('/homepage');
  } catch (err) {
      res.json(err);
  }
});

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

router.post('/upvote/:id', async (req, res, next) => {
  try {
      // Find the post by its ID
      const post = await Post.findById(req.params.id);
      // Check if the user has already upvoted the post
      const hasVoted = post.voters.some(voter => voter.equals(req.user._id));
      if(hasVoted){
          // remove the vote
          post.votes--;
          post.voters.pull(req.user._id);
          req.flash('error_message','Upvote removed')
      } else {
          // Increment the vote count
          post.votes++;
          // add the voter
          post.voters.push(req.user._id);
          req.flash('success_message','Post upvoted')
      }
      // Save the post to the database
      await post.save();
      // Send a success response
      res.redirect('/homepage')
  } catch (err) {
      // Pass the error to the next middleware
      next(err);
  }
});


router.post('/downvote/:id', async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    // Check if the user has already upvoted the post
    const hasVoted = post.voters.some(voter => voter.equals(req.user._id));
    if(hasVoted){
        // remove the vote
        post.votes++;
        post.voters.pull(req.user._id);
    } else {
        // Increment the vote count
        post.votes--;
        // add the voter
        post.voters.push(req.user._id);
    }
      // Save the post to the database
      await post.save();
      // Send a success response
      req.flash('error_message','Post downvoted')
      res.redirect('/homepage')
  } catch (err) {
      // Pass the error to the next middleware
      next(err);
  }
});

module.exports = router;
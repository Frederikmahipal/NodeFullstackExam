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
    res.render('createPost', { user: req.user });
});

router.post('/:id/delete', checkAuthenticated, async (req, res) => {
    try {

        const post = await Post.findById(req.params.id);

        if (post.User.toString() !== req.user._id.toString()) {
            req.flash('error_message', 'You are not authorized to delete this post');
            return res.redirect('/homepage');
        }

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

        const post = await Post.findById(req.params.id);

        const hasVoted = post.voters.some(voter => voter.equals(req.user._id));
        if (hasVoted) {

            post.votes--;
            post.voters.pull(req.user._id);
            req.flash('error_message', 'Upvote removed')
        } else {

            post.votes++;

            post.voters.push(req.user._id);
            req.flash('success_message', 'Post upvoted')
        }

        await post.save();

        res.redirect('/homepage')
    } catch (err) {

        next(err);
    }
});


router.post('/downvote/:id', async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);

        const hasVoted = post.voters.some(voter => voter.equals(req.user._id));
        if (hasVoted) {

            post.votes++;
            post.voters.pull(req.user._id);
        } else {

            post.votes--;

            post.voters.push(req.user._id);
        }

        await post.save();

        req.flash('error_message', 'Post downvoted')
        res.redirect('/homepage')
    } catch (err) {

        next(err);
    }
});

module.exports = router;
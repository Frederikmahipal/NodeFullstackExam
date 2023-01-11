const express = require('express');
const router = express.Router();
const { checkAuthenticated } = require('../config/auth')
const User = require('../models/User')
const Post = require('../models/Post');
const flash = require('express-flash');

router.get('/', (req, res) => {
    res.render('frontpage')
})

router.get('/homepage', checkAuthenticated, async (req, res) => {
    try {
        // Fetch the logged in user
        const user = await User.findById(req.user._id);
        // Fetch the list of user IDs that the logged in user is following
        const followingIds = user.following.map(user => user._id);
        // Add the logged in user's ID to the list of IDs
        followingIds.push(req.user._id);

        // Fetch the posts created by the users the logged in user is following or the logged in user themselves
        const posts = await Post.find({ User: { $in: followingIds } }).populate('User', 'name -_id');

        let followers = user.followers.length;
        let name = user.name;
        // Render the homepage view and pass the posts, followers, name and user data
        res.render('homepage', { posts, followers, name, user });
    } catch (err) {
        res.json(err);
    }
});

router.get('/follow', checkAuthenticated, (req, res) => {
    res.render('follow')
});

router.post('/follow', checkAuthenticated, (req, res) => {
    User.findOne({ email: req.body.email })
        .then(userToFollow => {
            if (userToFollow) {
                User.findById(req.user._id)
                    .then(loggedInUser => {
                        // add the user to the following array of the logged in user
                        loggedInUser.following.push(userToFollow._id);
                        // add the logged in user to the followers array of the user to follow
                        userToFollow.followers.push(loggedInUser._id);
                        // save both users
                        loggedInUser.save();
                        userToFollow.save();
                    })
                    .then(() => {
                        req.flash('success_message','User followed')
                        res.redirect('/homepage')
                    })
                    .catch(err => res.status(400).json(err));
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        })
        .catch(err => res.status(400).json(err));
});
module.exports = router;

router.get('/fetch-followers/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        const followers = await User.find({_id: {$in: user.followers}});
        res.json(followers)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
});
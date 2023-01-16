const express = require('express');
const router = express.Router();
const { checkAuthenticated } = require('../config/auth')
const User = require('../models/User')
const Post = require('../models/Post');
const flash = require('express-flash');






router.get('/', (req, res) => {
    res.render('frontpage')
})

router.get('/profile', checkAuthenticated, async (req, res) => {
    try {
        // find the user by ID and populate the followers and following fields
        const user = await User.findById(req.user._id).populate('followers').populate('following');
        // render the profile template and pass the user object to it
        res.render('profile', { user });
    } catch (err) {
        // handle errors
        res.json(err);
    }
});

router.get('/homepage', checkAuthenticated, async (req, res) => {
    try {
        // Fetch the logged in user
        const user = await User.findById(req.user._id);
        // Fetch the list of user IDs that the logged in user is following
        const followingIds = user.following.map(user => user._id);
        // Add the logged in user's ID to the list of IDs
        followingIds.push(req.user._id);

        // Fetch the posts created by the users the logged in user is following or the logged in user themselves
        const posts = await Post.find({ User: { $in: followingIds } }).populate('User', 'name votes -_id');

        let followers = user.followers.length;
        let name = user.name;

        //Fetch the number of online users
        let onlineUsers = io.onlineUsers;
        // Render the homepage view and pass the posts, followers, name and user data
        res.render('homepage', { posts, followers, name, user, onlineUsers});
    } catch (err) {
        res.json(err);
    }
});


router.get('/follow', checkAuthenticated, (req, res) => {
    res.render('follow', {user: req.user});
});


router.post('/follow', checkAuthenticated, (req, res) => {
    if(req.user._id === req.body.userId){
        req.flash('error_message', 'You cannot follow yourself');
        res.render('follow')
    } else {
        User.findOne({ email: req.body.email })
            .then(userToFollow => {
                if (userToFollow) {
                    User.findById(req.user._id)
                        .then(loggedInUser => {
    
                            loggedInUser.following.push(userToFollow._id);
                            
                            userToFollow.followers.push(loggedInUser._id);
    
                            loggedInUser.save();
                            userToFollow.save();
                        })
                        .then(() => {
                            req.flash('success_message','User followed')
                            res.redirect('/homepage')
                        })
                        .catch(err => res.status(400).json(err));
                } else {
                    req.flash('error_message', 'User not found');
                    res.render('follow')
                }
            })
            .catch(err => res.status(400).json(err));
    }
});

module.exports = router;


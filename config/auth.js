module.exports = {
    checkAuthenticated: function(req, res, next) {
        if (req.isAuthenticated()) {
            return next();            
        }
        req.flash('error_message', 'login to view this resource');
        res.redirect('/users/login');
    }
}
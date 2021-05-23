const authController = require('../controllers/authcontroller.js');
module.exports = function (app, passport) {
    app.get('/signup', authController.signup);
    app.get('/signin', authController.signin);
    app.get("/chatapp", authController.chatapp); // reload
    app.get("/logout", authController.logout);
    //authenticate by passport
    app.post('/signup', passport.authenticate('local-signup', {
        // successRedirect: '/dashboard',
        successRedirect: '/accesschatapp',
        failureRedirect: '/signup'
    }));
    // thực hiện router yêu cầu xác thực từ post signin bằng passport
    app.post('/signin', passport.authenticate('local-signin', {
        // tham số cho passport authenticate trả về sau xác thực
        //successRedirect: '/dashboard',//
        successRedirect: '/accesschatapp',
        failureRedirect: '/signin'
    }));
    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated())
            return next();
        res.redirect('/signin');
    }
};
//# sourceMappingURL=auth.js.map
//# sourceMappingURL=auth.js.map
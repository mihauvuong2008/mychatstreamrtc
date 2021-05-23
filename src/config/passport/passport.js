//load bcrypt
var bCrypt = require('bcrypt-nodejs');

module.exports = function(passport, user) {

  // tslint:disable-next-line:no-console
  // console.log("here user:", user, passport);

  var User = user;

  var LocalStrategy = require('passport-local').Strategy;

  //serialize
  passport.serializeUser(function(user2, done) {
    // tslint:disable-next-line:no-console
    // console.log("here done passport:", user2, passport);
    done(null, user2.userid);
      // tslint:disable-next-line:no-console
    // console.log("done  passport:",  user2, passport);
  });
  // deserialize user
  //With Sequelize v5, findById() was replaced by findByPk().
  passport.deserializeUser(function(id, done) {

    User.findByPk(id).then(function(user2) {

      if (user2) {

        done(null, user2.get());

      } else {

        done(user2.errors, null);

      }

    });

  });
  // deserialize user
  passport.deserializeUser(function(id, done) {

    User.findById(id).then(function(user2) {

      if (user2) {

        done(null, user2.get());

      } else {

        done(user2.errors, null);

      }

    });

  });

  passport.use('local-signup', new LocalStrategy(

    {

      usernameField: 'email',

      passwordField: 'password',

      passReqToCallback: true // allows us to pass back the entire request to the callback

    },

    function(req, email, password, done) {
      var generateHash = function(psswrd) {

        return bCrypt.hashSync(psswrd, bCrypt.genSaltSync(8), null);

      };

      User.findOne({
        where: {
          email: email
        }
      }).then(function(user2) {

        if (user2)

        {

          return done(null, false, {
            message: 'That email is already taken'
          });

        } else

        {

          var userPassword = generateHash(password);

          var data =

          {
            email: email,

            password: userPassword
            ,
            username: req.body.username,

            firstname: req.body.firstname,

            lastname: req.body.lastname

          };

          User.create(data).then(function(newUser, created) {

            if (!newUser) {

              return done(null, false);

            }

            if (newUser) {

              return done(null, newUser);

            }

          });

        }

      });

    }

  ));

  //LOCAL SIGNIN
  passport.use('local-signin', new LocalStrategy(

    {

      // by default, local strategy uses username and password, we will override with email

      usernameField: 'email',

      passwordField: 'password',

      passReqToCallback: true // allows us to pass back the entire request to the callback

    },

    function(req, email, password, done) {

      var User2 = user;

      var isValidPassword = function(userpass, psswrd) {

        return bCrypt.compareSync(psswrd, userpass);

      }

      User2.findOne({
        where: {
          email: email
        }
      }).then(function(user2) {

        if (!user2) {

          return done(null, false, {
            message: 'Email does not exist'
          });

        }

        if (!isValidPassword(user2.password, password)) {

          return done(null, false, {
            message: 'Incorrect password.'
          });

        }

        var userinfo = user2.get();
        return done(null, userinfo);

      }).catch(function(err) {

        // tslint:disable-next-line:no-console
        console.log("passport Error:", err);

        return done(null, false, {
          message: 'Something went wrong with your Signin'
        });

      });

    }

  ));

}

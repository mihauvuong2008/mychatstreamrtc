const express = require("express");
const router = express.Router();

module.exports = (app, tokenauthcontroller, chatController)=> {

  router.get("/accesschatapp", isLoggedIn, tokenauthcontroller.generateToken );
  router.get("/refresh_token", isLoggedIn, tokenauthcontroller.refreshToken );
  router.use(isLoggedIn, tokenauthcontroller.middlewareTokenChecker);
  // protected by jwt token:

  app.use("/",isLoggedIn, router);
}

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())// passport Authenticated login
  return next();
  res.redirect('/signin');//?
}

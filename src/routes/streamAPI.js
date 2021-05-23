const express = require("express");
const router = express.Router();

module.exports = (app, streamcontroller)=> {

  // check session availble:
  router.get("/Sjointochatbox", isLoggedIn, streamcontroller.userjoin);
  router.get("/Sleaveoutchatbox", isLoggedIn, streamcontroller.userleave);
  router.get("/Suserstilllivestream", isLoggedIn, streamcontroller.userstilllivestream);
  router.post("/SpostMessagetochatbox", isLoggedIn, streamcontroller.postMessagetochatbox);
  router.get("/SgetChatboxUnreadmessage", isLoggedIn, streamcontroller.getChatboxUnreadmessage);
  router.get("/Srequestfileuploadidid", isLoggedIn, streamcontroller.requestfileuploadidid);
  router.post("/Susertranferfile", isLoggedIn, streamcontroller.usertranferfile);
  router.post("/SgetactiveChatboxlist", isLoggedIn, streamcontroller.getactiveChatboxlist);

  router.post("/Ssendoffer", isLoggedIn, streamcontroller.sendoffer);
  router.get("/Sgetoffer", isLoggedIn, streamcontroller.getoffer);
  router.post("/Ssendanswer", isLoggedIn, streamcontroller.sendanswer);
  router.get("/Sgetanswer", isLoggedIn, streamcontroller.getanswer);
  router.get("/Suserismakemediacall", isLoggedIn, streamcontroller.userismakemediacall);
  router.get("/Soffersideconnected", isLoggedIn, streamcontroller.offersideconnected);
  router.get("/Sanswersideconnected", isLoggedIn, streamcontroller.answersideconnected);

  //enabled CORS (cross origin resource sharing)
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  app.use("/",isLoggedIn, router);
}

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())// passport Authenticated login
  return next();
  res.redirect('/signin');//?
}

const express = require("express");
const router = express.Router();

module.exports = (app, chatController)=> {

  // check session availble:
  router.get("/getChatboxlist", isLoggedIn, chatController.getChatboxlist);
  router.get("/getchatboxMember", isLoggedIn, chatController.getchatboxMember);
  router.get("/tokenTimeStamp", isLoggedIn, chatController.tokenTimeStamp);
  router.get("/getChatboxInfo", isLoggedIn, chatController.getChatboxInfo);
  router.get("/getConversationlist", isLoggedIn, chatController.getConversationlist);
  router.get("/getconversationData", isLoggedIn, chatController.getconversationData);
  router.get("/getLastConversation", isLoggedIn, chatController.getLastConversation);
  router.post("/postMessagetochatbox", isLoggedIn, chatController.postMessagetochatbox);
  router.get("/createConversation", isLoggedIn, chatController.createConversation);
  router.get("/getChatboxUnreadmessage", isLoggedIn, chatController.getChatboxUnreadmessage);
  router.get("/setchatboxMessageReaded", isLoggedIn, chatController.setchatboxMessageReaded);
  router.get("/getchatNotify", isLoggedIn, chatController.getchatNotify);
  router.get("/istillonline", isLoggedIn, chatController.istillonline);
  router.get("/getcontactList", isLoggedIn, chatController.contactList);
  router.get("/findUsername", isLoggedIn, chatController.findUsername);
  router.get("/sendmakerelateRequest", isLoggedIn, chatController.sendmakerelateRequest);
  router.get("/getMakerelateNotify", isLoggedIn, chatController.getMakerelateNotify);
  router.get("/getInvitechatboxNotify", isLoggedIn, chatController.getInvitechatboxNotify);
  router.get("/gettouchMe", isLoggedIn, chatController.gettouchMe);
  router.get("/settouchMe", isLoggedIn, chatController.settouchMe);
  router.get("/inittouchMe", isLoggedIn, chatController.inittouchMe);
  router.get("/relateAccept", isLoggedIn, chatController.relateAccept);
  router.get("/invitegroupAccept", isLoggedIn, chatController.invitegroupAccept);
  router.get("/relateRefuse", isLoggedIn, chatController.relateRefuse);
  router.get("/invitegroupRefuse", isLoggedIn, chatController.invitegroupRefuse);
  router.get("/createChatbox", isLoggedIn, chatController.createChatbox);
  router.get("/groupRequest", isLoggedIn, chatController.groupRequest);
  router.get("/removechatboxMember", isLoggedIn, chatController.removechatboxMember);
  router.get("/getfriendchatbox", isLoggedIn, chatController.getfriendchatbox);
  router.get("/createfriendchatbox", isLoggedIn, chatController.createfriendchatbox);
  router.get("/removeContact", isLoggedIn, chatController.removeContact);
  router.get("/updatememberChatboxname", isLoggedIn, chatController.updatememberChatboxname);
  router.get("/leaveChatbox", isLoggedIn, chatController.leaveChatbox);
  router.get("/dissolateGroup", isLoggedIn, chatController.dissolateGroup);
  router.get("/getSeenlist", isLoggedIn, chatController.getSeenlist);

  app.use("/",isLoggedIn, router);
}

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())// passport Authenticated login
  return next();
  res.redirect('/signin');//?
}

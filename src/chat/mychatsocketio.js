const servicetask = require('./servicetask');
// mysyn();

const setDatabasesync = function(models){
  servicetask.setupdatabase(models);
}

const startstreamservice = async function (){
  while (true) {
    servicetask.makeroom();
    servicetask.execjoin();
    servicetask.freecache();
    servicetask.writedowndb();
    servicetask.cleanuser();
    servicetask.cleanchatbox();
    servicetask.showChatboxstck();
    // tslint:disable-next-line:no-console
    console.log("database sync is running...");
    await new Promise(resolve => {setTimeout(resolve, 1800)});
  }
}

const userjoin = function(userid, chatboxid) {
  return servicetask.userjoin(userid, chatboxid);
}

const userleave = function(userid, chatboxid) {
  return servicetask.userleave(userid, chatboxid);
}

const userstilllivestream = function(userid, chatboxid) {
  servicetask.userstilllivestream(userid, chatboxid);
}
const srvreceivestreamdata = function(userid, messageData, datetimesend, conversationid){
  return servicetask.postmessagetochtbx(userid, messageData, datetimesend, conversationid);
}

const srvrespondstreamdata = function(userid, conversationid){
  const rs = servicetask.strmchtbxdatatouser(userid, conversationid);

  return rs;
}

const respondfileuploadidid = function(userid, chatboxid) {
  const rs = servicetask.respondfileuploadidid(userid, chatboxid);
  // tslint:disable-next-line:no-console
  console.log("respondfileuploadidid..", rs);
  return rs;

}

const usertranferfile = function(userid, conversationid, multimediafileid, name, path, type) {
  servicetask.usertranferfile(userid, conversationid, multimediafileid, name, path, type);
}

const getChatboxcachelist = function(chatlist) {
  return servicetask.getChatboxcachelist(chatlist);
}

const sendoffer = function(chatboxid, userid, offer) {
  return servicetask.sendoffer(chatboxid, userid, offer);
}

const getoffer = function(chatboxid, userid) {
  return servicetask.getoffer(chatboxid, userid);
}

const sendanswer = function(chatboxid, userid, answer) {
  return servicetask.sendanswer(chatboxid, userid, answer);
}

const getanswer = function(chatboxid, userid) {
  return servicetask.getanswer(chatboxid, userid);
}

const userismakemediacall = function(chatboxid, userid) {
  return servicetask.userismakemediacall(chatboxid, userid);
}

const offersideconnected = function(chatboxid, userid) {
  return servicetask.offersideconnected(chatboxid, userid);
}

const answersideconnected = function(chatboxid, userid) {
  return servicetask.answersideconnected(chatboxid, userid);
}

module.exports = {
  setDatabasesync: setDatabasesync,
  startstreamservice: startstreamservice,
  userjoin: userjoin,
  userleave: userleave,
  userstilllivestream: userstilllivestream,
  srvreceivestreamdata: srvreceivestreamdata,
  srvrespondstreamdata: srvrespondstreamdata,
  respondfileuploadidid: respondfileuploadidid,
  usertranferfile: usertranferfile,
  getChatboxcachelist: getChatboxcachelist,
  sendoffer: sendoffer,
  getoffer: getoffer,
  sendanswer: sendanswer,
  getanswer: getanswer,
  userismakemediacall: userismakemediacall,
  offersideconnected: offersideconnected,
  answersideconnected: answersideconnected,
}

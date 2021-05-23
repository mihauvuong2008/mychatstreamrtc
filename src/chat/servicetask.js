const databasequery = require('../controllers/databasequery');
const {Chatbox, Member, Message, Multimediafile, Multimediatype, Media} = require('./chatbox');
const databasesync = require('./databasesync');
const fs = require('fs');
const resource = {messageid: 0, mediaid:0};
const lenOfcache = 10;
const CHATBOXCACHE = [];
const JOINSTACK = [];
const MAXPIPELINE = 3;
const TIMEFORGIVE = 10000;// user will be remove after 10s disconect
const setupdatabase = function(models){
  databasesync.setupDatabase(models);
}

const makeroom = function() {
  JOINSTACK.forEach(item => {
    const chatboxid = item.chatboxid;
    if (!CHATBOXCACHE.some(_room => {
      if(parseInt(chatboxid, 10) !== _room.chatboxid) return;
      return true;
    })){
      databasesync.getchatbox(chatboxid)
      .then((chatbox)=>{
        const room = new Chatbox(chatbox.chatboxid, [], chatbox.chatboxName, chatbox.creatorid, chatbox.datetimeCreate, chatbox.type, new Date());
        CHATBOXCACHE.push(room);
      });
    }
  });
}

const execjoin = function() {
  JOINSTACK.forEach(item => {
    const userid = item.userid;
    const chatboxid = item.chatboxid;

    databasesync.getmemberOfchatbox(userid, chatboxid)
    .then((rs)=>{
      const mbOcb = rs.dataValues;
      switch (true) { case (!mbOcb): return; }
      CHATBOXCACHE.some(room => {
        if(parseInt(chatboxid, 10) !== room.chatboxid) return;
        switch (true) {
          case (room.members.some(_mem => { if (_mem.userid===parseInt(userid, 10)) return true; })): return false;// members is in room
        }
        const mem = new Member(mbOcb.memberid, "streamer", new Date(), mbOcb.chatboxuserkey, mbOcb.userchatboxname);
        room.members.push(mem);
        JOINSTACK.remove(item);
        return true;
      });
    }).catch((e)=>{
      return false;
    });
  });
}

const freecache = function(){
  CHATBOXCACHE.forEach(room => {
    room.members.forEach(mem => {
      if (mem.sendedmessage.length <= lenOfcache) return;
      mem.sendedmessage.forEach(msg => {
        if (!msg.iswritedown) return;
        mem.sendedmessage.remove(msg);
      });
    });
  });
}

const cleanchatbox = function(){
  CHATBOXCACHE.forEach(room => {
    if (room.members.length!==0)return ;
    if(isforgive(room.datetimeOpen)) return;
    CHATBOXCACHE.remove(room);
  });
}

const showChatboxstck = function(){
  // tslint:disable-next-line:no-console
  console.log("showChatboxstck", CHATBOXCACHE);
}

const cleanuser = function(){
  CHATBOXCACHE.forEach(room => {
    room.members.forEach(mem => {
      if(!mem.datetimeleave)return ;
      if(!isforgive(mem.datetimeleave)) {
        room.members.remove(mem);
      }
    });
  });
}

function isforgive(datetimeleave) {
  const d = new Date()-new Date(datetimeleave);
  if(d > TIMEFORGIVE)return false;
  return true;
}

const writedowndb = async function(){
  for (var room of CHATBOXCACHE) {
    for (var mem of room.members) {
      for (var msg of mem.sendedmessage) {
        switch (true) {
          case (msg.userreaded.length < room.members.length): continue;
          case (msg.iswritedown): continue;
          default: await databasesync.save(mem.userid, msg);
        }
      }
    }
  }
}

const userjoin = function(userid, chatboxid){
  const rs = {userid: parseInt(userid,10), chatboxid: parseInt(chatboxid,10)};
  JOINSTACK.push(rs);
  return {result: rs, message: "onway."}
}

const userleave = function(userid, chatboxid){
  return new Promise(function(resolve, reject) {
    CHATBOXCACHE.forEach(room => {
      if(parseInt(chatboxid,10)!==room.chatboxid) return ;
      room.members.forEach( mem => {
        if (mem.userid !== parseInt(userid, 10)) return ;
        room.members.remove(mem);
        resolve( {userid: userid, chatboxid: chatboxid, message: "success."});
      });
    });
    resolve( {message: "fail."});
  });
}

const userstilllivestream = function(userid, chatboxid){
  const _userid = parseInt(userid, 10);
  const _chatboxid = parseInt(chatboxid, 10);
  CHATBOXCACHE.forEach(room => {
    if(room.chatboxid !== _chatboxid) return ;
    room.members.forEach(mem => {
      if(mem.userid !== userid) return ;
      mem.datetimeleave = new Date();
      trace("mem.datetimeleave: ", mem.datetimeleave);
    });
  });
}

const postmessagetochtbx = function(userid, messageData, datetimesend, conversationid){
  return new Promise(function(resolve, reject) {
    const _userid = parseInt(userid, 10);
    databasesync.getConversation(conversationid)
    .then((rs) => {
      const conversation = rs.dataValues;
      for (var room of CHATBOXCACHE) {
        if (conversation.chatboxid!==room.chatboxid) continue ;
        for (var mem of room.members) {
          if(_userid!==mem.userid) continue;
          const msg = new Message(("S"+(getresourceMessageid())), new Date(datetimesend), messageData, conversationid);
          mem.sendedmessage.push(msg);
          resolve({
            datetimeUnhide: msg.datetimesend,
            messageData: msg.content,
            unhideUsermindid: msg.messageid,
            unhideuserid: userid,
            message: "success.",
          });
          break;
        };
        break;
      };
      resolve({ message: "empty.",});
    }).catch((e)=>{
      resolve({message: "Unauthorized.", content: "getmessageerror."+e, });
    });
  });
}

const strmchtbxdatatouser = function(userid, conversationid){
  const _userid = parseInt(userid, 10);
  let user = {};
  return new Promise(async function(resolve, reject) {
    databasesync.getConversation(conversationid)
    .then((conversation) => {// user checked conversation is live
      CHATBOXCACHE.forEach(room => {
        if (conversation.chatboxid !== room.chatboxid) return;//next
        if (!room.members.some(_mem=>{if(_userid===_mem.userid){user = _mem; return true;}})) return ;
        let result = [];
        room.members.forEach(mem => {
          for (var msg of mem.sendedmessage) {
            if(msg.datetimesend<user.datetimejoin) continue;
            if(msg.userreaded.some(reader => { if (_userid===reader) return true;})) continue;
            result.push({
              unhideUsermindid: msg.messageid,
              unhideuserid: mem.userid,
              datetimeUnhide: msg.datetimesend,
              messageData: msg.content,
              datetimetell: msg.datetimesend,
              readerid: userid, // everybody
              type: msg.type,
              datetimeread: null,
              conversationid: conversation.conversationid,
            });
            msg.userreaded.push(_userid);
          };
        });
        resolve(result);
      });
      resolve([]);
    }).catch((e)=>{
      resolve({message: "Unauthorized.", content: "getmessageerror." + e, });
    });
  });
}

const respondfileuploadidid = function(userid, chatboxid){
  return "S"+getresourceMessageid();
}

const usertranferfile = function(userid, conversationid, multimediafileid, name, path, type){
  return new Promise(function(resolve, reject) {
    const _userid = parseInt(userid, 10);
    const _conversationid = parseInt(conversationid, 10);
    databasesync.getConversation(conversationid)
    .then((rs) => {
      const conversation = rs.dataValues;
      CHATBOXCACHE.some(room => {
        if (conversation.chatboxid !== room.chatboxid) return ;//next
        for (var mem of room.members) {
          if(mem.userid !== _userid) continue;
          const fileupload = new Message(multimediafileid, new Date(), name+";"+ path, _conversationid);
          fileupload.type = "mmf";
          mem.sendedmessage.push(fileupload);
          resolve();
        };
      });
    }).catch((e)=>{
      // tslint:disable-next-line:no-console
      console.log("error:", e);
    });
  });
}

const getChatboxcachelist = function(chatlist){
  /************************************************
  * get chatboxs are active on server
  *************************************************/
  const rs = [];
  for (var room of CHATBOXCACHE) {
    for (var item of chatlist) {
      if (room.chatboxid!==parseInt(item, 10)) continue ;
      rs.push(room.chatboxid);
    }
  }
  return rs;
}

const sendoffer = function(chatboxid, userid, offer) {
  const _userid = parseInt(userid, 10);
  const _chatboxid = parseInt(chatboxid, 10);
  for (var room of CHATBOXCACHE) {
    if (_chatboxid!==room.chatboxid) continue ;
    for (var mem of room.members) {
      if(_userid!==mem.userid) continue;
      mem.offers.push(offer);
      trace("sendoffer_userid:", _userid, "_chatboxid", _chatboxid, mem.offers);
      return {rs: mem.offers, message: "success.",}
    };
    break;
  };
  return {message: "fail.",}
}

const getoffer = function(chatboxid, userid) {
  const _userid = parseInt(userid, 10);
  const _chatboxid = parseInt(chatboxid, 10);
  for (var room of CHATBOXCACHE) {
    if (_chatboxid!==room.chatboxid) continue ;
    for (var mem of room.members) {
      if(_userid!==mem.userid) continue;
      return mem.offers;
    };
    break;
  };
  return {message: "fail.",}
}

const sendanswer = function(chatboxid, userid, answer) {
  const _userid = parseInt(userid, 10);
  const _chatboxid = parseInt(chatboxid, 10);
  trace("sendanswer_userid:", _userid, "_chatboxid", _chatboxid);
  for (var room of CHATBOXCACHE) {
    if (_chatboxid!==room.chatboxid) continue ;
    for (var mem of room.members) {
      if(_userid!==mem.userid) continue;
      mem.answers.push(answer);
      return {rs: mem.answers, message: "success.",}
    };
    break;
  };
  return {message: "fail.",}
}

const getanswer = function(chatboxid, userid) {
  const _userid = parseInt(userid, 10);
  const _chatboxid = parseInt(chatboxid, 10);
  trace("getanswer _userid :", _userid, "_chatboxid", _chatboxid);
  for (var room of CHATBOXCACHE) {
    if (_chatboxid!==room.chatboxid) continue ;
    for (var mem of room.members) {
      if(_userid!==mem.userid) continue;
      return mem.answers;
    };
    break;
  };
  return {message: "fail.",}
}

const userismakemediacall = function(chatboxid, userid) {
  const _userid = parseInt(userid, 10);
  const _chatboxid = parseInt(chatboxid, 10);
  const result = [];
  for (var room of CHATBOXCACHE) {
    if (room.chatboxid !== _chatboxid) continue;
    for (var mem of room.members) {
      if (mem.userid === _userid) continue;
      trace(mem.offers.length);
      if(mem.offers.length>0) result.push(mem.userid); continue;
    };
  };
  return result;
}

const offersideconnected = function(chatboxid, userid) {
  const _userid = parseInt(userid, 10);
  const _chatboxid = parseInt(chatboxid, 10);
  for (var room of CHATBOXCACHE) {
    if (room.chatboxid !== _chatboxid) continue;
    for (var mem of room.members) {
      if (mem.userid !== _userid) continue;
      mem.offers = [];
      return {message: "success.",}
    };
  };
  return {message: "fail.",}
}

const answersideconnected = function(chatboxid, userid) {
  const _userid = parseInt(userid, 10);
  const _chatboxid = parseInt(chatboxid, 10);
  const result = [];
  for (var room of CHATBOXCACHE) {
    if (room.chatboxid !== _chatboxid) continue;
    for (var mem of room.members) {
      if (mem.userid !== _userid) continue;
      mem.answers = [];
      return {message: "success.",}
    };
  };
  return {message: "fail.",}
}

function trace() {
  let _string = "";
  for (var argument of arguments) {
    _string += argument + " ";
  }
  // tslint:disable-next-line:no-console
  console.log(_string);
}

Array.prototype.remove = function() {
  let what;
  let a = arguments;
  let L = a.length;
  while (L && this.length) {
    what = a[--L];
    while (this.indexOf(what)!== -1) {
      this.splice(this.indexOf(what), 1);
    }
  }
  return this;
};

function getresourceMessageid() {
  resource.messageid++;
  return resource.messageid;
}

function getDateString(d){
  const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
  const mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(d);
  const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
  var hh = new Intl.DateTimeFormat('en', { hour: '2-digit', hour12: false }).format(d);
  const mm = new Intl.DateTimeFormat('en', { minute: '2-digit' }).format(d);
  const ss = new Intl.DateTimeFormat('en', { second: '2-digit' }).format(d);
  if (parseInt(hh, 10)>23) { hh = "00"; }
  return `${ye}-${mo}-${da} ${hh}:${mm}:${ss}`;
}

module.exports = {
  makeroom: makeroom,
  execjoin: execjoin,
  showChatboxstck: showChatboxstck,
  setupdatabase: setupdatabase,
  freecache: freecache,
  writedowndb: writedowndb,
  cleanchatbox:cleanchatbox,
  cleanuser:cleanuser,
  userjoin: userjoin,
  userleave: userleave,
  userstilllivestream: userstilllivestream,
  postmessagetochtbx: postmessagetochtbx,
  strmchtbxdatatouser: strmchtbxdatatouser,
  respondfileuploadidid: respondfileuploadidid,
  usertranferfile:usertranferfile,
  getChatboxcachelist: getChatboxcachelist,

  sendoffer: sendoffer,
  getoffer: getoffer,
  sendanswer: sendanswer,
  getanswer: getanswer,

  userismakemediacall: userismakemediacall,

  offersideconnected: offersideconnected,
  answersideconnected: answersideconnected,
}

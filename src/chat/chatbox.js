var exports = module.exports = {}

export const Multimediatype = {image: "img", doc: "doc", text:"txt", mp3: "mp3", mp4: "mp4"}

exports.Chatbox = class Chatbox {
  constructor(chatboxid, members, chatboxName, creatorid, datetimeCreate, type, datetimeOpen) {
    this.chatboxid = chatboxid;
    this.members = members;
    this.creatorid = creatorid;
    this.datetimeCreate = datetimeCreate;
    this.datetimeOpen = datetimeOpen;
    this.type = type;
  }
}

exports.Member = class Member {
  constructor(userid, nickname, datetimejoin, chatboxuserkey, userchatboxname) {
    // tslint:disable-next-line:no-console
    console.log("datetimesend Member", datetimejoin);
    this.userid = userid;
    this.nickname = nickname;
    this.datetimejoin = datetimejoin;
    this.chatboxuserkey = chatboxuserkey;
    this.userchatboxname = userchatboxname;
    this.datetimejoin = datetimejoin;
    this.sendedmessage = [];
    this.offers = [];
    this.answers = [];
    this.datetimeleave = new Date();
  }
}

exports.Message = class Message {
  constructor(messageid, datetimesend, content, conversationid) {
    // tslint:disable-next-line:no-console
    console.log("datetimesend msg", datetimesend);
    this.messageid = messageid;
    this.datetimesend = datetimesend;
    this.content = content;
    this.conversationid = conversationid;
    this.type="msg";
    this.iswritedown = false;
    this.userreaded = [];
  }
}

exports.Media = class Media {
  constructor(mediaid, datetimesend, data) {
    this.mediaid = mediaid;
    this.datetimesend = datetimesend;
    this.data = data;
    this.sharewith = null;
  }
}

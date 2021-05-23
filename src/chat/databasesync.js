const {QueryTypes, Op} = require('sequelize');
const {Chatboxlist, Chatbox, Member, Message } = require('./chatbox');

var Database = {}

const setupDatabase = function(database) {
  Database = database;
}

const save = (userid, msg) => {
  const conversationid = msg.conversationid;
  return new Promise(async function(resolve, reject) {
    await Database.messages.create({unhideuserid: userid, messageData: msg.content, datetimeUnhide: msg.datetimesend, type: msg.type})
    .then(async function(entries) {
      await Database.saytoConversations.create({unhideUsermindid: entries.unhideUsermindid, conversationid: conversationid, datetimetell: new Date()});
      await Database.conversations.update({endAt: new Date()},{where: {conversationid: conversationid}});
      const convers = await Database.conversations.findOne({where: {conversationid:conversationid}});
      const members = await Database.memberOfChatboxs.findAll({where: {chatboxid: convers.dataValues.chatboxid}});
      for (var member of members) {
        if(member.memberid === parseInt(userid, 10)) continue;
        touchUser(member.memberid);
        const readed = msg.userreaded.some(reader=>{if(member.memberid===reader)return true;});
        // tslint:disable-next-line:no-console
        console.log("memberid readed...", msg,member.memberid, readed);
        const datereaded = readed?new Date():null;
        await Database.unreadMessages.create({readerid: member.memberid, unhideUsermindid: entries.unhideUsermindid, conversationid: conversationid, datetimeread: datereaded});
      };
      msg.iswritedown = true;
      resolve(msg);
    }).catch(function (error) {
      // tslint:disable-next-line:no-console
      console.log("database sync is error...", error);
      msg.iswritedown = false;
      resolve(msg);
    });
  });
}

const getConversation = (conversationid) => {
  return Database.conversations.findOne({where: {conversationid: conversationid}});
}

const getchatbox = (chatboxid) => {
  return Database.chatboxs.findOne({where: {chatboxid: chatboxid}});
}

const getmemberOfchatbox = (userid, chatboxid) => {
  return Database.memberOfChatboxs.findOne({where: {memberid: userid, chatboxid: chatboxid}});
}

async function touchUser(userid) {// error.....
  await Database.users.update({touchme: true}, {where: {userid: userid}})
  .catch(function (err) {
    return res.status(401).json({message: 'Unauthorized.',});
  });
}

module.exports = {
  setupDatabase: setupDatabase,
  save: save,
  getConversation: getConversation,
  getchatbox: getchatbox,
  getmemberOfchatbox: getmemberOfchatbox,
}

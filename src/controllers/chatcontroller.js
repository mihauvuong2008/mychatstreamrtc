const databasequery = require('./databasequery');
const formidable = require('formidable');
const {QueryTypes, Op} = require('sequelize');

var Database = {};

const setupDatabase = function (db) {
  Database = db;
}

const getChatboxlist = async function (req, res) {
  await Database.sequelize.query(databasequery.getchatboxList(req.user.userid),  {type: QueryTypes.SELECT}).
  then((chatboxsrs)=>{
    return res.status(200).json(chatboxsrs);
  }).catch(function (err) {
    return res.status(401).json({message: 'Unauthorized.',});
  });
}

const getchatboxMember = async function (req, res) {
  Database.sequelize.query(databasequery.getchatboxMember(req.query.chatboxid), {type: QueryTypes.SELECT})
  .then(function (result) {
    return res.status(200).json(result);
  }).catch(function (err) {
    return res.status(401).json({message: 'Unauthorized.',});
  });
}

const tokenTimeStamp = async (req, res) => {
  Database.tokens.findOne({attributes: ['createdAt', 'updatedAt'], where: {accesstoken: req.headers["x-access-token"]}})
  .then(function (result) {
    return res.status(200).json(result);
  }).catch(function (err) {
    return res.status(401).json({message: 'Unauthorized.',});
  });
}

const getChatboxInfo = async (req, res) => {
  Database.memberOfChatboxs.count({where: {chatboxid: req.query.chatboxid, memberid: req.user.userid}}).
  then((count)=>{
    if (count>=1) {
      Database.chatboxs.findOne({
        where: {chatboxid: req.query.chatboxid}})
        .then(function (result) {
          return res.status(200).json(result);
        });
      }else {
        return res.status(200).json({mesage: "Unauthorized."});
      }
    }).catch(function (err) {
      return res.status(401).json({message: 'Unauthorized.',});
    });
  }

  const getConversationlist = async (req, res) => {
    Database.memberOfChatboxs.count({where: {chatboxid: req.query.chatboxid, memberid: req.user.userid}}).
    then((count)=>{
      if (count>=1) {
        Database.conversations.findAll({where: {chatboxid: req.query.chatboxid}, order: [['conversationid', 'DESC']], limit : 10})
        .then(function (result) {
          return res.status(200).json(result);
        });
      }else {
        return res.status(200).json({mesage: "no conversation."});
      }
    }).catch(function (err) {
      return res.status(401).json({message: 'Unauthorized.',});
    });
  }

  const getconversationData = async (req, res) => {
    let unhideUsermindid;
    switch (req.query.unhideUsermindid) {
      case "undefined": unhideUsermindid = false; break;
      default: unhideUsermindid = req.query.unhideUsermindid;
    }

    await Database.sequelize.query(databasequery.getconversationData(req.query.conversationid, req.user.userid, unhideUsermindid), {type: QueryTypes.SELECT})
    .then(function(result) {
      return res.status(200).json(result);
    }).catch(function (err) {
      return res.status(401).json({message: 'Unauthorized.',});
    });
  }

  const getLastConversation = async (req, res) => {
    switch (req.query.datetime) {
      case "undefined":
      Database.conversations.findOne({limit: 1, where: {chatboxid: req.query.chatboxid}, order: [['conversationid', 'DESC'],['endAt', 'DESC']]})
      .then(function(convst){
        return res.status(200).json(convst);
      }).catch(function (err) {
        return res.status(401).json({message: 'Unauthorized.',});
      });
      break;
      default:
      const date = new Date(req.query.datetime);
      // tslint:disable-next-line:no-console
      console.log("date: ", date);
      Database.conversations.findOne({limit: 1, where: {
        chatboxid: req.query.chatboxid,
        endAt: {[Op.lt]: date}
      },
      order: [['conversationid', 'DESC'],['endAt', 'DESC']]})
      .then(function(convst){
        return res.status(200).json(convst);
      }).catch(function (err) {
        return res.status(401).json({message: 'Unauthorized.',});
      });
    }
  }

  const createConversation = async (req, res) => {
    Database.conversations.create({chatboxid: req.query.chatboxid, startAt: new Date(), endAt: new Date()})
    .then(function(convst){
      return res.status(200).json(convst);
    }).catch(function (err) {
      return res.status(401).json({message: 'Unauthorized.',});
    });
  }

  const postMessagetochatbox = async (req, res) => {
    const form = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {
      const userid = req.user.userid;
      const messageData = fields.message;
      const datetimesend = fields.datetimesend;
      const conversationid = fields.conversationid;
      await Database.messages.create({unhideuserid: userid, messageData: messageData, datetimeUnhide: datetimesend, type: "msg"})
      .then(async function(entries) {
        await Database.saytoConversations.create({unhideUsermindid: entries.unhideUsermindid, conversationid: conversationid, datetimetell: new Date()});
        await Database.conversations.update({endAt: new Date()},{where: {conversationid: conversationid}});
        const convers = await Database.conversations.findOne({where: {conversationid:conversationid}});
        const members = await Database.memberOfChatboxs.findAll({where: {chatboxid: convers.dataValues.chatboxid}});
        await members.forEach(async member => {
          if(member.memberid === req.user.userid) return;
          // touch
          await touchUser(member.memberid);
          await Database.unreadMessages.create({readerid: member.memberid, unhideUsermindid: entries.unhideUsermindid, conversationid: conversationid});
        });
        return res.status(200).json(entries);
      }).catch(function (error) {
        return res.status(401).json({message: 'Unauthorized.',});
      });
    });
  }

  const getChatboxUnreadmessage = async (req, res) => {
    // tslint:disable-next-line:no-console
    // console.log(databasequery.getChatboxUnreadmessage(req.query.conversationid, req.user.userid));
    await Database.sequelize.query(databasequery.getChatboxUnreadmessage(req.query.conversationid, req.user.userid), {type: QueryTypes.SELECT})
    .then(function (convst) {
      return res.status(200).json(convst);
    }).catch(function (err) {
      return res.status(401).json({message: 'Unauthorized.',});
    });
  }

  const setchatboxMessageReaded = async (req, res) => {
    Database.unreadMessages.update({datetimeread: new Date(req.query.datetimeRead)},{where: {readerid: req.user.userid, unhideUsermindid: req.query.unhideUsermindid}})
    .then(function (result) {
      return res.status(200).json(result);
    }).catch(function (err) {
      return res.status(401).json({message: 'Unauthorized.',});
    });
  }

  const getchatNotify = async (req, res) => {
    Database.sequelize.query(databasequery.getchatunreadnotice(req.user.userid), {type: QueryTypes.SELECT})
    .then(function (result) {
      return res.status(200).json(result);
    }).catch(function (err) {
      return res.status(401).json({message: 'Unauthorized.',});
    });
  }

  const istillonline = async (req, res) => {
    Database.users.update({lasttimelogin: new Date()},{where: {userid: req.user.userid}}).catch(function (err) {
      return res.status(401).json({message: 'Unauthorized.',});
    });
    return res.end();
  }

  const contactList = async (req, res) => {
    Database.friendrelates.findAll({ include: [ {model: Database.users, attributes:['userid', 'username', 'firstName', 'lastName'], as: 'imafriend'} ], where: {userid: req.user.userid}}).
    then( function (frlist) {
      return res.status(200).json(frlist);
    }).catch(function (err) {
      return res.status(401).json({message: 'Unauthorized.',});
    });
  }

  const findUsername = async (req, res) => {
    Database.users.findOne({where: {[Op.and]: [{userid: {[Op.not]: req.user.userid}}, {[Op.or]: [{username: req.query.pattern}, {email:req.query.pattern}]}]}})
    .then(function (result) { return res.status(200).json(result); }).catch(function (err) {
      return res.status(401).json({message: 'Unauthorized.',});
    });
  }

  const gettouchMe = async (req, res) => {
    Database.users.findOne({attributes: ['touchme'], where: {userid: req.user.userid}})
    .then(function (result) {
      return res.status(200).json(result);
    }).catch(function (err) {
      return res.status(401).json({message: 'Unauthorized.',});
    });
  }

  const settouchMe = async (req, res) => {
    Database.users.update({touchme: false}, {where: {userid: req.user.userid}})
    .then(function (result) {
      return res.status(200).json(result);
    }).catch(function (err) {
      return res.status(401).json({message: 'Unauthorized.',});
    });
  }

  const inittouchMe = async (req, res) => {
    Database.users.update({touchme: true}, {where: {userid: req.user.userid}})
    .then(function (result) {
      return res.status(200).json(result);
    }).catch(function (err) {
      return res.status(401).json({message: 'Unauthorized.',});
    });
  }

  const sendmakerelateRequest = async (req, res) => {
    Database.friendrequests.create({partnerid: req.user.userid, userid: req.query.userid, datetimesendrequest: new Date()})
    .then(async function (result) {
      await touchUser(req.query.userid);
      return res.status(200).json(result);
    }).catch(function (err) {
      return res.status(401).json({message: 'Unauthorized.',});
    });
  }

  const getMakerelateNotify = async (req, res) => {
    Database.friendrequests.findAll({ include: [ {model: Database.users, attributes:['username', 'firstName', 'lastName'], as: 'sendrequest'} ],
    attributes:['partnerid', 'userid', 'datetimesendrequest'],
    where: {userid: req.user.userid}})
    .then(function (result) {
      return res.status(200).json(result);
    }).catch(function (err) {
      return res.status(401).json({message: 'Unauthorized.',});
    });
  }

  const getInvitechatboxNotify = async (req, res) => {
    Database.inviteChatboxs.findAll({ include: [ {model: Database.users, attributes:['userid','username', 'firstName', 'lastName'], as: 'sender'} ],
    attributes:['senderid', 'chatboxid', 'receiverid', 'datetimeInvite'],
    where: {receiverid: req.user.userid}})
    .then(function (result) {
      return res.status(200).json(result);
    }).catch(function (err) {
      return res.status(401).json({message: 'Unauthorized.',});
    });
  }

  const relateAccept = async (req, res) => {
    Database.friendrelates.create({userid: req.user.userid, friendid: req.query.userid, datetimeMakefriend: new Date()})
    .then(async function (result1) {
      if(result1.dataValues)
      await Database.friendrelates.create({userid: req.query.userid, friendid: req.user.userid, datetimeMakefriend: new Date()})
      .then(function (result2) {
        if(result2.dataValues)
        Database.friendrequests.destroy({where:{
          [Op.or]:[{partnerid: req.query.userid, userid: req.user.userid}, {userid: req.query.userid, partnerid: req.user.userid}]
        }})
        .then(function (result){
          return res.status(200).json(result);
        });
      });;
    }).catch(function (err) {
      return res.status(401).json({message: 'Unauthorized.',});
    });
  }

  const invitegroupAccept = async (req, res) => {
    Database.memberOfChatboxs.create({chatboxid: req.query.chatboxid, memberid: req.user.userid, chatboxuserkey: false, datetimeJoin: new Date()})
    .then(function (rslt) {
      Database.inviteChatboxs.destroy({where:{chatboxid: req.query.chatboxid, receiverid: req.user.userid}})
      .then(async function (result) {
        await touchUser(req.query.userid);
        return res.status(200).json(result);
      })
    }).catch(function (err) {
      return res.status(401).json({message: 'Unauthorized.',});
    });
  }

  const relateRefuse = async (req, res) => {
    Database.friendrequests.destroy({ where: {partnerid: req.query.userid, userid: req.user.userid}})
    .then(function (result) {
      return res.status(200).json(result);
    }).catch(function (err) {
      return res.status(401).json({message: 'Unauthorized.',});
    });
  }

  const invitegroupRefuse = async (req, res) => {
    Database.inviteChatboxs.destroy({where: {senderid: req.query.userid, chatboxid: req.query.chatboxid}})
    .then(function (result) {
      return res.status(200).json(result);
    }).catch(function (err) {
      return res.status(401).json({message: 'Unauthorized.',});
    });
  }

  const groupRequest = async (req, res) => {
    Database.inviteChatboxs.create({senderid: req.user.userid,chatboxid: req.query.chatboxid, receiverid: req.query.receiverid, datetimeInvite: new Date()})
    .then(async function (result) {
      await touchUser(req.query.receiverid);
      return res.status(200).json(result);
    }).catch(function (err) {
      return res.status(401).json({message: 'Unauthorized.',});
    });
  }

  const createChatbox = async (req, res) => {
    await Database.chatboxs.create({chatboxName: req.query.name, creatorid: req.user.userid, datetimeCreate: new Date(), type: 'group'})
    .then(async function (result) {
      await Database.memberOfChatboxs.create({chatboxid: result.dataValues.chatboxid, memberid: req.user.userid, chatboxuserkey: true, datetimeJoin: new Date()})
      .then(async function (rslt) {
        return res.status(200).json(result);
      });
    }).catch(function (err) {
      return res.status(401).json({message: 'Unauthorized.',});
    });
  }

  const removechatboxMember = async (req, res) => {
    await Database.memberOfChatboxs.destroy({where: {chatboxid: req.query.chatboxid, memberid: req.query.memberid}})
    .then(async function (rslt) {
      await touchUser(req.query.memberid);
      return res.status(200).json(rslt);
    }).catch(function (err) {
      return res.status(401).json({message: 'Unauthorized.',});
    });
  }

  async function touchUser(userid) {// error.....
    await Database.users.update({touchme: true}, {where: {userid: userid}})
    .catch(function (err) {
      return res.status(401).json({message: 'Unauthorized.',});
    });
  }

  const getfriendchatbox = async (req, res) => {

    // tslint:disable-next-line:no-console
    console.log(databasequery.getfriendchatbox(req.query.friendid, req.user.userid));
    await Database.sequelize.query(databasequery.getfriendchatbox(req.query.friendid, req.user.userid),{type: QueryTypes.SELECT})
    .then(function (rslt) {
      return res.status(200).json(rslt);
    }).catch(function (err) {
      return res.status(401).json({message: 'Unauthorized.',});
    });
  }

  const createfriendchatbox = async (req, res) => {
    Database.chatboxs.create({
      chatboxName: "friend",
      creatorid: req.user.userid,
      datetimeCreate: new Date(),
      type: 'friend'}).then((chatbox)=>{
        Database.memberOfChatboxs.create({chatboxid: chatbox.chatboxid, memberid: req.query.friendid, userchatboxname: req.user.username, chatboxuserkey: true, datetimeJoin: new Date()})
        Database.memberOfChatboxs.create({chatboxid: chatbox.chatboxid, memberid: req.user.userid, userchatboxname: req.query.username, chatboxuserkey: true, datetimeJoin: new Date()})
        .then(async function (rslt) {
          await touchUser(req.query.userid);
          return res.status(200).json(rslt);
        });
      }).catch(function (err) {
        return res.status(401).json({message: 'Unauthorized.',});
      });
    }

    const removeContact = async (req, res) => {
      Database.friendrelates.destroy({where: {[Op.or]:[
        {[Op.and]: [{userid: req.user.userid}, {friendid: req.query.contactid}]},
        {[Op.and]: [{userid: req.query.contactid}, {friendid: req.user.userid}]}
      ]}})
      .then((chatbox)=>{
        Database.sequelize.query(databasequery.removefriendchatbox(req.query.contactid, req.user.userid), QueryTypes.DELETE)
        .then(function (rslt) {
          return res.status(200).json(rslt);
        });
      }).catch(function (err) {
        return res.status(401).json({message: 'Unauthorized.',});
      });
    }

    const updatememberChatboxname = async (req, res) => {
      Database.memberOfChatboxs.update({userchatboxname: req.query.userchatboxname}, {where: {chatboxid: req.query.chatboxid, memberid: req.user.userid}})
      .then(async (rslt)=>{
        await Database.memberOfChatboxs.findOne({where: {chatboxid: req.query.chatboxid, memberid: req.user.userid}})
        .then((result)=>{return res.status(200).json(result);});
      }).catch(function (err) {
        return res.status(401).json({message: 'Unauthorized.',});
      });
    }

    const leaveChatbox = async (req, res) => {
      Database.memberOfChatboxs.findOne( { where: {[Op.and]:[{chatboxid: req.query.chatboxid},{[Op.not]:[{memberid: req.user.userid}]}]}, order: [['datetimeJoin','ASC']]})
      .then((candidate)=>{
        if (candidate) {
          Database.memberOfChatboxs.update({chatboxuserkey: true}, {where: {chatboxid: req.query.chatboxid, memberid: candidate.memberid}})
          .then(()=>{
            Database.memberOfChatboxs.destroy({where: {chatboxid: req.query.chatboxid, memberid: req.user.userid}})
            .then((rslt)=>{
              return res.status(200).json(rslt);
            });
          }).catch(function (err) {
            return res.status(401).json({message: 'Unauthorized.',});
          });
        }else {
          Database.chatboxs.destroy({where: {chatboxid: req.query.chatboxid}}).then((rslt)=>{
            return res.status(200).json(rslt);
          });
        }
      });
    }

    const dissolateGroup = async (req, res) => {
      Database.chatboxs.destroy({where: {chatboxid: req.query.chatboxid}}).then((rslt)=>{
        return res.status(200).json(rslt);
      }).catch(function (err) {
        return res.status(401).json({message: 'Unauthorized.',});
      });
    }

    const getSeenlist = async (req, res) => {
      Database.unreadMessages.findAll({where: {unhideUsermindid: req.query.unhideUsermindid, datetimeread: { [Op.ne]: null }}}).
      then(async (rslt)=>{
        const rs = [];
        for (var item of rslt) {
          await Database.users.findOne({where:{userid: item.dataValues.readerid}}).
          then((mem)=>{rs.push(mem)});
        }
        return res.status(200).json(rs);
      }).catch(function (err) {
        return res.status(401).json({message: 'Unauthorized.'+err,});
      });
    }

    function trace() {
      let _string = "";
      for (var argument of arguments) {
        _string += argument + " ";
      }
      // tslint:disable-next-line:no-console
      console.log(_string);
    }

    module.exports = {
      setupDatabase: setupDatabase,
      getChatboxlist: getChatboxlist,
      getchatboxMember: getchatboxMember,
      tokenTimeStamp: tokenTimeStamp,
      getChatboxInfo: getChatboxInfo,
      getConversationlist: getConversationlist,
      getconversationData: getconversationData,
      getLastConversation: getLastConversation,
      createConversation: createConversation,
      postMessagetochatbox: postMessagetochatbox,
      getChatboxUnreadmessage: getChatboxUnreadmessage,
      setchatboxMessageReaded: setchatboxMessageReaded,
      getchatNotify: getchatNotify,
      istillonline: istillonline,
      contactList: contactList,
      findUsername: findUsername,
      sendmakerelateRequest: sendmakerelateRequest,
      getMakerelateNotify: getMakerelateNotify,
      getInvitechatboxNotify: getInvitechatboxNotify,
      gettouchMe: gettouchMe,
      settouchMe: settouchMe,
      inittouchMe: inittouchMe,
      relateAccept: relateAccept,
      invitegroupAccept: invitegroupAccept,
      relateRefuse: relateRefuse,
      invitegroupRefuse: invitegroupRefuse,
      groupRequest: groupRequest,
      createChatbox: createChatbox,
      removechatboxMember: removechatboxMember,
      getfriendchatbox: getfriendchatbox,
      createfriendchatbox: createfriendchatbox,
      removeContact: removeContact,
      updatememberChatboxname: updatememberChatboxname,
      leaveChatbox: leaveChatbox,
      dissolateGroup: dissolateGroup,
      getSeenlist: getSeenlist,
    };

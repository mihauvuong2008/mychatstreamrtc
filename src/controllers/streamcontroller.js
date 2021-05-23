const databasequery = require('./databasequery');
const formidable = require('formidable');
const {QueryTypes, Op} = require('sequelize');
var mv = require('mv');// for upload file. npm install mv

var Mychatsocketio = {}

const init = (models) => {
  Mychatsocketio = require("../chat/mychatsocketio");
  Mychatsocketio.setDatabasesync(models);
  Mychatsocketio.startstreamservice();// setup chatcontroller
}

const userjoin = async (req, res) => {
  return res.status(200).json(Mychatsocketio.userjoin(req.user.userid, req.query.chatboxid));
};

const userleave = async (req, res) => {
  Mychatsocketio.userleave(req.user.userid, req.query.chatboxid)
  .then((result)=>{
    return res.status(200).json(result);})
  .catch(function(err) {
    trace("Unauthorized." + err);
    return res.status(401).json({message: "Unauthorized.", err});
  });
}

const userstilllivestream = (req, res) => {
  Mychatsocketio.userstilllivestream(req.user.userid, req.query.chatboxid);
  return res.status(200).json({message: "success."});
}

const postMessagetochatbox = async (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async function (err, fields, files) {
    const userid = req.user.userid;
    const messageData = fields.message;
    const datetimesend = fields.datetimesend;
    const conversationid = fields.conversationid;
    Mychatsocketio.srvreceivestreamdata(userid, messageData, datetimesend, conversationid)
    .then((result)=>{return res.status(200).json(result);});
  }).on('uncaughtException', function(err) {
    return res.status(401).json({message: "Unauthorized."});
  });
}

const getstreamdata = async (req, res) => {
  let rs = {message: "socketfail."}
  await Mychatsocketio.srvrespondstreamdata(req.user.userid, req.query.conversationid)
  .then((result)=>{ rs = result; })
  .catch(function(err) {rs = {message: "Unauthorized."}; });
  return res.status(200).json(rs);
}

const requestfileuploadidid = async (req, res) => {
  return res.status(200).json({id: Mychatsocketio.respondfileuploadidid(req.user.userid, req.query.chatboxid)});
}

const usertranferfile = async (req, res) => {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    try {
      var currLocalDisk = __dirname;
      var oldpath = files.filetoupload.path;
      var newpath = currLocalDisk+ '../../../public\\uploads\\Images\\' + files.filetoupload.name;
      mv(oldpath , newpath, function(mverr) {
        if (mverr) throw mverr;
        var MyWebSiteAddress = "http://localhost:3000/"
        var publicResource = "uploads/Images/";
        const filepath = MyWebSiteAddress + publicResource + files.filetoupload.name;
        Mychatsocketio.usertranferfile(req.user.userid, req.query.conversationid, req.query.fileid, files.filetoupload.name, filepath, "");
        return res.status(200).json({ url: filepath});
      });
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.log("mverr", e);
      return res.status(401).json({message: "Unauthorized."});
    }
  }).on('uncaughtException', function(err) {
    // tslint:disable-next-line:no-console
    console.log("errrr", err);
    return res.status(401).json({message: "Unauthorized."});
  });
}

const getactiveChatboxlist = async (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, async function (err, fields, files) {
    const chatlist = JSON.parse("["+fields.chatlist+"]");
    const result = Mychatsocketio.getChatboxcachelist(chatlist);
    return res.status(200).json(result);
  });
}

const userlivestream = async (req, res) => {
  var currLocalDisk = __dirname;
  var newpath = currLocalDisk + '../../../public\\uploads\\Stream\\'

  var form = new formidable.IncomingForm({
    uploadDir: newpath,  // don't forget the __dirname here
    keepExtensions: true
  });

  form.parse(req, function (err, fields, files) {
    try {
      const chatboxid = fields.chatboxid;
      const blobchunk = files.blobchunk;
      if (!blobchunk)  throw new Error("blobchunk is not exists");
      var MyWebSiteAddress = "http://localhost:3000/"
      var publicResource = "uploads/Stream/";
      const arr = blobchunk.path.split("\\");
      const name = arr[arr.length - 1];
      blobchunk.srcpath = MyWebSiteAddress + publicResource + name;

      const result = Mychatsocketio.pipelinein(chatboxid, req.user.userid, blobchunk);
      return res.status(200).json(result);
    } catch (e) {
      return res.status(401).json({message: "Unauthorized."+e});
    }

  }).on('uncaughtException', function(err) {
    // tslint:disable-next-line:no-console
    console.log("errrr", err);
    return res.status(401).json({message: "Unauthorized."});
  });
}

const getlivestreamdata = async (req, res) => {
  const result = Mychatsocketio.pipelineout(req.query.chatboxid, req.query.userid, req.query.streamid);
  if (result) {
    return res.status(200).json({id: result.mediaid, path: result.data.srcpath});
  }
  return res.status(401).json({message: "Unauthorized."});
}

const userismakemediacall = async (req, res) => {
  const result = Mychatsocketio.userismakemediacall(req.query.chatboxid, req.query.userid);
  if (result) {
    return res.status(200).json(result);
  }
  return res.status(401).json({message: "Unauthorized."});
}

const sendoffer = async (req, res) => {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    const chatboxid = fields.chatboxid;
    const userid = req.user.userid;
    const offer = JSON.parse(fields.offer);
    const result = Mychatsocketio.sendoffer(chatboxid, userid, offer);
    // tslint:disable-next-line:no-console
    console.log("result", chatboxid, userid, offer);
    return res.status(200).json(result);
  }).on('uncaughtException', function(err) {
    return res.status(401).json({message: "Unauthorized."});
  });
  return;
}

const getoffer = async (req, res) => {
  const chatboxid = req.query.chatboxid;
  const userid = req.query.userid;
  const result = Mychatsocketio.getoffer(chatboxid, userid);
  return res.status(200).json(result);
}

const sendanswer = async (req, res) => {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    const chatboxid = fields.chatboxid;
    const userid = fields.userid;
    const answer = JSON.parse(fields.answer);
    const result = Mychatsocketio.sendanswer(chatboxid, userid, answer);
    return res.status(200).json(result);
  }).on('uncaughtException', function(err) {
    return res.status(401).json({message: "Unauthorized."});
  });
  return;
}

const getanswer = async (req, res) => {
  const chatboxid = req.query.chatboxid;
  const userid = req.user.userid;
  const result = Mychatsocketio.getanswer(chatboxid, userid);
  return res.status(200).json(result);
}

const offersideconnected = async (req, res) => {
  const chatboxid = req.query.chatboxid;
  const userid = req.user.userid;
  const result = Mychatsocketio.offersideconnected(chatboxid, userid);
  return res.status(200).json(result);
}

const answersideconnected = async (req, res) => {
  const chatboxid = req.query.chatboxid;
  const userid = req.query.userid;
  const result = Mychatsocketio.answersideconnected(chatboxid, userid);
  return res.status(200).json(result);
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
  init: init,
  postMessagetochatbox: postMessagetochatbox,
  getChatboxUnreadmessage: getstreamdata,
  userjoin: userjoin,
  userleave: userleave,
  requestfileuploadidid: requestfileuploadidid,
  usertranferfile: usertranferfile,
  userstilllivestream: userstilllivestream,
  getactiveChatboxlist: getactiveChatboxlist,
  sendoffer: sendoffer,
  getoffer: getoffer,
  sendanswer: sendanswer,
  getanswer: getanswer,
  userismakemediacall: userismakemediacall,
  offersideconnected: offersideconnected,
  answersideconnected: answersideconnected,
}

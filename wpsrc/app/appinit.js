const token = require('../app/token');
const serverComunicate = require('./serverComunicate');
const myapp = require('./myapp');
const chtmsLstnr = require('./chatmouseListener');
const chatapp = require('../chat/chatapp');
const chatBox = require('../chat/chatbox/chatBox');
const cbxcntrl = require('../chat/chatbox/chtbxcontrol');
const chtbxtool = require('../chat/chatbox/chtbxtool');
const rcntcontact = require('../chat/recentContact');
const bubble = require('../menu/bubble');
const mainMenu = require('../menu/mainMenu');
const srvcetool = require('../service/servicetool');
const chatsvctsk = require('../service/chattask/chatsvctsk');
const chattask = require('../service/chattask/chattask');
const service = require('../service/service');
const tmvwtsk = require('../service/teamviewtask/teamvwtask');
const contact = require('../contact/contact');
const scrncapture = require('../teamviewer/screencapture');
const teamview = require('../teamviewer/teamview');
const tvwcontrol = require('../teamviewer/tvwcontrol');

let svrCom = {};// server communicate
async function authorized () {
  token.init();
  serverComunicate.init(token);
  svrCom = serverComunicate.svrCom;
}

window.init = function (userid, username){
  authorized();

  myapp.init(svrCom, /*init user data*/ userid, username);
  chtmsLstnr.init(myapp);
  chatapp.init(myapp, service);
  chtbxtool.init(myapp, chatBox, cbxcntrl, contact, srvcetool, service, token, svrCom);
  chatBox.init(myapp, chtbxtool, cbxcntrl);
  cbxcntrl.init(myapp, chatBox, teamview, svrCom);
  rcntcontact.init(myapp, cbxcntrl, service, svrCom);
  tmvwtsk.init(myapp, svrCom);
  srvcetool.init(myapp);
  chattask.init(myapp, srvcetool, chtbxtool, cbxcntrl, svrCom);
  chatsvctsk.init(myapp, chattask, srvcetool, cbxcntrl, token, svrCom);
  service.init(myapp, chatsvctsk, tmvwtsk, srvcetool);
  bubble.init(myapp, service, token, svrCom);
  mainMenu.init(myapp, contact, service, svrCom);
  contact.init(myapp, service, svrCom);
  tvwcontrol.init(myapp, svrCom);
  scrncapture.init(tvwcontrol);
  teamview.init(scrncapture);
}

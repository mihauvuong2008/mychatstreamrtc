const dmt = require('../app/domtl');

let CHATROOMTYPE;
let ACTIVECHATBOX;
let _chatService;

export const init = function (myapp, service) {
  _chatService = service._chatService;
  CHATROOMTYPE = myapp.CHATROOMTYPE;
  ACTIVECHATBOX = myapp.ACTIVECHATBOX;

  intitChatboxlist();
}

export const chtlsttool = {
  getgrpiconchatlistitem: function (type) {
    switch (type) {
      case CHATROOMTYPE.TYPEGROUP:
      const groupiconparent = dmt.domtool.creatediv("groupicon");
      const groupicon1 = dmt.domtool.creatediv("groupicon");
      const groupicon2 = dmt.domtool.creatediv("groupicon");
      const groupicon3 = dmt.domtool.creatediv("groupicon");
      groupiconparent.appendChild(groupicon1);
      groupiconparent.appendChild(groupicon2);
      groupiconparent.appendChild(groupicon3);
      return groupiconparent;
      case CHATROOMTYPE.TYPEFRIEND:
      const icon = dmt.domtool.creatediv("icon");
      return icon;
    }
  },

  createchtbxnamechatlistitem: function (type, chatboxid, chatboxName) {
    switch (type) {
      case CHATROOMTYPE.TYPEGROUP:
      var chatlistitemname = dmt.domtool.creatediv("chatlistitemname", "chatlistitemnameID"+chatboxid);
      chatlistitemname.innerHTML = chatboxName;
      return chatlistitemname;
      case CHATROOMTYPE.TYPEFRIEND:
      var chatlistitemname = dmt.domtool.creatediv("chatlistitemname", "chatlistitemnameID"+chatboxid);
      chatlistitemname.innerHTML = chatboxName;
      return chatlistitemname;
    }
  },

  getcallitem: function (chatboxid){
    const callbean = dmt.domtool.creatediv("callbean");
    const callstream =  dmt.domtool.creatediv("callstream");
    callbean.appendChild(callstream);
    return callbean;
  },

  getnoticeitem: function (chatboxid){
    const notice =  dmt.domtool.creatediv("notice");
    notice.classList.add("hidenotice");
    notice.id = "chatlistitemnotice"+chatboxid;
    const noticevalue =  dmt.domtool.creatediv("noticevalue", "chatlistitemnoticevalue"+chatboxid);
    noticevalue.innerHTML = 0;
    notice.appendChild(noticevalue);
    return notice;
  },

  chatlistitemSelect: function () {
    const chatboxid =  this.getAttribute("chatboxid");
    this.classList.add ("chatlistitemwillSelect");
    _chatService.userhaveaAction();
    ACTIVECHATBOX.selector.select(chatboxid);
  }
}

function intitChatboxlist(){
  const chatlist = document.getElementById("chatlistID");
  chatlist.innerHTML = "";
  // service will be init last part

  // const log = document.createElement("textarea");
  // log.className = "log"
  // log.id = "logid";
  // document.body.prepend(log);
  //
  // const clearlog = document.createElement("input");
  // clearlog.type = "button"
  // clearlog.value = "clearlog";
  // clearlog.onclick = function () {
  //   const log = document.getElementById("logid");
  //   log.value = "";
  // }
  // clearlog.className = "clearlog";
  // clearlog.id = "clearlog";
  // document.body.prepend(clearlog);
  //
  // setInterval( async ()=>{
  //   log.value = "";
  // }, 15000);
}

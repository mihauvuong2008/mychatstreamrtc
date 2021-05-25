let executeAsync;
let CHATBOXSTATE;
let USERDATA;
let ACBchatboxStackdata;
let chatBox;
let teamviewtool;
let serverstreamcmnc;
let serverchatcmnc;

export const init = function (myapp, _chatBox, teamview, svrCom) {
  executeAsync = myapp.executeAsync;
  CHATBOXSTATE = myapp.CHATBOXSTATE;
  USERDATA = myapp.USERDATA;
  ACBchatboxStackdata = myapp.ACTIVECHATBOX.chatboxStack.data;
  chatBox = _chatBox;
  teamviewtool = teamview.teamviewtool;
  serverstreamcmnc = svrCom.serverstreamcmnc;
  serverchatcmnc  = svrCom.serverchatcmnc;
}

export const chbxcontrol = {

  showChatbox: function (chatboxID) {
    new Promise(async function(resolve, reject) {
      const chatbox = await(serverchatcmnc.getChatboxInfo(chatboxID));
      resolve(chatbox);
    }).then(async(chatbox)=>{
      await chatBox.addChatbox(chatbox);
      return chatbox;
    }).then((chatbox)=>{
      executeAsync(function() {
        chatBox.loadChatboxInfo(chatbox);
        executeAsync(async function() {
          serverstreamcmnc.jointochatbox(chatboxID);
          const lastconv = await(serverchatcmnc.getLastConversation(chatbox.chatboxid));
          const conversationData = lastconv?await(serverchatcmnc.getconversationData(lastconv.conversationid)):null;
          chatBox.initmessagebox(chatbox, lastconv, conversationData);
          chbxcontrol.hightlight();
        }, 100);
      }, 200);
    });
  },

  chtbxdestroyer: async function (idx) {
    const chtbxstkitem = ACBchatboxStackdata[idx];
    chtbxstkitem.chatbox.classList.remove("chatboxmaximize");
    chtbxstkitem.chatbox.setAttribute('style', 'animation: fade 0.5s ease forwards !important');
    new Promise(function(resolve, reject) {
      setTimeout(()=>{
        serverstreamcmnc.leaveoutchatbox(chtbxstkitem.chatboxid);
        chtbxstkitem.chatbox.remove();
        delete chtbxstkitem.chatbox;
        ACBchatboxStackdata.remove(chtbxstkitem);
        chbxcontrol.hightlight();
        resolve();
      }, 800);
    });
  },

  disposechatbox: async function (chatboxid) {
    const _chatboxid = parseInt(chatboxid, 10);
    ACBchatboxStackdata.some(chtbxstkitem=> {
      if (_chatboxid != chtbxstkitem.chatboxid) return;
      chtbxstkitem.dispose = true;
      return true;
    });
  },

  closechatbox: async function () {
    this.style.color = "red";
    const _chatboxid = parseInt(this.getAttribute("chatboxid"), 10);
    ACBchatboxStackdata.some(chtbxstkitem=> {
      if (_chatboxid != chtbxstkitem.chatboxid) return;
      chtbxstkitem.dispose = true;
      return true;
    });
  },

  chatboxminimize: function(){
    const chatboxid = parseInt(this.getAttribute("chatboxid"));
    const chatbox = document.getElementById( "chatboxID" + chatboxid);
    const setupChatboxsate = item => {
      if (chatboxid != item.chatboxid)return ;
      switch (item.CHATBOXSTATE) {
        case CHATBOXSTATE.MINIMIZE:
        item.CHATBOXSTATE = CHATBOXSTATE.NORMAL;
        chatbox.className = "chatbox";
        return /*break s_ome*/true;
        default:
        item.CHATBOXSTATE = CHATBOXSTATE.MINIMIZE;
        chatbox.className = "chatboxminimize";
        return /*break s_ome*/true;
      }
    }
    ACBchatboxStackdata.some(setupChatboxsate);
  },

  chatboxmaximize: function(){
    const chatboxid = this.getAttribute("chatboxid");
    const chatbox = document.getElementById( "chatboxID" + chatboxid);
    const setupChatboxsate = item => {
      if (chatboxid != item.chatboxid) return ;
      switch (item.CHATBOXSTATE) {
        case CHATBOXSTATE.MAXIMIZE:
        item.CHATBOXSTATE = CHATBOXSTATE.NORMAL;
        chatbox.className = "chatbox";
        chatbox.classList.remove("chatboxmaximize");
        return /*break s_ome*/true;
        default:
        item.CHATBOXSTATE = CHATBOXSTATE.MAXIMIZE;
        chatbox.className = "chatbox";
        chatbox.classList.add("chatboxmaximize");
        chatbox.style.height = "";
        return /*break s_ome*/true;
      }
    }
    ACBchatboxStackdata.some(setupChatboxsate);
  },

  showinfomessage: function(){
    const messageinfo = document.getElementById("messageinfoID" + this.getAttribute("unhideUsermindid"));
    switch (messageinfo.className) {
      case "hidemessageinfo": messageinfo.className = "messageinfo"; break;
      case "messageinfo": messageinfo.className = "hidemessageinfo"; break;
    }
  },

  showinfochbxmember: function(){
    switch (true) {
      case this.classList.contains("memberusernamefull"):
      this.classList.remove("memberusernamefull");
      break;
      default:
      this.classList.add("memberusernamefull");
    }
  },

  teamviewshare: function(){
    const teamviewwindow = document.getElementsByClassName("teamviewwindow");
    if (teamviewwindow.length>0) return;
    const chatboxid = this.getAttribute("chatboxid");
    teamviewtool.teamviewshare(chatboxid, USERDATA.ID);
  },

  teamviewreceive: function(){
    const teamviewwindow = document.getElementsByClassName("teamviewwindow");
    if (teamviewwindow.length>0) return;
    const chatboxid = this.getAttribute("chatboxid");
    const userid = this.getAttribute("userid");
    teamviewtool.teamviewreceive(chatboxid, userid);
  },

  downloadmmf: function(){
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = this.getAttribute("path");
    a.download = this.getAttribute("name");
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(this.getAttribute("path"));
  },

  hightlight: function(){
    const list = document.getElementsByClassName("chatlistitem");
    for (let item of list) {
      item.classList.remove("chatlistitemSelected");
      item.classList.remove("chatlistitemwillSelect");
    }
    for (var i = 0; i < ACBchatboxStackdata.length; i++) {
      const selected = document.getElementById("chatlistitemID" + ACBchatboxStackdata[i].chatboxid);
      if (selected)selected.classList.add ("chatlistitemSelected");
    }
  },

  setUserisscrollbox: function(chatboxid) {
    // scroll is max position
    const messagebox = document.getElementById("messageboxID" + chatboxid);
    if(!messagebox)return;
    const d = messagebox.scrollHeight - messagebox.clientHeight;
    const limit = window.scrollMaxY? Math.max (window.scrollMaxY, d):(d);
    const setupScroll = item => {
      if (chatboxid != item.chatboxid) return;
      if (messagebox.scrollTop == limit) {
        item.user_isscrollchatbox = false;
        return;
      }
      item.user_isscrollchatbox = true;
      return;
    }
    ACBchatboxStackdata.some(setupScroll);
  },

  getUserisscrollbox: function (chatboxid) {
    const getisscrollbox = item => {// do for all chatbox
      if (chatboxid != item.chatboxid) return;
      return item.user_isscrollchatbox;
    }
    return ACBchatboxStackdata.some(getisscrollbox);
  },

  textboxAutogrow: function (element) {
    element.style.height = "20px";
    element.style.height = (element.scrollHeight-8)+"px";
  },

  chtbxautoscrolllast: function (chatboxid) {
    const messagebox = document.getElementById("messageboxID"+ chatboxid);
    if(!messagebox) return;
    const d = messagebox.scrollHeight - messagebox.clientHeight;
    const limit = window.scrollMaxY? Math.max (window.scrollMaxY, d): (d);
    messagebox.scrollTop = limit;
    const setUser_isscrollchatbox = item => { if (chatboxid = item.chatboxid) { item.user_isscrollchatbox = false; return true; } }
    ACBchatboxStackdata.some(setUser_isscrollchatbox);
  },

}

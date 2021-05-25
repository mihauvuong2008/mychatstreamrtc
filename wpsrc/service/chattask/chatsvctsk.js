const accessdelay = 200;

let srvcetool;
let cbxcntrl;
let token;
let ACTIVECHATBOX;
let ACBchatboxStackdata;
let ACBrecentchatboxdata;
let APPDATA;
let TOUCH;
let APPNOTICE;
let UPDATER;
let USERDATA;
let sleep;
let getDateString;
let chattask;
let serviceTool;
let chbxcontrol;
let TOKEN;
let refreshtoken;

// chat server communicate
let getchatboxMember;
let getChatboxlist;
let gettouchMe;
let settouchMe;
let istillonline;
let sendMessagetochatbox;
let setmessageReaded;
let getMakerelateNotify;
let getInvitechatboxNotify;
let getchatNotify;
let getChatboxUnreadmessage;

// strean server communicate
let userstilllivestream;
let sgetChatboxUnreadmessage;

let openlist;

export const init = function (myapp, chttk, srvcetool, cbxcntrl, token, svrCom) {

  ACTIVECHATBOX = myapp.ACTIVECHATBOX;
  ACBchatboxStackdata = ACTIVECHATBOX.chatboxStack.data;
  ACBrecentchatboxdata = ACTIVECHATBOX.recentchatbox.data;
  APPDATA = myapp.APP.DATA;
  TOUCH = myapp.TOUCH;
  APPNOTICE = myapp.APP.NOTICE;
  UPDATER = myapp.UPDATER;
  USERDATA = myapp.USERDATA;
  sleep = myapp.sleep;
  getDateString = myapp.getDateString;
  chattask = chttk.chattask;
  serviceTool = srvcetool.serviceTool;
  chbxcontrol = cbxcntrl.chbxcontrol;
  TOKEN = token.TOKEN;
  refreshtoken = token.refreshtoken;

  getchatboxMember = svrCom.serverchatcmnc.getchatboxMember;
  getChatboxlist = svrCom.serverchatcmnc.getChatboxlist;
  gettouchMe = svrCom.serverchatcmnc.gettouchMe;
  settouchMe = svrCom.serverchatcmnc.settouchMe;
  istillonline = svrCom.serverchatcmnc.istillonline;
  sendMessagetochatbox = svrCom.serverchatcmnc.sendMessagetochatbox;
  setmessageReaded = svrCom.serverchatcmnc.setmessageReaded;
  getMakerelateNotify = svrCom.serverchatcmnc.getMakerelateNotify;
  getInvitechatboxNotify = svrCom.serverchatcmnc.getInvitechatboxNotify;
  getchatNotify = svrCom.serverchatcmnc.getchatNotify;
  getChatboxUnreadmessage = svrCom.serverchatcmnc.getChatboxUnreadmessage;

  userstilllivestream = svrCom.serverstreamcmnc.userstilllivestream;
  sgetChatboxUnreadmessage = svrCom.serverstreamcmnc.getChatboxUnreadmessage;

  openlist = ACTIVECHATBOX.selector.openlist;
}

export const chatsvctsk = {
  userstilllivestream: function () {
    ACBchatboxStackdata.forEach(chtbxstkitem => {
      userstilllivestream(chtbxstkitem.chatboxid);
    });
  },

  // chat list
  updatechatboxlistdata: async function() {
    const chatboxlist = await getChatboxlist();
    if (!chatboxlist) return;
    delete APPDATA.chatboxlist;
    APPDATA.chatboxlist = chatboxlist;
    for (var item of chatboxlist) {
      await sleep(accessdelay);
      const members = await getchatboxMember(item.chatboxid);
      if (members) {delete item.members; item.members = members};
    }
  },

  // chat box
  updatechatboxstack: function() {
    const chatboxlist = APPDATA.chatboxlist;
    ACBchatboxStackdata.forEach(chtbxstkitem => {
      chatboxlist.forEach(chatboxlistitem => {
        if(chtbxstkitem.chatboxid!=chatboxlistitem.chatboxid) return;
        if (!chatboxlistitem.members) return;
        delete chtbxstkitem.members;
        chtbxstkitem.members = chatboxlistitem.members;
      });
    });
  },

  showchatbox: function() {
    if(!ACTIVECHATBOX.selector.isreadytoshow())return ;
    openlist.forEach(item => {
      if (ACBchatboxStackdata.some(chtbxstkitem => { if(chtbxstkitem.chatboxid == item)return true;})) {// is opened
        openlist.remove(item);
        return;
      }
      openlist.remove(item);
      chbxcontrol.showChatbox(item);
    });
  },

  closechatbox: function() {
    ACBchatboxStackdata.forEach((chtbxstkitem, i) => {
      switch (true) {
        case (!chtbxstkitem.dispose): return;
        case (chtbxstkitem.chatbox.style.animation.localeCompare("")!=0): return;
      }
      chbxcontrol.chtbxdestroyer(i);
    });
  },

  removechatbox: function() {
    for (var i = 0, len = ACBchatboxStackdata.length; i < len; i++) {
      if (i< ACTIVECHATBOX.chatboxStack.maxWindows) continue;
      ACBchatboxStackdata[0].dispose = true;
    }
  },

  //service
  gettouch: async function () {
    const touch = await gettouchMe();
    delete TOUCH.touchme;
    TOUCH.touchme = ((touch)?touch.touchme:false);//
    if(!TOUCH.touchme) {UPDATER.ISWAKEDUP = false;}
  },

  feedback: async function (chtSrvce) {
    if(!TOUCH.touchme||TOUCH.VOTEUPDATE.updaterTotalVote < 3) return;
    await settouchMe(/*false*/);
    console.log("feedback", UPDATER.ISWAKEDUP);
  },

  wakeup: function (chtSrvce) {
    if(!TOUCH.touchme||UPDATER.ISWAKEDUP) return;
    UPDATER.ISWAKEDUP = true;// no double start
    chtSrvce.wakeupService();
    chtSrvce.dpsleep.count = 0;
  },

  deepslp: function (chtSrvce) {
    if (TOUCH.touchme||serviceTool.serviceIsWakingup()||chtSrvce.dpsleep.count>UPDATER.dpslp+1) return;
    if (chtSrvce.dpsleep.count<UPDATER.dpslp) {chtSrvce.dpsleep.count++; return};
    chtSrvce.dpsleep.gotoDeepsleep();//deepsleep
    chtSrvce.dpsleep.count = 0;
    console.log("goingtoDeepsleep");
  },

  // online
  userstillonline: async function () {
    await istillonline();
  },

  updtchtbxlistactivestt: async function () {// update chat box list active
    const chatlist = [];
    const chatboxlist = APPDATA.chatboxlist;
    const chatboxactivestt = chattask.chatboxactivestt;
    for (var chatbox of chatboxlist) { chatlist.push(chatbox.chatboxid); }
    for (var chatbox of chatboxlist) {
      await sleep(accessdelay);
      chatboxactivestt(chatbox, chatlist);
    }
  },

  updtchtbxlistonlinestt: function () {// update chat box list online
    const chatboxlist = APPDATA.chatboxlist;
    const chatlistonlinestt = chattask.chatlistonlinestt;
    for (var chatbox of chatboxlist) {
      chatlistonlinestt(chatbox);
    }
  },

  updtrecentchtbxonlinestt: async function () {// update recent chat box list online
    const chatboxlist = APPDATA.chatboxlist;
    const recentonlinestt = chattask.recentonlinestt;
    const setuprecentchatboxOnline = recentchtbx => {
      for (var chatbox of chatboxlist) {
        if(recentchtbx.chatboxid==chatbox.chatboxid) {
          recentonlinestt(recentchtbx, chatbox);
          continue;
        }
      }
    }
    ACBrecentchatboxdata.some(setuprecentchatboxOnline);
  },

  updtchtbxmemberonlinestt: function () {// update recent chat box mem online
    const memberonlinestt = chattask.memberonlinestt;
    const setupchatboxMemberonline = async chtbxstkitem => {
      memberonlinestt(chtbxstkitem);
    }
    ACBchatboxStackdata.forEach(setupchatboxMemberonline);
  },

  // token
  tokenExtend: async function() {
    const expired = new Date() - new Date(TOKEN.UPDATEDAT);
    if(expired<3555555) return;
    await refreshtoken();
  },

  // chat
  refreshmsgreceivecache: function () {
    ACBchatboxStackdata.forEach(chtbxstkitem => {
      const receive_chatdata_cache = chtbxstkitem.receive_chatdata_cache;
      if (receive_chatdata_cache.length < chtbxstkitem.cachelen) return ;
      receive_chatdata_cache.forEach(item => {
        if (!item.success) return;
        receive_chatdata_cache.remove(item);
        for (const prop of item.getOwnPropertyNames(obj)) {
          delete obj[prop];
        }
      });
    });
  },

  refreshmmfreceivecache: function () {
    ACBchatboxStackdata.forEach(chtbxstkitem => {
      const receive_streamdata_cache = chtbxstkitem.receive_streamdata_cache;
      if (receive_streamdata_cache.length < chtbxstkitem.cachelen) return ;
      receive_streamdata_cache.forEach(item => {
        if (!item.success) return;
        receive_streamdata_cache.remove(item);
        for (const prop of item.getOwnPropertyNames(obj)) {
          delete obj[prop];
        }
      });
    });
  },

  refreshcbsendingcache: function () {
    ACBchatboxStackdata.forEach(chtbxstkitem => {
      const sending_chatdata_cache = chtbxstkitem.sending_chatdata_cache;
      if (sending_chatdata_cache.length < chtbxstkitem.cachelen) return ;
      sending_chatdata_cache.forEach(item => {
        if (!item.success||!item.updateinbrowser) return;
        sending_chatdata_cache.remove(item);
        for (const prop of item.getOwnPropertyNames(obj)) {
          delete obj[prop];
        }
      });
    });
  },

  setnewconversation: function () {
    ACBchatboxStackdata.forEach (async chtbxstkitem => {
      if(chtbxstkitem.conversation!=null) return; // wait to clear
      chtbxstkitem.sending_chatdata_cache.some(item => {
        if (item.sendingcount != 0) return;
        chtbxstkitem.MAKECONVERSATION = true;
        return true;
      });
    });
  },

  sendmessage: async function () {

    for (var chtbxstkitem of ACBchatboxStackdata) {
      if(chtbxstkitem.conversation==null) continue;
      const conversationid = chtbxstkitem.conversation.conversationid;
      const sending_chatdata_cache = chtbxstkitem.sending_chatdata_cache;
      for (var item of sending_chatdata_cache) {
        if(item.sendingcount>=1) continue;
        item.sendingcount += 1;
        await sleep(80);
        await sendMessagetochatbox(conversationid, item).
        then((rs)=>{
          if(rs&&rs.unhideUsermindid) {
            item.resID = rs.unhideUsermindid;
            item.success = true;
            item.sended = true;// set sended to borowser update
            return;
          }
          item.success = false;
          item.sended = true;// set sended to borowser update
        });
      }
    };
  },

  updatemessagesended: function () {
    const browser_updt_chbxmsgitem_sendedstt = chattask.browser_updt_chbxmsgitem_sendedstt;
    ACBchatboxStackdata.forEach (async chtbxstkitem => {
      if(chtbxstkitem.conversation==null) return;
      for (var item of chtbxstkitem.sending_chatdata_cache) {
        if(!item.sended||item.updateinbrowser) continue;
        browser_updt_chbxmsgitem_sendedstt(item);
      }
    });
  },

  setmessagereaded: function () {
    //set message is readed
    const newDate = getDateString(new Date ());
    const setcachedataisReaded = async (chtbxstkitem, item) => {
      if (!item.viewinbrowser||item.success||item.sended||item.datetimeread != null ||item.unhideuserid==USERDATA.ID) return;
      item.sendingcount += 1;
      await sleep(accessdelay);
      const rs = await setmessageReaded(item.unhideUsermindid, newDate);// set item.success = res;
      if(rs[0]>=1) {
        item.success = true;
        item.sended = true;
        return;
      }
      item.success = false;// set status readed fail or ignore
      item.sended = true;
    }
    ACBchatboxStackdata.forEach (chtbxstkitem => {
      chtbxstkitem.receive_chatdata_cache.forEach(setcachedataisReaded.bind(null, chtbxstkitem));
    });
  },

  setseenmessage: function () {
    const brownser_show_seenmessage = chattask.brownser_show_seenmessage;
    ACBchatboxStackdata.forEach (chtbxstkitem => {
      brownser_show_seenmessage(chtbxstkitem); //
    });
  },

  insert_msgitmrecei_tochbx: function () {
    const brownser_insert_msgitmrecei_tochbx = chattask.brownser_insert_msgitmrecei_tochbx;
    const setcachedataisReaded = (chtbxstkitem, item) => {
      if (item.sended||item.datetimeread != null ||item.unhideuserid==USERDATA.ID||item.viewinbrowser) return;
      brownser_insert_msgitmrecei_tochbx (chtbxstkitem, item); // show new message from cache
    }
    ACBchatboxStackdata.forEach (chtbxstkitem => {
      chtbxstkitem.receive_chatdata_cache.forEach(setcachedataisReaded.bind(null, chtbxstkitem));
    });
  },

  insert_mmfitmrecei_tochbx: function () {
    const brownser_insert_mmfitmrecei_tochbx = chattask.brownser_insert_mmfitmrecei_tochbx;
    const setcachedataisReaded = (chtbxstkitem, item) => {
      if (item.viewinbrowser) return;
      brownser_insert_mmfitmrecei_tochbx (chtbxstkitem, item/*multimedia file*/); // show new message from cache
    }
    ACBchatboxStackdata.forEach (chtbxstkitem => {
      chtbxstkitem.receive_streamdata_cache.forEach(setcachedataisReaded.bind(null, chtbxstkitem));
    });
  },

  resort_receimsgitem_chtbx: function () {
    const resort_msgitmrecei_inchbx = chattask.resort_msgitmrecei_inchbx;
    const resortchatboxmsg = async (chtbxstkitem, item) => {
      resort_msgitmrecei_inchbx(chtbxstkitem, item);
    }
    ACBchatboxStackdata.forEach (chtbxstkitem => {
      chtbxstkitem.receive_chatdata_cache.forEach(resortchatboxmsg.bind(null, chtbxstkitem));
    });
  },

  getchatdatafromserver: function () {
    const load_receivedchtbxmsg_tocache = chatsvctsktool.load_receivedchtbxmsg_tocache;
    ACBchatboxStackdata.forEach(item => {
      load_receivedchtbxmsg_tocache(item);
    });
  },

  getstreamdatafromserver: function () {
    const load_streamdata_tocache = chatsvctsktool.load_streamdata_tocache;
    ACBchatboxStackdata.forEach(item => {
      load_streamdata_tocache(item);
    });
  },

  updateconversation: function () {
    const makeNewConversation = chatsvctsktool.makeNewConversation;
    for (var chtbxstkitem of ACBchatboxStackdata) {
      if(!chtbxstkitem.MAKECONVERSATION || chtbxstkitem.conversation != null) continue;
      chtbxstkitem.MAKECONVERSATION = false;
      makeNewConversation(chtbxstkitem);
    };
  },

  clearConversation: function () {
    const clearOldConversation = chatsvctsktool.clearOldConversation;
    ACBchatboxStackdata.forEach(chtbxstkitem => {
      clearOldConversation(chtbxstkitem /*chatbox*/);
    });
  },

  // notice
  getmakerelateevent:async function() {
    const makerelateRequest = await getMakerelateNotify();
    if (!makerelateRequest) return;
    delete APPNOTICE.makerelateRequest;
    APPNOTICE.makerelateRequest = makerelateRequest;
  },

  getinvitechatboxevent:async function() {
    const invitechatboxNotify = await getInvitechatboxNotify();
    if (!invitechatboxNotify) return;
    delete APPNOTICE.invitechatboxNotify;
    APPNOTICE.invitechatboxNotify = invitechatboxNotify;
  },

  getchatnotievent:async function() {
    const chatNotify = await getchatNotify();
    if (!chatNotify) return;
    delete APPNOTICE.chatboxUnreadmessage;
    APPNOTICE.chatboxUnreadmessage = chatNotify;// save to query
  },

  setchatboxlistnotice: function() {
    if (!APPNOTICE.chatboxUnreadmessage) return;
    const noticesetup = (item_, item) => {
      if (item.chatboxid == item_.chatboxid) {item_.totalnoticecount = item.totalnoticecount; return true;}
    }
    const chatboxlist = APPDATA.chatboxlist;
    const chatboxUnreadmessage = APPNOTICE.chatboxUnreadmessage;
    chatboxlist.some (item_ => {
      item_.totalnoticecount = 0;
      chatboxUnreadmessage.some(noticesetup.bind(null, item_));
    });
  },

  setrecentnotic: function() {
    const noticesetup = (item_, item) => {
      if (item.chatboxid == item_.chatboxid) {item_.totalnoticecount = item.totalnoticecount; return true;}
    }
    const chatboxUnreadmessage = APPNOTICE.chatboxUnreadmessage;
    ACBrecentchatboxdata.some(item_ => {
      item_.totalnoticecount = 0;
      chatboxUnreadmessage.some(noticesetup.bind(null, item_));
    });
  },

  showchatlistnotify: function () {
    const chatboxlist = APPDATA.chatboxlist;
    const brownser_update_chatlistnotice = chattask.brownser_update_chatlistnotice;
    chatboxlist.forEach(item => {
      brownser_update_chatlistnotice (item.chatboxid, item.totalnoticecount);
    });
  },

  showrecentnotify: function () {
    const chatboxlist = APPDATA.chatboxlist;
    const browser_update_recentnotice = chattask.browser_update_recentnotice;
    chatboxlist.forEach(item => {
      browser_update_recentnotice(item.chatboxid, item.totalnoticecount);
    });
  },

  showappnotify: function () {
    chattask.browser_update_appNotify(chatsvctsktool.gettotalNoticecount());
  },

  // refresh page
  chatlistrefresh: function() {
    const chatboxlist = APPDATA.chatboxlist;
    const refreshchatlistitem = chattask.refreshchatlistitem;
    chatboxlist.forEach(chatbox =>{
      refreshchatlistitem(chatbox);
    });
  },

  clearchatlistitem: function () {
    chattask.clearchatlistitem();
  },

  newchatlistitem:function () {
    const chatboxlist = APPDATA.chatboxlist;
    const len = chatboxlist.length;
    const appendnewchatlistitem = chattask.appendnewchatlistitem;
    chatboxlist.forEach((chatbox, i) => {
      appendnewchatlistitem(chatbox, i, chatboxlist.length);
    });
  },

  chatboxrefresh: function() {
    const refreshchatboxdata = chtbxstkitem => {
      switch (true) {
        case (!chtbxstkitem.initcomplete): return;
        default:
        chattask.refreshchatboxinfo(chtbxstkitem);
        chattask.refreshcbxprivilege(chtbxstkitem);
        chattask.newcbxmemberjoin(chtbxstkitem);
        chattask.updatecbxmemberinfo(chtbxstkitem);
      }
    }
    ACBchatboxStackdata.some(refreshchatboxdata);
  },

  chatboxclean: function() {
    const refreshchatboxdata = chtbxstkitem => {
      switch (true) {
        case (!chtbxstkitem.initcomplete): return;
        default:
        const findchatbox = chatbox => {if (chtbxstkitem.chatboxid == chatbox.chatboxid) return true;}
        if(!APPDATA.chatboxlist.some(findchatbox)) {chattask.cleanchatboxstck(chtbxstkitem)};
        chattask.cleancbxmemberlist(chtbxstkitem);
      }
    }
    ACBchatboxStackdata.some(refreshchatboxdata);
  },

  getloadmoremessage: function () {
    ACBchatboxStackdata.forEach(item => {
      chattask.getloadmoremsg(item);
    });
  },

  loadmoremessage: function () {
    const setloadmore = item => {
      if(item.NOMORE||!item.LOADMOREMESSAGE) return;;
      item.LOADMOREMESSAGE = false;
      chattask.loadmoremsg(item);
    };
    ACBchatboxStackdata.forEach(setloadmore);
  }
}

const chatsvctsktool = {

  gettotalNoticecount: function () {
    let count = APPNOTICE.makerelateRequest.length + APPNOTICE.invitechatboxNotify.length;
    for (const item of APPNOTICE.chatboxUnreadmessage) {
      count += item.totalnoticecount;
    }
    return count;
  },

  makeNewConversation: async function (chtbxstkitem) {
    chattask.makenewConversation(chtbxstkitem);
  },

  clearOldConversation:async function (chtbxstkitem) {
    chattask.clearOldConversation(chtbxstkitem);
  },

  load_receivedchtbxmsg_tocache:async function (chtbxstkitem) {
    if(!chtbxstkitem.conversation) return;
    if(!chtbxstkitem.initcomplete) return;

    const chatboxUnreadmessage = await getChatboxUnreadmessage(chtbxstkitem.conversation.conversationid);// check match id and load
    if (!chatboxUnreadmessage) return;
    const receive_chatdata_cache = chtbxstkitem.receive_chatdata_cache;
    const setupReceiveChatdataCache = (convMessageitem, i) => {
      //dont add double:
      const getisdoubleitem = item => { if(item.unhideUsermindid==convMessageitem.unhideUsermindid) return true; }
      const dontadddouble = receive_chatdata_cache.some(getisdoubleitem);
      if (dontadddouble) return;
      const receivchat_data = {
        unhideUsermindid: convMessageitem.unhideUsermindid,
        unhideuserid: convMessageitem.unhideuserid,
        datetimeUnhide: convMessageitem.datetimeUnhide,
        messageData: convMessageitem.messageData,
        datetimetell: convMessageitem.datetimetell,
        readerid: convMessageitem.readerid,
        datetimeread: convMessageitem.datetimeread,
        sended: false,
        success: false,
        sendingcount: 0,
        viewinbrowser: false,// wait for load to chatbox
      };
      setTimeout(function() {
        receive_chatdata_cache.push(receivchat_data);
      }, 25);
      if(i>50) return true;// for 50 per load
    }
    chatboxUnreadmessage.some(setupReceiveChatdataCache);
  },

  load_streamdata_tocache:async function (chtbxstkitem) {
    if(!chtbxstkitem.conversation) return;
    if(!chtbxstkitem.initcomplete) return;
    const chatboxStreamdatareceiv = await sgetChatboxUnreadmessage(chtbxstkitem.conversation.conversationid);
    const receive_streamdata_cache = chtbxstkitem.receive_streamdata_cache;

    const setupReceiveMultimediafile = (convMmediafileitem, i) => {
      //dont add double:
      const getisdoubleitem = item => { if(item.unhideUsermindid==convMmediafileitem.unhideUsermindid) return true; }
      const dontadddouble = receive_streamdata_cache.some(getisdoubleitem);
      if (dontadddouble) return;
      const receivchat_data = {
        unhideUsermindid: convMmediafileitem.unhideUsermindid,
        unhideuserid: convMmediafileitem.unhideuserid,
        datetimeUnhide: convMmediafileitem.datetimetell,
        messageData: convMmediafileitem.messageData,
        datetimetell: convMmediafileitem.datetimetell,
        conversationid: convMmediafileitem.conversationid,
        sended: false,
        success: false,
        sendingcount: 0,
        viewinbrowser: false,// wait for load to chatbox
      };
      receive_streamdata_cache.push(receivchat_data);
      if(i>50) return true;// for 50 per load
    }
    if(chatboxStreamdatareceiv)
    chatboxStreamdatareceiv.some(setupReceiveMultimediafile);
  },
}

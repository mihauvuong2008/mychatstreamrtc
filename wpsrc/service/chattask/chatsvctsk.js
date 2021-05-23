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
let serverchatcmnc;
let serverstreamcmnc;

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
  serverchatcmnc = svrCom.serverchatcmnc;
  serverstreamcmnc = svrCom.serverstreamcmnc;
}

export const chatsvctsk = {
  
  userstilllivestream: function () {
    ACBchatboxStackdata.forEach(chtbxstkitem => {
      serverstreamcmnc.userstilllivestream(chtbxstkitem.chatboxid);
    });
  },

  // chat list
  updatechatboxlistdata: async function() {
    const chatboxlist = await(serverchatcmnc.getChatboxlist());
    if (!chatboxlist) return;
    APPDATA.chatboxlist = chatboxlist
    APPDATA.chatboxlist.forEach (async item => {
      item.members = await(serverchatcmnc.getchatboxMember(item.chatboxid));
    });
  },

  // chat box
  updatechatboxstack: function() {
    const chatboxlist = APPDATA.chatboxlist;
    ACBchatboxStackdata.forEach(chtbxstkitem => {
      chatboxlist.forEach(chatboxlistitem => {
        if(chtbxstkitem.chatboxid!=chatboxlistitem.chatboxid) return;
        if (!chatboxlistitem.members) return;
        chtbxstkitem.members = chatboxlistitem.members;
      });
    });
  },

  showchatbox: function() {
    if(!ACTIVECHATBOX.selector.isreadytoshow())return ;
    const openlist = ACTIVECHATBOX.selector.openlist;
    openlist.forEach(item => {
      if (ACBchatboxStackdata.some(chtbxstkitem => { if(chtbxstkitem.chatboxid == item)return true;})) {// is opened
        ACTIVECHATBOX.selector.openlist.remove(item);
        return;
      }
      chbxcontrol.showChatbox(item);
      ACTIVECHATBOX.selector.openlist.remove(item);
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
    const touch = await serverchatcmnc.gettouchMe();
    TOUCH.touchme = ((touch)?touch.touchme:false);//
    if(!TOUCH.touchme) {UPDATER.ISWAKEDUP = false;}
  },

  feedback: async function (chtSrvce) {
    if(!TOUCH.touchme||TOUCH.VOTEUPDATE.updaterTotalVote < 3) return;
    await serverchatcmnc.settouchMe(/*false*/);
    console.log("feedback", UPDATER.ISWAKEDUP);
  },

  wakeup: function (chtSrvce) {
    if(!TOUCH.touchme||UPDATER.ISWAKEDUP) return;
    UPDATER.ISWAKEDUP = true;// no double start
    chtSrvce.wakeupService();
    chtSrvce.dpsleep.count = 0;
  },

  deepslp: function (chtSrvce) {
    if(TOUCH.touchme||serviceTool.serviceIsWakingup()||chtSrvce.dpsleep.count>UPDATER.dpslp+1) return ;
    if (chtSrvce.dpsleep.count<UPDATER.dpslp) {chtSrvce.dpsleep.count++; return} ;
    chtSrvce.dpsleep.gotoDeepsleep();//deepsleep
    chtSrvce.dpsleep.count = 0;
    console.log("goingtoDeepsleep");
  },

  // online
  userstillonline: async function () {
    await serverchatcmnc.istillonline();
  },

  updtchtbxlistactivestt: function () {// update chat box list active
    const chatlist = [];
    const chatboxlist = APPDATA.chatboxlist;
    for (var chatbox of chatboxlist) { chatlist.push(chatbox.chatboxid); }
    chatboxlist.forEach(chatbox => {
      chattask.chatboxactivestt(chatbox, chatlist);
    });
  },

  updtchtbxlistonlinestt: function () {// update chat box list online
    const chatboxlist = APPDATA.chatboxlist;
    chatboxlist.forEach(chatbox => {
      chattask.chatlistonlinestt(chatbox);
    });
  },

  updtrecentchtbxonlinestt: async function () {// update recent chat box list online
    const chatboxlist = APPDATA.chatboxlist;
    const setuprecentchatboxOnline = recentchtbx => {
      chatboxlist.forEach(chatboxlistitem => {
        if(recentchtbx.chatboxid==chatboxlistitem.chatboxid) {
          chattask.recentonlinestt(recentchtbx, chatboxlistitem);
          return true;
        }
      });
    }
    ACBrecentchatboxdata.some(setuprecentchatboxOnline);
  },

  updtchtbxmemberonlinestt: function () {// update recent chat box mem online
    const setupchatboxMemberonline = async chtbxstkitem => {
      await chattask.memberonlinestt(chtbxstkitem);
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
      if (chtbxstkitem.receive_chatdata_cache.length < chtbxstkitem.cachelen) return ;
      chtbxstkitem.receive_chatdata_cache.forEach(item => {
        if (!item.success) return;
        chtbxstkitem.receive_chatdata_cache.remove(item);
      });
    });
  },

  refreshmmfreceivecache: function () {
    ACBchatboxStackdata.forEach(chtbxstkitem => {
      if (chtbxstkitem.receive_streamdata_cache.length < chtbxstkitem.cachelen) return ;
      chtbxstkitem.receive_streamdata_cache.forEach(item => {
        if (!item.success) return;
        chtbxstkitem.receive_streamdata_cache.remove(item);
      });
    });
  },

  refreshcbsendingcache: function () {
    ACBchatboxStackdata.forEach(chtbxstkitem => {
      if (chtbxstkitem.sending_chatdata_cache.length < chtbxstkitem.cachelen) return ;
      chtbxstkitem.sending_chatdata_cache.forEach(item => {
        if (!item.success||!item.updateinbrowser) return;
        chtbxstkitem.sending_chatdata_cache.remove(item);
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
    const sender = serverchatcmnc.sendMessagetochatbox;

    for (var chtbxstkitem of ACBchatboxStackdata) {
      if(chtbxstkitem.conversation==null) continue;
      const conversationid = chtbxstkitem.conversation.conversationid;
      const sending_chatdata_cache = chtbxstkitem.sending_chatdata_cache;
      for (var item of sending_chatdata_cache) {
        if(item.sendingcount>=1) continue;
        item.sendingcount += 1;
        await sleep(50);
        const rs = await sender(conversationid, item);
        if(rs.unhideUsermindid) {
          item.resID = rs.unhideUsermindid;
          item.success = true;
          item.sended = true;// set sended to borowser update
          continue;
        }
        item.success = false;
        item.sended = true;// set sended to borowser update
      }
    };
  },

  updatemessagesended: function () {
    ACBchatboxStackdata.forEach (async chtbxstkitem => {
      if(chtbxstkitem.conversation==null) return;
      for (var item of chtbxstkitem.sending_chatdata_cache) {
        if(!item.sended||item.updateinbrowser) continue;
        chattask.browser_updt_chbxmsgitem_sendedstt(item);
      }
    });
  },

  setmessagereaded: function () {
    //set message is readed
    const setcachedataisReaded = async (chtbxstkitem, item) => {
      if (!item.viewinbrowser||item.success||item.sended||item.datetimeread != null ||item.unhideuserid==USERDATA.ID) return;
      item.sendingcount += 1;
      const rs = (await serverchatcmnc.setmessageReaded(item.unhideUsermindid, getDateString(new Date ())));// set item.success = res;
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
    ACBchatboxStackdata.forEach (chtbxstkitem => {
      chattask.brownser_show_seenmessage (chtbxstkitem); //
    });
  },

  insert_msgitmrecei_tochbx: function () {
    const setcachedataisReaded = (chtbxstkitem, item) => {
      if (item.sended||item.datetimeread != null ||item.unhideuserid==USERDATA.ID||item.viewinbrowser) return;
      chattask.brownser_insert_msgitmrecei_tochbx (chtbxstkitem, item); // show new message from cache
    }

    ACBchatboxStackdata.forEach (chtbxstkitem => {
      chtbxstkitem.receive_chatdata_cache.forEach(setcachedataisReaded.bind(null, chtbxstkitem));
    });
  },

  insert_mmfitmrecei_tochbx: function () {
    const setcachedataisReaded = (chtbxstkitem, item) => {
      if (item.viewinbrowser) return;
      chattask.brownser_insert_mmfitmrecei_tochbx (chtbxstkitem, item/*multimedia file*/); // show new message from cache
    }
    ACBchatboxStackdata.forEach (chtbxstkitem => {
      chtbxstkitem.receive_streamdata_cache.forEach(setcachedataisReaded.bind(null, chtbxstkitem));
    });
  },

  resort_receimsgitem_chtbx: function () {
    const resortchatboxmsg = async (chtbxstkitem, item) => {
      chattask.resort_msgitmrecei_inchbx(chtbxstkitem, item);
    }
    ACBchatboxStackdata.forEach (chtbxstkitem => {
      chtbxstkitem.receive_chatdata_cache.forEach(resortchatboxmsg.bind(null, chtbxstkitem));
    });
  },

  getchatdatafromserver: function () {
    ACBchatboxStackdata.forEach(item => {
      chatsvctsktool.load_receivedchtbxmsg_tocache (item);
    });
  },

  getstreamdatafromserver: function () {
    ACBchatboxStackdata.forEach(item => {
      chatsvctsktool.load_streamdata_tocache (item);
    });
  },

  updateconversation: function () {
    for (var chtbxstkitem of ACBchatboxStackdata) {
      if(!chtbxstkitem.MAKECONVERSATION || chtbxstkitem.conversation != null) continue;
      chtbxstkitem.MAKECONVERSATION = false;
      chatsvctsktool.makeNewConversation(chtbxstkitem);
    };
  },

  clearConversation: function () {
    ACBchatboxStackdata.forEach(chtbxstkitem => {
      chatsvctsktool.clearOldConversation(chtbxstkitem /*chatbox*/);
    });
  },

  // notice
  getmakerelateevent:async function() {
    APPNOTICE.makerelateRequest = (await serverchatcmnc.getMakerelateNotify());
  },

  getinvitechatboxevent:async function() {
    APPNOTICE.invitechatboxNotify = (await serverchatcmnc.getInvitechatboxNotify());
  },

  getchatnotievent:async function() {
    APPNOTICE.chatboxUnreadmessage = (await serverchatcmnc.getchatNotify());// save to query
  },

  setchatboxlistnotice: function() {
    if (!APPNOTICE.chatboxUnreadmessage) return;
    const noticesetup = (item_, item) => {
      if (item.chatboxid == item_.chatboxid) {item_.totalnoticecount = item.totalnoticecount; return true;}
    }
    const chatboxlist = APPDATA.chatboxlist;
    chatboxlist.some (item_ => {
      item_.totalnoticecount = 0;
      APPNOTICE.chatboxUnreadmessage.some(noticesetup.bind(null, item_));
    });
  },

  setrecentnotic: function() {
    const noticesetup = (item_, item) => {
      if (item.chatboxid == item_.chatboxid) {item_.totalnoticecount = item.totalnoticecount; return true;}
    }
    ACBrecentchatboxdata.some(item_ => {
      item_.totalnoticecount = 0;
      APPNOTICE.chatboxUnreadmessage.some(noticesetup.bind(null, item_));
    });
  },

  showchatlistnotify: function () {
    const chatboxlist = APPDATA.chatboxlist;
    chatboxlist.forEach(item => {
      chattask.brownser_update_chatlistnotice (item.chatboxid, item.totalnoticecount);
    });
  },

  showrecentnotify: function () {
    const chatboxlist = APPDATA.chatboxlist;
    chatboxlist.forEach(item => {
      chattask.browser_update_recentnotice (item.chatboxid, item.totalnoticecount);
    });
  },

  showappnotify: function () {
    chattask.browser_update_appNotify(chatsvctsktool.gettotalNoticecount());
  },

  // refresh page
  chatlistrefresh: function() {
    const chatboxlist = APPDATA.chatboxlist;
    chatboxlist.forEach(chatbox =>{
      chattask.refreshchatlistitem(chatbox);
    });
  },

  clearchatlistitem: function () {
    chattask.clearchatlistitem();
  },

  newchatlistitem:function () {
    const chatboxlist = APPDATA.chatboxlist;
    const len = chatboxlist.length;
    chatboxlist.forEach((chatbox, i) => {
      chattask.appendnewchatlistitem(chatbox, i, chatboxlist.length);
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

    const chatboxUnreadmessage = await(serverchatcmnc.getChatboxUnreadmessage (chtbxstkitem.conversation.conversationid));// check match id and load
    if (!chatboxUnreadmessage) return;
    const setupReceiveChatdataCache = (convMessageitem, i) => {
      //dont add double:
      const getisdoubleitem = item => { if(item.unhideUsermindid==convMessageitem.unhideUsermindid) return true; }
      const dontadddouble = chtbxstkitem.receive_chatdata_cache.some(getisdoubleitem);
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
        chtbxstkitem.receive_chatdata_cache.push(receivchat_data);
      }, 25);
      if(i>50) return true;// for 50 per load
    }
    chatboxUnreadmessage.some(setupReceiveChatdataCache);
  },

  load_streamdata_tocache:async function (chtbxstkitem) {
    if(!chtbxstkitem.conversation) return;
    if(!chtbxstkitem.initcomplete) return;
    const chatboxStreamdatareceiv = await serverstreamcmnc.getChatboxUnreadmessage(chtbxstkitem.conversation.conversationid);

    const setupReceiveMultimediafile = (convMmediafileitem, i) => {
      //dont add double:
      const getisdoubleitem = item => { if(item.unhideUsermindid==convMmediafileitem.unhideUsermindid) return true; }
      const dontadddouble = chtbxstkitem.receive_streamdata_cache.some(getisdoubleitem);
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
      chtbxstkitem.receive_streamdata_cache.push(receivchat_data);
      if(i>50) return true;// for 50 per load
    }
    if(chatboxStreamdatareceiv)
    chatboxStreamdatareceiv.some(setupReceiveMultimediafile);
  },
}

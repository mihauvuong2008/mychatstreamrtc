const dmt = require('../../app/domtl');
const rcntContact = require('../recentContact');
const filetransfer = require('../../filetransfer/filetransfer');

let chtbx;
let contact;
let _chtSrvc;
let serverstreamcmnc;
let serverchatcmnc;
let TOKEN;
let serviceTool;
let chbxcontrol;
let ACBchatboxStack;
let ACBrecentchatbox;
let ACBchatboxStackdata;
let ACBrecentchatboxdata;
let CHATBOXSTATE;
let APPDATA;
let USERDATA;
let CONTACTMODE;
let sleep;
let getDateString;

export const init = function (myapp, _chtbx, cbcntrl, _contact, srvcetool, service, token, svrCom) {

  chtbx = _chtbx;
  contact = _contact;
  _chtSrvc = service._chatService;
  serverstreamcmnc = svrCom.serverstreamcmnc;
  serverchatcmnc = svrCom.serverchatcmnc;
  TOKEN = token.TOKEN;
  serviceTool = srvcetool.serviceTool;
  chbxcontrol = cbcntrl.chbxcontrol;
  ACBchatboxStack = myapp.ACTIVECHATBOX.chatboxStack;
  ACBrecentchatbox = myapp.ACTIVECHATBOX.recentchatbox;
  ACBchatboxStackdata = myapp.ACTIVECHATBOX.chatboxStack.data;
  ACBrecentchatboxdata = myapp.ACTIVECHATBOX.recentchatbox.data;
  CHATBOXSTATE = myapp.CHATBOXSTATE;
  APPDATA = myapp.APP.DATA;
  USERDATA = myapp.USERDATA;
  CONTACTMODE = myapp.CONTACTMODE;
  sleep = myapp.sleep;
  getDateString = myapp.getDateString;
}

export const chtbxtool = {
  // register chatbox;
  // add stack chat chatbox
  // add recent chatbox
  // remove old chat box
  // style animation add
  chatboxregister: async function (chatbox, messagebox, chatboxid, type) {//add chatbox, save chatbox info here:
    if(ACBchatboxStackdata.some(item => {if(chatboxid == item.chatboxid) return true; })) return;// no double
    const lastconversation = await(serverchatcmnc.getLastConversation(chatboxid, "undefined"));
    const conversation = (lastconversation&&serviceTool.is_liveconversation(lastconversation))?lastconversation:null;

    //create chtbxstkdata item
    const chtbxstkdata = {
      initcomplete: false,
      dispose: false,
      chatboxid: chatboxid,
      members: [],
      type: type,
      user_isscrollchatbox: false,
      lastCountConversation: 0,
      CHATBOXSTATE: CHATBOXSTATE.NORMAL,
      sending_chatdata_cache: [],
      receive_chatdata_cache: [],
      receive_streamdata_cache:[],
      cachelen: 10,
      chatbox: chatbox,//dom
      messagebox: messagebox,//dom
      conversation: conversation,
      MAKECONVERSATION: false,
      NOMORE: false,
      ADDFIRSTDONE: 0,
      LOADMOREMESSAGE: false,
      LOADMOREMESSAGEID: 0,
      LOADMOREMESSAGEDONEID: 0,
    };

    ACBchatboxStackdata.push(chtbxstkdata);

    let anim = "expandwh 0.5s ease both";
    if (ACBchatboxStackdata.length> ACBchatboxStack.maxWindows) {
      anim = "expandwh 1.0s ease 0.5s both";// wait for last chatbox close
    }

    // add chat box to brownser
    new Promise(function(resolve, reject) {
      chatbox.style.animation = anim;
      document.getElementById("chatboxbeanID").append(chatbox);
      setTimeout(()=>{
        chatbox.style.animation = "";
        resolve();
      }, 1500);
    });

    // remove old recent chatbox
    if(ACBrecentchatboxdata.some(item => { if (chatboxid == item.chatboxid) return true; }))return;/*no double*/
    const rctcbx_dtlen = ACBrecentchatboxdata.length;
    if ( rctcbx_dtlen >= ACBrecentchatbox.maxRecent) {
      const idx = ACBrecentchatboxdata.length - ACBrecentchatbox.maxRecent;
      for (var i = 0; i < idx; i++) {
        const recentitem = document.getElementById("recentchatboxID" + ACBrecentchatboxdata[i].chatboxid);// remove now, you will lost it
        if (recentitem) recentitem.remove();
        ACBrecentchatboxdata.remove(ACBrecentchatboxdata[i]);
      }
    }

    ACBrecentchatboxdata.push({chatboxid: chatboxid, totalnoticecount: 0});
    // save cookie and show recent icon
    rcntContact.saverecentcontacttocookie(ACBrecentchatbox);
    rcntContact.drawrecentchatbox(ACBrecentchatbox);
  },

  fillconversation: async function (chtbxstkitem, converstationinfo, conversationData, messagebox){
    // fill conversation data
    //(when init (chatapp.js), when scroll top (servicetaskbrowser.js))

    // check type of message
    for (var item of conversationData) {
      switch (item.type) {
        case "mmf":
        var messageitem = this.createmultimediafileitem(item, chtbxstkitem.chatboxid, false);
        messagebox.insertBefore(messageitem, converstationinfo.nextSibling, false);
        break;
        case "msg": //(mmf)
        var messageitem = this.createmessageitem(item, chtbxstkitem.chatboxid, false);
        messagebox.insertBefore(messageitem, converstationinfo.nextSibling);
        break;
      }

      // limit message count by view
      if (chtbxstkitem.ADDFIRSTDONE> (window.innerHeight/40 /*single line height*/)){await sleep(200);}
      chtbxstkitem.ADDFIRSTDONE += 1;
      if (item.unhideuserid == USERDATA.ID) continue;

      // load old data from server to cache
      const receivchat_data = {
        unhideUsermindid: item.unhideUsermindid,
        unhideuserid: item.unhideuserid,
        datetimeUnhide: item.datetimeUnhide,
        messageData: item.messageData,
        datetimetell: item.datetimetell,
        readerid: item.readerid,
        datetimeread: item.datetimeread,
        sended: false,
        success: false,
        sendingcount: 0,
        viewinbrowser: true, // loaded to chatbox
      };
      chtbxstkitem.receive_chatdata_cache.push(receivchat_data);
    };

    // set chatbox inited
    chtbxstkitem.initcomplete = true;
    if (conversationData[0])
    return conversationData[0].unhideUsermindid;
  },


  createmessageitem: function (item, chatboxid, iscurrconversatt) {
    const messageitem = dmt.domtool.creatediv("messageitem", "messageitemID" + item.unhideUsermindid);
    messageitem.setAttribute("unhideUsermindid", item.unhideUsermindid);
    messageitem.setAttribute("chatboxid", chatboxid);
    messageitem.setAttribute("iscurrconversatt", iscurrconversatt);// for sort
    const messageitem_icon = dmt.domtool.creatediv("messageitem_icon");
    const _chatboxmessagae = dmt.domtool.creatediv(USERDATA.ID == item.unhideuserid?"userchatboxmessagae":"guestchatboxmessagae");
    const hidemessageinfo = dmt.domtool.creatediv("hidemessageinfo", "messageinfoID" + item.unhideUsermindid);
    hidemessageinfo.innerHTML = getDateString (new Date (item.datetimeUnhide));
    const messgetextbean = dmt.domtool.creatediv("messgetextbean");
    const messgetext = dmt.domtool.creatediv("messgetext", "message_dataID" + item.unhideUsermindid);
    // switch type of message
    switch (USERDATA.ID) {
      case item.unhideuserid: messgetext.classList.add("msguser"); break;
      default: messgetext.classList.add("msgguest");
    }
    messgetext.setAttribute("unhideUsermindid", item.unhideUsermindid);
    messgetext.addEventListener("click", chbxcontrol.showinfomessage);
    messgetext.innerHTML = item.messageData + "-" + item.unhideUsermindid;

    messgetextbean.appendChild (messgetext);
    _chatboxmessagae.appendChild (hidemessageinfo);
    _chatboxmessagae.appendChild (messgetextbean);
    switch (USERDATA.ID) {
      case item.unhideuserid:
      const seenlistitem = chtbxtool.createseenlist(item.unhideUsermindid);
      messgetextbean.appendChild(seenlistitem);
      /** */ break; // hide user icon
      default: messageitem.appendChild(messageitem_icon);
    }
    messageitem.appendChild (_chatboxmessagae);
    messageitem.style.animation = "opac 0.2s ease-in-out";
    return messageitem;
  },

  createmultimediafileitem: function (item /*multimedia file*/, chatboxid, iscurrconversatt) {
    // create multimedia messageitem to fillconversation
    //DECLARE variable
    const unhideUsermindid = item.unhideUsermindid;
    const unhideuserid = item.unhideuserid;
    const datetimeUnhide = item.datetimeUnhide;
    const name = item.messageData.split(";")[0];
    const path = item.messageData.split(";")[1];
    const datetimetell = item.datetimetell;
    const readerid = item.readerid;
    const datetimeread = item.datetimeread;

    const messageitem = dmt.domtool.creatediv("messageitem", "messageitemID" + unhideUsermindid);
    messageitem.setAttribute("unhideUsermindid", unhideUsermindid);
    messageitem.setAttribute("chatboxid", chatboxid);
    messageitem.setAttribute("iscurrconversatt", iscurrconversatt);// for sort
    const messageitem_icon = dmt.domtool.creatediv("messageitem_icon");
    const mmfitembean = dmt.domtool.creatediv("mmfitembean");
    const mmfbean = dmt.domtool.creatediv("mmfbean");
    const mmfitem = dmt.domtool.creatediv("mmfitem");
    const mmfitemicon = dmt.domtool.creatediv("mmfitemicon");
    const mmfiteminfo = dmt.domtool.creatediv("mmfiteminfo");
    const mmfitemname = dmt.domtool.creatediv("mmfitemname");
    mmfitemname.classList.add("mmfinfo");
    mmfitemname.innerHTML = name;
    const mmfitemsendeddate = dmt.domtool.creatediv("mmfitemsendeddate");
    mmfitemsendeddate.classList.add("mmfinfo");
    mmfitemsendeddate.innerHTML = "sended time: " + datetimeUnhide;
    const download = dmt.domtool.creatediv("download");
    download.classList.add("mmfinfo");
    download.setAttribute("path", path);
    download.setAttribute("name", name);
    download.innerHTML = "download";
    download.addEventListener("click",chbxcontrol.downloadmmf);
    mmfiteminfo.appendChild(mmfitemname);
    mmfiteminfo.appendChild(mmfitemsendeddate);
    mmfiteminfo.appendChild(download);
    mmfitem.appendChild(mmfitemicon);
    mmfitem.appendChild(mmfiteminfo);
    mmfbean.appendChild(mmfitem);
    mmfitembean.appendChild(mmfbean);
    switch (USERDATA.ID) {
      case unhideuserid: mmfitembean.classList.add("mmfitembeanuser"); break;
      default: messageitem.appendChild (messageitem_icon);
    }
    messageitem.appendChild (mmfitembean);
    messageitem.style.animation = "opac 0.2s ease-in-out";
    return messageitem;
  },

  creatermvmembutton: function (chatboxid, memberid) {
    const removemember = dmt.domtool.creatediv("removemember", "removememberitemID"+chatboxid+"-"+memberid);
    removemember.addEventListener('click', async function() {
      const _chatboxid = this.parentNode.getAttribute("chatboxid");
      const _memberid = parseInt(this.parentNode.getAttribute("userid"));
      if(memberid==USERDATA.ID) return;
      const rs = await serverchatcmnc.removechatboxMember(_chatboxid, _memberid);
      _chtSrvc.userhaveaAction(true);
      if(rs<0) return;
    });
    removemember.innerHTML = "&times;";
    return removemember;
  },

  createmberinvteitem: function (chatboxid) {
    const memberitem = dmt.domtool.creatediv("memberitem");
    memberitem.setAttribute("chatboxid", chatboxid);
    const memberinvite = dmt.domtool.creatediv("memberinvite", "memberinviteID" + chatboxid);
    memberinvite.innerHTML = "invite friend";
    memberinvite.addEventListener('click', function () {
      const chatboxid = parseInt(this.parentNode.getAttribute("chatboxid"));
      // callback init contact to get list contact checked
      contact.initContact(CONTACTMODE.CHECKER, listFriend => { //callback
        APPDATA.chatboxlist.some( item => {
          if(item.chatboxid!=chatboxid) return ;
          listFriend.forEach(async userid => {
            const getmember = mem =>{ if(mem.userid==userid)return true; }
            const ismem = (item.members||[]).some(getmember);
            if(!ismem) {await serverchatcmnc.sendgroupRequest(chatboxid, userid); console.log(userid);}
          });
          return true;
        });
      });
      _chtSrvc.userhaveaAction(true);
    });
    memberitem.appendChild(memberinvite);
    return memberitem;
  },

  createdissolutionitem: function (chatboxid) {
    const memberitem = dmt.domtool.creatediv("memberitem");
    memberitem.setAttribute("chatboxid", chatboxid);
    const dissolution = dmt.domtool.creatediv("dissolution", "dissolutionID" + chatboxid);
    dissolution.innerHTML = "dissolution";
    dissolution.addEventListener('click', async function () {
      const chatboxid = this.parentNode.getAttribute("chatboxid");
      chbxcontrol.closechatbox(chatboxid);
      await serverchatcmnc.dissolateGroup(chatboxid);
      _chtSrvc.userhaveaAction(true);
    });
    memberitem.appendChild(dissolution);
    return memberitem;
  },

  createleaveitem: function (chatboxid) {
    const leaveitem = dmt.domtool.creatediv("memberitem");
    leaveitem.setAttribute("chatboxid", chatboxid);
    const leave = dmt.domtool.creatediv("leave", "leaveID" + chatboxid);
    leave.innerHTML = "leave";
    leave.addEventListener('click', async function () {
      const chatboxid = this.parentNode.getAttribute("chatboxid");
      chbxcontrol.disposechatbox(chatboxid);
      await serverchatcmnc.leaveChatbox(chatboxid);
      _chtSrvc.userhaveaAction(true);
    });
    leaveitem.appendChild(leave);
    return leaveitem;
  },

  createlivestreamitem: function (chatboxid) {
      const livestreamitem = dmt.domtool.creatediv("memberitem");
      livestreamitem.setAttribute("chatboxid", chatboxid);
      const livestream = dmt.domtool.creatediv("livestream", "livestreamID" + chatboxid);
      livestream.innerHTML = "livestream";
      livestream.setAttribute("chatboxid", chatboxid);
      livestream.addEventListener('click', chbxcontrol.teamviewshare);
      livestreamitem.appendChild(livestream);
      return livestreamitem;
    },

  creatememberitem: function (chatboxid, userid, username, lasttimelogin) {
    const memberitem = dmt.domtool.creatediv("memberitem", "memberitemID" +chatboxid+"-"+ userid);
    memberitem.setAttribute("chatboxid", chatboxid);
    memberitem.setAttribute("userid", userid);
    const onlinestatus = dmt.domtool.creatediv("onlinestatus", "chatboxUseronlinestatusID"+ chatboxid+"-"+ userid);
    onlinestatus.style.backgroundColor = (serviceTool.is_Stillonline(lasttimelogin)?"#06FF0B":"#cc0000");
    const icon = dmt.domtool.creatediv("icon");
    const memberusername = dmt.domtool.creatediv("memberusername", "memberusernameID" + chatboxid +"-"+ userid);
    memberusername.innerHTML = username;
    memberusername.addEventListener('click', chbxcontrol.showinfochbxmember);
    const memberteamviewbean = dmt.domtool.creatediv("memberteamviewbean");
    const memberteamview = dmt.domtool.creatediv("memberteamview", "memberteamviewID" + chatboxid +"-"+ userid);
    memberteamview.setAttribute("chatboxid",chatboxid);
    memberteamview.setAttribute("userid", userid);
    memberteamview.addEventListener('click', chbxcontrol.teamviewreceive);
    memberteamview.classList.add("hidememberteamview");
    memberteamviewbean.appendChild(memberteamview);
    memberitem.appendChild(onlinestatus);
    memberitem.appendChild(icon);
    memberitem.appendChild(memberusername);
    switch (userid) {
      case (USERDATA.ID):
      break;
      default:
      memberitem.appendChild(memberteamviewbean);
    }
    return memberitem;
  },


  createfiletransfer: function (chatboxid, fileuploadid) {
    const messageitem = dmt.domtool.creatediv("messageitem");
    messageitem.setAttribute("unhideUsermindid", "S" + fileuploadid);// forresort
    messageitem.setAttribute("chatboxid", chatboxid);
    messageitem.setAttribute("iscurrconversatt", true);// for sort
    const filetransferbean = dmt.domtool.creatediv("filetransferbean");
    const preview = dmt.domtool.creatediv("preview");
    const previewcontent = dmt.domtool.createimg("previewcontent", "previewcontentID"+fileuploadid);
    const filetransfer = dmt.domtool.creatediv("filetransfer");
    const filetransfericonbox = dmt.domtool.creatediv("filetransfericonbox");
    const filetransfericon = dmt.domtool.creatediv("filetransfericon");
    const filetransferstatusbar = dmt.domtool.creatediv("filetransferstatusbar", "filetransferstatusbarID" + fileuploadid);
    const filetransferprogressbar = dmt.domtool.creatediv("filetransferprogressbar", "filetransferprogressbarID" + fileuploadid);
    const filetranspercent = dmt.domtool.creatediv("filetranspercent", "filetranspercentID" + fileuploadid);
    filetranspercent.innerHTML = "0%";
    filetranspercent.classList.add("filetransferbutton");
    const filetransfercancel = dmt.domtool.creatediv("filetransfercancel", "filetransfercancelID" + fileuploadid);
    filetransfercancel.classList.add("filetransferbutton");
    filetransfercancel.setAttribute("iscancel", false);

    filetransfercancel.innerHTML = "cancel";
    preview.appendChild(previewcontent);

    filetransferstatusbar.appendChild(filetransferprogressbar);
    filetransfericonbox.appendChild(filetransfericon);
    filetransfer.appendChild(filetransfericonbox);
    filetransfer.appendChild(filetransferstatusbar);
    filetransfer.appendChild(filetranspercent);
    filetransfer.appendChild(filetransfercancel);
    filetransferbean.appendChild(filetransfer);
    filetransferbean.appendChild(preview);
    messageitem.appendChild(filetransferbean);
    messageitem.style.animation = "opac 0.2s ease-in-out";
    return messageitem;
  },

  createseenlist: function(unhideUsermindid) {
    const seenlistitem = dmt.domtool.creatediv("seenlistitem", "seenlistitemID" + unhideUsermindid);
    seenlistitem.setAttribute("unhideUsermindid",unhideUsermindid);
    const seenlistitembean = dmt.domtool.creatediv("seenlistitembean");
    seenlistitem.appendChild(seenlistitembean);
    return seenlistitem;
  },

  addseenitem: function(seenlistitem, userid, username, iconpath) {
    const unhideUsermindid = seenlistitem.getAttribute("unhideUsermindid");
    const seenitem = dmt.domtool.creatediv("seenitem", "seenitemID" + unhideUsermindid +"-"+ userid);
    const seenicon = dmt.domtool.creatediv("seenicon");
    const seentooltipdesc = dmt.domtool.creatediv("seentooltipdesc", "seentooltipdescID" + unhideUsermindid +"-"+ userid);
    seentooltipdesc.innerHTML = username;
    seenitem.appendChild(seenicon);
    seenitem.appendChild(seentooltipdesc);
    seenlistitem.firstChild.appendChild(seenitem);
  },

  updateseenitem: function(seenlistitem, userid, username, iconpath) {
    const unhideUsermindid = seenlistitem.getAttribute("unhideUsermindid");
    const seenitem = document.getElementById("seenitemID"+ unhideUsermindid +"-"+ userid);
    const seenicon = dmt.domtool.creatediv("seenicon");
    const seentooltipdesc = document.getElementById("seentooltipdescID"+ unhideUsermindid +"-"+ userid);
    seentooltipdesc.innerHTML = username;
  },

  enablechatboxEditcbName: function () {
    _chtSrvc.userhaveaAction();
    this.contentEditable = "true";
    this.focus();
    switch (this.innerHTML) {
      case this.getAttribute("realchatboxname"):
      this.innerHTML ="";
      break;
    }
  },

  chatboxNameEditor: async function (event) {
    if(event.keyCode != 13) {
      if(this.innerHTML.length > 300) {
        event.preventDefault(); // Ensure it is only this code that runs
      }
      return;
    }
    event.preventDefault(); // Ensure it is only this code that runs
    switch (this.innerHTML) {
      case "":
      this.innerHTML = this.getAttribute("realchatboxname")
      this.contentEditable = "false";
      return;
      default:
      const chatboxid = this.getAttribute("chatboxid");
      const rs = await (serverchatcmnc.updatememberChatboxname(chatboxid, this.innerHTML));
      _chtSrvc.userhaveaAction(true);
      this.innerHTML = rs.userchatboxname;
      this.contentEditable = "false";
    }
  },

  autogrow:function () {
    chbxcontrol.textboxAutogrow(this);
  },

  typingboxFilterandAction: function(event) {
    switch (true) {
      case (event.keyCode === 13):
      event.preventDefault(); // Ensure it is only this code that runs
      const chatboxid = this.getAttribute("chatboxid");
      chtbx.sendMessage(chatboxid);
      _chtSrvc.userhaveaAction();
      break;
      case (this.value.length > 512):
      event.preventDefault(); // Ensure it is only this code that runs
      break;
    }
  },

  userscrollchecker: function(event) {
    const chatboxid = this.getAttribute("chatboxid");
    const messagebox = document.getElementById("messageboxID" + chatboxid);
    if (messagebox.scrollTop == 0) {
      _chtSrvc.userhaveaAction();
    }
    chbxcontrol.setUserisscrollbox(messagebox.getAttribute("chatboxid"));
  },

  sendmsgAction: function() {
    const chatboxid = this.getAttribute("chatboxid");
    chtbx.sendMessage(chatboxid);
    _chtSrvc.userhaveaAction();// update readed
    console.log("userhaveaAction");
  },

  handleFiles: async function() {
    _chtSrvc.userhaveaAction();
    const chatboxid = this.getAttribute("chatboxid");
    const messagebox = document.getElementById("messageboxID"+ chatboxid);
    let conversationid = 0;
    for (var item of ACBchatboxStackdata) {
      if (item.chatboxid != chatboxid) continue;
      if (item.conversation) {
        conversationid = item.conversation.conversationid;
        break;
      };
      item.MAKECONVERSATION = true;
      while (!item.conversation) {
        await sleep(100);
      }
      conversationid = item.conversation.conversationid;
      break;
    };
    const filetoupload = this.files[0]; /* now you can work with the file list */
    if (!filetoupload){console.log("has no file"); return};

    const fileuploadid = ((await serverstreamcmnc.requestfileuploadidid(chatboxid))||{id:-1}).id;
    const ftf = chtbxtool.createfiletransfer(chatboxid, fileuploadid);
    messagebox.appendChild(ftf);

    const loader = {file: new Promise(function(resolve, reject) {resolve(filetoupload);}), conversationid: conversationid, uploadTotal: 0, uploaded: 0, fileid:fileuploadid}
    var updloader = new filetransfer.MyUploadAdapter(loader, TOKEN);

    const up = await updloader.upload();

    const filetransfercancel = document.getElementById("filetransfercancelID" + fileuploadid);
    filetransfercancel.addEventListener('click', function() {
      const iscancel = this.getAttribute("iscancel");
      switch (iscancel) {
        case "true": filetransfercancel.setAttribute("iscancel", false); break;
        case "false": updloader.abort(); filetransfercancel.setAttribute("iscancel", true); break;
      }
    });
    const filetransferprogressbar = document.getElementById("filetransferprogressbarID" + fileuploadid);
    const filetranspercent = document.getElementById( "filetranspercentID" + fileuploadid);

    while(filetransfercancel.getAttribute("iscancel").localeCompare("true")!=0){
      const perc = ((loader.uploaded/loader.uploadTotal)*100);
      filetransferprogressbar.style.width = (perc+ "%");
      filetranspercent.innerHTML = (perc+ "%");
      if (perc>=100) break;
      await new Promise(resolve => {setTimeout(resolve, 150)});
      console.log("while");
    }

    // ftf.style.animation = "fade 0.5s ease both";

    // ftf.remove();
    // }, 100);
    this.value = "";
    console.log("finish");
    chbxcontrol.chtbxautoscrolllast(chatboxid);
  }
}

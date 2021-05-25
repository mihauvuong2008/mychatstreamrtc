const dmt = require('../../app/domtl');
const chtlst = require('../../chat/chatapp');

let chbxcontrol;
let chtbxtool;
let serviceTool;
let USERDATA;
let CHATROOMTYPE;
let APPDATA;
let ACBchatboxStackdata
let sleep;

let createConversation;
let getSeenlist;
let getLastConversation;
let getconversationData;

let getactiveChatboxlist;

export const init = function (myapp, srvcetool, cbtool, cbxcntrl, svrCom) {

  chbxcontrol = cbxcntrl.chbxcontrol;
  chtbxtool = cbtool.chtbxtool;
  serviceTool = srvcetool.serviceTool;
  USERDATA = myapp.USERDATA;
  CHATROOMTYPE = myapp.CHATROOMTYPE;
  APPDATA = myapp.APP.DATA;
  ACBchatboxStackdata = myapp.ACTIVECHATBOX.chatboxStack.data;
  sleep = myapp.sleep;

  createConversation = svrCom.serverchatcmnc.createConversation;
  getSeenlist = svrCom.serverchatcmnc.getSeenlist;
  getLastConversation = svrCom.serverchatcmnc.getLastConversation;
  getconversationData = svrCom.serverchatcmnc.getconversationData;

  getactiveChatboxlist = svrCom.serverstreamcmnc.getactiveChatboxlist;
}

export const chattask = {

  chatboxactivestt: function (chatbox, chatlist) {
    getactiveChatboxlist(chatlist)
    .then(activeChatboxlist => {
      const setupActive = item_ => {if (item_ == chatbox.chatboxid) return true;}
      const active = (activeChatboxlist||[]).some(setupActive);
      chattasktool.chatboxactivestate(chatbox.chatboxid, active);
    });
  },

  chatlistonlinestt: function (chatbox) {
    const setupOnline = item_ => {if (item_.userid != USERDATA.ID && item_.lasttimelogin) {if (serviceTool.is_Stillonline (item_.lasttimelogin)) {return true;}}}
    const online = (chatbox.members||[]).some(setupOnline);
    chattasktool.chtbxlstonlinestate(chatbox.chatboxid, online);
  },

  recentonlinestt: function (recentchtbx, chatboxlistitem) {
    const setupOnline = item_ => {if (item_.userid!= USERDATA.ID && item_.lasttimelogin) if (serviceTool.is_Stillonline(item_.lasttimelogin)) {return true;}}
    const online = (chatboxlistitem.members||[]).some(setupOnline);
    chattasktool.recentonlinestate(recentchtbx.chatboxid, online);
  },

  memberonlinestt: function (chtbxstkitem) {
    //update user chatbox online status
    const setupOnline = item_ => {
      if (item_.lasttimelogin)
      switch (true) {
        case serviceTool.is_Stillonline(item_.lasttimelogin):
        chattasktool.chtbxusronlinestate(chtbxstkitem.chatboxid, item_.userid, true);
        break;
        default:
        chattasktool.chtbxusronlinestate(chtbxstkitem.chatboxid, item_.userid, false);
      }
    }
    (chtbxstkitem.members||[]).some(setupOnline);
    return true;
  },

  // update chat
  cleanchatboxstck: function (chtbxstkitem) {
    chtbxstkitem.chatbox.remove();
    delete chtbxstkitem.chatbox;
    ACBchatboxStackdata.remove(chtbxstkitem);
  },

  refreshchatboxinfo: function (chtbxstkitem) {
    // if (!chtbxstkitem.members) return;
    try {
      chtbxstkitem.members.forEach(mem => {
        switch (true) {
          case (mem.userid != USERDATA.ID): return;
          case (!mem.userchatboxname): return true;
        }
        const chatboxname = document.getElementById("chatboxnameID"+ chtbxstkitem.chatboxid);
        if (!chatboxname)return true;
        switch (chatboxname.contentEditable) {case "false": chatboxname.innerHTML = mem.userchatboxname; break;}
      });
    } catch (e) {
      console.log(chtbxstkitem.members);
      console.log("chtbxstkitem", JSON.stringify(chtbxstkitem));
    }
  },

  newcbxmemberjoin: function (chtbxstkitem) {
    const memberList = document.getElementById("memberID"+chtbxstkitem.chatboxid);
    switch (true) {
      case (!memberList): {return};
      case (!chtbxstkitem.members): return;
    }
    let USER_ISKEY = chtbxstkitem.members.some(item => {if(item.userid == USERDATA.ID) return item.chatboxuserkey;});
    chtbxstkitem.members.forEach(mem => {
      if(document.getElementById("memberitemID" + chtbxstkitem.chatboxid + "-" + mem.userid)) return;// if exists
      const memberitem = chtbxtool.creatememberitem(chtbxstkitem.chatboxid, mem.userid, mem.username, mem.lasttimelogin);

      if (!USER_ISKEY|| mem.userid == USERDATA.ID) {
        memberitem.setAttribute("isupdated", true);
        memberList.prepend(memberitem);
        return;
      }

      // remove member button
      switch (chtbxstkitem.type) {
        case CHATROOMTYPE.TYPEGROUP:
        const removemember = chtbxtool.creatermvmembutton(chtbxstkitem.chatboxid, mem.userid);
        memberitem.appendChild(removemember);
        memberitem.setAttribute("isupdated", true);
        memberList.prepend(memberitem);
        break;
        case CHATROOMTYPE.TYPEFRIEND:
        memberitem.setAttribute("isupdated", true);
        memberList.prepend(memberitem);
        break;
      }
    });// end for
  },

  updatecbxmemberinfo: function (chtbxstkitem) {
    switch (true) {
      case (!chtbxstkitem.members): return;
    }
    chtbxstkitem.members.forEach( mem => {
      const memberusername = document.getElementById("memberusernameID" +chtbxstkitem.chatboxid+"-"+ mem.userid);
      if(memberusername){// update friend
        memberusername.innerHTML = mem.username;
        memberusername.parentNode.setAttribute("isupdated", true);
      }
      const teamviewicon = document.getElementById("memberteamviewID" + chtbxstkitem.chatboxid +"-"+ mem.userid);
      if(teamviewicon)
      if(mem.isstream){
        teamviewicon.classList.remove("hidememberteamview");
      }
      else {
        teamviewicon.classList.add("hidememberteamview");
      }
    });
  },

  cleancbxmemberlist: function (chtbxstkitem) {
    for (var item of document.querySelectorAll("[chatboxid='"+chtbxstkitem.chatboxid+"'][class=memberitem]")) {
      switch (item.getAttribute("isupdated")) {
        case "false": item.remove(); continue;
        case "true": item.setAttribute("isupdated", false); continue;
      }
    }
  },

  refreshcbxprivilege: function (chtbxstkitem) {
    const memberList = document.getElementById("memberID"+chtbxstkitem.chatboxid);
    switch (true) {
      case (!memberList): return;
      case (!chtbxstkitem.members): return; //async still not update yet
    }
    let USER_ISKEY = chtbxstkitem.members.some(item => {if(item.userid == USERDATA.ID) {return item.chatboxuserkey;}});
    chtbxstkitem.members.forEach(mem => {
      const memberitem = document.getElementById("memberitemID" + chtbxstkitem.chatboxid + "-" + mem.userid);
      if(!memberitem) return;// will be create

      if (USER_ISKEY&& mem.userid!= USERDATA.ID)
      switch (chtbxstkitem.type) {
        case CHATROOMTYPE.TYPEGROUP:
        if (document.getElementById("removememberitemID"+chtbxstkitem.chatboxid+"-"+mem.userid)) break; // has remv -> break
        removemember = chtbxtool.creatermvmembutton(+ chtbxstkitem.chatboxid, mem.userid);
        memberitem.appendChild(removemember);
        break;
      }
    });

    const memberinvite = document.getElementById ("memberinviteID" + chtbxstkitem.chatboxid);
    const leave = document.getElementById ("leaveID" + chtbxstkitem.chatboxid);
    const dissolution = document.getElementById ("dissolutionID" + chtbxstkitem.chatboxid);
    const livestreamitem = document.getElementById ("livestreamID" + chtbxstkitem.chatboxid);

    switch (chtbxstkitem.type) {
      case CHATROOMTYPE.TYPEGROUP:
      if (!USER_ISKEY) {
        if(memberinvite) memberinvite.remove();
        if (dissolution) dissolution.remove();
        break;
      }
      if (!memberinvite) {
        const memberitem = chtbxtool.createmberinvteitem(chtbxstkitem.chatboxid);
        memberList.appendChild(memberitem);
      }
      if (!leave) {
        const leave = chtbxtool.createleaveitem(chtbxstkitem.chatboxid);
        memberList.appendChild(leave);
      }
      if (!dissolution) {
        const memberitem = chtbxtool.createdissolutionitem(chtbxstkitem.chatboxid);
        memberList.appendChild(memberitem);
      }
      break;
    }
    if (!livestreamitem) {
      const _livestreamitem = chtbxtool.createlivestreamitem(chtbxstkitem.chatboxid);
      memberList.appendChild(_livestreamitem);
    }

  },

  appendnewchatlistitem: function (chatbox, i, len) {
    if(document.getElementById("chatlistitemID" + chatbox.chatboxid)) return;
    const chatlist = document.getElementById("chatlistID");
    const chatlistitembean = dmt.domtool.creatediv("chatlistitembean");

    const chatlistitem = dmt.domtool.creatediv("chatlistitem", "chatlistitemID" + chatbox.chatboxid);
    chatlistitem.classList.add(chatbox.type);
    chatlistitem.setAttribute("isupdated", true);
    chatlistitem.setAttribute("chatboxid", chatbox.chatboxid);
    chatlistitem.addEventListener("mousedown", chtlst.chtlsttool.chatlistitemSelect);

    var chatboxisonline = false;
    const setuponline = item_ => { if (item_.userid!= USERDATA.ID&&item_.lastdatetimelogin)if(is_Stillonline(item_.lastdatetimelogin)){chatboxisonline = true; return true;}};
    (chatbox.members||[]).some(setuponline);
    const onlinestatus = dmt.domtool.creatediv("onlinestatus", "onlinestatusID" + chatbox.chatboxid);
    onlinestatus.style.backgroundColor = (chatboxisonline?"#06FF0B":"#cc0000");
    chatlistitem.appendChild(onlinestatus);

    const chatlistitemname = chtlst.chtlsttool.createchtbxnamechatlistitem(chatbox.type, chatbox.chatboxid, chatbox.chatboxName);
    const icon = chtlst.chtlsttool.getgrpiconchatlistitem(chatbox.type);
    const chatlistitemactive = dmt.domtool.creatediv("chatlistitemactive", "chatlistitemactiveID"+chatbox.chatboxid);

    chatlistitem.appendChild(icon);
    chatlistitem.appendChild(chatlistitemactive);
    chatlistitem.appendChild(chatlistitemname);

    const getUserchatboxname = item_ => { if (item_.userid== USERDATA.ID&&item_.userchatboxname){chatlistitemname.innerHTML = item_.userchatboxname; return true;}};
    (chatbox.members||[]).some(getUserchatboxname);

    const callbean = chtlst.chtlsttool.getcallitem(chatbox.chatboxid);
    const notice = chtlst.chtlsttool.getnoticeitem(chatbox.chatboxid);

    chatlistitem.appendChild(callbean);
    chatlistitem.appendChild(notice);

    switch (true) {
      case (APPDATA.inited):
      chatlistitem.style.animation = "expandh 0.5s ease-in-out";
      chatlistitembean.appendChild(chatlistitem);
      chatlist.prepend(chatlistitembean);
      break;
      case (!APPDATA.inited):
      chatlistitembean.appendChild(chatlistitem);
      chatlist.append(chatlistitembean);
      break;
    }
    if(i==len-1){ APPDATA.inited = true;}
  },

  refreshchatlistitem: function (chatbox) {
    const chatlistitem = document.getElementById("chatlistitemID" + chatbox.chatboxid);
    if(!chatlistitem) return ;
    const chatlistitemname = document.getElementById("chatlistitemnameID" + chatbox.chatboxid);
    const getUserchatboxname = item_ => {if(item_.userid== USERDATA.ID&&item_.userchatboxname){chatlistitemname.innerHTML = item_.userchatboxname; return true;}};
    (chatbox.members||[]).some(getUserchatboxname);
    chatlistitem.setAttribute("isupdated", true);
  },

  clearchatlistitem: async function () {
    for (var item of document.getElementsByClassName("chatlistitem")) {
      switch (item.getAttribute("isupdated")) {
        case "true":
        item.setAttribute("isupdated", false);
        break;
        case "false":
        const bean = item.parentNode;
        bean.style.opacity = '0';
        await setTimeout(function(){bean.parentNode.removeChild(bean);}, 200);
        break;
      }
    }
  },

  makenewConversation: async function (chtbxstkitem) {
    chtbxstkitem.conversation = (await createConversation(chtbxstkitem.chatboxid));
    console.log("new conversation");
  },

  clearOldConversation: async function (chtbxstkitem) {
    if(chtbxstkitem.conversation)
    if (serviceTool.is_liveconversation(chtbxstkitem.conversation)) return;
    const conversation = await getLastConversation(chtbxstkitem.chatboxid,"undefined");
    if (!conversation) return;
    if (serviceTool.is_liveconversation(conversation)) {
      delete chtbxstkitem.conversation;
      chtbxstkitem.conversation = conversation;// update conversation
      return;
    }
    if(chtbxstkitem.conversation == null) return;
    console.log("remove conversation: ", conversation.conversationid, (new Date () - new Date (conversation.endAt)));
    chtbxstkitem.conversation = null;
  },

  br_up_ap_havechange: {value:true, lastvalue:0},
  browser_update_appNotify: function (totalnotice){
    if(!this.br_up_ap_havechange.value)return;
    switch (this.br_up_ap_havechange.lastvalue) {
      case totalnotice: return;
    }
    const menunotify = document.getElementById("menunotifyID");
    const menunotifyvalue = document.getElementById("menunotifyvalueID");
    menunotifyvalue.innerHTML = totalnotice;
    if(totalnotice==0) {
      menunotify.classList.add("notify");
      menunotify.classList.remove("havenotify");
      return;
    }
    menunotify.classList.add("havenotify");
    menunotify.classList.remove("notify");
    this.br_up_ap_havechange.lastvalue = totalnotice;
  },

  browser_update_recentnotice: function (id, totalnoticecount) {
    if(totalnoticecount === undefined) return ;
    const recentnotice = document.getElementById ("recentnoticeID" + id);
    if(!recentnotice) return;
    const last = recentnotice.getAttribute("lastvalue");
    if (totalnoticecount==last) return;
    recentnotice.setAttribute("lastvalue", totalnoticecount);
    const noticevalue = document.getElementById ("recentnoticevalueID" + id);
    if (totalnoticecount == 0) {
      recentnotice.classList.add ("hidenotice");
      noticevalue.innerHTML = 0;
      return;
    }
    recentnotice.classList.remove ("hidenotice");
    noticevalue.innerHTML = totalnoticecount;
  },

  brownser_update_chatlistnotice: function (chatboxid, totalnoticecount) {
    const chatlistitemnotice = document.getElementById ("chatlistitemnotice"+chatboxid);
    switch (true) {
      case (totalnoticecount === undefined): return ;
      case (!chatlistitemnotice): return;
      case (totalnoticecount==chatlistitemnotice.getAttribute("lastvalue")): return ;
    }
    chatlistitemnotice.setAttribute("lastvalue", totalnoticecount);
    const chatlistitemnoticevalue = document.getElementById ("chatlistitemnoticevalue"+chatboxid);
    switch (true) {
      case (totalnoticecount == 0):
      if(chatlistitemnoticevalue.innerHTML==0) return;
      chatlistitemnotice.classList.add ("hidenotice");
      chatlistitemnoticevalue.innerHTML = 0;
      return;
      break;
      case (totalnoticecount != 0):
      chatlistitemnotice.classList.remove ("hidenotice");
      chatlistitemnoticevalue.innerHTML = totalnoticecount;
      break;
    }
  },

  brownser_show_seenmessage: async function (chtbxstkitem) {
    const messagebox = chtbxstkitem.messagebox;
    const members = chtbxstkitem.members;
    if (!members) return;
    const minY = messagebox.getBoundingClientRect().y;
    const maxY = minY + messagebox.getBoundingClientRect().height;
    let unhideUsermindid, seenlistitem, seenlist;
    const messagelist = document.querySelectorAll("[class=messageitem][chatboxid='"+chtbxstkitem.chatboxid+"']");
    try {
      for (var messageitem of messagelist) {
        const pos = messageitem.getBoundingClientRect().y;
        switch (true) {
          case (pos>maxY||pos<minY): continue;
          case !(unhideUsermindid = messageitem.getAttribute("unhideusermindid")): continue;
          case !(seenlistitem = document.getElementById("seenlistitemID" + unhideUsermindid)): continue;
          case !(seenlist = await getSeenlist(unhideUsermindid)): {await sleep(200); continue};
          case (seenlist.length == members.length): continue;
        }
        (seenlist||[]).forEach(item => {
          const seenitem = document.getElementById("seenitemID"+ unhideUsermindid +"-"+item.userid);
          switch (true) {
            case (seenitem): chtbxtool.updateseenitem(seenlistitem, item.userid, item.username, null); break;
            case (!seenitem): chtbxtool.addseenitem(seenlistitem, item.userid, item.username, null); break;
          }
        });
      }
    } catch (e) {
      console.log(seenlist, e);
    }
  },

  brownser_insert_msgitmrecei_tochbx: async function (chtbxstkitem, itemToinsert) {
    const checkexists = document.querySelectorAll("[unhideusermindid='"+itemToinsert.unhideUsermindid+"']");
    switch (true) {
      case (checkexists.length>0): itemToinsert.viewinbrowser = true; return;
      case (itemToinsert.viewinbrowser): return;
      case (!chtbxstkitem.initcomplete): return;
      case (chtbxstkitem.LOADMOREMESSAGEID != chtbxstkitem.LOADMOREMESSAGEDONEID): return;
    }
    const messagebox = chtbxstkitem.messagebox;
    const messageitem = chtbxtool.createmessageitem(itemToinsert, chtbxstkitem.chatboxid);
    const messagelist = document.querySelectorAll("[class='messageitem']");
    if (messagelist.length==0) {
      messagebox.append(messageitem);
      itemToinsert.viewinbrowser = true;
      chbxcontrol.chtbxautoscrolllast(chtbxstkitem.chatboxid);
      return;
    }

    let inserted = false;
    const len = messagelist.length;
    const d = len - (10*chtbxstkitem.members.length); // max to delay
    for (let i = (d<0?0:d); i < len; i++) {
      const unhideusermindid = messagelist[i].getAttribute("unhideusermindid");
      if (!messagebox.contains(messagelist[i])) continue;

      if(!unhideusermindid) return;//wait for update
      if(itemToinsert.unhideUsermindid>unhideusermindid){
        if(i==len-1){
          messagebox.insertBefore (messageitem, messagelist[i].nextSibling);
          inserted = true;
          break; // insertAfter
        }
        continue;
      }
      if (itemToinsert.unhideUsermindid<unhideusermindid) {
        messagebox.insertBefore(messageitem, messagelist[i]);
        inserted = true;
        break; // insertAfter
      }
    }
    if (!inserted)return;
    chbxcontrol.chtbxautoscrolllast(chtbxstkitem.chatboxid);
    itemToinsert.viewinbrowser = true;
  },

  brownser_insert_mmfitmrecei_tochbx: async function (chtbxstkitem, itemToinsert) {
    const messagebox = chtbxstkitem.messagebox;
    const messageitem = chtbxtool.createmultimediafileitem(itemToinsert, chtbxstkitem.chatboxid, true);
    messagebox.append(messageitem);
    itemToinsert.viewinbrowser = true;
    itemToinsert.success = true;
    chbxcontrol.chtbxautoscrolllast(chtbxstkitem.chatboxid);
  },

  resort_msgitmrecei_inchbx: async function (chtbxstkitem, item) {// sort in curr conversation
    const messagebox = chtbxstkitem.messagebox;
    for (var item of document.querySelectorAll("[chatboxid='"+chtbxstkitem.chatboxid+"'][iscurrconversatt='true']")) {
      if (!item.nextSibling) continue;
      const _item_id = parseInt(item.getAttribute("unhideUsermindid")),
      _nextitem_id = parseInt(item.nextSibling.getAttribute("unhideUsermindid"));
      if (_item_id > _nextitem_id) {
        messagebox.insertBefore(item.nextSibling, item);
      }
    }
  },

  browser_updt_chbxmsgitem_sendedstt: function (item) {
    const messageitem = document.getElementById ("tempmessageitemID"+item.post_data_id);
    if (!messageitem) return;
    const hidemessageinfo = document.getElementById ("tempmessageinfoID"+item.post_data_id);
    const messgetext = document.getElementById ("tempmessagetextID"+item.post_data_id);
    const checksened = document.getElementById("checksenedID" + item.post_data_id);
    switch (true) {
      case (item.success):
      messageitem.id = "messageitemID" + item.resID;
      messageitem.setAttribute("unhideUsermindid", item.resID);
      messageitem.setAttribute("chatboxid", item.chatboxid);
      messageitem.setAttribute("iscurrconversatt", true);// for sort
      messageitem.setAttribute("sended", item.post_data_id);
      hidemessageinfo.id = "messageinfoID" + item.resID;
      hidemessageinfo.className = "hidemessageinfo";
      hidemessageinfo.innerHTML = "sended";
      checksened.className = "checksened";
      checksened.id = "checksenedID" + item.resID;
      messgetext.id = "message_dataID" + item.resID;
      messgetext.setAttribute("unhideUsermindid", item.resID);
      messgetext.addEventListener("click", chbxcontrol.showinfomessage);
      const messgetextbean = messgetext.parentNode;
      const seenlistitem = chtbxtool.createseenlist(item.resID);
      messgetextbean.appendChild(seenlistitem);
      hidemessageinfo.innerHTML = item.datetimesend;
      messgetext.classList.remove("messgetextpresend");
      break;
      case (!item.success):
      // message has sened fail
      hidemessageinfo.innerHTML = "send fail, click to resend";
      hidemessageinfo.className = "messageinfo";
      messgetext.addEventListener ("click", function(){
        const messageitem = document.getElementById ("tempmessageitemID" + item.post_data_id);
        console.log("tempmessageitemID" + item.post_data_id);
        if (!messageitem||!item.sended) return;
        messageitem.id = "tempmessageitemID" + item.post_data_id;
        //show hand to user resend
        item.sended = false;
        item.success = false;
        item.updateinbrowser = false;
        item.sendingcount = 0;
        messgetext.style.backgroundColor = "";
        messgetext.style.borderColor = "";
      });
      messgetext.style.backgroundColor = "#E00003";
      messgetext.style.borderColor = "#a80003";
      break;
    }
    // for give it
    item.updateinbrowser = true;
  },

  getloadmoremsg: function (chtbxstkitem) {
    switch (true) {
      case (!chtbxstkitem.messagebox): return ;
      case (chtbxstkitem.messagebox.scrollTop==0): chtbxstkitem.LOADMOREMESSAGE = true;//scrollTop==0
      return;
    }
    chtbxstkitem.LOADMOREMESSAGE = false;
  },

  loadmoremsg: async function (chtbxstkitem){
    switch (true) {
      case (chtbxstkitem.LOADMOREMESSAGEID != chtbxstkitem.LOADMOREMESSAGEDONEID): return;
      case (!chtbxstkitem.initcomplete): return ;
    }
    let firstconverstationinfo;
    let conversationData = [];
    const chatboxid = chtbxstkitem.chatboxid;
    const messagebox = chtbxstkitem.messagebox;

    //get first converstationinfo showed in chatbox

    firstconverstationinfo = messagebox.getElementsByClassName('converstationinfo')[0];// get top conversaation
    if (!firstconverstationinfo)return;
    const firstconverstationid = firstconverstationinfo.getAttribute("conversationid");
    const converstationEndat = firstconverstationinfo.firstChild.getAttribute("endAt");
    const olderMsg = messagebox.getElementsByClassName('messageitem')[0]; // get curr oldest message in chatbox
    if (olderMsg) {
      const unhideUsermindid = olderMsg.getAttribute("unhideUsermindid");
      conversationData = await getconversationData(firstconverstationid, unhideUsermindid);
    }
    if (!conversationData) return;
    if(conversationData.length==0||!olderMsg) {// add new conversation to loadmoremsg
      // get older conversation
      const conversation = await getLastConversation(chatboxid, converstationEndat);
      if (!conversation) {
        chtbxstkitem.NOMORE = true;
        const nomore = dmt.domtool.creatediv("nomore");
        nomore.innerHTML = "No more message"
        messagebox.prepend(nomore);
        return;
      }

      if (document.querySelectorAll("[conversationid='"+conversation.conversationid+"']").length>0) return; //check exists

      const converstationinfo = dmt.domtool.creatediv("converstationinfo");
      converstationinfo.setAttribute("conversationid", conversation.conversationid);
      const converstationstartat = dmt.domtool.creatediv("converstationstartat");
      converstationstartat.setAttribute("endAt", conversation.endAt);
      converstationstartat.innerHTML = new Date(conversation.startAt);
      converstationinfo.append(converstationstartat);
      messagebox.prepend(converstationinfo);// add new conversation to loadmoremsg

      firstconverstationinfo = converstationinfo;
      conversationData = await getconversationData(conversation.conversationid);
    }
    if(conversationData[0]) { // load data conversation
      chtbxstkitem.LOADMOREMESSAGEID /*for sync*/ = conversationData[0].unhideUsermindid;
      chtbxstkitem.LOADMOREMESSAGEDONEID = await chtbxtool.fillconversation (chtbxstkitem, firstconverstationinfo, conversationData, messagebox);
    }
    if (!chbxcontrol.getUserisscrollbox(chatboxid)) {
      chbxcontrol.chtbxautoscrolllast(chatboxid);
      return ;
    }
    messagebox.scrollTop = 1;
  },
}

const chattasktool = {
  chatboxactivestate: function (chatboxid, online) {
    const activestatus = document.getElementById("chatlistitemactiveID" + chatboxid);
    if(!activestatus) return ;
    activestatus.style.backgroundColor = (online?"#06FF0B":"#cc0000");
  },

  recentonlinestate: function(chatboxid, online) {
    const onlinestatus = document.getElementById("recentonlinestatusID" + chatboxid);
    if(!onlinestatus) return ;
    onlinestatus.style.backgroundColor = (online?"#06FF0B":"#cc0000");
  },

  chtbxlstonlinestate: function(chatboxid, online) {
    const onlinestatus = document.getElementById ("onlinestatusID"+chatboxid);
    if(!onlinestatus) return ;
    onlinestatus.style.backgroundColor = (online?"#06FF0B":"#cc0000");// make icon
  },

  chtbxusronlinestate: function(chatboxid, userid, online) {
    const onlinestatus = document.getElementById("chatboxUseronlinestatusID" + chatboxid + "-" + userid);
    if(!onlinestatus) return ;
    onlinestatus.style.backgroundColor = (online?"#06FF0B":"#cc0000");// make icon
  }
}

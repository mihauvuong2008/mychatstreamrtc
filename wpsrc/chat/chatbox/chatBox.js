const dmt = require('../../app/domtl');

let APPDATA;
let USERDATA;
let CHATROOMTYPE;
let ACBchatboxStackdata
let getDateString;
let chtbxtool;
let chbxcontrol;

export const init = function (myapp, cbtool, cbxcntrl) {
  APPDATA = myapp.APP.DATA;
  USERDATA = myapp.USERDATA;
  CHATROOMTYPE = myapp.CHATROOMTYPE;
  ACBchatboxStackdata = myapp.ACTIVECHATBOX.chatboxStack.data;
  getDateString = myapp.getDateString;
  chtbxtool = cbtool.chtbxtool;
  chbxcontrol = cbxcntrl.chbxcontrol;
}

export async function loadChatboxInfo(chatbox){
  switch (chatbox.mesage) { case "Unauthorized.": return; }
  let chatboxname = document.querySelector("#chatboxnameID"+ chatbox.chatboxid);
  if (!chatboxname) return;

  let members = {};
  const getmembers = item => {if(chatbox.chatboxid == item.chatboxid) {members = (item.members||[]); return true;}}
  APPDATA.chatboxlist.some(getmembers);
  if (!members) return ;

  const memberList = document.querySelector("#memberID"+chatbox.chatboxid);
  memberList.innerHTML = "";
  let USER_ISKEY = members.some(item => {if(item.userid == USERDATA.ID) return item.chatboxuserkey;});
  members.forEach(item => {

    if(item.userchatboxname&&item.userid == USERDATA.ID){
      chatboxname.innerHTML = item.userchatboxname;
    }
    const memberitem = chtbxtool.creatememberitem(chatbox.chatboxid, item.userid, item.username, item.lasttimelogin);
    switch (chatbox.type) {
      case CHATROOMTYPE.TYPEFRIEND:

      break;
      default:
      if (USER_ISKEY&&item.userid != USERDATA.ID) {
        const removemember = chtbxtool.creatermvmembutton(chatbox.chatboxid, item.userid);
        memberitem.appendChild(removemember);
      }
    }
    memberList.appendChild(memberitem);
  });
}

export async function initmessagebox(chatbox, lastconv, conversationData) {
  switch (chatbox.mesage) { case "Unauthorized.": return; }
  const messagebox = document.querySelector("#messageboxID" + chatbox.chatboxid);
  if (!messagebox) return ;
  messagebox.innerHTML = "";

  var chtbxStckdt_item = {};
  const getChtbxStkdt_item = item => {if (chatbox.chatboxid == item.chatboxid) {chtbxStckdt_item = item; return /*break s_ome*/true;}}
  ACBchatboxStackdata.some(getChtbxStkdt_item);
  if (!lastconv){ // no more
    chtbxStckdt_item.initcomplete = true;
    const nomore = dmt.domtool.creatediv("nomore");
    nomore.innerHTML = "No more message"
    messagebox.prepend(nomore);
    return ;
  }
  const converstationinfo = dmt.domtool.creatediv("converstationinfo");
  converstationinfo.setAttribute("conversationid", lastconv.conversationid);
  const converstationstartat = dmt.domtool.creatediv("converstationstartat");
  converstationstartat.setAttribute("endAt", lastconv.endAt);
  converstationstartat.innerHTML = new Date(lastconv.startAt);
  converstationinfo.append(converstationstartat);
  messagebox.prepend(converstationinfo);

  // if(conversationData[0])
  await chtbxtool.fillconversation(chtbxStckdt_item, converstationinfo, conversationData, messagebox);

  chbxcontrol.chtbxautoscrolllast(chatbox.chatboxid);
}


export function addChatbox(chatboxObj){
  return new Promise(function(resolve, reject) {
    switch (chatboxObj.mesage) { case "Unauthorized.": return; }
    // console.log(type, id);
    const chatbox = dmt.domtool.creatediv("chatbox", "chatboxID" + chatboxObj.chatboxid);
    chatbox.setAttribute("chatboxid", chatboxObj.chatboxid);
    // chatbox.classList.add("chatboxwindow");
    const typingbox = dmt.domtool.creatediv("typingbox", "typingboxID" + chatboxObj.chatboxid);
    typingbox.setAttribute("chatboxid", chatboxObj.chatboxid);

    const sendfilebutton = dmt.domtool.createlabel("sendfilebutton", "sendfileID" + chatboxObj.chatboxid);
    const sendfileinput = dmt.domtool.createinput("file", "sendfilebutton", "sendfileID" + chatboxObj.chatboxid);
    sendfileinput.setAttribute("chatboxid", chatboxObj.chatboxid);
    sendfileinput.addEventListener("change", chtbxtool.handleFiles);

    const sendfileico = dmt.domtool.creatediv("sendfileico");
    sendfilebutton.setAttribute("chatboxid", chatboxObj.chatboxid);
    sendfilebutton.appendChild(sendfileico);
    sendfilebutton.appendChild(sendfileinput);
    const mess = document.createElement("textarea");
    mess.classList.add("mess");
    mess.id = "messID" + chatboxObj.chatboxid;
    mess.setAttribute("chatboxid", chatboxObj.chatboxid);
    mess.addEventListener("input", chtbxtool.autogrow);
    mess.addEventListener("keypress", chtbxtool.typingboxFilterandAction);
    const sendbutton = dmt.domtool.creatediv("sendbutton", "sendbuttonID" + chatboxObj.chatboxid);
    sendbutton.setAttribute("chatboxid", chatboxObj.chatboxid);
    sendbutton.innerHTML = "send";
    sendbutton.addEventListener("click", chtbxtool.sendmsgAction);

    const messagebox = dmt.domtool.creatediv("messagebox", "messageboxID"+ chatboxObj.chatboxid);
    messagebox.setAttribute("chatboxid", chatboxObj.chatboxid);
    messagebox.addEventListener("wheel", chtbxtool.userscrollchecker);

    const memberList = dmt.domtool.creatediv("member", "memberID"+ chatboxObj.chatboxid);
    memberList.setAttribute("chatboxid", chatboxObj.chatboxid);
    const titlechatbox = dmt.domtool.creatediv("titlechatbox", "titlechatboxID" + chatboxObj.chatboxid);
    titlechatbox.setAttribute("chatboxid", chatboxObj.chatboxid);

    const chatboxname = dmt.domtool.creatediv("chatboxname", "chatboxnameID"+ chatboxObj.chatboxid);
    chatboxname.setAttribute("chatboxid", chatboxObj.chatboxid);
    chatboxname.contentEditable = "false";
    chatboxname.setAttribute("placeholder", "Your chatbox name");
    chatboxname.setAttribute("realchatboxname", chatboxObj.chatboxName);
    chatboxname.addEventListener('dblclick', chtbxtool.enablechatboxEditcbName );
    chatboxname.addEventListener('keypress', chtbxtool.chatboxNameEditor);
    chatboxname.innerHTML = chatboxObj.chatboxName + chatboxObj.chatboxid ;

    const controlchatbox = dmt.domtool.creatediv("controlchatbox");
    const chatbox_minimize = dmt.domtool.creatediv("chatbox_minimize", "chatbox_minimizeID"+ chatboxObj.chatboxid);
    chatbox_minimize.setAttribute("chatboxid", chatboxObj.chatboxid);
    chatbox_minimize.addEventListener('click', chbxcontrol.chatboxminimize);
    const chatbox_maximize = dmt.domtool.creatediv("chatbox_maximize", "chatbox_maximize"+ chatboxObj.chatboxid);
    chatbox_maximize.setAttribute("chatboxid", chatboxObj.chatboxid);
    chatbox_maximize.addEventListener('click', chbxcontrol.chatboxmaximize);
    const chatbox_close = dmt.domtool.creatediv("chatbox_close", "chatbox_closeID"+ chatboxObj.chatboxid);
    chatbox_close.setAttribute("chatboxid", chatboxObj.chatboxid);
    chatbox_close.addEventListener('click',chbxcontrol.closechatbox );
    chatbox_close.innerHTML = "&times;";
    controlchatbox.appendChild(chatbox_minimize);
    controlchatbox.appendChild(chatbox_maximize);
    controlchatbox.appendChild(chatbox_close);
    titlechatbox.appendChild(chatboxname);
    titlechatbox.appendChild(controlchatbox);
    typingbox.appendChild(sendfilebutton);
    typingbox.appendChild(mess);
    typingbox.appendChild(sendbutton);

    chatbox.appendChild(typingbox);
    chatbox.appendChild(messagebox);
    chatbox.appendChild(memberList);
    chatbox.appendChild(titlechatbox);
    resolve({chatbox, messagebox});
  }).then((rs)=>{
    // register:
    chtbxtool.chatboxregister(rs.chatbox, rs.messagebox, chatboxObj.chatboxid, chatboxObj.type);
  });
}

// send data
let post_data_id = 0;
export function sendMessage(chatboxid){
  const typingbox = document.querySelector("#messID"+ chatboxid);
  const mess = typingbox.value.replace(/'/g, "\'");
  if(mess.localeCompare("") == 0) return;
  const post_data = {
    post_data_id: post_data_id,
    chatboxid: chatboxid,
    message: mess,
    datetimesend: getDateString(new Date()) ,
    sended: false,
    success: false,
    sendingcount: 0,
    updateinbrowser: false,
    resID: -1
  };

  temporaryShowClientMessage(chatboxid, post_data_id, mess);
  const addSending_chatdata_cache = item => {
    if(chatboxid != item.chatboxid) return;
    item.sending_chatdata_cache.push(post_data);
    post_data_id += 1;
    typingbox.value = "";
    chbxcontrol.textboxAutogrow(typingbox);// enter key
    return true;
  }
  ACBchatboxStackdata.some(addSending_chatdata_cache);
}

function temporaryShowClientMessage(chatboxid, post_data_id, mess) {
  const messageitem = dmt.domtool.creatediv("messageitem", "tempmessageitemID"+post_data_id);
  const messageitem_icon = dmt.domtool.creatediv("messageitem_icon");
  const userchatboxmessagae = dmt.domtool.creatediv("userchatboxmessagae");
  const messageinfo = dmt.domtool.creatediv("hidemessageinfo", "tempmessageinfoID"+post_data_id);
  messageinfo.innerHTML = "sending...";
  const messgetextbean = dmt.domtool.creatediv("messgetextbean");
  const messgetext = dmt.domtool.creatediv("messgetext", "tempmessagetextID"+post_data_id);
  messgetext.classList.add("messgetextpresend");
  messgetext.classList.add("msguser");
  messgetext.innerHTML = mess;
  messgetextbean.appendChild(messgetext);
  userchatboxmessagae.appendChild(messageinfo);
  userchatboxmessagae.appendChild(messgetextbean);
  // messageitem.appendChild(messageitem_icon);
  const checksened = getchecksened(post_data_id);
  messageitem.appendChild(checksened);
  messageitem.appendChild(userchatboxmessagae);
  document.querySelector("#messageboxID"+chatboxid).appendChild(messageitem);
  chbxcontrol.chtbxautoscrolllast(chatboxid);
}

function getchecksened(post_data_id) {
  const checksened = document.createElement("span");
  checksened.className = "hidechecksened";
  checksened.id = "checksenedID" + post_data_id;
  const checksened_stem = document.createElement("checksened_stem");
  checksened_stem.className = "checksened_stem";
  const checksened_kick = document.createElement("checksened_kick");
  checksened_kick.className = "checksened_kick";
  checksened.appendChild(checksened_stem);
  checksened.appendChild(checksened_kick);
  return checksened;
}

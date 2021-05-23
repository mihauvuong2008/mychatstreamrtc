let APPNOTICE;
let CONTACTMODE;
let NOTIFYTYPE;
let contact;
let _chatService;
let serverchatcmnc;

export const init = function (myapp, _contact, service, svrCom) {

  APPNOTICE = myapp.APP.NOTICE;
  CONTACTMODE = myapp.CONTACTMODE;
  NOTIFYTYPE = myapp.NOTIFYTYPE;
  contact = _contact;
  _chatService = service._chatService;
  serverchatcmnc = svrCom.serverchatcmnc;
  initMenu();
}

function initMenu(){
  const menunotify = document.getElementById("menunotifyID");
  const showaccountnotify = document.getElementById("showaccountnotifyID");
  menunotify.addEventListener('click', function() {
    _chatService.userhaveaAction();
    showNotice();
  });

  const accountnotify = document.getElementById("accountnotifyID");
  accountnotify.addEventListener('mouseleave', function () {
    const accountnotify = document.getElementById("accountnotifyID");
    showaccountnotify.className="hideaccountnotify";
  });

  const menucontact = document.getElementById("menucontactID");
  menucontact.addEventListener('click',function() {
    contact.initContact(CONTACTMODE.SELECT);
  });
}

function showNotice() {
  new Promise(function(resolve, reject) {
    const accountnotify = document.getElementById("accountnotifyID");
    accountnotify.innerHTML="";
    let haveNotice = false;

    for (var item of APPNOTICE.invitechatboxNotify) {
      addAccountnotify(NOTIFYTYPE.TYPEADDGROUP, item);
      haveNotice = true;
    }
    for (var item of APPNOTICE.makerelateRequest) {
      addAccountnotify(NOTIFYTYPE.TYPEADDFRIEND, item);
      haveNotice = true;
    }
    let unread = 0;
    for (var item of APPNOTICE.chatboxUnreadmessage) {
      unread += item.totalnoticecount;
    }
    if(unread==0)resolve();
    haveNotice = true;
    addAccountnotify(NOTIFYTYPE.TYPEUNREADMESSAGE, {unread});
    resolve();
  }).then(()=>{
    const showaccountnotify = document.getElementById("showaccountnotifyID");
    showaccountnotify.className = "showaccountnotify";
    console.log(showaccountnotify.className);
  });
}

function addAccountnotify(type, item){
  // console.log(item);
  const accountnotify = document.getElementById("accountnotifyID");
  const accountnotifyitem = document.createElement("div");
  accountnotifyitem.classList.add("accountnotifyitem");
  switch (type) {
    case NOTIFYTYPE.TYPEADDFRIEND:
    accountnotifyitem.id = "accountnotifyitemID" + type + item.partnerid;
    break;
    case NOTIFYTYPE.TYPEADDGROUP:
    accountnotifyitem.id = "accountnotifyitemID" + type  + "-" + item.chatboxid + "-" + item.senderid;
    break;
    case NOTIFYTYPE.TYPEUNREADMESSAGE:
    accountnotifyitem.id = "accountnotifyitemID" + type + item.unread;
    break;
  }
  const user = document.createElement("div");
  user.classList.add("user");
  if(item){
    var usericon = document.createElement("div");
    usericon.classList.add("usericon");
    var username = document.createElement("div");
    username.classList.add("username");
    switch (type) {
      case NOTIFYTYPE.TYPEADDFRIEND:
      console.log(type, item);
      username.innerHTML = item.sendrequest.username;
      break;
      case NOTIFYTYPE.TYPEADDGROUP:
      username.innerHTML = item.sender.username;
      break;
    }
  }
  const actionmessage = document.createElement("div");
  actionmessage.classList.add("actionmessage");
  switch (type) {
    case NOTIFYTYPE.TYPEADDFRIEND:
    actionmessage.innerHTML="send friend request to you";
    break;
    case NOTIFYTYPE.TYPEADDGROUP:
    actionmessage.innerHTML="send invite group to you";
    break;
    case NOTIFYTYPE.TYPEUNREADMESSAGE:
    actionmessage.innerHTML="you have: " + item.unread + " unread message";
    break;
  }
  const confirm = document.createElement("div");
  confirm.classList.add("confirm");
  confirm.classList.add("respone");
  switch (type) {
    case NOTIFYTYPE.TYPEADDFRIEND:
    confirm.id = "confirmID" + type + item.partnerid;
    confirm.setAttribute("type", type);
    confirm.setAttribute("partnerid", item.partnerid);
    break;
    case NOTIFYTYPE.TYPEADDGROUP:
    confirm.id = "confirmID" + type + "-" + item.chatboxid + "-" + item.senderid;
    confirm.setAttribute("type", type);
    confirm.setAttribute("chatboxid", item.chatboxid);
    confirm.setAttribute("senderid", item.senderid);
    break;
    case NOTIFYTYPE.TYPEUNREADMESSAGE:
    confirm.id = "confirmID" + type + item.unread;
    confirm.setAttribute("type", type);
    confirm.setAttribute("unread", item.unread);
    break;
  }
  confirm.innerHTML = "confirm";
  confirm.addEventListener('click', function(){
    _chatService.userhaveaAction();
    const type =  this.getAttribute("type");
    var accept = null;
    switch (type) {
      case NOTIFYTYPE.TYPEADDFRIEND:;
      const userid = this.getAttribute("partnerid");
      accept = serverchatcmnc.relateAccept(userid);
      break;
      case NOTIFYTYPE.TYPEADDGROUP:
      const chatboxid = this.getAttribute("chatboxid");
      const senderid = this.getAttribute("senderid");
      accept = serverchatcmnc.invitegroupAccept(senderid, chatboxid);// userid todo
      break;
      default:
    }
    if(!accept) return;
    const thisid = this.id.substring(9);
    const el = document.getElementById('accountnotifyitemID'+ thisid);
    el.remove();
  });
  const discare = document.createElement("div");
  discare.classList.add("discare");
  discare.classList.add("respone");
  switch (type) {
    case NOTIFYTYPE.TYPEADDFRIEND:
    discare.id = "discareID" + type + item.partnerid;
    discare.setAttribute("type", type);
    discare.setAttribute("partnerid", item.partnerid);
    break;
    case NOTIFYTYPE.TYPEADDGROUP:
    discare.id = "confirmID" + type + "-" + item.chatboxid + "-" + item.senderid;
    discare.setAttribute("type", type);
    discare.setAttribute("chatboxid", item.chatboxid);
    discare.setAttribute("senderid", item.senderid);
    break;
    case NOTIFYTYPE.TYPEUNREADMESSAGE:
    discare.id = "discareID" + type + item.unread;
    discare.setAttribute("type", type);
    discare.setAttribute("unread", item.unread);
    break;
  }
  discare.innerHTML = "discare";
  discare.addEventListener('click',function() {
    _chatService.userhaveaAction();
    const type = this.getAttribute("type");
    var accept = false;
    switch (type) {
      case NOTIFYTYPE.TYPEADDFRIEND:
      const userid = this.getAttribute("partnerid");
      accept = serverchatcmnc.relateRefuse(userid);
      break;
      case NOTIFYTYPE.TYPEADDGROUP:
      const chatboxid = this.getAttribute("chatboxid");
      accept = serverchatcmnc.invitegroupRefuse(chatboxid);
      if(!accept) return;
      break;
      default:
    }
    const thisid = this.id.substring(9);
    const el = document.getElementById('accountnotifyitemID'+ thisid);
    el.remove();
  });
  if(item){
    user.appendChild(usericon);
    user.appendChild(username);
  }
  accountnotifyitem.appendChild(user);
  accountnotifyitem.appendChild(actionmessage);
  switch (type) {
    case NOTIFYTYPE.TYPEUNREADMESSAGE: // do nothing
    break;
    default:
    accountnotifyitem.appendChild(confirm);
    accountnotifyitem.appendChild(discare);
  }
  accountnotify.appendChild(accountnotifyitem);
}

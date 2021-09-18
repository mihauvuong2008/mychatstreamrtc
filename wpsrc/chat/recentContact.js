const dmt = require('../app/domtl');

let serverchatcmnc;
let _chatService;
let chbxcontrol;
let ACBrecentchatboxdata;
let ACBrecentchatbox;
let APPDATA;
let USERDATA;
let CHATROOMTYPE;

export const init = function (myapp, cbxcntrl, service, svrCom) {
  serverchatcmnc = svrCom.serverchatcmnc;
  _chatService = service._chatService;
  chbxcontrol = cbxcntrl.chbxcontrol;
  ACBrecentchatboxdata = myapp.ACTIVECHATBOX.recentchatbox.data;
  ACBrecentchatbox = myapp.ACTIVECHATBOX.recentchatbox;
  APPDATA = myapp.APP.DATA;
  USERDATA = myapp.USERDATA;
  CHATROOMTYPE = myapp.CHATROOMTYPE;
  initRecentcontact();
}

function initRecentcontact(){
  const recentcontactcookie = getrecentcontacttocookie();
  // check user stay in converstation
  for (const item of (recentcontactcookie||"").split("-")) {
    const recentdata = {chatboxid: parseInt(item), totalnoticecount: 0};
    ACBrecentchatboxdata.push(recentdata);
  }
  drawrecentchatbox(ACBrecentchatbox);
}

function getrecentcontacttocookie(){
  for (var item of document.cookie.split(";")) {
    if(item.indexOf("recentcontact")>= 0)
    return item.split("=")[1];
  }
}

export function saverecentcontacttocookie(recentchatbox){
  var recentcontact = "";
  const makeCookiedata = (item, i) => { if(item.chatboxid) { recentcontact += (item.chatboxid +  ((i == recentchatbox.data.length-1)?"":"-"));}}
  recentchatbox.data.some(makeCookiedata);
  document.cookie = "recentcontact="+recentcontact;//save
}

export async function drawrecentchatbox(recentdata){
  if(!ACBrecentchatbox.hide) return;
  const body = document.getElementById("bodyID");
  for (let item of document.getElementsByClassName("recentchatbox")) { item.remove(); }
  let i = 0;
  for (var rcntchtbx of recentdata.data) {
    const id = rcntchtbx.chatboxid;
    const chatbox = await(serverchatcmnc.getChatboxInfo(id));
    if(!chatbox) continue;
    if(!chatbox.chatboxid) {continue};
    (document.getElementById("recentchatboxID" + id)||[]).remove();
    // continue;
    const recentchatbox = dmt.domtool.creatediv("recentchatbox", "recentchatboxID" + id);
    recentchatbox.setAttribute("chatboxid", id);
    recentchatbox.addEventListener("click",async function() {
      _chatService.userhaveaAction();
      chbxcontrol.showChatbox(this.getAttribute("chatboxid"));
    });
    recentchatbox.addEventListener("mousemove",function() {
      const thisid = this.getAttribute("chatboxid");
      const recentchatboxlabel = document.getElementById("recentchatboxlabelID"+thisid);
      recentchatboxlabel.className = "recentchatboxlabel";
    });

    recentchatbox.addEventListener("mouseout",function() {
      const thisid = this.getAttribute("chatboxid");
      const recentchatboxlabel = document.getElementById("recentchatboxlabelID"+thisid);
      recentchatboxlabel.className = "hiderecentchatboxlabel";
    });
    recentchatbox.style.right = (i * 50+3)+"px";
    recentchatbox.style.top = 3+"px";

    const recentchatboxlabel = dmt.domtool.creatediv("hiderecentchatboxlabel", "recentchatboxlabelID" + id);
    const pointer = dmt.domtool.creatediv("pointer");
    const recentchatboxname = dmt.domtool.creatediv("recentchatboxname", "recentchatboxnameID" + id);
    recentchatboxname.innerHTML = chatbox.chatboxName;
    const onlinestatus = dmt.domtool.creatediv("onlinestatus", "recentonlinestatusID" + id);
    var online = false;
    const setmemberol = item => {
      if (item.chatboxid==id) {
        (item.members||[]).some(item_ => {
          if (item_.userid!= USERDATA.ID && item_.lastdatetimelogin)
          if(is_Stillonline(item_.lastdatetimelogin)){online = true; return true;}
        });
      }
      return true;
    }
    APPDATA.chatboxlist.some(setmemberol);

    onlinestatus.style.backgroundColor = (online?"#06FF0B":"#cc0000");
    const recentchatboxicon = dmt.domtool.creatediv("recentchatboxicon");
    switch (chatbox.type) {
      case CHATROOMTYPE.TYPEGROUP:
      const table = document.createElement("table");
      table.cellSpacing = "1px";
      table.cellPadding = "0";
      const tbody = document.createElement("tbody");
      const tr1 = document.createElement("tr");
      const td1 = document.createElement("td");
      const td2 = document.createElement("td");
      const tr2 = document.createElement("tr");
      const td3 = document.createElement("td");
      const td4 = document.createElement("td");
      const recentmembericon1 = dmt.domtool.creatediv("recentmembericon");
      const recentmembericon2 = dmt.domtool.creatediv("recentmembericon");
      const recentmembericon3 = dmt.domtool.creatediv("recentmembericon");
      const recentmembericon4 = dmt.domtool.creatediv("recentmembericon");
      td1.appendChild(recentmembericon1);
      td2.appendChild(recentmembericon2);
      td3.appendChild(recentmembericon3);
      td4.appendChild(recentmembericon4);
      tr1.appendChild(td1);
      tr1.appendChild(td2);
      tr2.appendChild(td3);
      tr2.appendChild(td4);
      tbody.appendChild(tr1);
      tbody.appendChild(tr2);
      table.appendChild(tbody);
      recentchatboxicon.appendChild(table);
      break;
      case CHATROOMTYPE.TYPEFRIEND:
      const recentcontacticon = dmt.domtool.creatediv("recentcontacticon");
      recentchatboxicon.appendChild(recentcontacticon);
      break;
    }
    const noticebean = dmt.domtool.creatediv("noticebean");

    const notice =  dmt.domtool.creatediv("recentnotice", "recentnoticeID" +  id);
    notice.classList.add("hidenotice");
    const noticevalue = dmt.domtool.creatediv("noticevalue", "recentnoticevalueID" + id);
    noticevalue.innerHTML = "0";

    const closebean = dmt.domtool.creatediv("closebean");
    const close = dmt.domtool.creatediv("close");
    const closeicon = dmt.domtool.creatediv("closeicon", "closeiconID" + id);
    closeicon.classList.add("hidecloseicon");
    closeicon.innerHTML = "&times;";
    closeicon.addEventListener('click', () =>{
      // remove here
    });
    close.appendChild(closeicon);
    closebean.appendChild(close);

    notice.appendChild(noticevalue);
    noticebean.appendChild(notice);
    recentchatbox.appendChild(noticebean);
    recentchatbox.appendChild(onlinestatus);
    recentchatbox.appendChild(recentchatboxicon);
    recentchatboxlabel.appendChild(pointer);
    recentchatboxlabel.appendChild(recentchatboxname);
    recentchatbox.appendChild(recentchatboxlabel);
    // recentchatbox.appendChild(closebean);
    body.appendChild(recentchatbox);
    i++;
  }
}

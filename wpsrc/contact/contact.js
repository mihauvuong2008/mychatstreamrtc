const dmt = require('../app/domtl');


let CONTACTMODE;
let ACTIVECHATBOX;
let serverchatcmnc;
let _chatService;

export const init = function (myapp,  service, svrCom) {

  CONTACTMODE = myapp.CONTACTMODE;
  ACTIVECHATBOX = myapp.ACTIVECHATBOX;
  serverchatcmnc = svrCom.serverchatcmnc;
  _chatService = service._chatService;
}

export async function initContact(contactmode, callbackFunc) {
  const preInit = document.getElementById("contactID");
  if(preInit)preInit.remove();

  const contact = dmt.domtool.creatediv("contact", "contactID");
  const contactbean = dmt.domtool.creatediv("contactbean");
  const contacttile = dmt.domtool.creatediv("contacttile");
  const contacttitlename = dmt.domtool.creatediv("contacttitlename");
  contacttitlename.classList.add("contacttitlename");
  contacttitlename.classList.add("contacttitleitem");
  contacttitlename.innerHTML = "Contact";

  const contactaccept = dmt.domtool.creatediv("contactaccept");
  contactaccept.classList.add("contacttitleitem");
  contactaccept.innerHTML = "accept";
  contactaccept.addEventListener('click', function () {
    _chatService.userhaveaAction();
    const listItm = document.getElementsByClassName("contactitem_checker");
    const contactlstrslt = [];
    for (var item of listItm) {
      if(item.checked){
        contactlstrslt.push(parseInt(item.getAttribute("imafriend_userid")));
      }
    }
    callbackFunc(contactlstrslt);
    const dispose = document.getElementById("contactID");
    if(dispose)dispose.remove();
  });
  const contactcancel = dmt.domtool.creatediv("contactcancel");
  contactcancel.classList.add("contacttitleitem");
  contactcancel.innerHTML="cancel";
  contactcancel.addEventListener('click', function () {
    const dispose = document.getElementById("contactID");
    if(dispose)dispose.remove();
  });
  switch (contactmode) {
    case CONTACTMODE.SELECT:
    contactaccept.style.visibility="hidden";
    break;
    case CONTACTMODE.CHECKER:
    break;
  }
  const contactlist = getContactlist();
  await loadContactList(contactmode, contactlist);
  contacttile.appendChild(contacttitlename);
  if(contactaccept)
  contacttile.appendChild(contactaccept);
  if(contactcancel)
  contacttile.appendChild(contactcancel);
  contactbean.appendChild(contacttile);
  contactbean.appendChild(contactlist);
  contact.appendChild(contactbean);

  await new Promise(function(resolve, reject) {
    contact.style.animation = "expandwh 0.12s cubic-bezier(0,0, 1, 1)  0.1s both";
    setTimeout(resolve, 200);
  });
  document.getElementById("chatsubpanelID").prepend(contact);
}

function getContactlist() {
  const contactlist = dmt.domtool.creatediv("contactlist", "contactlistID");
  contactlist.addEventListener('wheel', (e) =>{
    if (event.deltaY<0) {
      contactlist.scrollTop -= 12;
      return;
    } else {
      contactlist.scrollTop += 12;
      return;
    }
  });
  return contactlist;
}


let itemToolOver = false;
async function loadContactList(contactmode, contactlist) {
  contactlist.innerHTML="";
  const contctLst = await(serverchatcmnc.getContactList());
  contctLst.forEach( item => {
    const contactitem = dmt.domtool.creatediv("contactitem");
    contactitem.addEventListener('click',async function() {
      if(itemToolOver) return;
      _chatService.userhaveaAction();

      let chatbox = await(serverchatcmnc.getfriendchatbox(item.friendid));
      if(chatbox==null||chatbox.length<=0){
        chatbox = await(serverchatcmnc.createfriendchatbox(item.friendid, item.imafriend.username));
        console.log(chatbox);
        ACTIVECHATBOX.selector.select(chatbox.chatboxid);
        return;
      }
      ACTIVECHATBOX.selector.select(chatbox[0].chatboxid);
    });
    contactitem.addEventListener('dblclick', function (e) {

    });
    const contactavatar = dmt.domtool.creatediv("contactavatar");
    const contactname = dmt.domtool.creatediv("contactname");
    contactname.innerHTML = item.imafriend.username;
    switch (contactmode) {
      case CONTACTMODE.SELECT:
      var contactcallbean = dmt.domtool.creatediv("contactcallbean");
      const contactcall = dmt.domtool.creatediv("contactcall");
      var removebutton = dmt.domtool.creatediv("removebutton", "removebuttonID" +  item.imafriend.userid);
      removebutton.innerHTML="&times;";
      removebutton.setAttribute("imafriend_userid", item.imafriend.userid);
      removebutton.addEventListener('click', async function() {
        _chatService.userhaveaAction();
        const id = parseInt(this.getAttribute("imafriend_userid"));
        const rs = await serverchatcmnc.removeContact(id);
        console.log(rs);
        const contactlist = document.getElementById("contactlistID");
        loadContactList(CONTACTMODE.SELECT, contactlist);
      });
      removebutton.addEventListener('mouseover',()=>{
        itemToolOver = true;
      });
      removebutton.addEventListener('mouseleave',()=>{
        itemToolOver = false;
      });
      contactcallbean.appendChild(contactcall);
      break;
      case CONTACTMODE.CHECKER:
      var contactitemselect = dmt.domtool.creatediv("contactitemselect");
      const contactitem_checker = document.createElement("input");
      contactitem_checker.classList.add("contactitem_checker", "contactitem_checkerID" +  item.imafriend.userid);
      contactitem_checker.type = "checkbox";
      contactitem_checker.setAttribute("imafriend_userid", item.imafriend.userid);
      contactitem_checker.addEventListener('mouseover',()=>{
        itemToolOver = true;
      });
      contactitem_checker.addEventListener('mouseleave',()=>{
        itemToolOver = false;
      });
      contactitemselect.appendChild(contactitem_checker);
      break;
    }

    contactitem.appendChild(contactavatar);
    contactitem.appendChild(contactname);
    if(contactcallbean)
    contactitem.appendChild(contactcallbean);
    if(contactitemselect)
    contactitem.appendChild(contactitemselect);
    if(removebutton)
    contactitem.appendChild(removebutton);
    contactlist.appendChild(contactitem);
  });

}

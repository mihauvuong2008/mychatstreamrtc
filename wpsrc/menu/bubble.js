// const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
const dmt = require('../app/domtl');

let MOUSESTATE;
let USERDATA;
let PUPLESTATE;
let ACBrecentchatbox;
let ACBchatboxStack;
let ACBchatboxStackdata;
let executeAsync;
let sleep;
let serverchatcmnc;
let TOKEN;
let _chatService;

export const init = function (myapp, service, token, svrCom) {

  MOUSESTATE = myapp.MOUSESTATE;
  USERDATA = myapp.USERDATA;
  PUPLESTATE = myapp.PUPLESTATE;
  ACBrecentchatbox = myapp.ACTIVECHATBOX.recentchatbox;
  ACBchatboxStack = myapp.ACTIVECHATBOX.chatboxStack;
  ACBchatboxStackdata = myapp.ACTIVECHATBOX.chatboxStack.data;
  executeAsync = myapp.executeAsync;
  sleep = myapp.sleep;
  serverchatcmnc = svrCom.serverchatcmnc;
  TOKEN = token.TOKEN;
  _chatService = service._chatService;

  initPuplebox();
}

async function initPuplebox(){
  document.getElementById("logout_buttonID").style.display = "";
  document.getElementById("login_buttonID").style.display = "none";
  const pupleuserName = document.getElementById("pupleuserNameID");
  pupleuserName.innerHTML = USERDATA.NAME;
  const puplebox = document.getElementById("pupleboxID");
  const puple = document.getElementById("pupleID");
  puple.addEventListener('click', async () =>{
    if(MOUSESTATE.PRESSANDMOVE)return;
    if(PUPLESTATE.showpuplebox_toolbar){
      executeAsync(function() {
        _chatService.userhaveaAction(true);
      }, 220);
      document.getElementById("toolbarID").className = "toolbar";
    }else {
      document.getElementById("toolbarID").className = "hidetoolbar";
      close_newgroup();
      close_addfriend();
    }
    PUPLESTATE.showpuplebox_toolbar =!PUPLESTATE.showpuplebox_toolbar;
  });

  const addfriend = document.getElementById("addfriendID");
  addfriend.addEventListener('click', async () =>{
    _chatService.userhaveaAction();
    if(MOUSESTATE.PRESSANDMOVE)return;
    return new Promise(async function(resolve, reject) {
      close_newgroup();
      await sleep(50);
      resolve();
    }).then(()=>{show_addfriend();});
  });

  const newfriendtext = document.getElementById("newfriendtextID");
  newfriendtext.addEventListener('keypress', function(event) {
    switch (event.keyCode) {
      case 13:
      break;
      default:
      if(newfriendtext.value.length<50) return;
    }
    event.preventDefault();
  });
  newfriendtext.addEventListener('paste', function(event) {
    if(newfriendtext.value.length>50){newfriendtext.value = newfriendtext.value.substring(0,50);}
  });
  newfriendtext.addEventListener('input', function(event) {
    if(newfriendtext.value.length>50){newfriendtext.value = newfriendtext.value.substring(0,50);}
  });

  const searchbutton = document.getElementById("searchbuttonID");
  searchbutton.addEventListener('click',async function(){
    const newfriendtext = document.getElementById("newfriendtextID");
    const pattern = newfriendtext.value;
    // console.log(pattern);
    if(pattern.localeCompare("")===0) return;
    const userresult = await(serverchatcmnc.findUsername (pattern));
    if(userresult)
    {
      showfriendSreachresult(userresult);
      return;
    }
    showfriendSreachresult({username: "noresult for: "+ pattern});
    newfriendtext.value = "";
  });

  const newgroup = document.getElementById("newgroupID");
  newgroup.addEventListener('click',async () =>{
    if(MOUSESTATE.PRESSANDMOVE) return;
    return new Promise(async function(resolve, reject) {
      close_addfriend();
      await sleep(50);
      resolve();
    }).then(()=>{show_newgroup();});
  });

  const newgrouptext = document.getElementById("newgrouptext");
  newgrouptext.addEventListener('keypress', function(event) {
    switch (event.keyCode) {
      case 13:
      break;
      default:
      if(newgrouptext.value.length<50) return;
    }
    event.preventDefault();
  });
  newgrouptext.addEventListener('paste', function(event) {
    if(newgrouptext.value.length>80){newgrouptext.value = newgrouptext.value.substring(0,80);}
  });
  newgrouptext.addEventListener('input', function(event) {
    if(newgrouptext.value.length>80){newgrouptext.value = newgrouptext.value.substring(0,80);}
  });

  const newgroupCreatebutton = document.getElementById("newgroupCreatebuttonID");
  newgroupCreatebutton.addEventListener('click', async function() {
    _chatService.userhaveaAction();
    const name = newgrouptext.value;
    if(name.localeCompare("")==0)return;
    const newgroup = await(serverchatcmnc.createChatbox(name));
    const chatboxid = newgroup.chatboxid;
    if(!chatboxid||chatboxid<0) return;
    const listfriendID = [];
    const list = document.getElementsByClassName("friendlist_item_checker");
    for (var item of list) {
      if(item.checked){
        const id = item.getAttribute("imafriend_userid");
        console.log("item.checked:" , id);
        listfriendID.push(id);
      }
    }

    listfriendID.forEach(userid => {
      serverchatcmnc.sendgroupRequest(chatboxid, userid);
    });

    newgrouptext.value="";
    close_newgroup();
  });

  const openstory = document.getElementById("openstoryID");
  openstory.addEventListener('click', () =>{
    // if(MOUSESTATE.PRESSANDMOVE)return;
    // if(PUPLESTATE.show_story){
    //   document.getElementById("listlistItmstoryID").className = "liststory";
    // }else {
    //   document.getElementById("liststoryID").className = "hideliststory";
    // }
    // PUPLESTATE.show_story =!PUPLESTATE.show_story;
  });

  const logout = document.getElementById("logout_buttonID");
  logout.addEventListener('click', function(){
    // signout ();
    window.location.replace("/logout?token="+TOKEN.ACCESSTOKEN);
  });

  const hidechatlist = document.getElementById("hidechatlistID");
  hidechatlist.addEventListener('click', function () {
    if (chatlisttoolbarchecker.checked) {
      chatlisttoolbarchecker.checked = false;
      chatlist.classList.add("hide");
      for (let chtbxstkitem of ACBchatboxStackdata) { chtbxstkitem.dispose = true;}
      for (let item of document.getElementsByClassName("recentchatbox")) {item.style.visibility = "hidden";}
      ACBchatboxStack.hide = true;
    } else {
      chatlisttoolbarchecker.checked = true;
      chatlist.classList.remove("hide");
      ACBchatboxStack.hide = false;
    }
  });

  const chatlisttoolbarchecker = document.getElementById("chatlisttoolbarcheckerID");
  const chatlist = document.getElementById("chatlistID");
  chatlisttoolbarchecker.checked = true;
  chatlisttoolbarchecker.addEventListener('change',function() {
    if (this.checked) {
      chatlist.classList.remove("hide");
      ACBchatboxStack.hide = false;
    } else {
      chatlist.classList.add("hide");
      for (let chtbxstkitem of ACBchatboxStackdata) { chtbxstkitem.dispose = true;}
      for (let item of document.getElementsByClassName("recentchatbox")) {item.style.visibility = "hidden";}
      ACBchatboxStack.hide = true;
    }
  });

  const hiderecent = document.getElementById("hiderecentID");
  hiderecent.addEventListener('click', function () {
    // return ;
    if (recenttoolbarchecker.checked) {
      for (let item of document.getElementsByClassName("recentchatbox")) {item.style.visibility = "hidden";}
      recenttoolbarchecker.checked = false;
      ACBrecentchatbox.hide = false;
    } else {
      for (let item of document.getElementsByClassName("recentchatbox")) { item.style.visibility='visible'; }
      recenttoolbarchecker.checked = true;
      ACBrecentchatbox.hide = true;
    }
  });

  const recenttoolbarchecker = document.getElementById("recenttoolbarcheckerID");
  recenttoolbarchecker.checked = true;
  recenttoolbarchecker.disabled = true;
  recenttoolbarchecker.addEventListener('change', function() {
    if (this.checked) {
      for (let item of document.getElementsByClassName("recentchatbox")) { item.style.visibility='visible'; }
      ACBrecentchatbox.hide = true;
    } else {
      for (let item of document.getElementsByClassName("recentchatbox")) {item.style.visibility = "hidden";}
      ACBrecentchatbox.hide = false;
    }
  });
}


function show_newgroup() {
  if(PUPLESTATE.show_newgroup){
    document.getElementById("creategroupboxID").className = "creategroupbox";
    loadfriendlist(true);
  }else {
    document.getElementById("creategroupboxID").className = "hidecreategroupbox";
    loadfriendlist(false);
  }
  PUPLESTATE.show_newgroup =!PUPLESTATE.show_newgroup;
}

async function loadfriendlist(show){
  const listfriend = document.getElementById("creategroup_friendlistID");
  if(!show) {listfriend.innerHTML=""; return;}
  const contactList = await(serverchatcmnc.getContactList());
  // console.log(contactList);
  contactList.forEach(item => {
    const creategroup_friendlist_item = dmt.domtool.creatediv("creategroup_friendlist_item");
    const friendlist_item_name = dmt.domtool.creatediv("friendlist_item_name");
    friendlist_item_name.innerHTML = item.imafriend.username;
    const friendlist_item_checker = document.createElement("input");
    friendlist_item_checker.classList.add("friendlist_item_checker");
    friendlist_item_checker.setAttribute("type", "checkbox");
    friendlist_item_checker.id = "friendlist_item_checkerID" + item.imafriend.userid;
    friendlist_item_checker.setAttribute("imafriend_userid", item.imafriend.userid);
    creategroup_friendlist_item.appendChild(friendlist_item_name);
    creategroup_friendlist_item.appendChild(friendlist_item_checker);
    listfriend.appendChild(creategroup_friendlist_item);
  });
}

async function close_newgroup(){
  if(!PUPLESTATE.show_newgroup){
    document.getElementById("creategroupboxID").className = "hidecreategroupbox";
    PUPLESTATE.show_newgroup =!PUPLESTATE.show_newgroup;
    loadfriendlist(false);
  }
}

function show_addfriend() {
  if(PUPLESTATE.show_addfriend){
    document.getElementById("addfriendboxID").className = "addfriendbox";
  } else {
    document.getElementById("addfriendboxID").className = "hideaddfriendbox";
  }
  PUPLESTATE.show_addfriend =!PUPLESTATE.show_addfriend;
}

function close_addfriend(){
  if(!PUPLESTATE.show_addfriend){
    document.getElementById("addfriendboxID").className = "hideaddfriendbox";
    PUPLESTATE.show_addfriend =!PUPLESTATE.show_addfriend;
  }
  clearsearch();
}

function clearsearch(){
  const addfriendsearchresult = document.getElementById("addfriendsearchresultID");
  addfriendsearchresult.innerHTML="";
  const newfriendtext = document.getElementById("newfriendtextID");
  newfriendtext.value="";
}

function showfriendSreachresult(friend){
  const addfriendsearchresult = document.getElementById("addfriendsearchresultID");
  addfriendsearchresult.innerHTML="";
  const addfriendqueryresult = dmt.domtool.creatediv("addfriendqueryresult", "addfriendqueryresultID");
  addfriendqueryresult.innerHTML="";
  const friendinfo = dmt.domtool.creatediv("friendinfo", "friendinfoID" + friend.userid);
  const friendavatar = dmt.domtool.creatediv("friendavatar");
  const friendname = dmt.domtool.creatediv("friendname", "friendnameID" + friend.userid);
  friendname.innerHTML = friend.username;
  if(friend.userid) {
    var addfriendbutton = document.createElement("div");
    addfriendbutton.classList.add("addfriendbutton");
    addfriendbutton.id = "addfriendbuttonID" + friend.userid;
    addfriendbutton.innerHTML= "+ add friend";
    addfriendbutton.setAttribute("friend_userid", friend.userid);
    addfriendbutton.addEventListener('click', function() {
      _chatService.userhaveaAction();
      const userid = this.getAttribute("friend_userid");
      serverchatcmnc.sendmakerelateRequest(friend.userid);
      close_addfriend();
    });
  }
  const descript = dmt.domtool.creatediv("descript");
  const userdescript = dmt.domtool.creatediv("userdescript");
  descript.appendChild(userdescript);
  friendinfo.appendChild(friendavatar);
  friendinfo.appendChild(friendname);
  if(addfriendbutton)
  friendinfo.appendChild(addfriendbutton);
  addfriendqueryresult.appendChild(friendinfo);
  addfriendqueryresult.appendChild(descript);
  const addfriendbox = document.getElementById("addfriendboxID");
  addfriendsearchresult.appendChild(addfriendqueryresult);
  addfriendbox.appendChild(addfriendsearchresult);
}

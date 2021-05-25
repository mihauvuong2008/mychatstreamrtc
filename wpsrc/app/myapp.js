export const init = async function (svrCom, userid, username) {
  USERDATA.ID = userid;
  USERDATA.NAME = username;
  Object.freeze(USERDATA); //set Enum

  APP.DATA.chatboxlist = await(svrCom.serverchatcmnc.getChatboxlist());
  (APP.DATA.chatboxlist||[]).forEach (async item => {
    item.members = await(svrCom.serverchatcmnc.getchatboxMember(item.chatboxid));
  });
}

export const USERDATA = {};
export const CHATROOMTYPE = {TYPEFRIEND: "friend", TYPEGROUP: "group"};
export const CONTACTMODE = {SELECT: "select", CHECKER: "checker"};
export const TIMEFORGIVE = {ONLINE: 15000, CONVERSATION: 720000};
export const CHATBOXSTATE = {MAXIMIZE: 2, MINIMIZE: 0, NORMAL: 1};
export const NOTIFYTYPE = {TYPEADDFRIEND: "addfriend", TYPEADDGROUP: "addgroup", TYPEUNREADMESSAGE: "unreadmessages"};
export const MOUSESTATE = {LEFTMOUSEBUTTONONLYDOWN: false, PRESSANDMOVE: false};
export const UPDATER = {// sevice delay
  neweventrate: {timeoutid: 0, delay: 3000, fullpower: 3000, limittocldn: 380, cldnrate: 20, cldnstep: 300, cldndelay: 1200},
  srvrcchrate: {timeoutid: 0, delay: 3000, fullpower: 3000, limittocldn: 380, cldnrate: 20, cldnstep: 300, cldndelay: 1200},
  brnsrcchrate: {timeoutid: 0, delay: 1000, fullpower: 1000, limittocldn: 280, cldnrate: 10,cldnstep: 100, cldndelay: 1200},
  olnstatusrate: {timeoutid: 0, delay: 5000},
  beatrate: {timeoutid: 0, delay: 1800},
  cnfrate: {timeoutid: 0, delay: 1200},
  useractionrate: {timeoutid: 0, delay: 220},
  ISWAKEDUP: false,// wakeup
  WAKEDUPDONE: false,// wakeup
  dpslp: 40,
}

export const APP = {
  DATA: {
    inited: false,
    chatboxlist:[],
  },
  NOTICE: {chatboxUnreadmessage : [], makerelateRequest: [], invitechatboxNotify: []}
};

export const ACTIVECHATBOX = {
  selector: {
    openlist:[],
    last: new Date(),
    isreadytoshow: function () {
      if(new Date() - this.last > 500) {
        this.last = new Date(); return true;
      }
      return false;
    },
    select: function(chatboxid) {
      this.openlist.push(chatboxid);
      for (var i = 0, len = this.openlist.length; i < len; i++) {
        if (i< ACTIVECHATBOX.chatboxStack.maxWindows) continue;
        this.openlist.remove(this.openlist[0]);
      }
    },
  },

  chatboxStack: {maxWindows: 3, data:[]},
  recentchatbox: {hide: true, maxRecent: parseInt(window.innerWidth/150), data:[]}
};

export const PUPLESTATE = {showpuplebox_toolbar: true, show_addfriend: true, show_newgroup: true, show_story: true};
export const TOUCH = {touchme: false, havechange: {value: false, last: false}, VOTEUPDATE: {updaterTotalVote: 0, newevent : {ticket: 1}, servercache: {ticket: 1}, brownsercache: {ticket: 1}}};

Object.freeze(NOTIFYTYPE); //set Enum
Object.freeze(CHATBOXSTATE); //set Enum
Object.freeze(CHATROOMTYPE); //set Enum
Object.freeze(TIMEFORGIVE); //set Enum
Object.freeze(CONTACTMODE); //set Enum

export function getDateString(d){
  const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
  const mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(d);
  const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
  var hh = new Intl.DateTimeFormat('en', { hour: '2-digit', hour12: false }).format(d);
  const mm = new Intl.DateTimeFormat('en', { minute: '2-digit' }).format(d);
  const ss = new Intl.DateTimeFormat('en', { second: '2-digit' }).format(d);
  if (parseInt(hh)>23) { hh = "00"; }
  return `${ye}-${mo}-${da} ${hh}:${mm}:${ss}`;
}

Array.prototype.remove = function() {
  var what, a = arguments, L = a.length, ax;
  while (L && this.length) {
    what = a[--L];
    while ((ax = this.indexOf(what))!== -1) {
      this.splice(ax, 1);
    }
  }
  return this;
};

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function executeAsync(func, delay) {
  setTimeout(func, delay);
}

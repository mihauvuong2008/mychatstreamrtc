let UPDATER;
let TIMEFORGIVE;
let VOTEUPDATE;
let sleep;

export const init = function (myapp) {
  UPDATER = myapp.UPDATER;
  VOTEUPDATE = myapp.TOUCH.VOTEUPDATE;
  TIMEFORGIVE = myapp.TIMEFORGIVE;
  sleep = myapp.sleep;
}

export const serviceTool = {

  cooldownandfeedback: {

    delaycooldown: async function (updaterate) {
      updaterate.delay += 1;
      if (updaterate.delay < updaterate.fullpower)
      for (var i = 0;i < updaterate.cldnrate;i++) {
        await sleep(updaterate.cldndelay);
        updaterate.delay += updaterate.cldnstep;
        if (updaterate.delay >= updaterate.fullpower) break;
      }
      updaterate.delay = updaterate.fullpower;//ms
    },

    voteUpdateTouch: function(ticket){// SERVICE WILL VOTE WHEN delaycooldown TO UPDATE TOUCH
      if(ticket.ticket==0) return;
      VOTEUPDATE.updaterTotalVote +=ticket.ticket;
      ticket.ticket = 0;
      // console.log("voteUpdateTouch");
    },

    brownsercachecnf: function () {
      if(VOTEUPDATE.updaterTotalVote < 3) {// we still vote
        //PREPARE END WAKE (SLEEP)
        if(UPDATER.brnsrcchrate.delay >= UPDATER.brnsrcchrate.fullpower)
        if(VOTEUPDATE.brownsercache.ticket > 0)
        if(VOTEUPDATE.updaterTotalVote >= 2) // i'm later //brownsercache vote after get data from server:
        this.voteUpdateTouch(VOTEUPDATE.brownsercache);
      }//END WAKE
      // cooldown
      if (UPDATER.brnsrcchrate.delay > UPDATER.brnsrcchrate.limittocldn)return ;
      this.delaycooldown (UPDATER.brnsrcchrate); // do delaycooldown
    },

    servercachecnf: function () {
      if(VOTEUPDATE.updaterTotalVote < 3){ // we still vote
        if(VOTEUPDATE.servercache.ticket>0)
        if(UPDATER.srvrcchrate.delay >= UPDATER.srvrcchrate.fullpower)
        this.voteUpdateTouch(VOTEUPDATE.servercache);
      } // END WAKE
      //delaycooldown
      if (UPDATER.srvrcchrate.delay > UPDATER.srvrcchrate.limittocldn)return ;
      this.delaycooldown (UPDATER.srvrcchrate);
    },

    neweventcnf: function () {
      if(VOTEUPDATE.updaterTotalVote < 3) {// we still wake
        if(VOTEUPDATE.newevent.ticket>0)
        if(UPDATER.neweventrate.delay >= UPDATER.neweventrate.fullpower)
        this.voteUpdateTouch(VOTEUPDATE.newevent);
      }// END WAKE
      //delaycooldown
      if (UPDATER.neweventrate.delay > UPDATER.neweventrate.limittocldn)return ;
      this.delaycooldown (UPDATER.neweventrate);
    },
  },

  neweventraterefresh: function functionName() {
    return new Promise(function(resolve, reject) {
      UPDATER.neweventrate.delay = UPDATER.neweventrate.limittocldn;//updated now
      resolve();
    });
  },

  srvrcchraterefresh:function functionName() {
    return new Promise(function(resolve, reject) {
      UPDATER.srvrcchrate.delay = UPDATER.srvrcchrate.limittocldn;//updated now
      resolve();
    });
  },

  brnsrcchraterefresh:function functionName() {
    return new Promise(function(resolve, reject) {
      UPDATER.brnsrcchrate.delay = UPDATER.brnsrcchrate.limittocldn;//updated now
      resolve();
    });
  },

  clearUpdater: function () {
    clearTimeout(UPDATER.neweventrate.timeoutid);
    clearTimeout(UPDATER.srvrcchrate.timeoutid);
    clearTimeout(UPDATER.brnsrcchrate.timeoutid);
    clearTimeout(UPDATER.olnstatusrate.timeoutid);
    clearTimeout(UPDATER.beatrate.timeoutid);
    clearTimeout(UPDATER.cnfrate.timeoutid);
    clearTimeout(UPDATER.useractionrate.timeoutid);
  },

  resetTicket: function () {
    VOTEUPDATE.updaterTotalVote = 0;
    VOTEUPDATE.newevent.ticket = 1;
    VOTEUPDATE.servercache.ticket = 1;
    VOTEUPDATE.brownsercache.ticket = 1;
  },

  resetDelay: function () {
    UPDATER.neweventrate.delay = UPDATER.neweventrate.limittocldn;
    UPDATER.srvrcchrate.delay = UPDATER.srvrcchrate.limittocldn;
    UPDATER.brnsrcchrate.delay = UPDATER.brnsrcchrate.limittocldn;
  },

  serviceIsDeepsleep: function (){
    if (UPDATER.neweventrate.delay>UPDATER.neweventrate.fullpower) return true;
    if (UPDATER.srvrcchrate.delay>UPDATER.srvrcchrate.fullpower) return true;
    if (UPDATER.brnsrcchrate.delay>UPDATER.brnsrcchrate.fullpower) return true;
    return false;
  },

  serviceIsWakingup: function (){
    if (UPDATER.neweventrate.delay<UPDATER.neweventrate.fullpower) return true;
    if (UPDATER.srvrcchrate.delay<UPDATER.srvrcchrate.fullpower) return true;
    if (UPDATER.brnsrcchrate.delay<UPDATER.brnsrcchrate.fullpower) return true;
    return false;
  },

  Deepsleep: function(){
    this.count = 0;
    this.gotoDeepsleep = function () {
      console.log("going to deepsleep...");
      UPDATER.neweventrate.delay = 100000;
      UPDATER.srvrcchrate.delay = 100000;
      UPDATER.brnsrcchrate.delay = 100000;
    }
  },

  is_liveconversation: function (conversation) {
    if ((new Date () - new Date (conversation.endAt)) < TIMEFORGIVE.CONVERSATION) return true;
    return false;
  },

  is_Stillonline: function (date) {
    if (!date) return false;
    if ((new Date () - new Date (date)) > TIMEFORGIVE.ONLINE) return false;
    return true;
  }
}

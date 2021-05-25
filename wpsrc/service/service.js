let chatsvctsk;
let teamvwtask;
let serviceTool;
let sleep;
let UPDATER;
let APPDATA;

export const init = function (myapp, chsvtsk, tmvwtsk, srvcetool) {

  sleep = myapp.sleep;
  chatsvctsk = chsvtsk.chatsvctsk;
  teamvwtask = tmvwtsk.teamvwtask;
  serviceTool = srvcetool.serviceTool;
  UPDATER = myapp.UPDATER;
  APPDATA = myapp.APP.DATA;
  _chatService.startchatService();
}

class chatService {

  constructor () {
    this.isstart = false;
    this.dpsleep;
  }

  startchatService() {
    this.dpsleep = new serviceTool.Deepsleep();
    this.isstart = true;
    this.initService();
    this.startUpdater();
  }

  wakeupService() {
    new Promise(function(resolve, reject) {
      resolve(chatService.prototype.clearService()&&chatService.prototype.initService());
    }).then((result)=>{
      if (!result)return;
      console.log("service wakeup", result);
      this.startUpdater(true);
    });
  }

  initService(){
    serviceTool.resetTicket();
    serviceTool.resetDelay();
    return true;
  }

  clearService(){
    serviceTool.clearUpdater();
    return true;
  }

  async startUpdater(wakeup) {
    this.useraction();
    if (wakeup) await sleep(200);
    this.cnf();
    if (wakeup) await sleep(200);
    this.beat();
    if (wakeup) await sleep(200);
    this.onlinestatus();
    if (wakeup) await sleep(200);
    this.newevent();
    if (wakeup) await sleep(200);
    this.servercache();
    if (wakeup) await sleep(200);
    this.brownsercache();
    if (wakeup) await sleep(200);
  }

  useraction(){
    UPDATER.useractionrate.timeoutid = setInterval(async ()=> {

      chatsvctsk.showchatbox();
      chatsvctsk.closechatbox();
      chatsvctsk.removechatbox();
    }, UPDATER.useractionrate.delay);
  }

  cnf() {
    // cooldown and feedback
    UPDATER.cnfrate.timeoutid = setInterval(async ()=> {
      serviceTool.cooldownandfeedback.neweventcnf();
      serviceTool.cooldownandfeedback.servercachecnf();
      serviceTool.cooldownandfeedback.brownsercachecnf();
    }, UPDATER.cnfrate.delay);
  }

  /**
  *
  *
  * // SERVICE BEAT (SERVICE)
  * wakeup Service
  * say to server i still online
  * say to server i still on stream
  * get is touched
  * feedback touch
  *
  */
  beat() {
    UPDATER.beatrate.timeoutid = setInterval(async () => {
      try {
        //user stream
        teamvwtask.userisslivetream();

        // user still online
        chatsvctsk.userstillonline();


        chatsvctsk.userstilllivestream();

        // update Touch:
        chatsvctsk.gettouch();

        // wakeup And deep sleep service
        chatsvctsk.wakeup(this);

        //feedback touch
        chatsvctsk.feedback(this);

        // wakeup And deep sleep service
        chatsvctsk.deepslp(this);

        //refresh chat list
        chatsvctsk.updatechatboxlistdata();

        //update chat box data
        chatsvctsk.updatechatboxstack();

        //update new conversation: (time out 1s)
        chatsvctsk.updateconversation();


      } catch (e) {
        console.log(e);
      }

      // console.log(TOUCH, myapp .TOUCH.VOTEUPDATE, UPDATERRATE);
    }, UPDATER.beatrate.delay);
  }

  /**
  *
  * //KEEP APP ONLINE (SERVICE)
  *
  * token extend:
  * updatr chtabox mem online state:
  */

  onlinestatus() {
    UPDATER.olnstatusrate.timeoutid = setInterval( async ()=>{
      try {
        //tokenExtend
        chatsvctsk.tokenExtend();

        //online state:

        //update chtbxlist active
        chatsvctsk.updtchtbxlistactivestt();

        //update chtbxlist
        chatsvctsk.updtchtbxlistonlinestt();

        //update recent
        chatsvctsk.updtrecentchtbxonlinestt();

        //update member
        chatsvctsk.updtchtbxmemberonlinestt();


      } catch (e) {
        console.log(e);
      }

    }, UPDATER.olnstatusrate.delay);
  }

  /**
  *
  * // GET NEW EVENT (SERVICE)
  * wakeup service. get new event. vote update touch, refresh tikect, refresh touch
  */
  async newevent () {
    while (true) {
      try {
        // event
        chatsvctsk.getmakerelateevent();

        // event
        chatsvctsk.getinvitechatboxevent();

        // event
        chatsvctsk.getchatnotievent();



        // refresh
        chatsvctsk.chatlistrefresh();


        chatsvctsk.newchatlistitem();


        chatsvctsk.clearchatlistitem();


        chatsvctsk.chatboxrefresh();


        chatsvctsk.chatboxclean();



        chatsvctsk.refreshmsgreceivecache();


        chatsvctsk.refreshmmfreceivecache();


        chatsvctsk.refreshcbsendingcache();

      } catch (e) {
        console.log(e);
      }

      //service delay
      await new Promise(resolve => {UPDATER.neweventrate.timeoutid = setTimeout(resolve, UPDATER.neweventrate.delay)});
    }
  } /** //END newevent */

  /**
  *
  * //LOAD DATA FROM SERVER AND SETUP (SERVICE)
  * load data from server to cache:
  */

  async servercache () {

    while (true){
      try {

        //load data from server to cache:
        chatsvctsk.getchatdatafromserver();


        chatsvctsk.getstreamdatafromserver();


        chatsvctsk.clearConversation();

        // item notify
        chatsvctsk.setchatboxlistnotice();

        // item notify
        chatsvctsk.setrecentnotic();


      } catch (e) {
        console.log(e);
      }

      // service delay
      await new Promise(resolve => {UPDATER.srvrcchrate.timeoutid = setTimeout(resolve, UPDATER.srvrcchrate.delay)});
    }
  } /** // END servercache */

  /**
  *
  * //EXCUTE SETUPED CACHE DATA TO VIEW ELEMENT. SEND CHATDATA FROM CACHE TO SERVER (SERVICE)
  * update browsers from cache:
  * send and set readed chat data; update browsers - send message
  */
  async brownsercache() {
    while (true) {
      try {

        chatsvctsk.setnewconversation();
        //
        // //send and set readed chat data; update browsers - send message
        chatsvctsk.sendmessage();
        //
        //
        chatsvctsk.updatemessagesended();
        //
        // //send and set readed chat data; update browsers - send message
        chatsvctsk.setmessagereaded();
        //
        //
        chatsvctsk.setseenmessage();


        chatsvctsk.insert_msgitmrecei_tochbx();


        chatsvctsk.insert_mmfitmrecei_tochbx();


        chatsvctsk.resort_receimsgitem_chtbx();


        chatsvctsk.getloadmoremessage();

        //load more mesg
        chatsvctsk.loadmoremessage();

        //notify brownser element update
        chatsvctsk.showchatlistnotify();

        //notify brownser element update
        chatsvctsk.showrecentnotify();

        //notify brownser element update
        chatsvctsk.showappnotify();

      } catch (e) {
        console.log(e);
      }

      //service delay
      await new Promise(resolve => {UPDATER.brnsrcchrate.timeoutid = setTimeout(resolve, UPDATER.brnsrcchrate.delay)});

    }
  } /** //END brownsercache*/


  userhaveaAction() {

    // wakeup And deep sleep service
    if(serviceTool.serviceIsWakingup()) return ;

    // update Touch:
    chatsvctsk.gettouch();

    this.wakeupService();
  }

} /** // END CHAT SERVICE CLASS DECLARE */

/**
*
* // DECLARE CHAT SERVICE: _chatService : ble ble
*
*/

export const _chatService = new chatService();

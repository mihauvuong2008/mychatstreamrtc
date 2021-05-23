const startScreenshare = require('./openscreenshare');
const Peer = require('simple-peer');

let serverstreamcmnc;
let executeAsync;
let sleep;

export const init = function (myapp, svrCom) {
  executeAsync = myapp.executeAsync;
  sleep = myapp.sleep;
  serverstreamcmnc = svrCom.serverstreamcmnc;
}

export const twcontrol = {
  teamviewscreenonplay: function () {
    const chatboxid = this.getAttribute('chatboxid');
    const userid = this.getAttribute('userid');
    console.log("teamviewcontrolID"+chatboxid+"-"+userid);
    const teamviewcontrol = document.getElementById("teamviewcontrolID"+chatboxid+"-"+userid);
    const s = this.videoHeight / this.videoWidth;
    const screenheight = parseInt(this.offsetWidth * s,10);
    const controlbarheight = teamviewcontrol.offsetHeight;
    const teamviewwindow = document.getElementById("teamviewwindowID"+chatboxid+"-"+userid);
    console.log("aasd:", controlbarheight+screenheight);
    teamviewwindow.style.height = (controlbarheight+screenheight) + "px";
  },

  startCapture: async function (teamviewscreen, chatboxid, userid) {
    let peer;
    let connected = false;
    twcontrol.stopteamview = false;
    await startScreenshare()
    .then(stream => {
      teamviewscreen.srcObject = stream;
      peer = new Peer({ initiator: true, stream: stream });
      peer.on('signal', async data => {
        console.log("chatboxid, userid:", chatboxid, userid);
        const rs = await serverstreamcmnc.sendoffer(chatboxid, JSON.stringify(data));
        console.log("sendoffer:", rs);
      });

      peer.on('connect', () => {
        // say to server we are connected
        console.log('CONNECTED')
        connected = true;
        serverstreamcmnc.offersideconnected(chatboxid);
      })
    })
    .catch(err => console.log(err));

    executeAsync(async function() {
      /****************************************************
      * receive answer
      *****************************************************/
      for (var i = 0; i < 100; i++) {
        await sleep(1000);
        const answers = await serverstreamcmnc.getanswer(chatboxid);
        console.log("answers:", answers);
        if (connected) break;
        if (answers) {
          if (answers.length==0)continue;
          answers.forEach(answer => {
            peer.signal(answer);
            if (connected) return;
          });
        }
      }
    }, 5);
  },

  stopCapture: function (teamviewscreen) {
    let tracks = teamviewscreen.srcObject.getTracks();
    tracks.forEach(track => track.stop());
    teamviewscreen.srcObject = null;
  },

  receivestreamdata: function (teamviewscreen, chatboxid, userid) {
    let peer;
    let connected = false;
    executeAsync(async function() {
      /****************************************************
      * get stream info, receive data
      *****************************************************/
      peer = new Peer();
      peer.on('signal', async data => {
        const rs = await serverstreamcmnc.sendanswer(chatboxid, userid, JSON.stringify(data));
        console.log("sendanswer:", rs);
      });

      peer.on('stream', stream => {
        teamviewscreen.srcObject = stream;
      });

      peer.on('connect', () => {
        // say to server we are connected, and clear
        connected = true;
        console.log('CONNECTED')
        serverstreamcmnc.answersideconnected(chatboxid, userid);
      })

      for (var i = 0; i < 100; i++) {
        await sleep(1000);
        const signdata = await serverstreamcmnc.getoffer(chatboxid, userid);
        console.log("signdata:", signdata);
        if (connected) break;
        signdata.forEach(data => {
          peer.signal(data);
          if (connected) return;
        });
      }
    }, 5);

  },

  teamviewclose: function () {
    twcontrol.stopteamview = true;
    const chatboxid = this.getAttribute('chatboxid');
    const userid = this.getAttribute('userid');
    const teamviewwindowid = "teamviewwindowID"+chatboxid+"-"+userid;
    const teamviewscreenid = "teamviewscreenID"+chatboxid+"-"+userid;
    const teamviewwindow = document.getElementById(teamviewwindowid);
    const teamviewscreen = document.getElementById(teamviewscreenid);
    if (teamviewscreen.srcObject){
      teamviewscreen.srcObject.getTracks().forEach(track => track.stop());
    }
    teamviewscreen.srcObject = null;
    teamviewwindow.remove();
    teamviewscreen.remove();
  }
}

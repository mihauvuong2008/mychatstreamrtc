const dmt = require('../app/domtl');
let tvwcntrl;
export const init = function (_tvwcntrl) {
  tvwcntrl = _tvwcntrl;
}

export const screensharetool = {

  getshareinterface: function (chatboxid, userid) {

    const teamviewwindow = dmt.domtool.creatediv("teamviewwindow", "teamviewwindowID"+chatboxid+"-"+userid);
    const teamviewcontrolbean = dmt.domtool.creatediv("teamviewcontrolbean");
    const teamviewcontrol = dmt.domtool.creatediv("teamviewcontrol", "teamviewcontrolID"+chatboxid+"-"+userid);
    teamviewcontrol.setAttribute("chatboxid", chatboxid);
    teamviewcontrol.setAttribute("userid", userid);
    const teamviewclose = dmt.domtool.creatediv("teamviewclose", "teamviewcloseID"+chatboxid+"-"+userid);
    teamviewclose.classList.add("teamviewcontrolitem");
    teamviewclose.setAttribute('chatboxid', chatboxid);
    teamviewclose.setAttribute('userid', userid);
    teamviewclose.addEventListener('click', tvwcntrl.twcontrol.teamviewclose);

    teamviewclose.innerHTML = "close";
    const teamviewmaximize = dmt.domtool.creatediv("teamviewmaximize", "teamviewmaximizeID"+chatboxid+"-"+userid);
    teamviewmaximize.innerHTML = "max";
    teamviewmaximize.classList.add("teamviewcontrolitem");
    const teamviewminimize = dmt.domtool.creatediv("teamviewminimize", "teamviewminimizeID"+chatboxid+"-"+userid);
    teamviewminimize.innerHTML = "min";
    teamviewminimize.classList.add("teamviewcontrolitem");
    const teamviewscreenbean = dmt.domtool.creatediv("teamviewscreenbean");
    const teamviewscreen = dmt.domtool.createvideo("teamviewscreen", "teamviewscreenID"+chatboxid+"-"+userid);
    teamviewscreen.autoplay = true;
    teamviewscreen.controls = true;

    const startcapture = dmt.domtool.creatediv("startcapture", "start");
    startcapture.innerHTML = "start";
    startcapture.classList.add("teamviewcontrolitem");
    startcapture.setAttribute("chatboxid", chatboxid);
    startcapture.setAttribute("userid", userid);
    startcapture.addEventListener("click", function(evt) {
      const chatboxid = this.getAttribute("chatboxid");
      const userid = this.getAttribute("userid");
      const teamviewscreen = document.getElementById("teamviewscreenID"+chatboxid+"-"+userid);
      tvwcntrl.twcontrol.startCapture(teamviewscreen, chatboxid, userid);
    }, false);

    const stopcapture = dmt.domtool.creatediv("stopcapture", "stop");
    stopcapture.innerHTML = "stop";
    stopcapture.classList.add("teamviewcontrolitem");
    stopcapture.setAttribute("chatboxid", chatboxid);
    stopcapture.setAttribute("userid", userid);
    stopcapture.addEventListener("click", function(evt) {
      const chatboxid = this.getAttribute("chatboxid");
      const userid = this.getAttribute("userid");
      const teamviewscreen = document.getElementById("teamviewscreenID"+chatboxid+"-"+userid);
      tvwcntrl.twcontrol.stopCapture(teamviewscreen);
    }, false);

    teamviewscreenbean.appendChild(teamviewscreen);
    teamviewcontrol.appendChild(startcapture);
    teamviewcontrol.appendChild(stopcapture);
    teamviewcontrol.appendChild(teamviewminimize);
    teamviewcontrol.appendChild(teamviewmaximize);
    teamviewcontrol.appendChild(teamviewclose);
    teamviewcontrolbean.appendChild(teamviewcontrol);
    teamviewwindow.appendChild(teamviewcontrolbean);
    teamviewwindow.appendChild(teamviewscreenbean);
    document.body.prepend(teamviewwindow);
  },

  getreceivedinterface: function (chatboxid, userid) {

    const teamviewwindow = dmt.domtool.creatediv("teamviewwindow", "teamviewwindowID"+chatboxid+"-"+userid);
    const teamviewcontrolbean = dmt.domtool.creatediv("teamviewcontrolbean");
    const teamviewcontrol = dmt.domtool.creatediv("teamviewcontrol", "teamviewcontrolID"+chatboxid+"-"+userid);
    teamviewcontrol.setAttribute("chatboxid", chatboxid);
    teamviewcontrol.setAttribute("userid", userid);
    const teamviewclose = dmt.domtool.creatediv("teamviewclose", "teamviewcloseID"+chatboxid+"-"+userid);
    teamviewclose.classList.add("teamviewcontrolitem");
    teamviewclose.setAttribute('chatboxid', chatboxid);
    teamviewclose.setAttribute('userid', userid);
    teamviewclose.addEventListener('click', tvwcntrl.twcontrol.teamviewclose);
    teamviewclose.innerHTML = "close";
    const teamviewmaximize = dmt.domtool.creatediv("teamviewmaximize", "teamviewmaximizeID"+chatboxid+"-"+userid);
    teamviewmaximize.innerHTML = "max";
    teamviewmaximize.classList.add("teamviewcontrolitem");
    const teamviewminimize = dmt.domtool.creatediv("teamviewminimize", "teamviewminimizeID"+chatboxid+"-"+userid);
    teamviewminimize.innerHTML = "min";
    teamviewminimize.classList.add("teamviewcontrolitem");
    const teamviewscreenbean = dmt.domtool.creatediv("teamviewscreenbean");
    const teamviewscreen = dmt.domtool.createvideo("teamviewscreen", "teamviewscreenID"+chatboxid+"-"+userid);
    teamviewscreen.setAttribute("chatboxid", chatboxid);
    teamviewscreen.setAttribute("userid", userid);
    teamviewscreen.onplay = tvwcntrl.twcontrol.teamviewscreenonplay;
    teamviewscreen.autoplay = true;
    // teamviewscreen.controls = true;

    const receiver = dmt.domtool.creatediv("receiver", "receiver");
    receiver.innerHTML = "receiver";
    receiver.classList.add("teamviewcontrolitem");
    receiver.setAttribute("chatboxid", chatboxid);
    receiver.setAttribute("userid", userid);
    receiver.addEventListener("click", function(evt) {
      const chatboxid = this.getAttribute("chatboxid");
      const userid = this.getAttribute("userid");
      const teamviewscreen = document.getElementById("teamviewscreenID"+chatboxid+"-"+userid);
      tvwcntrl.twcontrol.receivestreamdata(teamviewscreen, chatboxid, userid);
    }, false);


    teamviewscreenbean.appendChild(teamviewscreen);
    teamviewcontrol.appendChild(receiver);
    teamviewcontrol.appendChild(teamviewminimize);
    teamviewcontrol.appendChild(teamviewmaximize);
    teamviewcontrol.appendChild(teamviewclose);
    teamviewcontrolbean.appendChild(teamviewcontrol);
    teamviewwindow.appendChild(teamviewcontrolbean);
    teamviewwindow.appendChild(teamviewscreenbean);
    document.body.prepend(teamviewwindow);
  }
}

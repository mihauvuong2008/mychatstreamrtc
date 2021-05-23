const startScreenshare = require('./openscreenshare');
const playvideo = require('./playvideo');
const Peer = require('simple-peer');

const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const connect = document.getElementById('connect');
const call = document.getElementById('call');
const recei = document.getElementById('recei');
const signalTextOff = document.getElementById("signalTextOff");
const signalTextAns = document.getElementById("signalTextAns");

let localStream;
let remoteStream;


let peer;
call.addEventListener('click', ()=>{
  startScreenshare()
  .then(stream => {
    playvideo(localVideo, stream);
    peer = new Peer({ initiator: true, stream: stream })
    peer.on('signal', data => {
      signalTextOff.value += JSON.stringify(data);
    });
  })
  .catch(err => console.log(err));
});

recei.addEventListener('click', ()=>{
  peer = new Peer();
  peer.on('signal', data => {
    console.log("recei signal");
    signalTextOff.value += JSON.stringify(data);
  });

  peer.on('stream', stream => {
    console.log("onstream", stream);
    playvideo(remoteVideo, stream);
  });
});

connect.addEventListener('click', ()=>{
  const data = JSON.parse(signalTextAns.value);
  peer.signal(data);
  console.log("signal", data);
});

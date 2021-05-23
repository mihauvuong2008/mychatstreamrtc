const playvideo = require('./playvideo');
function startScreenshare() {
const option = { video: true, audio: true, }
  try {
    return navigator.mediaDevices.getDisplayMedia(option);
  } catch (e) {
    console.log(e);
  }
}

module.exports = startScreenshare;

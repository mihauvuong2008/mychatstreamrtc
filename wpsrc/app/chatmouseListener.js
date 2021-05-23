let MOUSESTATE;

export const init = function (myapp) {
  MOUSESTATE = myapp.MOUSESTATE;
  initdocMouseEvt();
  document.addEventListener('mousemove', function(e) {
    if(!MOUSESTATE.LEFTMOUSEBUTTONONLYDOWN) return;

    const currPos = {x: e.clientX, y: e.clientY};
    updateCursor(currPos);

    if(!(catched||chbxcatched||teamviewcatched))
    switch ((document.elementFromPoint(currPos.x, currPos.y)||{className: false}).className) {
      case "puple":
      catched = true;
      box = document.getElementById("pupleboxID");
      boxsizeX = box.clientWidth;
      boxsizeY = box.clientHeight;
      boxmousePointX = 25;// currPos.x - box.getBoundingClientRect().x;
      boxmousePointY = 25;//currPos.y - box.getBoundingClientRect().y;
      endX = document.documentElement.clientWidth - boxsizeX;
      endY = document.documentElement.clientHeight -boxsizeY;
      break;
      case "titlechatbox":
      chbxcatched = true;
      id = document.elementFromPoint(currPos.x, currPos.y).getAttribute("chatboxid");
      box = document.getElementById("chatboxID" + id);
      boxsizeX = box.offsetWidth;
      boxsizeY = box.offsetHeight;
      boxmousePointX = currPos.x - box.getBoundingClientRect().x;
      boxmousePointY = currPos.y - box.getBoundingClientRect().y + 55 /*chatpanel margin*/;
      endX = document.documentElement.clientWidth - boxsizeX;
      endY = document.documentElement.clientHeight - boxsizeY - 55 /*chatpanel margin*/;
      break;
      case "teamviewcontrol":
      teamviewcatched = true;
      const teamviewcontrol = document.elementFromPoint(currPos.x, currPos.y);

      const chatboxid = teamviewcontrol.getAttribute("chatboxid");
      const userid = teamviewcontrol.getAttribute("userid");

      box = document.getElementById("teamviewwindowID" + chatboxid + "-" + userid);
      boxsizeX = box.offsetWidth;
      boxsizeY = box.offsetHeight;
      boxmousePointX = currPos.x - teamviewcontrol.getBoundingClientRect().x;
      boxmousePointY = currPos.y - teamviewcontrol.getBoundingClientRect().y;
      endX = document.documentElement.clientWidth - boxsizeX;
      endY = document.documentElement.clientHeight - boxsizeY;
      break;

    }

    if(ismoving) return;

    switch (true) {
      case (catched||chbxcatched||teamviewcatched):
      moveTo(box, pos);
      break;
    }

  });
}

let endX, endY;
function initdocMouseEvt(){
  document.body.onmousedown = setLeftButtonState_onmousedown;
  document.body.onmousemove = setLeftButtonState_onmousemove;
  document.body.onmouseup = setLeftButtonState_onmouseup;
  endX = document.documentElement.clientWidth - ppboxsize;
  endY = document.documentElement.clientHeight - ppboxsize;
}

function setLeftButtonState_onmousemove(e) {
  MOUSESTATE.LEFTMOUSEBUTTONONLYDOWN = (e.buttons === undefined ? e.which === 1 : e.buttons === 1);
  MOUSESTATE.PRESSANDMOVE = true;
}

function setLeftButtonState_onmousedown(e) {
  MOUSESTATE.LEFTMOUSEBUTTONONLYDOWN = (e.buttons === undefined ? e.which === 1 : e.buttons === 1);
  MOUSESTATE.PRESSANDMOVE = false;
}

function setLeftButtonState_onmouseup(e) {
  MOUSESTATE.LEFTMOUSEBUTTONONLYDOWN = (e.buttons === undefined ? e.which === 1 : e.buttons === 1);
  catched = false;
  chbxcatched = false;
  teamviewcatched = false;
}

const ppboxsize = 50;
const boxcenter = ppboxsize/2;
let boxsizeX = 0, boxsizeY = 0, boxmousePointX = 0, boxmousePointY = 0;
const pos = {posX: 0, posY: 0}
let catched = false, chbxcatched = false, teamviewcatched = false;
let ismoving = false;
let box = {};
let id = 0;

function updateCursor(currPos) {
  ismoving = false;
  pos.posX = currPos.x-boxmousePointX, pos.posY = currPos.y-boxmousePointY;
  if(pos.posX>=0&&pos.posX+boxsizeX<=document.documentElement.clientWidth&&pos.posY>=0&&pos.posY+boxsizeY<=document.documentElement.clientHeight) {
    return;
  }
  if(pos.posX<0) { // duong vien cua viewport...
    pos.posX = 0;
    if(pos.posY <0) {
      pos.posY = 0;
    } else if(pos.posY+boxsizeY>document.documentElement.clientHeight) {
      pos.posY = endY;
    }
    return;
  } else if(pos.posX+boxsizeX>document.documentElement.clientWidth) {
    pos.posX = endX;
  }
  if(pos.posY <0) {
    pos.posY = 0;
  } else if(pos.posY+boxsizeY>document.documentElement.clientHeight) {
    pos.posY = endY;
  }
}

async function moveTo(box, pos) {
  const currX = box.offsetLeft;
  const currY = box.offsetTop;
  const Dx = pos.posX - currX;
  const Dy = pos.posY - currY;
  const basicHandSpeed = 12;
  let Dx_ = 0, Dy_= 0;
  const stepx = Dx/basicHandSpeed, stepy = Dy/basicHandSpeed;
  // box.style.left = (currX+Dx)+"px";
  // box.style.top = (currY+Dy)+"px";
  new Promise(function(resolve, reject) {
    ismoving = true;
    for(let i = 0; i < basicHandSpeed; i++) {
      box.style.left = (currX+(Dx_+=stepx))+"px";
      box.style.top = (currY+(Dy_+=stepy))+"px";
    }
    resolve();
  }).then(async()=>{
    ismoving = false;
  });
}

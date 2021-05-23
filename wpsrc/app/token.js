const xmlHttpRequest = require('./xmlhttp');
let xmlhttp = {};

export const TOKEN = {ACCESSTOKEN: "", REFRESHTOKEN: "", UPDATEDAT: ""};

export const init = function () {
  initToken();
}

export const initToken = function () {
  TOKEN.ACCESSTOKEN = getCookieTOKEN("chattoken");
  TOKEN.REFRESHTOKEN = getCookieTOKEN("chatrefreshtoken");
  xmlHttpRequest(TOKEN, xmlhttp);
  updatetimestamp();
}

async function updatetimestamp() {
  const timestamp = await (getTokenTimestamp());
  TOKEN.UPDATEDAT = timestamp.updatedAt;
}

function getCookieTOKEN(type){
  for (const item of document.cookie.split(";")) {
    const n = item.indexOf(type);
    if(n<0)continue;
    return (item.split("=")[1]);
  }
}

async function saveChatTOKEN(token){
  return new Promise(function(resolve, reject) {
    document.cookie = "chattoken="+token.accessToken;
    document.cookie = "chatrefreshtoken="+token.refreshToken;
    resolve();
  });
}

export function refreshtoken() {// view more in serverUpdater
  return new Promise(async function(resolve, reject) {
    console.log("TOKEN: ", TOKEN);
    const tokenRevice = JSON.parse(getnewChatTOKEN(TOKEN.REFRESHTOKEN));
    resolve(tokenRevice);
  }).then(async(tokenRevice)=>{
    await saveChatTOKEN({accessToken: tokenRevice.accessToken, refreshToken: TOKEN.REFRESHTOKEN});
    await initToken();
    console.log("new TOKEN: ", TOKEN);
  });
}

function getTokenTimestamp(){
  return xmlhttp.Get_XMLHttpRequest("/tokenTimeStamp", "");
}

function getnewChatTOKEN(refreshToken){
  const xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", "/refresh_token", false );
  xmlHttp.setRequestHeader("x-access-token", refreshToken);
  xmlHttp.send( "" );
  return(xmlHttp.responseText);
}

async function initToken(){
  TOKEN.ACCESSTOKEN =  getCookieTOKEN("chattoken");
  TOKEN.REFRESHTOKEN =  getCookieTOKEN("chatrefreshtoken");
  const timestamp = await (serverchatcmnc.getTokenTimestamp());
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

function refreshtoken() {// view more in serverUpdater
  return new Promise(async function(resolve, reject) {
    console.log("TOKEN: ", TOKEN);
    const tokenRevice = JSON.parse(serverchatcmnc.getnewChatTOKEN(TOKEN.REFRESHTOKEN));
    resolve(tokenRevice);
  }).then(async(tokenRevice)=>{
    await saveChatTOKEN({accessToken: tokenRevice.accessToken, refreshToken: TOKEN.REFRESHTOKEN});
    await initToken();
    console.log("new TOKEN: ", TOKEN);
  });
}

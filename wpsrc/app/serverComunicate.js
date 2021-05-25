const xmlHttpRequest = require('./xmlhttp');

let xmlhttp = {};
let token = {};
let Get_XMLHttpRequest;
let Post_XMLHttpRequest;

export const init = function (_token) {
  token = _token;
  xmlHttpRequest(token.TOKEN, xmlhttp);
  Get_XMLHttpRequest = xmlhttp.Get_XMLHttpRequest;
  Post_XMLHttpRequest = xmlhttp.Post_XMLHttpRequest;

}

export const svrCom = {
  serverchatcmnc: {

    signout: function(){
      Get_XMLHttpRequest("/logout?token="+token.TOKEN.ACCESSTOKEN);
    },

    getChatboxlist: function(){
      return Get_XMLHttpRequest("/getChatboxlist", "");
    },

    getchatboxMember: function (chatboxID){
      return Get_XMLHttpRequest("/getchatboxMember?chatboxid="+chatboxID, "");
    },

    getChatboxInfo: function (chatboxID){
      return Get_XMLHttpRequest("/getChatboxInfo?chatboxid="+chatboxID, "");
    },

    getConversationlist: function (chatboxID){
      return Get_XMLHttpRequest("/getConversationlist?chatboxid="+chatboxID, "");
    },

    getconversationData: function (conversationid, unhideUsermindid){
      return Get_XMLHttpRequest("/getconversationData?conversationid="+conversationid+"&unhideUsermindid="+unhideUsermindid, "");
    },

    getLastConversation: function (chatboxid, datetime){ // datetime default undefined
      return Get_XMLHttpRequest("/getLastConversation?chatboxid="+chatboxid+"&datetime="+datetime, "");
    },

    createConversation: function (chatboxid){
      return Get_XMLHttpRequest("createConversation?chatboxid="+chatboxid, "");
    },

    sendMessagetochatbox: async function (conversationid, item){
      const formdata = new FormData();
      formdata.append('conversationid', conversationid);
      formdata.append('message',item.message);
      formdata.append('datetimesend',item.datetimesend);
      return Post_XMLHttpRequest('/postMessagetochatbox', formdata);
    },

    getChatboxUnreadmessage: function (conversationid){
      const rs = Get_XMLHttpRequest("/getChatboxUnreadmessage?conversationid="+conversationid, "")
      return rs;
    },

    setmessageReaded: function (messageID, datetimeRead){
      return Get_XMLHttpRequest("setchatboxMessageReaded?unhideUsermindid="+messageID+"&datetimeRead="+datetimeRead, "");
    },

    getfriendstillonline: function (friendid){
      return Get_XMLHttpRequest("/friendstillonline?friendid="+friendid, "");
    },

    istillonline: function (){
      const xhr = new XMLHttpRequest();
      xhr.open('GET',  "/istillonline", true);
      xhr.timeout = 500; // time in milliseconds
      xhr.setRequestHeader("x-access-token", token.TOKEN.ACCESSTOKEN);
      xhr.send("");
      return xhr.responseText;
    },

    getContactList: function (){
      return Get_XMLHttpRequest("/getcontactList", "");
    },

    findUsername: function (pattern){
      return Get_XMLHttpRequest("/findUsername?pattern="+pattern, "");
    },

    gettouchMe: function (){
      return Get_XMLHttpRequest("/gettouchMe", "");
    },

    settouchMe: function (){
      return Get_XMLHttpRequest("/settouchMe", "");
    },

    sendmakerelateRequest: function (userid){
      return Get_XMLHttpRequest("/sendmakerelateRequest?userid="+userid, "");
    },

    getchatNotify: function (){
      return Get_XMLHttpRequest("getchatNotify", "");
    },

    getMakerelateNotify: function () {
      return Get_XMLHttpRequest("/getMakerelateNotify", "");
    },

    getInvitechatboxNotify: function () {
      return Get_XMLHttpRequest("/getInvitechatboxNotify", "");
    },

    relateAccept: function (userid){
      return Get_XMLHttpRequest("/relateAccept?userid="+userid, "");
    },

    invitegroupAccept: function (userid, chatboxid){
      return Get_XMLHttpRequest("/invitegroupAccept?chatboxid="+chatboxid+"&userid="+userid, "");
    },

    relateRefuse: function (userid){
      return Get_XMLHttpRequest("/relateRefuse?userid="+userid, "");
    },

    invitegroupRefuse: function (userid, chatboxid){
      return Get_XMLHttpRequest("/invitegroupRefuse?chatboxid="+chatboxid+"&userid="+userid, "");
    },

    createChatbox: function (name) {
      return Get_XMLHttpRequest("/createChatbox?name="+name, "");
    },

    sendgroupRequest: function (chatboxid, receiverid){
      return Get_XMLHttpRequest("/groupRequest?chatboxid="+chatboxid+"&receiverid="+receiverid, "");
    },

    removeContact: function (contactid){
      return Get_XMLHttpRequest("/removeContact?contactid="+contactid, "");
    },

    removechatboxMember: function (chatboxid, memberid){
      return Get_XMLHttpRequest("/removechatboxMember?chatboxid="+chatboxid+"&memberid="+memberid, "");
    },

    getfriendchatbox: function (friendid) {
      return Get_XMLHttpRequest("/getfriendchatbox?friendid="+friendid, "");
    },

    createfriendchatbox: function (friendid, username) {
      return Get_XMLHttpRequest("/createfriendchatbox?friendid="+friendid+"&username="+username, "");
    },

    updatememberChatboxname: function (chatboxid, userchatboxname) {
      return Get_XMLHttpRequest("/updatememberChatboxname?chatboxid="+chatboxid+"&userchatboxname="+userchatboxname, "");
    },

    leaveChatbox: function (chatboxid) {
      return Get_XMLHttpRequest("/leaveChatbox?chatboxid="+chatboxid, "");
    },

    dissolateGroup: function (chatboxid) {
      return Get_XMLHttpRequest("/dissolateGroup?chatboxid="+chatboxid, "");
    },

    getSeenlist:function (unhideUsermindid) {
      return Get_XMLHttpRequest("/getSeenlist?unhideUsermindid="+unhideUsermindid, "");
    },

  },

  serverstreamcmnc: {

    jointochatbox: function (chatboxid) {
      return Get_XMLHttpRequest("/Sjointochatbox?chatboxid="+chatboxid, "");
    },

    leaveoutchatbox: function (chatboxid) {
      return Get_XMLHttpRequest("/Sleaveoutchatbox?chatboxid="+chatboxid, "");
    },

    userstilllivestream: function (chatboxid) {
      return Get_XMLHttpRequest("/Suserstilllivestream?chatboxid="+chatboxid, "");
    },

    sendMessagetochatbox: async function (conversationid, item){
      const formdata = new FormData();
      formdata.append('conversationid', conversationid);
      formdata.append('message',item.message);
      formdata.append('datetimesend',item.datetimesend);
      const rs = await Post_XMLHttpRequest('/SpostMessagetochatbox', formdata);
      return rs;
    },

    getChatboxUnreadmessage: function (conversationid){
      return Get_XMLHttpRequest("/SgetChatboxUnreadmessage?conversationid="+conversationid, "")
    },

    requestfileuploadidid: function (chatboxid) {
      return Get_XMLHttpRequest("/Srequestfileuploadidid?chatboxid="+chatboxid, "");
    },

    getactiveChatboxlist: function (chatlist) {
      const formdata = new FormData();
      formdata.append('chatlist', chatlist);
      const rs = Post_XMLHttpRequest('/SgetactiveChatboxlist', formdata);
      return rs;
    },

    getuserstreamchatbox: async function (chatboxid){
      return Get_XMLHttpRequest('/Suserismakemediacall?chatboxid='+chatboxid, "");
    },

    sendoffer: async function (chatboxid, offer){
      const formdata = new FormData();
      formdata.append('chatboxid', chatboxid);
      formdata.append('offer', offer);
      return Post_XMLHttpRequest('/Ssendoffer', formdata);
    },

    getoffer: async function(chatboxid, userid){
      return Get_XMLHttpRequest('/Sgetoffer?chatboxid='+chatboxid+"&userid="+userid, "");
    },

    sendanswer: async function(chatboxid, userid, answer){
      const formdata = new FormData();
      formdata.append('chatboxid', chatboxid);
      formdata.append('userid', userid);
      formdata.append('answer', answer);
      return Post_XMLHttpRequest('/Ssendanswer', formdata);
    },

    getanswer: async function(chatboxid){
      return Get_XMLHttpRequest('/Sgetanswer?chatboxid='+chatboxid, "");
    },

    offersideconnected: async function(chatboxid){
      return Get_XMLHttpRequest('/Soffersideconnected?chatboxid='+chatboxid, "");
    },

    answersideconnected: async function(chatboxid, userid){
      return Get_XMLHttpRequest('/Sanswersideconnected?chatboxid='+chatboxid+"&userid="+userid, "");
    },
  }

};

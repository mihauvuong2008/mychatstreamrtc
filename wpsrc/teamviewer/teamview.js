let scrncapture;
export const init = function (_scrncapture) {
  scrncapture = _scrncapture;
}

export const teamviewtool = {

  teamviewshare: function (chatboxid, userid) {
    scrncapture.screensharetool.getshareinterface(chatboxid, userid);
  },

  teamviewreceive: function (chatboxid, userid) {
    scrncapture.screensharetool.getreceivedinterface(chatboxid, userid);
  }
}

let ACBchatboxStackdata;
let serverstreamcmnc;

export const init = function (myapp, svrCom) {
  ACBchatboxStackdata = myapp.ACTIVECHATBOX.chatboxStack.data;
  serverstreamcmnc = svrCom.serverstreamcmnc;
}

export const teamvwtask = {

  userisslivetream: function () {

    ACBchatboxStackdata.forEach(async chtbxstkitem => {

      const streamlist = await serverstreamcmnc.getuserstreamchatbox(chtbxstkitem.chatboxid);

      const setupisstream = (mem, item_) => {
        if (item_ == mem.userid) return true;
      }

      chtbxstkitem.members.forEach(mem => {
        mem.isstream = (streamlist||[]).some(setupisstream.bind(null, mem));
      });

    });

  },
}

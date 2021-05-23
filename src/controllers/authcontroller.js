const jwtTool = require("../config/jwt/jwtTool");
var exports = module.exports = {}

exports.signup = function(req, res, ) {
  if(req.isAuthenticated()){
    res.render('chatapp', {userid: req.user.userid, username: req.user.username});
  }else {
    res.render('signup');
  }
}

exports.signin = function(req, res) {
  if(req.isAuthenticated()){
    res.render('chatapp', {userid: req.user.userid, username: req.user.username});
  }else {
    res.render('signin');
  }
}

// exports.logout = function(req, res) {
//   req.session.destroy(function(err) {
//     res.redirect('/');
//   });
// }

exports.logout = async function (req, res) {
  const tokenFromClient = req.body.token || req.query.token || req.headers["x-access-token"];
  if (!tokenFromClient) return res.status(401).json({message: 'Unauthorized.',});
  const removetoken = await Database.tokens.destroy({where: {accesstoken: tokenFromClient}});
  if(removetoken < 1) return res.status(401).json({message: 'Unauthorized.',});
  req.session.destroy(function(err) {
    res.writeHead(302, {
      'Location': '/signin',
    });
    res.end();
  });
}

// tslint:disable-next-line:no-console
exports.chatapp = async function (req, res) {
  // Lấy token tu cookie
  let tokenFromClient;
  const getToken = item => {if(item.indexOf("chattoken")>=0){tokenFromClient = item.split("=")[1]; return /*break some*/true;}}
  req.headers.cookie.split(";").some(getToken);

  if (!tokenFromClient) return res.status(403).send({message: 'router.use: No token provided.',});
  // Nếu tồn tại token
  try {
    // Thực hiện giải mã token xem có hợp lệ hay không?
    const decoded = await jwtTool.verifyToken(tokenFromClient, process.env.SECRECT_ACCESS_KEY);
    const userid = decoded.data.userid;
    const sessionid = req.user.userid;
    const username = req.user.username;
    if (userid !== sessionid) return res.status(401).json({message: 'Unauthorized.'});
    return res.render('chatapp', {userid: req.user.userid, username: username});
  } catch (error) {
    req.session.destroy(function(err) {
      res.writeHead(302, {
        'Location': '/signin',
      });
      res.end();
    });
  }
}

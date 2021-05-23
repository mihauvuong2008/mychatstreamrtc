var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const jwtTool = require("../config/jwt/jwtTool");
var exports = module.exports = {};
exports.signup = function (req, res) {
    if (req.isAuthenticated()) {
        res.render('chatapp', { userid: req.user.userid, username: req.user.username });
    }
    else {
        res.render('signup');
    }
};
exports.signin = function (req, res) {
    if (req.isAuthenticated()) {
        res.render('chatapp', { userid: req.user.userid, username: req.user.username });
    }
    else {
        res.render('signin');
    }
};
// exports.logout = function(req, res) {
//   req.session.destroy(function(err) {
//     res.redirect('/');
//   });
// }
exports.logout = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const tokenFromClient = req.body.token || req.query.token || req.headers["x-access-token"];
        if (!tokenFromClient)
            return res.status(401).json({ message: 'Unauthorized.', });
        const removetoken = yield Database.tokens.destroy({ where: { accesstoken: tokenFromClient } });
        if (removetoken < 1)
            return res.status(401).json({ message: 'Unauthorized.', });
        req.session.destroy(function (err) {
            res.writeHead(302, {
                'Location': '/signin',
            });
            res.end();
        });
    });
};
// tslint:disable-next-line:no-console
exports.chatapp = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // Lấy token tu cookie
        let tokenFromClient;
        const getToken = item => { if (item.indexOf("chattoken") >= 0) {
            tokenFromClient = item.split("=")[1];
            return /*break some*/ true;
        } };
        req.headers.cookie.split(";").some(getToken);
        if (!tokenFromClient)
            return res.status(403).send({ message: 'router.use: No token provided.', });
        // Nếu tồn tại token
        try {
            // Thực hiện giải mã token xem có hợp lệ hay không?
            const decoded = yield jwtTool.verifyToken(tokenFromClient, process.env.SECRECT_ACCESS_KEY);
            const userid = decoded.data.userid;
            const sessionid = req.user.userid;
            const username = req.user.username;
            if (userid !== sessionid)
                return res.status(401).json({ message: 'Unauthorized.' });
            return res.render('chatapp', { userid: req.user.userid, username: username });
        }
        catch (error) {
            req.session.destroy(function (err) {
                res.writeHead(302, {
                    'Location': '/signin',
                });
                res.end();
            });
        }
    });
};
//# sourceMappingURL=authcontroller.js.map
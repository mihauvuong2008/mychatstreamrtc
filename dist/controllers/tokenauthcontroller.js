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
const jwt = require("jsonwebtoken");
const databasequery = require('./databasequery');
var exports = module.exports = {};
Database = {};
exports.setupDatabase = function (db) { Database = db; };
exports.generateToken = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userFakeData = { userid: req.user.userid, username: req.user.username };
            //Thực hiện tạo mã Token, [thời gian sống 1 giờ.`);
            const accessToken = yield jwtTool.generateToken(userFakeData, process.env.SECRECT_ACCESS_KEY, process.env.ACCESS_TOKEN_LIFE);
            //Thực hiện tạo mã Refresh Token
            const refreshToken = yield jwtTool.generateToken(userFakeData, process.env.SECRECT_REFRESH_KEY, process.env.REFRESH_TOKEN_LIFE);
            // save to database // Lưu lại 2 mã access & Refresh token, với key chính là cái refreshToken để đảm bảo unique và không sợ hacker sửa đổi dữ liệu truyền lên
            const result = yield Database.tokens.create({ accesstoken: accessToken, refreshtoken: refreshToken, createdAt: new Date(), updatedAt: new Date() });
            // save fail
            if (!result) /*accessToken, refreshToken = 2*/
                return;
            // Gửi Token và Refresh Token về cho client...
            return res.render('accesschatapp', { accessToken: accessToken, refreshToken: refreshToken });
        }
        catch (error) {
            // tslint:disable-next-line:no-console
            console.log("generateToken", error);
            return res.status(500).json(error);
        }
    });
};
exports.refreshToken = function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // User gửi mã refresh token kèm theo trong req
        const refreshTokenFromClient = req.body.token || req.query.token || req.headers["x-access-token"];
        // Nếu như tồn tại refreshToken truyền lên và nằm trong DB
        const count = yield Database.tokens.count({ where: { refreshtoken: refreshTokenFromClient } });
        if (refreshTokenFromClient && count > 0) {
            try {
                // Verify kiểm tra tính hợp lệ của cái refreshToken và lấy dữ liệu giải mã decoded
                const decoded = yield jwtTool.verifyToken(refreshTokenFromClient, process.env.SECRECT_REFRESH_KEY);
                // Thông tin user lúc này các bạn có thể lấy thông qua biến decoded.data
                const userFakeData = decoded.data;
                // debug(`Thực hiện tạo mã Token trong bước gọi refresh Token, [thời gian sống vẫn là 1 giờ.]`);
                const accessToken = yield jwtTool.generateToken(userFakeData, process.env.SECRECT_ACCESS_KEY, process.env.ACCESS_TOKEN_LIFE);
                const update = yield Database.tokens.update({ accesstoken: accessToken, updatedAt: new Date() }, { where: { refreshtoken: refreshTokenFromClient } });
                if (update[0] === 0)
                    return res.status(401).json({ message: 'refresh error', });
                // gửi token mới về cho người dùng
                return res.status(200).json({ accessToken });
            }
            catch (error) {
                // tslint:disable-next-line:no-console
                console.log("refreshToken: ", error);
                // debug(error);
                res.status(403).json({
                    message: 'Invalid refresh token.',
                });
            }
        }
        else {
            // Không tìm thấy token trong request
            return res.status(403).send({
                message: 'refresh-token: No token provided.',
            });
        }
    });
};
exports.middlewareTokenChecker = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        // after setup middleware;
        // Lấy token được gửi lên từ phía client, thông thường tốt nhất là các bạn nên truyền token vào header
        let tokenFromClient = req.body.token || req.query.token || req.headers["x-access-token"];
        if (tokenFromClient) { // Nếu tồn tại token
            try {
                // Thực hiện giải mã token xem có hợp lệ hay không?
                const decoded = yield jwtTool.verifyToken(tokenFromClient, process.env.SECRECT_ACCESS_KEY);
                // Nếu token hợp lệ, lưu thông tin giải mã được vào đối tượng req, dùng cho các xử lý ở phía sau.
                req.jwtDecoded = decoded;
                const userid = decoded.data.userid;
                const sessionid = req.user.userid;
                if (userid !== sessionid)
                    return res.status(401).json({ message: 'Unauthorized.' });
                // Cho phép req đi tiếp sang controller.
                next();
            }
            catch (error) {
                // tslint:disable-next-line:no-console
                console.log("middlewareTokenChecker: ", error);
                // Nếu giải mã gặp lỗi: Không đúng, hết hạn...etc:
                // debug("Error while verify token:", error);
                return res.status(401).json({
                    message: 'Unauthorized.' + error, // for debug
                });
            }
        }
        else {
            // Không tìm thấy token trong request
            return res.status(403).send({
                message: 'No token provided.',
            });
        }
    });
};
//# sourceMappingURL=tokenauthcontroller.js.map
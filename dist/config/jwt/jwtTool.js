const jwt = require("jsonwebtoken");
let generateToken = (user, secretSignature, tokenLife) => {
    return new Promise((resolve, reject) => {
        // Định nghĩa những thông tin của user mà bạn muốn lưu vào token ở đây
        const userData = {
            userid: user.userid,
            username: user.username
        };
        // Thực hiện ký và tạo token
        jwt.sign({ data: userData }, secretSignature, {
            algorithm: "HS256",
            expiresIn: tokenLife,
        }, (error, token) => {
            if (error) {
                return reject(error);
            }
            resolve(token);
        });
    });
};
let verifyToken = (token, secretKey) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secretKey, (error, decoded) => {
            if (error) {
                return reject(error);
            }
            resolve(decoded);
        });
    });
};
let decodeToken = (token) => {
    return new Promise(function (resolve, reject) {
        var decoded = jwt.decode(token, { complete: true });
        resolve(decoded);
    });
    ;
};
module.exports = {
    generateToken: generateToken,
    verifyToken: verifyToken,
    decodeToken: decodeToken
};
//# sourceMappingURL=jwtTool.js.map
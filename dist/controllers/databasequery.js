var exports = module.exports = {};
exports.getchatboxList = function (userid) { return "select c.*, max(cxx.datetimetell) from chatboxs c INNER JOIN memberOfChatboxs m ON m.memberid = '" + userid + "' AND c.chatboxid = m.chatboxid LEFT JOIN (select cx.chatboxid, (s.datetimetell) as datetimetell from saytoConversations s INNER JOIN conversations cv ON s.conversationid = cv.conversationid INNER JOIN chatboxs cx ON cv.chatboxid = cx.chatboxid ORDER BY s.datetimetell ASC) as cxx ON (cxx.chatboxid = c.chatboxid OR cxx.chatboxid is null) GROUP BY c.chatboxid ORDER BY max(cxx.datetimetell) DESC;"; };
exports.getchatboxMember = function (chatboxid) { return "select u.userid, u.username, u.firstName, u.lastName, u.lasttimelogin, m.chatboxuserkey, m.userchatboxname , m.datetimeJoin from users u, memberOfChatboxs m where m.memberid = u.userid AND m.chatboxid = '" + chatboxid + "'"; };
exports.getconversationData = function (conversationid, userid, unhideUsermindid) { return "select * from (select a.unhideUsermindid, a.unhideuserid, a.datetimeUnhide, a.messageData, a.datetimetell, a.type, u.readerid, u.datetimeread FROM (select m.unhideUsermindid, m.unhideuserid, m.datetimeUnhide, m.messageData, m.type, s.datetimetell from messages m, saytoconversations s where s.conversationid = '" + conversationid + "' AND s.unhideUsermindid = m.unhideUsermindid) a LEFT JOIN unreadMessages u ON u.readerid='" + userid + "' AND (u.unhideUsermindid = a.unhideUsermindid OR u.unhideUsermindid is NULL) " + (unhideUsermindid ? ("where a.unhideUsermindid < '" + unhideUsermindid + "'") : "") + " ORDER BY a.unhideUsermindid DESC limit 6) r ORDER BY unhideUsermindid DESC;"; };
exports.getChatboxUnreadmessage = function (conversationid, userid) { return " select m.unhideUsermindid, m.unhideuserid, m.datetimeUnhide, m.messageData, m.type, s.datetimetell, u.readerid, u.datetimeread, u.conversationid from messages m INNER JOIN saytoconversations s ON s.unhideUsermindid = m.unhideUsermindid INNER JOIN unreadMessages u ON u.unhideUsermindid = m.unhideUsermindid where  u.conversationid = '" + conversationid + "' AND u.readerid = '" + userid + "' AND u.datetimeread IS NULL"; };
exports.getchatunreadnotice = function (userid) { return "select COUNT(c.chatboxid) AS totalnoticecount, c.chatboxid, c.type FROM chatboxs c, unreadMessages u, conversations cv WHERE c.chatboxid = cv.chatboxid AND u.conversationid = cv.conversationid AND u.datetimeread is NULL AND u.readerid = '" + userid + "' GROUP BY c.chatboxid"; };
exports.getfriendchatbox = function (friendid, userid) { return "select c.chatboxid, c.chatboxName, c.creatorid, c.datetimeCreate, c.type from chatboxs c INNER JOIN (select chatboxid, userchatboxname, count(chatboxid), m.memberid from memberOfChatboxs m, friendrelates f where (m.memberid = '" + userid + "' OR m.memberid = '" + friendid + "') AND (f.userid = '" + userid + "' AND f.friendid = '" + friendid + "')  group by chatboxid having count(chatboxid) > 1) s ON s.chatboxid = c.chatboxid AND c.type = 'friend';"; };
exports.removefriendchatbox = function (friendid, userid) { return "delete c from chatboxs c INNER JOIN (select m1.chatboxid from (select * from memberOfChatboxs where memberid = '" + userid + "') m1, (select * from memberOfChatboxs where memberid = '" + friendid + "') m2 where m1.chatboxid = m2.chatboxid) q ON c.chatboxid = q.chatboxid and c.type = 'friend';"; };
exports.getlistfirend = function (logindatetime, userid) { return ""; };
exports.getchatboxdata = function (logindatetime, userid) { return ""; };
exports.getuserinfomation = function (logindatetime, userid) { return ""; };
exports.getchatboxinformation = function (logindatetime, userid) { return ""; };
exports.getmemberofchatbox = function (logindatetime, userid) { return ""; };
exports.getaddfriendnotify = function (logindatetime, userid) { return ""; };
exports.getaddgroupnotify = function (logindatetime, userid) { return ""; };
function getDateString(d) {
    const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
    const mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(d);
    const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
    var hh = new Intl.DateTimeFormat('en', { hour: '2-digit', hour12: false }).format(d);
    const mm = new Intl.DateTimeFormat('en', { minute: '2-digit' }).format(d);
    const ss = new Intl.DateTimeFormat('en', { second: '2-digit' }).format(d);
    if (parseInt(hh, 10) > 23) {
        hh = "00";
    }
    return `${ye}-${mo}-${da} ${hh}:${mm}:${ss}`;
}
//# sourceMappingURL=databasequery.js.map
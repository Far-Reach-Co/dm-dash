"use strict";
exports.__esModule = true;
exports.getTableUsers = exports.userLeave = exports.getCurrentUser = exports.userJoin = void 0;
var users = [];
function userJoin(id, username, table) {
    var user = { id: id, username: username, table: table };
    users.push(user);
    return user;
}
exports.userJoin = userJoin;
function getCurrentUser(id) {
    return users.find(function (user) { return user.id === id; });
}
exports.getCurrentUser = getCurrentUser;
function userLeave(id) {
    var index = users.findIndex(function (user) { return user.id === id; });
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
    else
        return null;
}
exports.userLeave = userLeave;
function getTableUsers(table) {
    return users.filter(function (user) { return user.table === table; });
}
exports.getTableUsers = getTableUsers;

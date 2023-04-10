"use strict";
var users = [];
function userJoin(id, username, project) {
    var user = { id: id, username: username, project: project };
    users.push(user);
    return user;
}
function getCurrentUser(id) {
    return users.find(function (user) { return user.id === id; });
}
function userLeave(id) {
    var index = users.findIndex(function (user) { return user.id === id; });
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}
function getProjectUsers(project) {
    return users.filter(function (user) { return user.project === project; });
}
module.exports = {
    userJoin: userJoin,
    getCurrentUser: getCurrentUser,
    userLeave: userLeave,
    getProjectUsers: getProjectUsers
};

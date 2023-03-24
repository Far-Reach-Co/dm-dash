const users = []

// join user to chat
function userJoin(id, username, project) {
  const user = {id, username, project}
  users.push(user)

  return user
}

// get current user
function getCurrentUser(id) {
  return users.find(user => user.id === id)
}

// user leaves chat
function userLeave(id) {
  const index = users.findIndex(user => user.id === id)

  if(index !== -1) {
    return users.splice(index, 1)[0]
  }
}

// get project users
function getProjectUsers(project) {
  return users.filter(user => user.project === project)
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getProjectUsers
}
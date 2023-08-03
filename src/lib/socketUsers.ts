const users: User[] = [];

type User = {
  id: string;
  username: string;
  table: string;
};

// join user to chat
function userJoin(id: string, username: string, table: string) {
  const user: User = { id, username, table };
  users.push(user);

  return user;
}

// get current user
function getCurrentUser(id: string) {
  return users.find((user) => user.id === id);
}

// user leaves chat
function userLeave(id: string) {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  } else return null;
}

// get table users
function getTableUsers(table: string) {
  return users.filter((user) => user.table === table);
}

export { userJoin, getCurrentUser, userLeave, getTableUsers };

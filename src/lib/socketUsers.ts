const users: User[] = [];

type User = {
  id: string;
  username: string;
  campaign: string;
};

// join user to chat
function userJoin(id: string, username: string, campaign: string) {
  const user: User = { id, username, campaign };
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

// get campaign users
function getCampaignUsers(campaign: string) {
  return users.filter((user) => user.campaign === campaign);
}

export { userJoin, getCurrentUser, userLeave, getCampaignUsers };

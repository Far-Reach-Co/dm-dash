const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mail = require("../smtp/index.js");
const {
  getUserByIdQuery,
  getAllUsersQuery,
  getUserByEmailQuery,
  registerUserQuery,
  editUserQuery,
  editUserPasswordQuery,
} = require("../queries/users");
const { addProjectQuery } = require("../queries/projects");

const validLoginLength = "30d";

function generateAccessToken(id, expires) {
  return jwt.sign({ id }, process.env.SECRET_KEY, { expiresIn: expires });
}

function sendResetEmail(user, token) {
  mail.sendMessage({
    user: user,
    title: "Reset Password",
    message: `Visit the following link to reset your password: <a href="http://165.227.88.65/resetpassword.html?token=${token}">Reset Password</a>`,
  });
}

async function verifyUserByToken(token) {
  return jwt.verify(token, process.env.SECRET_KEY, async (err, user) => {
    if (err) return null;

    const userData = await getUserByIdQuery(user.id);

    if (userData.rows.length === 0) return null;

    return userData;
  });
}

async function getAllUsers(req, res, next) {
  try {
    const usersData = await getAllUsersQuery();

    res.send(usersData);
  } catch (err) {
    next(err);
  }
}

async function getUserById(req, res, next) {
  try {
    const userData = await getUserByIdQuery(req.params.id);

    res.send(userData);
  } catch (err) {
    next(err);
  }
}

async function registerUser(req, res, next) {
  try {
    const { email, password } = req.body;
    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = await registerUserQuery({
      email: email.toLowerCase(),
      password: hashedPassword,
    });
    const data = userData.rows[0];

    // create first project for user
    addProjectQuery({ title: "New Project", user_id: data.id });

    // login
    const token = generateAccessToken(data.id, validLoginLength);

    res.status(201).send({ token: token });
  } catch (err) {
    next(err);
  }
}

async function loginUser(req, res, next) {
  try {
    const email = req.body.email.toLowerCase();
    const password = req.body.password;
    let user;

    const userEmailData = await getUserByEmailQuery(email);

    if (userEmailData.rows.length !== 0) {
      user = userEmailData.rows[0];
    } else
      return res
        .status(400)
        .json({ message: "This email account has not been registered" });

    if (user) {
      const validPassword = await bcrypt.compare(password, user.password);
      if (validPassword) {
        const token = generateAccessToken(user.id, validLoginLength);
        res.send({ token: token });
      } else return res.status(400).json({ message: "Invalid Password" });
    }
  } catch (err) {
    next(err);
  }
}

async function verifyJwt(req, res, next) {
  try {
    const token = req.token ? req.token : null;
    if (token) {
      const userData = await verifyUserByToken(token);

      if (!userData)
        return res.status(400).json({ message: "Can't find user by token" });

      res.send(userData.rows[0]);
    } else return res.status(400).json({ message: "No token sent in headers" });
  } catch (err) {
    next(err);
  }
}

async function editUser(req, res, next) {
  try {
    console.log(req.user, req.params)
    if (!req.user) throw { status: 401, message: "Missing Credentials" };
    if (req.user.id != req.params.id) throw { status: 403, message: "Forbidden" };

    const userEditData = await editUserQuery(req.params.id, req.body);
    res.send(userEditData.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const token = req.body.token;
    const password = req.body.password;

    const userData = await verifyUserByToken(token);
    if (userData) {
      // hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const user = await editUserPasswordQuery(
        userData.rows[0].id,
        hashedPassword
      );
      res.send({
        message: `Reset password success for user: ${user.rows[0].id}`,
      });
    } else res.status(400).json({ message: "Invalid Token" });
  } catch (err) {
    next(err);
  }
}

async function requestResetEmail(req, res, next) {
  try {
    const userData = await getUserByEmailQuery(req.body.email.toLowerCase());

    if (userData.rows.length !== 0) {
      const user = userData.rows[0];

      const token = generateAccessToken(user.id, "30m");

      sendResetEmail(userData.rows[0], token);

      res.send({ message: "Email has been sent" });
    } else
      return res.status(400).json({ message: "No user found by this email" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  verifyUserByToken,
  getAllUsers,
  getUserById,
  registerUser,
  loginUser,
  verifyJwt,
  editUser,
  resetPassword,
  requestResetEmail,
};

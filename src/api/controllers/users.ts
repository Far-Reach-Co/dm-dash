import { genSalt, hash, compare } from "bcrypt";
import { sign, verify } from "jsonwebtoken";
import mail from "../smtp/index.js";
import { Request, Response, NextFunction } from "express";

import {
  getUserByIdQuery,
  getAllUsersQuery,
  getUserByEmailQuery,
  registerUserQuery,
  editUserQuery,
  editUserPasswordQuery,
} from "../queries/users";
import { addProjectQuery } from "../queries/projects";
import { addTableViewQuery } from "../queries/tableViews.js";

const validLoginLength = "30d";

function generateAccessToken(id: string | number, expires: string) {
  return sign({ id }, process.env.SECRET_KEY as string, { expiresIn: expires });
}

function sendResetEmail(user: { email: string }, token: string) {
  mail.sendMessage({
    user: user,
    title: "Reset Password",
    message: `Visit the following link to reset your password: <a href="https://farreachco.com/resetpassword.html?token=${token}">Reset Password</a>`,
  });
}
interface UserPayload {
  id: string;
}

async function verifyUserByToken(token: string) {
  const userVerifiedOrNull = verify(
    token,
    process.env.SECRET_KEY as string
  ) as unknown as UserPayload;

  if (userVerifiedOrNull) {
    const userData = await getUserByIdQuery(userVerifiedOrNull.id);

    if (userData.rows.length === 0) return null;

    return userData;
  } else return null;
}

async function getAllUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const usersData = await getAllUsersQuery();

    res.send(usersData);
  } catch (err) {
    return next(err);
  }
}

async function getUserById(req: Request, res: Response, next: NextFunction) {
  try {
    const userData = await getUserByIdQuery(req.params.id);

    res.send(userData.rows[0]);
  } catch (err) {
    return next(err);
  }
}

async function registerUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, username, password } = req.body;
    // hash password
    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);

    const userData = await registerUserQuery({
      email: email.toLowerCase(),
      username: username,
      password: hashedPassword,
    });
    const data = userData.rows[0];

    // create first project for user
    const projectData = await addProjectQuery({
      title: "First Project",
      user_id: data.id,
    });
    await addTableViewQuery({ project_id: projectData.rows[0].id });

    // login
    const token = generateAccessToken(data.id, validLoginLength);

    res.status(201).send({ token: token });
    // send welcome email
    mail.sendMessage({
      user: data,
      title: "Welcome",
      message: `Hi friend, our team would like to welcome you aboard our ship as we sail into our next adventure together with courage and strength!\nIf you find yourself in need of any assistance feel free to reach out to us at farreachco@gmail.com<br>Thanks for joining us, have a wonderful day.<br> - Far Reach Co.`,
    });
  } catch (err) {
    return next(err);
  }
}

async function loginUser(req: Request, res: Response, next: NextFunction) {
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
      const validPassword = await compare(password, user.password);
      if (validPassword) {
        const token = generateAccessToken(user.id, validLoginLength);
        res.send({ token: token });
      } else return res.status(400).json({ message: "Invalid Password" });
    }
  } catch (err) {
    return next(err);
  }
}

async function verifyJwt(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.token ? req.token : null;
    if (token) {
      const userData = await verifyUserByToken(token);

      if (!userData)
        return res.status(400).json({ message: "Can't find user by token" });

      res.send(userData.rows[0]);
    } else return res.status(400).json({ message: "No token sent in headers" });
  } catch (err) {
    return next(err);
  }
}

async function editUser(req: Request, res: Response, next: NextFunction) {
  try {
    const userEditData = await editUserQuery(req.user.id, req.body);
    res.send(userEditData.rows[0]);
  } catch (err) {
    return next(err);
  }
}

async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.body.token;
    const password = req.body.password;

    const userData = await verifyUserByToken(token);
    if (userData) {
      // hash password
      const salt = await genSalt(10);
      const hashedPassword = await hash(password, salt);
      const user = await editUserPasswordQuery(
        userData.rows[0].id,
        hashedPassword
      );
      res.send({
        message: `Reset password success for user: ${user.rows[0].id}`,
      });
    } else res.status(400).json({ message: "Invalid Token" });
  } catch (err) {
    return next(err);
  }
}

async function requestResetEmail(
  req: Request,
  res: Response,
  next: NextFunction
) {
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
    return next(err);
  }
}

export {
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

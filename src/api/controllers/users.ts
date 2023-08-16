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
import {
  addTableViewByProjectQuery,
  addTableViewByUserQuery,
} from "../queries/tableViews.js";
import { validationResult } from "express-validator";

// I had to put this somewhere
declare module "express-session" {
  export interface SessionData {
    user: string | number;
  }
}

function generateAccessToken(id: string | number, expires: string) {
  return sign({ id }, process.env.SECRET_KEY as string, { expiresIn: expires });
}

function sendResetEmail(user: { email: string }, token: string) {
  mail.sendMessage({
    user: user,
    title: "Reset Password",
    message: `Visit the following link to reset your password: <a href="https://farreachco.com/resetpassword?token=${token}">Reset Password</a>`,
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

interface GetUserByIdRequestObject extends Request {
  params: {
    id: string;
  };
}

async function getUserById(
  req: GetUserByIdRequestObject,
  res: Response,
  next: NextFunction
) {
  try {
    const userData = await getUserByIdQuery(req.params.id);

    res.send(userData.rows[0]);
  } catch (err) {
    return next(err);
  }
}

interface RegisterUserRequestObject extends Request {
  body: {
    _csrf: string;
    email: string;
    username: string;
    password: string;
  };
}

async function registerUser(
  req: RegisterUserRequestObject,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, username, password } = req.body;
    const errors = validationResult(req);
    if (errors.mapped().email) {
      // if errors array is not empty, return the validation errors
      throw { status: 400, message: errors.mapped().email.msg };
    }

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
      title: "First Wyrld",
      user_id: data.id,
    });
    // create two tables, one for a project/wyrld another for just the user
    await addTableViewByProjectQuery({
      project_id: projectData.rows[0].id,
      title: "First Wyrld Table",
    });
    await addTableViewByUserQuery({ user_id: data.id, title: "First Table" });

    // login
    req.session.user = data.id;
    res.status(201).send({ message: "Successful registration" });
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

interface LoginUserRequestObject extends Request {
  body: {
    _csrf: string;
    email: string;
    password: string;
  };
}

async function loginUser(
  req: LoginUserRequestObject,
  res: Response,
  next: NextFunction
) {
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
        req.session.user = user.id;

        res.status(200).send({ message: "Successful Login" });
      } else return res.status(400).json({ message: "Invalid Password" });
    }
  } catch (err) {
    return next(err);
  }
}

async function verifyJwt(req: Request, res: Response, next: NextFunction) {
  // try {
  //   const token = req.token ? req.token : null;
  //   if (token) {
  //     const userData = await verifyUserByToken(token);
  //     if (!userData)
  //       return res.status(400).json({ message: "Can't find user by token" });
  //     res.send(userData.rows[0]);
  //   } else return res.status(400).json({ message: "No token sent in headers" });
  // } catch (err) {
  //   return next(err);
  // }
}

interface EditUsernameRequestObject extends Request {
  body: {
    _csrf: string;
    username: string;
  };
}

async function editUsername(
  req: EditUsernameRequestObject,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.session.user) throw new Error("User is not logged in");
    await editUserQuery(req.session.user, {
      username: req.body.username,
    });
    res.send("Saved!");
  } catch (err) {
    next(err);
  }
}

interface EditEmailRequestObject extends Request {
  body: {
    _csrf: string;
    email: string;
  };
}

async function editEmail(
  req: EditEmailRequestObject,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.session.user) throw new Error("User is not logged in");
    const errors = validationResult(req);
    if (errors.mapped().email) {
      // if errors array is not empty, return the validation errors
      throw { status: 400, message: errors.mapped().email.msg };
    }
    await editUserQuery(req.session.user, {
      email: req.body.email,
    });
    res.send("Saved!");
  } catch (err) {
    next(err);
  }
}

interface ResetPasswordRequestObject extends Request {
  body: {
    _csrf: string;
    token: string;
    password: string;
  };
}

async function resetPassword(
  req: ResetPasswordRequestObject,
  res: Response,
  next: NextFunction
) {
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
        message: `Reset password success for user: ${user.rows[0].username}`,
      });
    } else res.status(400).json({ message: "Invalid Token" });
  } catch (err) {
    return next(err);
  }
}

interface RequestResetEmailRequestObject extends Request {
  body: {
    _csrf: string;
    email: string;
  };
}

async function requestResetEmail(
  req: RequestResetEmailRequestObject,
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

async function getUserBySession(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.session.user) throw new Error("User is not logged in");
    const { rows } = await getUserByIdQuery(req.session.user);
    res.send(rows[0]);
  } catch (err) {
    return next(err);
  }
}

export {
  verifyUserByToken,
  getAllUsers,
  getUserById,
  getUserBySession,
  registerUser,
  loginUser,
  verifyJwt,
  editEmail,
  editUsername,
  resetPassword,
  requestResetEmail,
};

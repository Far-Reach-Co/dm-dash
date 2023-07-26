import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import { editUserQuery, getUserByIdQuery } from "./api/queries/users";

var router = Router();

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    //
    res.render("index", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get("/index", (req: Request, res: Response, next: NextFunction) => {
  try {
    //
    res.render("index", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get("/login", (req: Request, res: Response, next: NextFunction) => {
  try {
    //
    res.render("login", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get("/register", (req: Request, res: Response, next: NextFunction) => {
  try {
    //
    res.render("register", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get(
  "/forgotpassword",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      //
      res.render("forgotpassword", { auth: req.session.user });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/resetpassword",
  (req: Request, res: Response, next: NextFunction) => {
    try {
      //
      res.render("resetpassword", { auth: req.session.user });
    } catch (err) {
      next(err);
    }
  }
);

router.get("/invite", (req: Request, res: Response, next: NextFunction) => {
  try {
    //
    res.render("invite", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get(
  "/account",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      //
      if (!req.session.user) throw new Error("User is not logged in");
      const { rows } = await getUserByIdQuery(req.session.user);
      res.render("account", { auth: req.session.user, user: rows[0] });
    } catch (err) {
      next(err);
    }
  }
);

router.get("/dashboard", (req: Request, res: Response, next: NextFunction) => {
  try {
    //
    res.render("dashboard", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get("/5eplayer", (req: Request, res: Response, next: NextFunction) => {
  try {
    //
    res.render("5eplayer", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get("/sheets", (req: Request, res: Response, next: NextFunction) => {
  try {
    //
    res.render("sheets", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get("/vtt", (req: Request, res: Response, next: NextFunction) => {
  try {
    //
    res.render("vtt", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get(
  "/update_username",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.session.user) throw new Error("User is not logged in");
      const { rows } = await getUserByIdQuery(req.session.user);
      res.render("partials/account/editusername", {
        user: rows[0],
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/update_username",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.session.user) throw new Error("User is not logged in");
      const userData = await editUserQuery(req.session.user, {
        username: req.body.username,
      });
      res.render("partials/account/username", {
        user: userData.rows[0],
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/update_email",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.session.user) throw new Error("User is not logged in");
      const { rows } = await getUserByIdQuery(req.session.user);
      res.render("partials/account/editemail", {
        user: rows[0],
      });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/update_email",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.session.user) throw new Error("User is not logged in");
      const userData = await editUserQuery(req.session.user, {
        email: req.body.email,
      });
      res.render("partials/account/email", {
        user: userData.rows[0],
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get("/logout", (req: Request, res: Response, next: NextFunction) => {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.redirect("/");
  });
});

router.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).render("404", { auth: req.session.user });
});

module.exports = router;

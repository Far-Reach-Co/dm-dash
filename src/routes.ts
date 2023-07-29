import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import { editUserQuery, getUserByIdQuery } from "./api/queries/users";
import {
  get5eCharGeneralQuery,
  get5eCharGeneralUserIdQuery,
  get5eCharsGeneralByUserQuery,
} from "./api/queries/5eCharGeneral";
import { getTableViewsByUserQuery } from "./api/queries/tableViews";
import {
  getPlayerUserByUserAndPlayerQuery,
  getPlayerUsersQuery,
} from "./api/queries/playerUsers";

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

router.get(
  "/5eplayer",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.session.user) throw new Error("User is not logged in");
      if (!req.query.id) throw new Error("Missing player ID in query");
      const playerSheetid = req.query.id as string;
      const playerSheetUserIdData = await get5eCharGeneralUserIdQuery(
        playerSheetid
      );
      const playerSheetUserId = playerSheetUserIdData.rows[0].user_id;
      // check if user created character sheet or if is a playerUser (add by invite)
      if (playerSheetUserId != req.session.user) {
        const playerUserData = await getPlayerUserByUserAndPlayerQuery(
          req.session.user,
          playerSheetid
        );
        if (!playerUserData.rows.length) {
          const invite = req.query.invite as string;
          if (!invite) {
            return res.render("forbidden", { auth: req.session.user });
          }
        }
      }
      //
      res.render("5eplayer", { auth: req.session.user });
    } catch (err) {
      next(err);
    }
  }
);

router.get("/dash", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.session.user) throw new Error("User is not logged in");
    // get table views by user
    const tableData = await getTableViewsByUserQuery(req.session.user);
    // get all character sheets by user
    const charData = await get5eCharsGeneralByUserQuery(req.session.user);
    // get shared character sheets by playerUser
    const sharedCharData = [];
    const playerUsersData = await getPlayerUsersQuery(req.session.user);
    if (playerUsersData.rows.length) {
      for (const playerUser of playerUsersData.rows) {
        const puCharData = await get5eCharGeneralQuery(playerUser.player_id);
        sharedCharData.push(puCharData.rows[0]);
      }
    }

    res.render("dash", {
      auth: req.session.user,
      tables: tableData.rows,
      sheets: charData.rows,
      sharedSheets: sharedCharData,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/newsheet", (req: Request, res: Response, next: NextFunction) => {
  try {
    //
    res.render("newsheet", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get("/newtable", (req: Request, res: Response, next: NextFunction) => {
  try {
    //
    res.render("newtable", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get("/vtt", (req: Request, res: Response, next: NextFunction) => {
  try {
    //
    if (!req.session.user) {
      res.render("forbidden", { auth: req.session.user });
    } else {
      res.render("vtt", { auth: req.session.user });
    }
  } catch (err) {
    next(err);
  }
});

router.post(
  "/update_username",
  async (req: Request, res: Response, next: NextFunction) => {
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
);

router.post(
  "/update_email",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.session.user) throw new Error("User is not logged in");
      await editUserQuery(req.session.user, {
        email: req.body.email,
      });
      res.send("Saved!");
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

router.get("/forbidden", (req: Request, res: Response, next: NextFunction) => {
  try {
    //
    res.render("forbidden", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).render("404", { auth: req.session.user });
});

module.exports = router;

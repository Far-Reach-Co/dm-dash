import { Router, Request, Response, NextFunction } from "express";

const router = Router();

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.render("index", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get("/index", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.render("index", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get("/about-us", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.render("aboutus", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get("/what-is-frc", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.render("what-is-frc", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get("/resources", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.render("resources", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get("/radio", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.render("radio", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get("/vtt-guide", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.render("vtt-guide", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get("/preaethrend", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.render("preaethrend", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get("/attributions", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.render("attributions", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get("/privacy-policy", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.render("privacypolicy", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

router.get("/terms-of-use", (req: Request, res: Response, next: NextFunction) => {
  try {
    res.render("termsofuse", { auth: req.session.user });
  } catch (err) {
    next(err);
  }
});

export default router;

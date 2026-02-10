import { Router, Request, Response, NextFunction } from "express";
import {
  requireUserOrRedirect,
  requireProjectEditorOrRedirect,
} from "../lib/authz";

const router = Router();

router.get(
  "/library",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = requireUserOrRedirect(req, res, "/login");
      if (!userId) return;

      const projectId = (req.query.wyrld as string) || null;

      if (projectId) {
        const project = await requireProjectEditorOrRedirect(
          req,
          res,
          projectId,
        );
        if (!project) return;
      }

      res.render("library", {
        auth: userId,
        projectId,
      });
    } catch (err) {
      next(err);
    }
  },
);

export default router;

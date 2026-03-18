import { Router } from "express";
import { body } from "express-validator";
import {
  registerUser,
  loginUser,
  resetPassword,
  requestResetEmail,
  getUserBySession,
  editEmail,
  editUsername,
  editEmailPreferences,
} from "../controllers/users.js";
import { getFrontendAuthState } from "../controllers/frontendAuth.js";
import {
  loginLimiter,
  registerLimiter,
  requestResetLimiter,
} from "../rateLimiters.js";
import { csrfProtection } from "../../routes.js";

const router = Router();

router.get("/get_user", getUserBySession);
router.get("/get_frontend_auth_state", getFrontendAuthState);

router.post(
  "/register",
  csrfProtection,
  registerLimiter,
  body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
  registerUser,
);
router.post("/login", csrfProtection, loginLimiter, loginUser);
router.post(
  "/request_reset_email",
  csrfProtection,
  requestResetLimiter,
  requestResetEmail,
);
router.post("/user/reset_password", csrfProtection, resetPassword);
router.post("/update_username", csrfProtection, editUsername);
router.post(
  "/update_email",
  csrfProtection,
  body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
  editEmail,
);
router.post("/update_email_preferences", csrfProtection, editEmailPreferences);

export default router;

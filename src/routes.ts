import { Router } from "express";
import publicRoutes from "./routes/public";
import authRoutes from "./routes/auth";
import inviteRoutes from "./routes/invites";
import accountRoutes from "./routes/account";
import checkoutRoutes from "./routes/checkout";
import billingRoutes from "./routes/billing";
import adminAffiliateRoutes from "./routes/adminAffiliates";
import playerRoutes from "./routes/players";
import dashRoutes from "./routes/dash";
import wyrldRoutes from "./routes/wyrld";
import recordRoutes from "./routes/records";
import tableRoutes from "./routes/tables";
import vttRoutes from "./routes/vtt";
import libraryRoutes from "./routes/library";
import miscRoutes from "./routes/misc";
import emailRoutes from "./routes/email";

const router = Router();

router.use(publicRoutes);
router.use(authRoutes);
router.use(inviteRoutes);
router.use(accountRoutes);
router.use(checkoutRoutes);
router.use(billingRoutes);
router.use(adminAffiliateRoutes);
router.use(playerRoutes);
router.use(dashRoutes);
router.use(wyrldRoutes);
router.use(recordRoutes);
router.use(tableRoutes);
router.use(vttRoutes);
router.use(libraryRoutes);
router.use(miscRoutes);
router.use(emailRoutes);

export default router;
export { csrfProtection } from "./routes/csrf";

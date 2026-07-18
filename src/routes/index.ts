console.log("========== ROUTES INDEX LOADED ==========");



import { Router, Request, Response } from "express";
import { authRoutes } from "../modules/auth";
import adminRoutes from "@/modules/admin/admin.routes";
import eventRoutes from "@/modules/events";
import hostelRoutes from "@/modules/hostels";
import hallRoutes from "@/modules/halls";
import accommodationRoutes from "@/modules/accommodation";
import parishArrivalRoutes from "@/modules/parish-arrival";
import qrRoutes from "@/modules/qr";
import committeeRoutes from "@/modules/committee";
import { reportsRoutes } from "../modules/reports";
import { financeRoutes } from "../modules/finance";
import { badgeRoutes } from "../badge";
import { delegateRoutes } from "@/modules/delegates/index";
import {parishRoutes} from "@/modules/parish";
import { draftRoutes}  from "@/modules/delegate-drafts/index";
import incomeRoutes from "@/modules/income/inccome.routes";
import  vendorRoutes  from "@/modules/vendor/vendor.routes"
import financeUploadRoutes from "@/modules/uploads/upload.routes";


const router = Router();





router.use(
  "/upload",
  financeUploadRoutes
);


router.use("/auth", authRoutes);



router.use("/vendors", vendorRoutes);




router.use("/delegate-drafts", draftRoutes);
/**
 * ===========================================
 * Admin Routes
 * ===========================================
 */
router.use("/admin", adminRoutes);

/**
 * ===========================================
 * Event Routes
 * ===========================================
 */
router.use("/delegates", delegateRoutes);

/**
 * ===========================================
 * Deanery Routes
 * ===========================================
 */


/**
 * ===========================================
 * Parish Routes
 * ===========================================
 */
router.use("/parish", parishRoutes);

/**
 * ===========================================
 * Delegate Routes
 * ===========================================
 */

/**
 * ===========================================
 * Committee Routes
 * ===========================================
 */


/**
 * ===========================================
 * Finance Routes
 * ===========================================
 */

/**
 * ===========================================
 * Accommodation Routes
 * ===========================================
 */

/**
 * ===========================================
 * Attendance Routes
 * ===========================================
 */


/**
 * ===========================================
 * Complaint Routes
 * ===========================================
 */


/**
 * ===========================================
 * Announcement Routes
 * ===========================================
 */

/**
 * ===========================================
 * Badge Routes
 * ===========================================
 */
router.use("/badges", badgeRoutes);

/**
 * ===========================================
 * Report Routes
 * ===========================================
 */



router.use("/events", eventRoutes);

router.use("/hostels", hostelRoutes);

router.use("/halls", hallRoutes);

router.use("/committees", committeeRoutes);

router.use("/reports", reportsRoutes);

router.use("/finance", financeRoutes);

router.use(
  "/income",
  incomeRoutes
);

router.use("/badge", badgeRoutes);

router.use(
  "/qr",
  qrRoutes
);

router.use(
  "/accommodation",
  accommodationRoutes
);

router.use(
  "/parish-arrivals",
  parishArrivalRoutes
);

export default router;
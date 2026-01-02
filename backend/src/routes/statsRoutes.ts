import { Router } from "express";
import { 
  getStats, 
  getIssueTrends, 
  getTopIssues, 
  getRecentActivity 
} from "../controllers/statsController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/stats - Overall stats for dashboard cards
router.get("/", getStats);

// GET /api/stats/trends - Issue trends for last 7 days
router.get("/trends", getIssueTrends);

// GET /api/stats/issues - Top issues by frequency
router.get("/issues", getTopIssues);

// GET /api/stats/activity - Recent activity (alias for /api/activity)
router.get("/activity", getRecentActivity);

export default router;

import type { Response } from "express";
import type { AuthenticatedRequest } from "../types/index.js";
import { statsService } from "../services/statsService.js";

/**
 * Get overall stats for dashboard cards
 * GET /api/stats
 */
export async function getStats(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const stats = await statsService.getOverallStats(req.userId!);
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ success: false, error: "Failed to fetch stats" });
  }
}

/**
 * Get issue trends for the last 7 days
 * GET /api/stats/trends
 */
export async function getIssueTrends(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const trends = await statsService.getIssueTrends(req.userId!);
    res.json({ success: true, data: trends });
  } catch (error) {
    console.error("Error fetching trends:", error);
    res.status(500).json({ success: false, error: "Failed to fetch trends" });
  }
}

/**
 * Get top issues by frequency
 * GET /api/stats/issues
 */
export async function getTopIssues(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const topIssues = await statsService.getTopIssues(req.userId!, limit);
    res.json({ success: true, data: topIssues });
  } catch (error) {
    console.error("Error fetching top issues:", error);
    res.status(500).json({ success: false, error: "Failed to fetch top issues" });
  }
}

/**
 * Get recent activity
 * GET /api/activity
 */
export async function getRecentActivity(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const activity = await statsService.getRecentActivity(req.userId!, limit);
    res.json({ success: true, data: activity });
  } catch (error) {
    console.error("Error fetching activity:", error);
    res.status(500).json({ success: false, error: "Failed to fetch activity" });
  }
}

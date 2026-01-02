import prisma from "../utils/prisma.js";

export const statsService = {
  /**
   * Get overall stats for dashboard cards
   */
  async getOverallStats(ownerId: string) {
    // Get counts for user's data only
    const [
      totalProjects,
      totalVersions,
      totalIssues,
      totalComparisons,
      comparisonResults,
    ] = await Promise.all([
      // Total projects
      prisma.project.count({
        where: { ownerId },
      }),
      // Total versions (through projects)
      prisma.codeVersion.count({
        where: { project: { ownerId } },
      }),
      // Total issues (through projects -> versions -> analyses)
      prisma.analysisIssue.count({
        where: {
          analysis: {
            codeVersion: {
              project: { ownerId },
            },
          },
        },
      }),
      // Total comparisons
      prisma.comparison.count({
        where: { project: { ownerId } },
      }),
      // Comparison results breakdown
      prisma.comparisonResult.groupBy({
        by: ["changeType"],
        _count: { id: true },
        where: {
          comparison: {
            project: { ownerId },
          },
        },
      }),
    ]);

    // Process comparison breakdown
    const issueBreakdown = {
      improved: 0,
      worsened: 0,
      unchanged: 0,
    };

    for (const result of comparisonResults) {
      if (result.changeType === "IMPROVED") {
        issueBreakdown.improved = result._count.id;
      } else if (result.changeType === "WORSENED") {
        issueBreakdown.worsened = result._count.id;
      } else if (result.changeType === "UNCHANGED") {
        issueBreakdown.unchanged = result._count.id;
      }
    }

    return {
      totalProjects,
      totalVersions,
      totalIssues,
      totalComparisons,
      issueBreakdown,
    };
  },

  /**
   * Get issue trends for the last 7 days
   */
  async getIssueTrends(ownerId: string) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get analyses grouped by date
    const analyses = await prisma.analysisResult.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        codeVersion: {
          project: { ownerId },
        },
      },
      include: {
        _count: {
          select: { issues: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Build a map of all 7 days with default 0 values
    const trendMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];
      if (dateKey) {
        trendMap[dateKey] = 0;
      }
    }

    // Fill in actual data
    for (const analysis of analyses) {
      const dateKey = analysis.createdAt.toISOString().split("T")[0];
      if (dateKey && trendMap[dateKey] !== undefined) {
        trendMap[dateKey] = trendMap[dateKey] + analysis._count.issues;
      }
    }

    // Convert to array (already in order since we built it that way)
    const trends = Object.entries(trendMap).map(([date, issues]) => ({
      date,
      issues,
    }));

    return { trends };
  },

  /**
   * Get top issues by frequency
   */
  async getTopIssues(ownerId: string, limit: number = 10) {
    const topIssues = await prisma.analysisIssue.groupBy({
      by: ["issueCode"],
      _count: { id: true },
      where: {
        analysis: {
          codeVersion: {
            project: { ownerId },
          },
        },
      },
      orderBy: {
        _count: { id: "desc" },
      },
      take: limit,
    });

    return {
      topIssues: topIssues.map((item) => ({
        issueCode: item.issueCode,
        count: item._count.id,
      })),
    };
  },

  /**
   * Get recent activity (analyses and comparisons)
   */
  async getRecentActivity(ownerId: string, limit: number = 10) {
    // Get recent analyses
    const recentAnalyses = await prisma.analysisResult.findMany({
      where: {
        codeVersion: {
          project: { ownerId },
        },
      },
      include: {
        codeVersion: {
          include: {
            project: true,
          },
        },
        _count: {
          select: { issues: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Get recent comparisons
    const recentComparisons = await prisma.comparison.findMany({
      where: {
        project: { ownerId },
      },
      include: {
        project: true,
        _count: {
          select: { results: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // Combine and sort
    const activities: {
      type: "analysis" | "comparison";
      projectName: string;
      versionLabel?: string | null;
      issueCount?: number;
      resultCount?: number;
      createdAt: Date;
    }[] = [];

    for (const analysis of recentAnalyses) {
      activities.push({
        type: "analysis",
        projectName: analysis.codeVersion.project.name,
        versionLabel: analysis.codeVersion.versionLabel,
        issueCount: analysis._count.issues,
        createdAt: analysis.createdAt,
      });
    }

    for (const comparison of recentComparisons) {
      activities.push({
        type: "comparison",
        projectName: comparison.project.name,
        resultCount: comparison._count.results,
        createdAt: comparison.createdAt,
      });
    }

    // Sort by date descending
    activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return {
      activities: activities.slice(0, limit),
    };
  },
};

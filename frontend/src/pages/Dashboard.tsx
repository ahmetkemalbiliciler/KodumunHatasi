import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { stats } from "../services/api";
import Wrapper from "../components/common/Wrapper";

// Issue code display names
const ISSUE_NAMES: Record<string, string> = {
  NESTED_LOOP: "Nested Loop",
  INEFFICIENT_ALGORITHM: "Inefficient Algorithm",
  MEMORY_LEAK: "Memory Leak",
  N_PLUS_ONE_QUERY: "N+1 Query",
  BLOCKING_OPERATION: "Blocking Operation",
  UNUSED_VARIABLE: "Unused Variable",
  MAGIC_NUMBER: "Magic Number",
  LONG_FUNCTION: "Long Function",
  DUPLICATE_CODE: "Duplicate Code",
  DEAD_CODE: "Dead Code",
  COMPLEX_CONDITION: "Complex Condition",
  DEEP_NESTING: "Deep Nesting",
  HARDCODED_SECRET: "Hardcoded Secret",
  SQL_INJECTION: "SQL Injection",
  XSS_VULNERABILITY: "XSS Vulnerability",
  INSECURE_RANDOM: "Insecure Random",
  EMPTY_CATCH: "Empty Catch",
  MISSING_ERROR_HANDLING: "Missing Error Handling",
  SWALLOWED_EXCEPTION: "Swallowed Exception",
  MISSING_NULL_CHECK: "Missing Null Check",
  MISSING_TYPE_ANNOTATION: "Missing Type Annotation",
  INCONSISTENT_NAMING: "Inconsistent Naming",
  GOD_FUNCTION: "God Function",
  MISSING_RETURN_TYPE: "Missing Return Type",
};

interface OverviewData {
  totalProjects: number;
  totalVersions: number;
  totalIssues: number;
  totalComparisons: number;
  issueBreakdown: {
    improved: number;
    worsened: number;
    unchanged: number;
  };
}

interface TrendData {
  date: string;
  issues: number;
}

interface TopIssue {
  issueCode: string;
  count: number;
}

interface Activity {
  type: "analysis" | "comparison";
  projectName: string;
  versionLabel?: string;
  issueCount?: number;
  resultCount?: number;
  createdAt: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [topIssues, setTopIssues] = useState<TopIssue[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [overviewData, trendsData, topIssuesData, activityData] = await Promise.all([
        stats.getOverview(),
        stats.getTrends(),
        stats.getTopIssues(5),
        stats.getActivity(10),
      ]);

      setOverview(overviewData);
      setTrends(trendsData.trends);
      setTopIssues(topIssuesData.topIssues);
      setActivities(activityData.activities);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const getMaxIssueCount = () => {
    if (topIssues.length === 0) return 1;
    return Math.max(...topIssues.map((i) => i.count));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-12">
      {/* Background effects */}
      <div className="fixed top-20 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      <Wrapper>
        <div className="py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">Dashboard</h1>
            <p className="text-text-secondary">Overview of your code analysis statistics</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon="folder_open"
              label="Projects"
              value={overview?.totalProjects ?? 0}
              color="accent"
            />
            <StatCard
              icon="history"
              label="Versions"
              value={overview?.totalVersions ?? 0}
              color="blue"
            />
            <StatCard
              icon="bug_report"
              label="Total Issues"
              value={overview?.totalIssues ?? 0}
              color="orange"
            />
            <StatCard
              icon="compare_arrows"
              label="Comparisons"
              value={overview?.totalComparisons ?? 0}
              color="green"
            />
          </div>

          {/* Improvement Breakdown */}
          {overview && (overview.issueBreakdown.improved > 0 || overview.issueBreakdown.worsened > 0 || overview.issueBreakdown.unchanged > 0) && (
            <div className="glass-card p-6 mb-8">
              <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-accent">analytics</span>
                Comparison Results
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <p className="text-3xl font-bold text-green-400">{overview.issueBreakdown.improved}</p>
                  <p className="text-sm text-text-secondary mt-1">Improved</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-3xl font-bold text-red-400">{overview.issueBreakdown.worsened}</p>
                  <p className="text-sm text-text-secondary mt-1">Worsened</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-gray-500/10 border border-gray-500/20">
                  <p className="text-3xl font-bold text-gray-400">{overview.issueBreakdown.unchanged}</p>
                  <p className="text-sm text-text-secondary mt-1">Unchanged</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column: Issue Trend + Top Issues */}
            <div className="space-y-8">
              {/* Issue Trend */}
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-accent">trending_up</span>
                  Last 7 Days Issue Trend
                </h2>
                {trends.length > 0 ? (
                  <div className="flex items-end gap-2 h-40">
                    {trends.map((trend, i) => {
                      const maxIssues = Math.max(...trends.map((t) => t.issues), 1);
                      const heightPx = Math.max((trend.issues / maxIssues) * 120, 8);
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-xs text-text-secondary font-medium">{trend.issues}</span>
                          <div
                            className="w-full bg-accent rounded-t-lg transition-all duration-500 hover:bg-accent/80 min-w-[20px]"
                            style={{ height: `${heightPx}px` }}
                          />
                          <span className="text-xs text-text-secondary">
                            {new Date(trend.date).toLocaleDateString("tr-TR", { weekday: "short" })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center text-text-secondary">
                    <p>No trend data yet</p>
                  </div>
                )}
              </div>

              {/* Top Issues */}
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-orange-400">priority_high</span>
                  Most Common Issues
                </h2>
                {topIssues.length > 0 ? (
                  <div className="space-y-3">
                    {topIssues.map((issue, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-accent/20 text-accent text-xs font-bold">
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-text-primary font-medium">
                              {ISSUE_NAMES[issue.issueCode] || issue.issueCode}
                            </span>
                            <span className="text-xs text-text-secondary">{issue.count}</span>
                          </div>
                          <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-linear-to-r from-accent to-accent/50 rounded-full transition-all duration-500"
                              style={{ width: `${(issue.count / getMaxIssueCount()) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-text-secondary">
                    <p>No issue data yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Recent Activity */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400">schedule</span>
                Recent Activity
              </h2>
              {activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.map((activity, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          activity.type === "analysis"
                            ? "bg-accent/20 text-accent"
                            : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg">
                          {activity.type === "analysis" ? "search" : "compare_arrows"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-primary font-medium truncate">
                          {activity.projectName}
                          {activity.versionLabel && (
                            <span className="text-text-secondary"> • {activity.versionLabel}</span>
                          )}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {activity.type === "analysis" ? (
                            <>Analysis completed • {activity.issueCount ?? 0} issues detected</>
                          ) : (
                            <>Comparison completed • {activity.resultCount ?? 0} results</>
                          )}
                        </p>
                      </div>
                      <span className="text-xs text-text-secondary whitespace-nowrap">
                        {formatDate(activity.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-text-secondary">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-50">inbox</span>
                  <p>No activity yet</p>
                  <p className="text-xs mt-1">Start by analyzing some code</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Wrapper>
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: number;
  color: "accent" | "blue" | "orange" | "green";
}) {
  const colorClasses = {
    accent: "bg-accent/10 text-accent border-accent/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    green: "bg-green-500/10 text-green-400 border-green-500/20",
  };

  const iconColors = {
    accent: "text-accent",
    blue: "text-blue-400",
    orange: "text-orange-400",
    green: "text-green-400",
  };

  return (
    <div className={`glass-card p-5 border ${colorClasses[color]} hover:scale-105 transition-transform`}>
      <div className="flex items-center gap-3 mb-2">
        <span className={`material-symbols-outlined ${iconColors[color]}`}>{icon}</span>
        <span className="text-sm text-text-secondary">{label}</span>
      </div>
      <p className="text-3xl font-bold text-text-primary">{value}</p>
    </div>
  );
}

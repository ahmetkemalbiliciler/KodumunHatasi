import { useState, useEffect } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import { versions } from "../../services/api";
import type { Version } from "./types";
import { safeFormatDate } from "./utils";

interface AnalysisViewProps {
    versionId: string;
    onBack: () => void;
}

export default function AnalysisView({ versionId, onBack }: AnalysisViewProps) {
    const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchVersion = async () => {
            setIsLoading(true);
            try {
                const data = await versions.get(versionId);
                setSelectedVersion(data);
            } catch (error) {
                console.error("Failed to fetch version:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchVersion();
    }, [versionId]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            </div>
        );
    }

    if (!selectedVersion) {
        return (
            <div className="text-center p-10">
                <p className="text-text-secondary">Version not found.</p>
                <button onClick={onBack} className="mt-4 text-accent hover:underline">Go Back</button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-slide-up">
            {/* Mobile Back Button */}
            <div className="md:hidden mb-4">
                <button
                    onClick={onBack}
                    className="flex items-center text-text-secondary hover:text-text-primary transition-colors"
                >
                    <ArrowBackIcon className="mr-2" /> Back to List
                </button>
            </div>

            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                    <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
                        <span className="opacity-60">Version Label</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2 break-all bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        {selectedVersion.versionLabel}
                    </h1>
                    <p className="text-text-secondary flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Analyzed on {safeFormatDate(selectedVersion.uploadedAt, "MMMM d, yyyy 'at' HH:mm")}
                    </p>
                </div>
            </header>

            {/* AI Summary */}
            <div className="glass-card p-8 border border-glass-border/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>
                <h3 className="text-accent font-bold text-lg mb-4 flex items-center gap-2">
                    <AutoFixHighIcon /> Analysis Summary
                </h3>
                <p className="text-text-primary/90 leading-relaxed text-base whitespace-pre-wrap">
                    {selectedVersion.analysis?.summary}
                </p>
            </div>

            {/* Issues List (Cons) */}
            {selectedVersion.analysis?.issues && selectedVersion.analysis.issues.length > 0 && (
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-text-primary flex items-center gap-2 mt-8">
                        <span className="w-1 h-6 bg-red-500 rounded-full"></span>
                        Detected Issues ({selectedVersion.analysis.issues.length})
                    </h3>

                    <div className="grid gap-4 sm:gap-6">
                        {selectedVersion.analysis.issues.map((issue, idx) => (
                            <div key={idx} className="glass p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                                <div className="flex flex-col sm:flex-row sm:flex-wrap justify-between items-start gap-3 sm:gap-4 mb-4">
                                    <div className="w-full sm:w-auto">
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                                            <span className="font-mono text-sm sm:text-base font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded border border-red-500/10 break-all max-w-full">{issue.issueCode}</span>
                                        </div>
                                        <div className="text-xs sm:text-sm text-text-secondary mt-2">
                                            Complexity: <span className="text-text-primary font-mono bg-bg-tertiary/50 px-1.5 py-0.5 rounded">{issue.complexity}</span>
                                        </div>
                                    </div>
                                    <span className={`text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full uppercase font-bold tracking-wider border shrink-0
                                        ${issue.severity === 'high' ? 'bg-red-500/10 text-red-500 border-red-500/20 shadow-red-500/10 shadow-lg' :
                                            issue.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                        }`}>
                                        {issue.severity}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
                                    {(issue.snippet?.beforeSnippet || issue.beforeSnippet) && (
                                        <div className="space-y-2 min-w-0">
                                            <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider pl-1">Target Code</div>
                                            <div className="bg-[#0d1117] rounded-lg sm:rounded-xl p-3 sm:p-4 overflow-x-auto border border-red-500/20 shadow-inner max-w-full">
                                                <pre className="text-[10px] sm:text-xs font-mono text-gray-300 leading-relaxed whitespace-pre-wrap break-words sm:whitespace-pre sm:break-normal"><code>{issue.snippet?.beforeSnippet || issue.beforeSnippet}</code></pre>
                                            </div>
                                        </div>
                                    )}

                                    {(issue.snippet?.afterSnippet || issue.afterSnippet) && (
                                        <div className="space-y-2 min-w-0">
                                            <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider pl-1 text-green-400">Suggested Fix</div>
                                            <div className="bg-[#0d1117] rounded-lg sm:rounded-xl p-3 sm:p-4 overflow-x-auto border border-green-500/20 shadow-inner group-hover:shadow-green-500/5 transition-shadow max-w-full">
                                                <pre className="text-[10px] sm:text-xs font-mono text-green-400 leading-relaxed whitespace-pre-wrap break-words sm:whitespace-pre sm:break-normal"><code>{issue.snippet?.afterSnippet || issue.afterSnippet}</code></pre>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

import { useState, useEffect } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { comparisons } from "../../services/api";
import type { Comparison } from "./types";
import { toast } from "react-toastify";

interface ComparisonViewProps {
    comparisonId: string;
    getVersionLabel: (id: string) => string;
    onBack: () => void;
}

export default function ComparisonView({
    comparisonId,
    getVersionLabel,
    onBack
}: ComparisonViewProps) {
    const [comparisonData, setComparisonData] = useState<Comparison | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isExplaining, setIsExplaining] = useState(false);

    useEffect(() => {
        const fetchComparison = async () => {
            setIsLoading(true);
            try {
                const data = await comparisons.get(comparisonId);
                setComparisonData(data);
            } catch (error) {
                console.error("Failed to fetch comparison:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchComparison();
    }, [comparisonId]);

    const handleGenerateExplanation = async () => {
        if (!comparisonData) return;
        setIsExplaining(true);
        try {
            const explanation = await comparisons.explain(comparisonData.id);
            setComparisonData(prev => prev ? { ...prev, explanation } : null);
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate explanation.");
        } finally {
            setIsExplaining(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            </div>
        );
    }

    if (!comparisonData) {
        return (
            <div className="text-center p-10">
                <p className="text-text-secondary">Comparison not found.</p>
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
                    <ArrowBackIcon className="mr-2" /> Back to Selection
                </button>
            </div>

            <header className="border-b border-white/10 pb-6">
                <div className="flex items-center gap-2 text-accent mb-3">
                    <div className="p-1.5 bg-accent/10 rounded-lg">
                        <CompareArrowsIcon fontSize="small" />
                    </div>
                    <span className="font-bold text-xs tracking-wider uppercase opacity-80">Comparison Mode</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
                    Analysis Comparison
                </h1>
                <div className="flex items-center gap-3 text-sm mt-3 bg-bg-tertiary/30 w-fit px-4 py-2 rounded-full border border-white/5">
                    <span className="text-text-primary font-medium">{getVersionLabel(comparisonData.fromAnalysisId)}</span>
                    <ArrowForwardIosIcon style={{ fontSize: 10 }} className="text-text-secondary" />
                    <span className="text-text-primary font-medium">{getVersionLabel(comparisonData.toAnalysisId)}</span>
                </div>
            </header>

            {/* Explanation Section */}
            <div className="glass-card p-8 border border-glass-border/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none transition-opacity group-hover:opacity-100 opacity-50"></div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
                    <h3 className="text-text-primary font-bold text-xl flex items-center gap-3">
                        <AutoFixHighIcon className="text-accent" />
                        AI Explanation
                    </h3>
                    {!comparisonData.explanation && (
                        <button
                            onClick={handleGenerateExplanation}
                            disabled={isExplaining}
                            className="text-sm bg-accent hover:bg-accent/90 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-accent/20 disabled:opacity-50 font-semibold"
                        >
                            {isExplaining ? "Generating Insights..." : "Generate AI Insights"}
                        </button>
                    )}
                </div>

                {comparisonData.explanation ? (
                    <div className="prose prose-invert max-w-none animate-fade-in prose-p:text-text-primary/90 prose-p:leading-relaxed prose-headings:text-text-primary prose-li:text-text-primary/90">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {comparisonData.explanation.explanation}
                        </ReactMarkdown>
                    </div>
                ) : (
                    <div className="text-center py-8 text-text-secondary/70">
                        {isExplaining ? (
                            <div className="flex flex-col items-center gap-3 animate-pulse">
                                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                                <p>Analyzing differences...</p>
                            </div>
                        ) : (
                            <p className="italic">Generate AI insights to understand the key differences between these versions.</p>
                        )}
                    </div>
                )}
            </div>

            {/* Results List */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                    <span className="w-1 h-6 bg-accent rounded-full"></span>
                    Detailed Changes
                </h3>
                <div className="grid gap-4">
                    {comparisonData.results.map((res) => (
                        <div key={res.id} className="glass p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2.5 py-1 rounded-md text-[11px] uppercase font-bold tracking-wider border
                                            ${res.changeType === 'IMPROVED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                res.changeType === 'WORSENED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                    'bg-gray-500/10 text-gray-400 border-gray-500/20'}
                                        `}>
                                            {res.changeType}
                                        </span>
                                        <span className="font-mono font-bold text-text-primary">{res.issueCode}</span>
                                    </div>
                                    <div className="text-sm text-text-secondary flex gap-6">
                                        {res.beforeSeverity && (
                                            <div className="flex items-center gap-2">
                                                <span className="opacity-60">Before:</span>
                                                <span className={`font-medium ${res.beforeSeverity === 'high' ? 'text-red-400' : 'text-text-primary'}`}>{res.beforeSeverity}</span>
                                            </div>
                                        )}
                                        {res.afterSeverity && (
                                            <div className="flex items-center gap-2">
                                                <span className="opacity-60">After:</span>
                                                <span className={`font-medium ${res.afterSeverity === 'high' ? 'text-red-400' : 'text-text-primary'}`}>{res.afterSeverity}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    {(res.beforeComplexity && res.afterComplexity && res.beforeComplexity !== res.afterComplexity) && (
                                        <div className="text-sm bg-bg-tertiary/30 px-3 py-1.5 rounded-lg border border-white/5">
                                            <span className="text-text-secondary opacity-70">Complexity:</span>{' '}
                                            <span className="line-through opacity-50 mx-1">{res.beforeComplexity}</span>
                                            <ArrowForwardIosIcon style={{ fontSize: 10 }} className="inline mx-1 opacity-50" />
                                            <span className="text-accent font-bold">{res.afterComplexity}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {comparisonData.results.length === 0 && (
                    <div className="text-center py-12 text-text-secondary border border-dashed border-border/50 rounded-2xl bg-bg-primary/30">
                        No significant code issues changed between these versions.
                    </div>
                )}
            </div>
        </div>
    );
}

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projects, versions, comparisons } from "../services/api";
import Sidebar from "../components/History/Sidebar";
import ComparisonView from "../components/History/ComparisonView";
import AnalysisView from "../components/History/AnalysisView";
import EmptyState from "../components/History/EmptyState";
import type { Project, Version, Comparison } from "../components/History/types";
import { toast } from "react-toastify";

export default function History() {
    const { projectId, type, id } = useParams();
    const navigate = useNavigate();

    const [projectList, setProjectList] = useState<Project[]>([]);
    const [versionList, setVersionList] = useState<Version[]>([]);
    const [comparisonList, setComparisonList] = useState<Comparison[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"versions" | "comparisons">("versions");

    // Comparison State
    const [isCompareMode, setIsCompareMode] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
    const [isComparing, setIsComparing] = useState(false);

    // Fetch Projects
    useEffect(() => {
        projects.list().then((data) => {
            setProjectList(data);
            if (data.length > 0 && !projectId) {
                navigate(`/history/${data[0].id}`, { replace: true });
            }
        }).catch(console.error);
    }, [projectId, navigate]);

    // Fetch Versions and Comparisons when Project changes
    useEffect(() => {
        if (!projectId) return;

        setIsLoading(true);
        
        Promise.all([
            versions.list(projectId),
            comparisons.list(projectId)
        ]).then(([vData, cData]) => {
            const sortedVersions = vData.sort((a: any, b: any) =>
                new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
            );
            setVersionList(sortedVersions);

            const sortedComparisons = cData.sort((a: any, b: any) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setComparisonList(sortedComparisons);
        }).catch(console.error).finally(() => setIsLoading(false));
    }, [projectId]);

    // Update active tab based on URL type
    useEffect(() => {
        if (type === "version") {
            setActiveTab("versions");
        } else if (type === "comparison") {
            setActiveTab("comparisons");
        }
    }, [type]);

    const handleVersionSelect = async (version: Version) => {
        if (isCompareMode) {
            if (selectedForCompare.includes(version.id)) {
                setSelectedForCompare(prev => prev.filter(id => id !== version.id));
            } else {
                if (selectedForCompare.length < 2) {
                    setSelectedForCompare(prev => [...prev, version.id]);
                } else {
                    toast.warn("You can only compare 2 versions at a time.");
                }
            }
            return;
        }

        navigate(`/history/${projectId}/version/${version.id}`);
    };

    const handleComparisonSelect = async (comparison: Comparison) => {
        navigate(`/history/${projectId}/comparison/${comparison.id}`);
    };

    const toggleCompareMode = () => {
        setIsCompareMode(!isCompareMode);
        setIsEditMode(false);
        setSelectedForCompare([]);
        if (!isCompareMode) {
            navigate(`/history/${projectId}`);
        }
    };

    const toggleEditMode = () => {
        setIsEditMode(!isEditMode);
        setIsCompareMode(false);
        setSelectedForCompare([]);
        navigate(`/history/${projectId}`);
    };

    const handleVersionDelete = async (versionId: string) => {
        if (!window.confirm("Are you sure you want to delete this version?")) return;
        try {
            await versions.delete(versionId);
            setVersionList(prev => prev.filter(v => v.id !== versionId));
            if (id === versionId) {
                navigate(`/history/${projectId}`);
            }
            toast.success("Version deleted successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete version");
        }
    };

    const handleVersionUpdate = async (versionId: string, newLabel: string) => {
        try {
            await versions.update(versionId, { versionLabel: newLabel });
            setVersionList(prev => prev.map(v => v.id === versionId ? { ...v, versionLabel: newLabel } : v));
            toast.success("Version updated successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update version");
        }
    };

    const handleCompare = async () => {
        if (selectedForCompare.length !== 2 || !projectId) return;

        setIsComparing(true);
        const v1 = versionList.find(v => v.id === selectedForCompare[0]);
        const v2 = versionList.find(v => v.id === selectedForCompare[1]);

        if (!v1 || !v2) return;

        const date1 = new Date(v1.uploadedAt).getTime();
        const date2 = new Date(v2.uploadedAt).getTime();

        const fromVersionId = date1 < date2 ? v1.id : v2.id;
        const toVersionId = date1 < date2 ? v2.id : v1.id;

        try {
            const result = await comparisons.create(projectId, {
                fromVersionId,
                toVersionId
            });
            setComparisonList(prev => [result, ...prev]);
            setIsCompareMode(false);
            navigate(`/history/${projectId}/comparison/${result.id}`);
        } catch (error) {
            console.error(error);
            toast.error("Comparison failed. Ensure both versions have been analyzed.");
        } finally {
            setIsComparing(false);
        }
    };

    const handleBackToNavigator = () => {
        navigate(`/history/${projectId}`);
    };

    const handleProjectChange = (newProjectId: string) => {
        navigate(`/history/${newProjectId}`);
    };

    // Helper to get version label by ID or Analysis ID
    const getVersionLabel = (id: string) => {
        const byVersionId = versionList.find(v => v.id === id);
        if (byVersionId) return byVersionId.versionLabel;

        const byAnalysisId = versionList.find(v => v.analysis?.id === id);
        if (byAnalysisId) return byAnalysisId.versionLabel;

        return "Unknown";
    };

    return (
        <div className="flex h-[calc(100vh-80px)] bg-bg-primary overflow-hidden relative">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Sidebar - Navigator */}
            <Sidebar
                projectList={projectList}
                selectedProjectId={projectId || ""}
                onProjectChange={handleProjectChange}
                versionList={versionList}
                comparisonList={comparisonList}
                selectedId={id || null}
                selectedType={(type as any) || null}
                onVersionSelect={handleVersionSelect}
                onComparisonSelect={handleComparisonSelect}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                isCompareMode={isCompareMode}
                onToggleCompareMode={toggleCompareMode}
                isEditMode={isEditMode}
                onToggleEditMode={toggleEditMode}
                onVersionDelete={handleVersionDelete}
                onVersionUpdate={handleVersionUpdate}
                selectedForCompare={selectedForCompare}
                onCompare={handleCompare}
                isComparing={isComparing}
                isLoading={isLoading}
            />

            {/* Main Content */}
            <div
                className={`
          flex-1 overflow-y-auto bg-bg-primary/50 relative
          transition-all duration-500 ease-in-out
          ${id ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none md:opacity-100 md:translate-x-0 md:pointer-events-auto'}
        `}
            >
                <div className="p-6 md:p-10 max-w-5xl mx-auto pb-24">
                    {type === "comparison" && id ? (
                        <ComparisonView
                            comparisonId={id}
                            getVersionLabel={getVersionLabel}
                            onBack={handleBackToNavigator}
                        />
                    ) : type === "version" && id ? (
                        <AnalysisView
                            versionId={id}
                            onBack={handleBackToNavigator}
                        />
                    ) : (
                        <EmptyState
                            isCompareMode={isCompareMode}
                            isLoading={isLoading}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

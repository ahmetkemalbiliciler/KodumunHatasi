import { useState } from "react";
import { format } from "date-fns";
import CodeIcon from "@mui/icons-material/Code";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";


// Mock Data Types
interface Review {
    id: string;
    date: Date;
    fileName: string;
    language: string;
    score: number;
    pros: string[];
    cons: string[];
    codeSnippet: string;
}

// Mock Data
const MOCK_REVIEWS: Review[] = [
    {
        id: "1",
        date: new Date(2023, 11, 24, 14, 30),
        fileName: "auth.service.ts",
        language: "TypeScript",
        score: 85,
        pros: [
            "Proper use of Dependency Injection",
            "Clean error handling structure",
            "Good type safety practices",
        ],
        cons: [
            "Missing input validation for password strength",
            "Hardcoded JWT secret in one method (fixed in v2)",
        ],
        codeSnippet: `async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user && user.password === pass) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }`,
    },
    {
        id: "2",
        date: new Date(2023, 11, 23, 9, 15),
        fileName: "UserProfile.tsx",
        language: "React/TSX",
        score: 60,
        pros: ["Component is functional", "Uses correct hooks for state"],
        cons: [
            "Inline styles should be avoided",
            "Large component needs breaking down",
            "Missing proper prop types definition",
            "useEffect dependency array is incomplete",
        ],
        codeSnippet: `useEffect(() => {
    fetchProfile();
}, []); // Missing dependencies

const fetchProfile = async () => {
   // ... implementation
}`,
    },
    {
        id: "3",
        date: new Date(2023, 11, 20, 16, 45),
        fileName: "utils.py",
        language: "Python",
        score: 92,
        pros: [
            "Excellent docstrings and typing",
            "Efficient list comprehension usage",
            "Follows PEP 8 guidelines",
        ],
        cons: ["Slightly complex regex in email validator"],
        codeSnippet: `def process_data(data: List[Dict]) -> List[int]:
    """Extracs IDs from data dictionaries."""
    return [item['id'] for item in data if 'id' in item and item['active']]`,
    },
];

export default function History() {
    // On mobile, if selectedReview is not null, we show the detail view
    // On desktop, we always show both
    const [selectedReview, setSelectedReview] = useState<Review | null>(
        MOCK_REVIEWS[0]
    );

    // Helper to handle back on mobile
    const handleBackToNavigator = () => {
        // Only strictly necessary if we want to "clear" selection visually on mobile,
        // but typically we might want to keep the selection state but just show list.
        // However, for this simple logic, setting to null or handling a view mode state is best.
        // Let's use a separate state variable for "mobile view mode" if needed, 
        // or just rely on CSS media queries for layout + conditional rendering for mobile.
        // Simpler approach: If on mobile (check with CSS hidden), show list.
        // But React logic is easier: 
        setSelectedReview(null);
    };

    return (
        <div className="flex h-[calc(100vh-80px)] bg-bg-primary overflow-hidden relative">
            {/* Sidebar - Navigator */}
            <div
                className={`
          w-full md:w-1/3 min-w-[300px] max-w-full md:max-w-[400px] 
          bg-bg-secondary border-r border-border flex flex-col 
          absolute md:static top-0 bottom-0 left-0 z-10 transition-transform duration-300
          ${selectedReview ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}
        `}
            >
                <div className="p-4 border-b border-border bg-bg-secondary sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                        <CodeIcon className="text-accent" />
                        History
                    </h2>
                    <p className="text-text-secondary text-sm mt-1">
                        Previous analyses
                    </p>
                </div>
                <div className="overflow-y-auto flex-1 p-2 space-y-2 custom-scrollbar">
                    {MOCK_REVIEWS.map((review) => (
                        <div
                            key={review.id}
                            onClick={() => setSelectedReview(review)}
                            className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border group ${selectedReview?.id === review.id
                                ? "bg-accent/10 border-accent shadow-md md:transform md:scale-[1.01]"
                                : "bg-bg-primary border-border hover:border-text-secondary hover:shadow-sm"
                                }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-semibold text-text-primary truncate">
                                    {review.fileName}
                                </span>
                                <span
                                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${review.score >= 80
                                        ? "bg-green-500/20 text-green-500"
                                        : review.score >= 60
                                            ? "bg-yellow-500/20 text-yellow-500"
                                            : "bg-red-500/20 text-red-500"
                                        }`}
                                >
                                    Score: {review.score}
                                </span>
                            </div>
                            <div className="flex justify-between items-end text-text-secondary text-xs">
                                <span>{review.language}</span>
                                <span>{format(review.date, "MMM d, HH:mm")}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content - Detail View */}
            <div
                className={`
          flex-1 overflow-y-auto bg-bg-primary p-4 md:p-8 custom-scrollbar
          absolute md:static top-0 bottom-0 right-0 left-0 md:left-auto 
          transition-transform duration-300 bg-bg-primary z-20 md:z-auto
          ${selectedReview ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}
            >
                {selectedReview ? (
                    <div className="max-w-4xl mx-auto space-y-6 pb-20">
                        {/* Mobile Back Button */}
                        <div className="md:hidden mb-4">
                            <button
                                onClick={handleBackToNavigator}
                                className="flex items-center text-text-secondary hover:text-text-primary"
                            >
                                <ArrowBackIcon className="mr-2" /> Back to List
                            </button>
                        </div>

                        {/* Header */}
                        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-border/50">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2 break-all">
                                    {selectedReview.fileName}
                                </h1>
                                <p className="text-text-secondary flex items-center gap-2 text-sm">
                                    <span className="bg-bg-tertiary px-2 py-1 rounded text-xs font-mono">
                                        {selectedReview.language}
                                    </span>
                                    <span>•</span>
                                    <span>{format(selectedReview.date, "MMMM d, yyyy 'at' HH:mm")}</span>
                                </p>
                            </div>
                            <div
                                className={`flex flex-col items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full border-4 shrink-0 self-end md:self-auto ${selectedReview.score >= 80
                                    ? "border-green-500 text-green-500"
                                    : selectedReview.score >= 60
                                        ? "border-yellow-500 text-yellow-500"
                                        : "border-red-500 text-red-500"
                                    }`}
                            >
                                <span className="text-xl md:text-2xl font-bold">{selectedReview.score}</span>
                                <span className="text-[8px] md:text-[10px] font-medium uppercase tracking-wider">
                                    Score
                                </span>
                            </div>
                        </header>

                        {/* Pros & Cons Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            {/* Pros */}
                            <div className="bg-bg-secondary/50 glass rounded-2xl p-6 border border-glass-border">
                                <h3 className="text-green-500 font-bold text-lg mb-4 flex items-center gap-2">
                                    <CheckCircleIcon fontSize="small" /> Pros
                                </h3>
                                <ul className="space-y-3">
                                    {selectedReview.pros.map((pro, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0"></span>
                                            <span className="text-text-primary text-sm leading-relaxed">
                                                {pro}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Cons */}
                            <div className="bg-bg-secondary/50 glass rounded-2xl p-6 border border-glass-border">
                                <h3 className="text-red-500 font-bold text-lg mb-4 flex items-center gap-2">
                                    <CancelIcon fontSize="small" /> Cons
                                </h3>
                                <ul className="space-y-3">
                                    {selectedReview.cons.map((con, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0"></span>
                                            <span className="text-text-primary text-sm leading-relaxed">
                                                {con}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Code Snippet */}
                        <div className="mt-8">
                            <h3 className="text-text-primary font-bold text-lg mb-4 flex items-center gap-2">
                                <CodeIcon className="text-accent" /> Code Snippet
                            </h3>
                            <div className="bg-[#1e1e1e] rounded-xl p-4 overflow-x-auto border border-border shadow-inner">
                                <pre className="text-sm font-mono text-gray-300">
                                    <code>{selectedReview.codeSnippet}</code>
                                </pre>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-text-secondary opacity-50">
                        <ArrowForwardIosIcon style={{ fontSize: 64 }} className="mb-4" />
                        <p className="text-xl font-medium">Select a review to see details</p>
                    </div>
                )}
            </div>
        </div>
    );
}

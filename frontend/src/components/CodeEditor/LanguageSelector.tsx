import { useState } from "react";

const languages = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "typescript", label: "TypeScript" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
];

export default function LanguageSelector() {
  const [selected, setSelected] = useState("javascript");

  return (
    <div className="relative group/select">
      <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-accent text-[20px]! pointer-events-none select-none">
        code
      </span>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="appearance-none bg-bg-mobile-secondary text-white text-sm font-mono font-medium rounded-lg py-1.5 pl-9 pr-8 focus:outline-none focus:ring-1 focus:ring-accent/50 cursor-pointer border border-border hover:border-accent/50 transition-colors min-w-[140px]"
      >
        {languages.map((lang) => (
          <option key={lang.value} value={lang.value} className="bg-bg-secondary text-white">
            {lang.label}
          </option>
        ))}
      </select>
      <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary text-sm pointer-events-none group-hover/select:text-white transition-colors select-none">
        expand_more
      </span>
    </div>
  );
}

import LanguageSelector from "./LanguageSelector";
import EditorArea from "./EditorArea";

export default function CodeEditor() {
  return (
    <div className="w-full max-w-[1024px] flex flex-col gap-8 animate-fade-in-up">
      {/* Heading */}
      <div className="flex flex-col gap-3 text-center md:text-left">
        <h1 className="text-white text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em]">
          Kodunu <span className="text-accent">anında</span> analiz et
        </h1>
        <p className="text-text-secondary text-base md:text-lg font-normal leading-normal max-w-2xl">
          Kodunu aşağıya yapıştır. Yapay zekamız hataları, güvenlik açıklarını ve
          performans iyileştirmelerini saniyeler içinde tespit etsin.
        </p>
      </div>

      {/* Code Editor Container - Structure from a.html, Colors from Violet Theme */}
      <div className="group relative flex flex-col w-full rounded-2xl overflow-hidden border border-border bg-bg-secondary shadow-2xl transition-all duration-300 hover:shadow-accent/10 hover:border-accent/50">
        {/* Editor Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 bg-bg-mobile-secondary border-b border-border">
          <div className="flex items-center gap-4">
            {/* Window Controls */}
            <div className="hidden sm:flex gap-1.5 opacity-60">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            {/* Divider */}
            <div className="hidden sm:block w-px h-4 bg-border"></div>
            {/* Language Selector */}
            <LanguageSelector />
          </div>

          {/* Editor Meta */}
          <div className="flex items-center gap-4 text-text-secondary text-xs font-mono">
            <span className="hidden sm:inline-block hover:text-white cursor-pointer transition-colors">
              Auto-detect
            </span>
            <span className="w-px h-3 bg-border hidden sm:block"></span>
            <span className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[16px]!">
                content_copy
              </span>
              <span className="hidden sm:inline">Kopyala</span>
            </span>
          </div>
        </div>

        {/* Editor Area */}
        <EditorArea />

        {/* Editor Footer Status */}
        <div className="px-4 py-2 bg-bg-mobile-secondary border-t border-border flex justify-between items-center text-xs text-text-secondary font-mono">
          <div>Taramaya hazır</div>
          <div>Ln 1, Col 1</div>
        </div>
      </div>

      {/* Action Area - The specific part user wanted to keep */}
      <div className="flex flex-col items-center gap-4 mt-2">
        <button className="group flex min-w-[200px] md:min-w-[240px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-8 bg-accent hover:bg-accent/90 active:scale-95 transition-all duration-200 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]">
          <div className="text-white mr-2 transition-transform duration-300 group-hover:rotate-12">
            <span className="material-symbols-outlined text-[24px]! font-bold">
              bolt
            </span>
          </div>
          <span className="text-white text-lg font-bold leading-normal tracking-[0.015em]">
            İnceleme için Gönder
          </span>
        </button>
        <p className="text-xs text-text-secondary font-medium">
          Göndererek,{" "}
          <a className="underline hover:text-white" href="#">
            Gizlilik Politikamızı
          </a>{" "}
          kabul etmiş olursunuz.
        </p>
      </div>
    </div>
  );
}

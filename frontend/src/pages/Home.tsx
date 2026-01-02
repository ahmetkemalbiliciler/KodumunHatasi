import CodeEditor from "../components/CodeEditor";

export default function Home() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center px-4 py-8 md:py-12 lg:px-40 bg-bg-primary">
      <CodeEditor />
    </div>
  );
}


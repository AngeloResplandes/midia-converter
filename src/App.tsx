import { useState, useEffect } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { LandingPage } from "@/components/pages/LandingPage";
import { ImageConverter } from "@/components/converters/ImageConverter";
import { VideoConverter } from "@/components/converters/VideoConverter";
import "@/styles/index.css";

function getHashPage(): string {
  return window.location.hash.replace("#/", "").replace("#", "");
}

export function App() {
  const [page, setPage] = useState(getHashPage);

  useEffect(() => {
    const onHashChange = () => setPage(getHashPage());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = (target: string) => {
    window.location.hash = `#/${target}`;
  };

  const renderPage = () => {
    switch (page) {
      case "image":
        return <ImageConverter onNavigate={navigate} />;
      case "video":
        return <VideoConverter onNavigate={navigate} />;
      default:
        return <LandingPage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      <Navbar currentPage={page} onNavigate={navigate} />
      <main className="animate-page-in">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;

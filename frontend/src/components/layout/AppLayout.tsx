import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Play, GitCompare, Database, BarChart3, FileText, Truck } from "lucide-react";
import gsap from "gsap";
import { Solver } from "@/pages/Solver";
import { Compare } from "@/pages/Compare";
import { Datasets } from "@/pages/Datasets";
import { Results } from "@/pages/Results";
import { Home as HomePage } from "@/pages/Home";
import { ApiStatusDocumentation } from "../../pages/ApiStatusDocumentation";

type TabId = "home" | "solver" | "compare" | "datasets" | "results";

const TABS: { id: TabId; label: string; path: string; icon: React.ReactNode }[] = [
  { id: "home", label: "Home", path: "/", icon: <Home className="h-4 w-4" /> },
  { id: "solver", label: "Run Algorithm", path: "/solver", icon: <Play className="h-4 w-4" /> },
  { id: "compare", label: "Compare All", path: "/compare", icon: <GitCompare className="h-4 w-4" /> },
  { id: "datasets", label: "Datasets & BKS", path: "/datasets", icon: <Database className="h-4 w-4" /> },
  { id: "results", label: "Experiment Results", path: "/results", icon: <BarChart3 className="h-4 w-4" /> },
];

function TabContent({ activeTab }: { activeTab: TabId }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
  }, []);
  return (
    <div ref={ref}>
      {activeTab === "home" && <HomePage />}
      {activeTab === "solver" && <Solver />}
      {activeTab === "compare" && <Compare />}
      {activeTab === "datasets" && <Datasets />}
      {activeTab === "results" && <Results />}
    </div>
  );
}

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab: TabId = (TABS.find((t) => t.path === location.pathname)?.id as TabId) ?? "solver";
  const handleTabChange = (tab: TabId) => {
    const t = TABS.find((x) => x.id === tab);
    if (t) navigate(t.path);
  };

  return (
    <div className="min-h-screen" style={{ background: "#f5f0ff" }}>
      <header style={{ background: "linear-gradient(135deg, #2d0a6e 0%, #4a1a9e 60%, #6b2fc4 100%)", borderBottom: "3px solid #c9a84c", boxShadow: "0 4px 24px rgba(45,10,110,0.4)" }}>
        <div className="mx-auto max-w-9xl px-2 lg:px-4 xl:px-6 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="rounded-xl p-3" style={{ background: "linear-gradient(135deg, #c9a84c, #f0d080)", boxShadow: "0 2px 12px rgba(201,168,76,0.5)" }}>
                <Truck className="h-7 w-7" style={{ color: "#2d0a6e" }} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight" style={{ color: "#f0d080" }}>RouteIQ</h1>
                <p className="text-sm font-medium" style={{ color: "#d4b8f0" }}>Intelligent VRPTW Platform - Metaheuristic Algorithm Benchmark Suite</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg px-4 py-2 text-sm font-semibold" style={{ background: "rgba(201,168,76,0.15)", border: "1px solid #c9a84c", color: "#f0d080" }}>
                NMIMS - Optimization Techniques
              </div>
              <button type="button" onClick={() => navigate("/api-status-documentation")} className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all cursor-pointer" style={{ background: location.pathname === "/api-status-documentation" ? "rgba(201,168,76,0.3)" : "rgba(255,255,255,0.08)", border: "1px solid rgba(201,168,76,0.5)", color: "#f0d080" }}>
                <FileText className="h-4 w-4" />
                API Docs
              </button>
            </div>
          </div>
          <div className="mt-5 flex gap-1 rounded-xl p-1" style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(201,168,76,0.2)" }}>
            {TABS.map((tab) => (
              <button key={tab.id} type="button" onClick={() => handleTabChange(tab.id)} className="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all cursor-pointer" style={activeTab === tab.id ? { background: "linear-gradient(135deg, #c9a84c, #f0d080)", color: "#2d0a6e", fontWeight: 700, boxShadow: "0 2px 10px rgba(201,168,76,0.4)" } : { color: "#d4b8f0" }}>
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-9xl px-2 lg:px-4 xl:px-6 py-6">
        {location.pathname === "/api-status-documentation" ? <ApiStatusDocumentation /> : <TabContent key={activeTab} activeTab={activeTab} />}
      </main>
      <footer className="mx-auto max-w-9xl px-2 lg:px-4 xl:px-6 py-6">
        <div className="rounded-xl px-6 py-5" style={{ background: "linear-gradient(135deg, #2d0a6e 0%, #4a1a9e 100%)", border: "1px solid rgba(201,168,76,0.3)" }}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-xl p-2.5" style={{ background: "linear-gradient(135deg, #c9a84c, #f0d080)" }}>
                <Truck className="h-5 w-5" style={{ color: "#2d0a6e" }} />
              </div>
              <div>
                <h1 className="text-base font-bold" style={{ color: "#f0d080" }}>RouteIQ - Intelligent VRPTW Platform</h1>
                <p className="text-xs" style={{ color: "#d4b8f0" }}>NMIMS University - Optimization Techniques Project - {new Date().getFullYear()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs" style={{ color: "#d4b8f0" }}>Built with React - FastAPI - Metaheuristics</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

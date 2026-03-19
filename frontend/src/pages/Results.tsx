import { useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  getTestResultSets,
  getTestResultExperiments,
  getTestResultContent,
  getTestResultImageUrl,
} from "@/lib/api";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Download,
  FileText,
  Filter,
  Loader2,
  Maximize2,
  Search,
  SlidersHorizontal,
  Trophy,
  X,
} from "lucide-react";
import { Skeleton } from "@/components/common/Skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type TestResultSet = { id: string; name: string };
type TestExperiment = {
  id: string;
  has_txt: boolean;
  txt_name: string | null;
  images: string[];
};

function downloadTextFile(fileName: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function downloadJsonFile(fileName: string, data: unknown) {
  const content = JSON.stringify(data, null, 2);
  const blob = new Blob([content], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function getTestResultContentUrl(setId: string, expId: string): string {
  const base = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const s = encodeURIComponent(setId);
  const e = encodeURIComponent(expId);
  return `${base}/api/test-results/${s}/${e}/content`;
}

function getTestResultImageDownloadUrl(setId: string, expId: string, filename: string): string {
  return `${getTestResultImageUrl(setId, expId, filename)}?download=1`;
}

function getTestResultsZipUrl(): string {
  const base = import.meta.env.VITE_API_URL || "http://localhost:8000";
  return import.meta.env.VITE_TEST_RESULTS_ZIP_URL || `${base}/test_results.zip`;
}

function ResultsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-4 flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-72" />
            <Skeleton className="h-4 w-[520px]" />
            <Skeleton className="h-4 w-[420px]" />
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="py-2">
              <div className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-44" />
              </div>
              <div className="ml-6 mt-2 space-y-2">
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Results() {
  const { data: sets, isLoading } = useQuery({
    queryKey: ["test-results-sets"],
    queryFn: getTestResultSets,
  });

  const experimentsPreviewQueries = useQueries({
    queries: (sets ?? []).map((set) => ({
      queryKey: ["test-results-experiments-preview", set.id],
      queryFn: () => getTestResultExperiments(set.id),
      enabled: !!sets?.length,
      staleTime: 60_000,
    })),
  });

  const [expandedSet, setExpandedSet] = useState<string | null>(null);
  const [expandedExp, setExpandedExp] = useState<string | null>(null);
  const [resultsSearch, setResultsSearch] = useState("");
  const [selectedResultsSetFilter, setSelectedResultsSetFilter] = useState<string>("all");
  const [isDownloadingAllResults, setIsDownloadingAllResults] = useState(false);

  const experimentsBySet = (sets ?? []).reduce<Record<string, TestExperiment[]>>((acc, set, index) => {
    acc[set.id] = (experimentsPreviewQueries[index]?.data ?? []).map((exp) => ({
      id: exp.id,
      has_txt: exp.has_txt,
      txt_name: exp.txt_name,
      images: exp.images,
    }));
    return acc;
  }, {});

  const normalizedResultsSearch = resultsSearch.trim().toLowerCase();
  const selectedResultsSetLabel =
    selectedResultsSetFilter === "all"
      ? "All Sets"
      : (sets?.find((set) => set.id === selectedResultsSetFilter)?.name ?? "All Sets");

  const filteredResultSets = (sets ?? []).filter((set) => {
    if (selectedResultsSetFilter !== "all" && set.id !== selectedResultsSetFilter) return false;
    if (!normalizedResultsSearch) return true;
    const matchesSet =
      set.name.toLowerCase().includes(normalizedResultsSearch) ||
      set.id.toLowerCase().includes(normalizedResultsSearch);
    const matchesExperiment = (experimentsBySet[set.id] ?? []).some((exp) =>
      exp.id.toLowerCase().includes(normalizedResultsSearch),
    );
    return matchesSet || matchesExperiment;
  });

  const handleDownloadAllResults = async () => {
    if (!sets?.length) return;
    setIsDownloadingAllResults(true);
    try {
      const exportedSets = await Promise.all(
        sets.map(async (set) => {
          const preview = experimentsBySet[set.id] ?? [];
          const experiments = preview.length > 0 ? preview : await getTestResultExperiments(set.id);
          return {
            id: set.id,
            name: set.name,
            experiments: experiments.map((exp) => ({
              id: exp.id,
              has_txt: exp.has_txt,
              txt_name: exp.txt_name,
              content_url: exp.has_txt ? getTestResultContentUrl(set.id, exp.id) : null,
              images: exp.images,
              image_urls: exp.images.map((img) => getTestResultImageUrl(set.id, exp.id, img)),
            })),
          };
        }),
      );
      downloadJsonFile(`vrptw-test-results-${new Date().toISOString().slice(0, 10)}.json`, {
        generated_at: new Date().toISOString(),
        total_sets: exportedSets.length,
        sets: exportedSets,
      });
    } finally {
      setIsDownloadingAllResults(false);
    }
  };

  const handleDownloadAllResultsZip = () => {
    const url = getTestResultsZipUrl();
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "vrptw-test-results.zip";
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.click();
  };

  if (isLoading) return <ResultsSkeleton />;

  if (!sets?.length) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Test Results</h2>
        <p className="text-slate-600">No experiment results found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="self-start rounded-lg bg-green-100 p-4">
              <Trophy className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Best-Known Solutions & Algorithm Results</h2>
              <p className="text-md text-slate-500">
                Explore experiment sets with different tuning choices. Expand each set to see best-known solutions, algorithm outputs, and plots.
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-300 bg-white px-2 py-2.5 text-base font-medium text-slate-700 shadow-lg transition-colors hover:bg-slate-100" title="Download all results">
                <Download className="h-4 w-4" />
                Download All Results
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Export format</div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDownloadAllResultsZip}>
                <Download className="h-4 w-4" />
                Download as .zip
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadAllResults} disabled={isDownloadingAllResults}>
                {isDownloadingAllResults ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Download as .json
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50/70 p-3 shadow-lg">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={resultsSearch}
                onChange={(event) => setResultsSearch(event.target.value)}
                placeholder="Search sets or instances (e.g., c101, r201, Ex.1)..."
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-base text-slate-900 shadow-lg transition-colors placeholder:text-slate-400"
              />
              {resultsSearch && (
                <button type="button" onClick={() => setResultsSearch("")} className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-2 py-2.5 text-base font-medium text-slate-700 shadow-lg transition-colors hover:bg-slate-100">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>{selectedResultsSetLabel}</span>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Filter sets</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSelectedResultsSetFilter("all")} className="flex items-center justify-between">
                  <span>All Sets</span>
                  {selectedResultsSetFilter === "all" ? <Check className="h-4 w-4 text-slate-700" /> : null}
                </DropdownMenuItem>
                {(sets ?? []).map((set) => (
                  <DropdownMenuItem key={set.id} onClick={() => setSelectedResultsSetFilter(set.id)} className="flex items-center justify-between">
                    <span>{set.name}</span>
                    {selectedResultsSetFilter === set.id ? <Check className="h-4 w-4 text-slate-700" /> : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {(resultsSearch || selectedResultsSetFilter !== "all") && (
              <button type="button" onClick={() => { setResultsSearch(""); setSelectedResultsSetFilter("all"); }} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-base font-medium text-slate-700 shadow-lg transition-colors hover:bg-slate-100">
                <Filter className="h-4 w-4" />
                Reset
              </button>
            )}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Showing {filteredResultSets.length} of {(sets ?? []).length} sets
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredResultSets.map((set) => (
            <ExperimentSetItem
              key={set.id}
              set={set}
              searchTerm={normalizedResultsSearch}
              expanded={expandedSet === set.id}
              onToggleSet={() => { setExpandedSet(expandedSet === set.id ? null : set.id); setExpandedExp(null); }}
              expandedExp={expandedExp}
              onToggleExp={setExpandedExp}
            />
          ))}
          {filteredResultSets.length === 0 && (
            <div className="py-6 text-center text-sm text-slate-500">No result sets match your current search/filter.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ExperimentSetItem({ set, searchTerm, expanded, onToggleSet, expandedExp, onToggleExp }: {
  set: TestResultSet;
  searchTerm: string;
  expanded: boolean;
  onToggleSet: () => void;
  expandedExp: string | null;
  onToggleExp: (id: string | null) => void;
}) {
  const { data: experiments, isLoading } = useQuery({
    queryKey: ["test-results-experiments", set.id],
    queryFn: () => getTestResultExperiments(set.id),
    enabled: expanded,
  });

  const visibleExperiments = (experiments ?? []).filter((exp) => {
    if (!searchTerm) return true;
    return exp.id.toLowerCase().includes(searchTerm) || set.name.toLowerCase().includes(searchTerm);
  });

  return (
    <div className="py-2">
      <button type="button" onClick={onToggleSet} className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-50 cursor-pointer">
        {expanded ? <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" /> : <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />}
        <span className="font-medium text-slate-900">{set.name}</span>
      </button>
      {expanded && (
        <div className="ml-6 mt-2 space-y-2">
          {isLoading ? (
            <p className="text-sm text-slate-500">Loading experiments...</p>
          ) : visibleExperiments.length > 0 ? (
            visibleExperiments.map((exp) => (
              <ExperimentItem
                key={exp.id}
                setId={set.id}
                exp={exp}
                expanded={expandedExp === `${set.id}/${exp.id}`}
                onToggle={() => onToggleExp(expandedExp === `${set.id}/${exp.id}` ? null : `${set.id}/${exp.id}`)}
              />
            ))
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">No instances match the current search.</p>
          )}
        </div>
      )}
    </div>
  );
}

function ExperimentItem({ setId, exp, expanded, onToggle }: {
  setId: string;
  exp: TestExperiment;
  expanded: boolean;
  onToggle: () => void;
}) {
  const [copiedInstance, setCopiedInstance] = useState(false);
  const [isDownloadingInstance, setIsDownloadingInstance] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: content, isLoading } = useQuery({
    queryKey: ["test-results-content", setId, exp.id],
    queryFn: () => getTestResultContent(setId, exp.id),
    enabled: expanded && exp.has_txt,
  });

  const handleCopyInstance = async () => {
    try {
      const textToCopy = exp.has_txt
        ? (content ?? (await getTestResultContent(setId, exp.id)))
        : `Set: ${setId}\nInstance: ${exp.id}\nImages:\n${exp.images.map((img) => `- ${getTestResultImageUrl(setId, exp.id, img)}`).join("\n")}`;
      await navigator.clipboard.writeText(textToCopy);
      setCopiedInstance(true);
      setTimeout(() => setCopiedInstance(false), 1500);
    } catch { /* ignore */ }
  };

  const handleDownloadInstance = async () => {
    setIsDownloadingInstance(true);
    try {
      if (exp.has_txt) {
        const text = content ?? (await getTestResultContent(setId, exp.id));
        downloadTextFile(`${exp.id}.txt`, text);
      } else {
        downloadJsonFile(`${exp.id}.json`, { set_id: setId, instance_id: exp.id, has_txt: false, images: exp.images });
      }
    } finally {
      setIsDownloadingInstance(false);
    }
  };

  const handleDownloadImage = (imageName: string) => {
    const anchor = document.createElement("a");
    anchor.href = getTestResultImageDownloadUrl(setId, exp.id, imageName);
    anchor.download = imageName;
    anchor.click();
  };

  const selectedImageUrl = selectedImage ? getTestResultImageUrl(setId, exp.id, selectedImage) : null;

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/50">
      <button type="button" onClick={onToggle} className="flex w-full items-center gap-2 px-3 py-2.5 text-left transition-colors hover:bg-slate-100 cursor-pointer">
        {expanded ? <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" /> : <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />}
        <FileText className="h-4 w-4 text-slate-500" />
        <span className="font-medium text-slate-800">{exp.id}</span>
        {exp.images.length > 0 && <span className="text-xs text-slate-500">({exp.images.length} plots)</span>}
      </button>
      {expanded && (
        <div className="border-t border-slate-200 p-4">
          <div className="mb-3 flex justify-end gap-2">
            <button type="button" onClick={handleCopyInstance} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition-colors hover:bg-slate-100" title={copiedInstance ? "Copied" : "Copy"}>
              {copiedInstance ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </button>
            <button type="button" onClick={handleDownloadInstance} disabled={isDownloadingInstance} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-60" title="Download">
              {isDownloadingInstance ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            </button>
          </div>
          {exp.has_txt && (
            isLoading ? <p className="text-sm text-slate-500">Loading...</p> :
            content ? <pre className="mb-4 max-h-80 overflow-auto rounded-lg bg-white p-4 text-xs text-slate-700 whitespace-pre-wrap font-mono">{content}</pre> : null
          )}
          {exp.images.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {exp.images.map((img) => (
                <div key={img} className="rounded-lg border border-slate-200 bg-white p-2">
                  <button type="button" onClick={() => setSelectedImage(img)} className="group block rounded">
                    <img src={getTestResultImageUrl(setId, exp.id, img)} alt={img} className="max-h-48 w-auto rounded object-contain transition-opacity group-hover:opacity-90" />
                  </button>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="text-xs text-slate-500">{img}</p>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => setSelectedImage(img)} className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100" title="View">
                        <Maximize2 className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => handleDownloadImage(img)} className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100" title="Download">
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Dialog open={selectedImage !== null} onOpenChange={(open) => { if (!open) setSelectedImage(null); }}>
            <DialogContent className="h-[90vh] max-h-[90vh] w-[90vw] max-w-[90vw] p-4" aria-describedby={undefined}>
              <div className="flex h-full flex-col">
                <div className="mb-3 flex items-center justify-between pr-8">
                  <DialogTitle className="truncate text-sm font-medium text-slate-700">{selectedImage ?? "Plot preview"}</DialogTitle>
                  {selectedImage && (
                    <button type="button" onClick={() => handleDownloadImage(selectedImage)} className="inline-flex h-8 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100">
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  )}
                </div>
                <div className="flex-1 overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-2">
                  {selectedImageUrl && <img src={selectedImageUrl} alt={selectedImage ?? "Plot"} className="mx-auto h-full max-h-full w-auto object-contain" />}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
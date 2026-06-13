import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, ListChecks, Image as ImageIcon } from "lucide-react";
import { API_BASE_URL } from "../../../core/utils/api";

interface CrashClassroomState {
  subject: string;
  categoryTitle?: string;
  chapterTitle: string;
  jsonUrl: string;
  duration?: string;
}

interface CrashJsonDefinition {
  term: string;
  definition: string;
}

interface CrashJson {
  metadata?: {
    subject?: string;
    class?: string;
    chapter?: string;
    topic?: string;
    exam_type?: string;
  };
  lecture_script?: string | any;
  duration_minutes?: string;
  difficulty_level?: string;
  images?: { url?: string; alt?: string }[] | string[];
  keywords?: string[];
  formulas?: { formula: string; description?: string }[];
  definitions?: CrashJsonDefinition[];
}

export const CrashClassroom: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as CrashClassroomState | undefined;

  const [data, setData] = React.useState<CrashJson | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!state?.jsonUrl) {
      navigate("/");
      return;
    }

    const controller = new AbortController();
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const url =
          state.jsonUrl.startsWith("http") || state.jsonUrl.startsWith("/")
            ? state.jsonUrl
            : `${API_BASE_URL.replace(/\/$/, "")}/oneshorts${state.jsonUrl}`;

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
          throw new Error(`Failed to load crash course (${res.status})`);
        }
        const json = (await res.json()) as CrashJson;
        setData(json);
      } catch (e: any) {
        if (e.name !== "AbortError") {
          setError(e.message || "Failed to load crash course.");
        }
      } finally {
        setLoading(false);
      }
    };

    load();

    return () => controller.abort();
  }, [state, navigate]);

  if (!state) {
    return null;
  }

  const chapterTitle = state.chapterTitle;
  const subjectLabel = state.subject;

  const lectureText =
    typeof data?.lecture_script === "string"
      ? data.lecture_script
      : Array.isArray(data?.lecture_script)
      ? data?.lecture_script
          .map((seg: any) => {
            if (typeof seg === "string") return seg;
            if (seg.segment_title && Array.isArray(seg.content)) {
              const inner = seg.content
                .map((c: any) => {
                  if (typeof c === "string") return c;
                  const items: string[] = [];
                  if (c.so_what) items.push(`SO WHAT: ${c.so_what}`);
                  if (c.simple_truth) items.push(`SIMPLE TRUTH: ${c.simple_truth}`);
                  if (c.neet_lens) items.push(`NEET LENS: ${c.neet_lens}`);
                  if (c.trap_alert) items.push(`TRAP: ${c.trap_alert}`);
                  return items.join("\n");
                })
                .join("\n\n");
              return `${seg.segment_title}\n\n${inner}`;
            }
            return "";
          })
          .join("\n\n")
      : "";

  const keywords = data?.keywords || [];
  const definitions = data?.definitions || [];
  const images = (data?.images || []).map((img) =>
    typeof img === "string" ? { url: img, alt: "" } : img
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050816] via-[#070b18] to-[#020617] text-white flex flex-col">
      <header className="h-16 flex items-center justify-between px-4 sm:px-8 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/20 text-xs sm:text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-semibold">
            Crash Courses Classes
          </p>
          <p className="text-xs text-slate-300">
            {subjectLabel} • {data?.metadata?.class || "NEET"}
          </p>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-4 sm:gap-6 p-4 sm:p-6 lg:p-8">
        <section className="flex-[1.4] rounded-3xl bg-slate-900/70 border border-slate-800 shadow-2xl shadow-purple-500/20 overflow-hidden flex flex-col">
          <div className="px-5 sm:px-7 py-4 border-b border-slate-800 bg-gradient-to-r from-purple-700/50 via-slate-900 to-slate-900/80 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-purple-200 font-semibold flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Smart Board
              </p>
              <h1 className="text-lg sm:text-xl font-black text-white leading-snug">
                {chapterTitle}
              </h1>
            </div>
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[11px] font-semibold text-purple-200 uppercase tracking-[0.16em]">
                Duration
              </span>
              <span className="text-sm font-bold text-white">
                {state.duration || data?.duration_minutes || "12 mins"}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 sm:p-7 text-sm sm:text-base leading-relaxed text-slate-100 whitespace-pre-wrap">
            {loading && (
              <div className="h-full flex items-center justify-center text-slate-300">
                Loading crash course...
              </div>
            )}
            {error && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-center gap-2">
                <p className="text-red-300 text-sm font-semibold">
                  Failed to load crash course.
                </p>
                <p className="text-xs text-slate-400 max-w-md">{error}</p>
              </div>
            )}
            {!loading && !error && lectureText && (
              <div className="space-y-4">
                {lectureText.split("\n").map((line, idx) => (
                  <p key={idx} className="text-slate-100/95">
                    {line}
                  </p>
                ))}
              </div>
            )}
          </div>
        </section>

        <aside className="flex-1 flex flex-col gap-4 sm:gap-5">
          <div className="rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl p-4 sm:p-5 flex flex-col h-[42%]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center">
                  <ListChecks className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-200 font-semibold">
                    Keywords
                  </p>
                  <p className="text-xs text-slate-300">
                    High-yield terms for this chapter
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {loading && (
                <p className="text-xs text-slate-500">Loading keywords...</p>
              )}
              {!loading && keywords.length === 0 && (
                <p className="text-xs text-slate-500">No keywords available.</p>
              )}
              {keywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-[11px] font-semibold text-emerald-200 mr-1 mb-1"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl p-4 sm:p-5 flex flex-col h-[58%]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-200 font-semibold">
                    Definitions & Visuals
                  </p>
                  <p className="text-xs text-slate-300">
                    Precise definitions and supporting images.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3">
              {!loading && definitions.length === 0 && images.length === 0 && (
                <p className="text-xs text-slate-500">
                  Definitions and images will appear here once available.
                </p>
              )}
              {definitions.length > 0 && (
                <div className="space-y-2">
                  {definitions.map((d) => (
                    <div
                      key={d.term}
                      className="rounded-2xl bg-slate-900 border border-slate-800 px-3 py-2.5"
                    >
                      <p className="text-[11px] font-semibold text-slate-100 uppercase tracking-[0.12em]">
                        {d.term}
                      </p>
                      <p className="text-xs text-slate-300 mt-1">{d.definition}</p>
                    </div>
                  ))}
                </div>
              )}
              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {images.map((img, idx) => (
                    <div
                      key={img.url || idx}
                      className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900"
                    >
                      <img
                        src={img.url || ""}
                        alt={img.alt || chapterTitle}
                        className="w-full h-24 object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};


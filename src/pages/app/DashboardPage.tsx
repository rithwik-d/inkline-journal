import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, FileText, PenLine, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { createStory, getDashboardData } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { usePageMeta } from "@/lib/use-page-meta";
import type { DashboardData, Prompt } from "@/lib/types";

export function DashboardPage() {
  usePageMeta("Your journal — Inkline Journal");

  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData>({
    drafts: [],
    published: [],
    prompts: [],
    todayPrompt: null,
  });

  useEffect(() => {
    getDashboardData()
      .then(setData)
      .catch((error) => toast.error(error instanceof Error ? error.message : "Could not load your journal."));
  }, []);

  async function startFromPrompt(prompt: Prompt | null) {
    try {
      const response = await createStory({ promptId: prompt?.id ?? null });
      navigate(`/app/write/${response.storyId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start a story.");
    }
  }

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 5) return "Still up";
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="px-6 md:px-12 py-12 max-w-5xl mx-auto">
      <header className="mb-12">
        <div className="eyebrow mb-2">Your journal</div>
        <h1 className="font-display text-4xl md:text-5xl tracking-tight">{greeting}.</h1>
        <p className="mt-2 text-ink-soft">What feels worth writing today?</p>
      </header>

      {data.todayPrompt && (
        <section className="rounded-2xl p-8 bg-card border border-rule mb-12 shadow-[0_18px_44px_-30px_rgba(80,50,30,0.3)]">
          <div className="flex items-start gap-6">
            <div className="hidden md:grid h-12 w-12 rounded-full bg-terracotta-soft text-terracotta place-items-center">
              <Sparkles size={20} />
            </div>
            <div className="flex-1">
              <div className="eyebrow mb-2">Today&apos;s prompt</div>
              <h2 className="font-display text-3xl leading-tight">{data.todayPrompt.title}</h2>
              <p className="mt-3 font-prose italic text-ink-soft">{data.todayPrompt.body}</p>
              <button
                onClick={() => startFromPrompt(data.todayPrompt)}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-ink text-paper text-sm font-medium hover:bg-ink/85 transition"
              >
                <PenLine size={14} /> Write from this prompt
              </button>
            </div>
          </div>
        </section>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <button
          onClick={() => startFromPrompt(null)}
          className="p-6 rounded-2xl border border-rule bg-paper hover:bg-paper-warm text-left transition group"
        >
          <PenLine size={20} className="text-terracotta mb-3" />
          <div className="font-display text-xl">Start from a blank page</div>
          <p className="mt-1 text-sm text-ink-soft">When you already know what you want to say.</p>
        </button>
        <Link to="/app/write" className="p-6 rounded-2xl border border-rule bg-paper hover:bg-paper-warm text-left transition group block">
          <Sparkles size={20} className="text-sage mb-3" />
          <div className="font-display text-xl">Browse all prompts</div>
          <p className="mt-1 text-sm text-ink-soft">
            {data.prompts.length} guided prompts across {new Set(data.prompts.map((prompt) => prompt.suggestedTheme).filter(Boolean)).size} themes.
          </p>
        </Link>
      </div>

      <section className="mb-12">
        <div className="flex items-end justify-between mb-5">
          <h2 className="font-display text-2xl">Drafts in progress</h2>
          <Link to="/app/drafts" className="text-sm text-ink-soft hover:text-ink">All drafts →</Link>
        </div>
        {data.drafts.length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed border-rule text-center text-ink-soft">
            No drafts yet. Pick a prompt above and start.
          </div>
        ) : (
          <div className="space-y-2">
            {data.drafts.map((story) => (
              <Link key={story.id} to={`/app/write/${story.id}`} className="flex items-center justify-between p-4 rounded-xl border border-rule bg-card hover:border-terracotta transition">
                <div>
                  <div className="font-display text-lg">{story.title || "Untitled"}</div>
                  <div className="text-xs text-ink-soft mt-1">
                    {story.wordCount} words · last edited {formatDate(story.updatedAt)}
                  </div>
                </div>
                <FileText size={16} className="text-ink-soft" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {data.published.length > 0 && (
        <section>
          <div className="flex items-end justify-between mb-5">
            <h2 className="font-display text-2xl">Recently published</h2>
            <Link to="/app/published" className="text-sm text-ink-soft hover:text-ink">All published →</Link>
          </div>
          <div className="space-y-2">
            {data.published.map((story) => (
              <div key={story.id} className="flex items-center justify-between p-4 rounded-xl border border-rule bg-card">
                <div>
                  <div className="font-display text-lg">{story.title}</div>
                  <div className="text-xs text-ink-soft mt-1">
                    {story.themeName ?? "Unthemed"} · {formatDate(story.publishedAt ?? story.updatedAt)}
                  </div>
                </div>
                <BookOpen size={16} className="text-ink-soft" />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PenLine, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { createStory, listPrompts } from "@/lib/api";
import { usePageMeta } from "@/lib/use-page-meta";
import type { Prompt } from "@/lib/types";

export function WriteStartPage() {
  usePageMeta("Begin a story — Inkline Journal");

  const navigate = useNavigate();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    listPrompts()
      .then((data) => setPrompts(data.prompts))
      .catch((error) => toast.error(error instanceof Error ? error.message : "Could not load prompts."));
  }, []);

  const themes = useMemo(
    () => Array.from(new Set(prompts.map((prompt) => prompt.suggestedTheme).filter(Boolean))) as string[],
    [prompts],
  );
  const filteredPrompts = useMemo(
    () => (filter === "all" ? prompts : prompts.filter((prompt) => prompt.suggestedTheme === filter)),
    [filter, prompts],
  );

  async function startStory(prompt: Prompt | null) {
    try {
      const response = await createStory({ promptId: prompt?.id ?? null });
      navigate(`/app/write/${response.storyId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start a story.");
    }
  }

  return (
    <div className="px-6 md:px-12 py-12 max-w-5xl mx-auto">
      <header className="mb-10">
        <div className="eyebrow mb-2">Begin</div>
        <h1 className="font-display text-4xl md:text-5xl tracking-tight">A gentle place to start.</h1>
        <p className="mt-3 text-ink-soft max-w-xl">
          Pick a prompt that meets you where you are, or write from scratch.
        </p>
      </header>

      <button
        onClick={() => startStory(null)}
        className="w-full mb-12 p-6 rounded-2xl border border-rule bg-card hover:bg-paper-warm transition flex items-center justify-between group"
      >
        <div className="flex items-center gap-4">
          <div className="grid h-11 w-11 rounded-full bg-ink text-paper place-items-center"><PenLine size={18} /></div>
          <div className="text-left">
            <div className="font-display text-xl">Write from scratch</div>
            <div className="text-sm text-ink-soft">When you already know what you want to say.</div>
          </div>
        </div>
        <div className="text-ink-soft group-hover:text-ink">→</div>
      </button>

      <div className="mb-6 flex items-end justify-between">
        <h2 className="font-display text-2xl">Or pick a prompt</h2>
        <Sparkles size={16} className="text-terracotta" />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={(filter === "all" ? "bg-ink text-paper " : "bg-card border border-rule text-ink-soft hover:text-ink ") + "px-3 py-1.5 rounded-full text-xs transition"}
        >All</button>
        {themes.map((theme) => (
          <button
            key={theme}
            onClick={() => setFilter(theme)}
            className={(filter === theme ? "bg-ink text-paper " : "bg-card border border-rule text-ink-soft hover:text-ink ") + "px-3 py-1.5 rounded-full text-xs capitalize transition"}
          >
            {theme.replace(/-/g, " ")}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filteredPrompts.map((prompt) => (
          <button
            key={prompt.id}
            onClick={() => startStory(prompt)}
            className="p-6 rounded-2xl border border-rule bg-paper hover:bg-card hover:border-terracotta transition text-left group"
          >
            <div className="eyebrow mb-2 capitalize">{prompt.suggestedTheme?.replace(/-/g, " ") ?? "open"}</div>
            <div className="font-display text-xl leading-snug">{prompt.title}</div>
            <p className="mt-2 text-sm text-ink-soft font-prose italic">{prompt.body}</p>
            <div className="mt-4 text-xs text-terracotta opacity-0 group-hover:opacity-100 transition">
              Begin with this →
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

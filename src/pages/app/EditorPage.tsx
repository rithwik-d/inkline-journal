import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { archiveStory, getEditorStory, listThemes, publishStory, restoreStory, updateStory } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { usePageMeta } from "@/lib/use-page-meta";
import type { StoryEditor, Theme } from "@/lib/types";

const contentWarnings = [
  { value: "", label: "None" },
  { value: "grief & loss", label: "Grief & loss" },
  { value: "mental health", label: "Mental health" },
  { value: "abuse", label: "Abuse" },
  { value: "addiction", label: "Addiction" },
  { value: "medical", label: "Medical" },
  { value: "violence", label: "Violence" },
];

export function EditorPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState<StoryEditor | null>(null);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [saving, setSaving] = useState<"idle" | "saving" | "saved">("idle");
  const [dirty, setDirty] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  usePageMeta(story ? `${story.title || "Write"} — Inkline Journal` : "Write — Inkline Journal");

  useEffect(() => {
    Promise.all([getEditorStory(id), listThemes()])
      .then(([storyResponse, themeResponse]) => {
        setStory(storyResponse.story);
        setThemes(themeResponse.themes);
      })
      .catch((error) => {
        toast.error(error instanceof Error ? error.message : "Could not load this story.");
        navigate("/app/drafts");
      })
      .finally(() => setInitialLoadComplete(true));
  }, [id, navigate]);

  useEffect(() => {
    if (!story || !dirty || !initialLoadComplete) {
      return;
    }

    setSaving("saving");

    const timer = window.setTimeout(async () => {
      try {
        const response = await updateStory(story.id, {
          title: story.title,
          dek: story.dek,
          body: story.body,
          theme: story.theme,
          contentWarning: story.contentWarning,
          allowComments: story.allowComments,
        });
        setStory((current) => (current ? { ...response.story, prompt: current.prompt } : response.story));
        setDirty(false);
        setSaving("saved");
        window.setTimeout(() => setSaving("idle"), 1400);
      } catch (error) {
        setSaving("idle");
        toast.error(error instanceof Error ? error.message : "Could not save your story.");
      }
    }, 800);

    return () => window.clearTimeout(timer);
  }, [dirty, initialLoadComplete, story]);

  const wordCount = story?.wordCount ?? 0;
  const readingTime = story?.readingTimeMinutes ?? 1;

  const publishLabel = useMemo(() => {
    if (!story) {
      return "Publish";
    }
    if (story.status === "published") {
      return "Published";
    }
    return "Publish";
  }, [story]);

  async function handlePublish() {
    if (!story) {
      return;
    }
    setPublishing(true);
    try {
      const response = await publishStory(story.id);
      setStory(response.story);
      toast.success("Published.");
      navigate("/app/published");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not publish your story.");
    } finally {
      setPublishing(false);
    }
  }

  async function handleArchive() {
    if (!story) {
      return;
    }
    try {
      const response = story.status === "archived" ? await restoreStory(story.id) : await archiveStory(story.id);
      setStory(response.story);
      toast.success(story.status === "archived" ? "Story restored." : "Story archived.");
      navigate(story.status === "archived" ? "/app/drafts" : "/app/archive");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update this story.");
    }
  }

  if (!story) {
    return <div className="p-12 text-ink-soft">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-30 bg-paper/85 backdrop-blur border-b border-rule">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center gap-4">
          <Link to="/app" className="flex items-center gap-2 text-sm text-ink-soft hover:text-ink">
            <ArrowLeft size={16} /> Journal
          </Link>
          <div className="ml-auto flex items-center gap-3 text-xs text-ink-soft">
            <span>{wordCount} words · {readingTime} min read</span>
            <span className="text-rule">|</span>
            {saving === "saving" && <span className="flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Saving…</span>}
            {saving === "saved" && <span className="flex items-center gap-1 text-sage"><Check size={12} /> Saved</span>}
            {saving === "idle" && <span>Auto-saves as you write</span>}
          </div>
          {story.status !== "draft" && (
            <button onClick={handleArchive} className="px-3 py-1.5 rounded-full text-sm border border-rule hover:border-ink transition">
              {story.status === "archived" ? "Restore" : "Archive"}
            </button>
          )}
          <button onClick={handlePublish} disabled={publishing || story.status === "published"} className="px-4 py-1.5 rounded-full bg-terracotta text-primary-foreground text-sm font-medium hover:bg-terracotta/90 transition disabled:opacity-60">
            {publishing ? "…" : publishLabel}
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10 grid lg:grid-cols-[1fr_320px] gap-12">
        <div>
          {story.prompt && (
            <div className="mb-10 p-5 rounded-xl bg-card border border-rule">
              <div className="eyebrow mb-1">Writing from prompt</div>
              <div className="font-display text-xl">{story.prompt.title}</div>
              <p className="mt-1 font-prose italic text-ink-soft">{story.prompt.body}</p>
            </div>
          )}

          <input
            value={story.title}
            onChange={(event) => {
              setStory({ ...story, title: event.target.value });
              setDirty(true);
            }}
            placeholder="Title"
            className="w-full bg-transparent font-display text-5xl md:text-6xl leading-tight tracking-tight outline-none placeholder:text-ink/25"
          />
          <input
            value={story.dek}
            onChange={(event) => {
              setStory({ ...story, dek: event.target.value });
              setDirty(true);
            }}
            placeholder="A subtitle, if you want one"
            className="mt-4 w-full bg-transparent font-prose italic text-xl text-ink-soft outline-none placeholder:text-ink/25"
          />
          <div className="h-px bg-rule my-8" />
          <textarea
            value={story.body}
            onChange={(event) => {
              setStory({ ...story, body: event.target.value });
              setDirty(true);
            }}
            placeholder="Begin here. Write the truest sentence you know."
            className="w-full min-h-[60vh] bg-transparent font-prose text-lg leading-[1.8] outline-none resize-none placeholder:text-ink/25"
          />
        </div>

        <aside className="space-y-7">
          <Section title="Publishing">
            <div className="rounded-2xl border border-rule bg-card p-4 text-sm text-ink-soft">
              Drafts stay private until you publish them. Once published, your story appears in the journal under your name.
            </div>
          </Section>

          <Section title="Life theme">
            <select
              value={story.theme ?? ""}
              onChange={(event) => {
                setStory({ ...story, theme: event.target.value || null });
                setDirty(true);
              }}
              className="w-full px-3 py-2 rounded-lg border border-rule bg-card text-sm outline-none focus:ring-2 focus:ring-terracotta/30"
            >
              <option value="">— pick a theme —</option>
              {themes.map((theme) => <option key={theme.slug} value={theme.slug}>{theme.name}</option>)}
            </select>
          </Section>

          <Section title="Content warning">
            <select
              value={story.contentWarning ?? ""}
              onChange={(event) => {
                setStory({ ...story, contentWarning: event.target.value || null });
                setDirty(true);
              }}
              className="w-full px-3 py-2 rounded-lg border border-rule bg-card text-sm outline-none focus:ring-2 focus:ring-terracotta/30"
            >
              {contentWarnings.map((warning) => <option key={warning.label} value={warning.value}>{warning.label}</option>)}
            </select>
            <p className="mt-2 text-xs text-ink-soft">Shown above your story so readers can choose their proximity.</p>
          </Section>

          <Section title="Comments">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={story.allowComments}
                onChange={(event) => {
                  setStory({ ...story, allowComments: event.target.checked });
                  setDirty(true);
                }}
                className="mt-1"
              />
              <span className="text-sm">
                Allow readers to comment.
                <span className="block text-xs text-ink-soft mt-0.5">You can hide or remove comments at any time.</span>
              </span>
            </label>
          </Section>

          <Section title="Status">
            <div className="rounded-2xl border border-rule bg-card p-4 text-sm">
              <div className="font-medium capitalize">{story.status}</div>
              <div className="mt-1 text-ink-soft">
                Last updated {formatDate(story.updatedAt)}.
              </div>
            </div>
          </Section>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <div className="eyebrow mb-3">{title}</div>
      {children}
    </section>
  );
}

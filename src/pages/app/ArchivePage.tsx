import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { deleteStory, listUserStories, restoreStory } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { usePageMeta } from "@/lib/use-page-meta";
import type { StoryListItem } from "@/lib/types";

export function ArchivePage() {
  usePageMeta("Archive — Inkline Journal");

  const [stories, setStories] = useState<StoryListItem[]>([]);

  useEffect(() => {
    listUserStories("archived")
      .then((data) => setStories(data.stories))
      .catch((error) => toast.error(error instanceof Error ? error.message : "Could not load your archive."));
  }, []);

  async function handleRestore(id: string) {
    try {
      await restoreStory(id);
      setStories((current) => current.filter((story) => story.id !== id));
      toast.success("Story restored.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not restore story.");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteStory(id);
      setStories((current) => current.filter((story) => story.id !== id));
      toast.success("Story deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete story.");
    }
  }

  return (
    <div className="px-6 md:px-12 py-12 max-w-4xl mx-auto">
      <div className="eyebrow mb-2">Archive</div>
      <h1 className="font-display text-4xl tracking-tight">Quietly tucked away.</h1>
      <p className="mt-2 text-ink-soft">Stories you&apos;ve archived live here until you decide to bring them back.</p>

      <div className="mt-10 space-y-2">
        {stories.length === 0 && (
          <div className="p-10 rounded-xl border border-dashed border-rule text-center text-ink-soft">
            Nothing archived yet. You can archive a published story whenever you want it out of the public journal.
          </div>
        )}
        {stories.map((story) => (
          <div key={story.id} className="flex items-center justify-between gap-4 p-5 rounded-xl border border-rule bg-card">
            <div>
              <div className="font-display text-xl">{story.title}</div>
              <div className="text-xs text-ink-soft mt-1">{story.themeName ?? "Unthemed"} · last updated {formatDate(story.updatedAt)}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to={`/app/write/${story.id}`} className="text-sm px-3 py-1.5 rounded-full border border-rule hover:border-ink">Open</Link>
              <button onClick={() => handleRestore(story.id)} className="text-sm px-3 py-1.5 rounded-full border border-rule hover:border-ink">Restore</button>
              <button onClick={() => handleDelete(story.id)} className="text-sm px-3 py-1.5 rounded-full border border-rule hover:border-ink">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

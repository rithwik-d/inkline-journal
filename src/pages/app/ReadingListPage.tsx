import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StoryCard } from "@/components/marketing/StoryCard";
import { getReadingList, removeStoryFromReadingList } from "@/lib/api";
import { usePageMeta } from "@/lib/use-page-meta";
import type { StoryPreview } from "@/lib/types";

export function ReadingListPage() {
  usePageMeta("Reading list — Inkline Journal");

  const [stories, setStories] = useState<StoryPreview[]>([]);

  useEffect(() => {
    getReadingList()
      .then((data) => setStories(data.stories))
      .catch((error) => toast.error(error instanceof Error ? error.message : "Could not load your reading list."));
  }, []);

  async function handleRemove(storyId?: string) {
    if (!storyId) {
      return;
    }

    try {
      await removeStoryFromReadingList(storyId);
      setStories((current) => current.filter((story) => story.id !== storyId));
      toast.success("Removed from your reading list.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update your reading list.");
    }
  }

  return (
    <div className="px-6 md:px-12 py-12 max-w-5xl mx-auto">
      <div className="eyebrow mb-2">Reading list</div>
      <h1 className="font-display text-4xl tracking-tight">Stories you&apos;ve saved for later.</h1>
      <p className="mt-2 text-ink-soft">Keep the stories you want to return to close at hand.</p>

      {stories.length === 0 ? (
        <div className="mt-10 p-10 rounded-xl border border-dashed border-rule text-center text-ink-soft">
          Nothing saved yet. Save a public story and it will appear here.
        </div>
      ) : (
        <div className="mt-10 grid md:grid-cols-2 gap-8">
          {stories.map((story) => (
            <div key={story.slug}>
              <StoryCard story={story} />
              <button
                onClick={() => handleRemove(story.id)}
                className="mt-3 text-sm text-ink-soft hover:text-ink"
              >
                Remove from reading list
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

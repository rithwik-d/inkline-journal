import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { archiveStory, listUserStories } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { usePageMeta } from "@/lib/use-page-meta";
import type { StoryListItem } from "@/lib/types";

export function PublishedPage() {
  usePageMeta("Published — Inkline Journal");

  const [stories, setStories] = useState<StoryListItem[]>([]);

  useEffect(() => {
    listUserStories("published")
      .then((data) => setStories(data.stories))
      .catch((error) => toast.error(error instanceof Error ? error.message : "Could not load published stories."));
  }, []);

  async function handleArchive(id: string) {
    try {
      await archiveStory(id);
      setStories((current) => current.filter((story) => story.id !== id));
      toast.success("Story archived.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not archive story.");
    }
  }

  return (
    <div className="px-6 md:px-12 py-12 max-w-4xl mx-auto">
      <div className="eyebrow mb-2">Published</div>
      <h1 className="font-display text-4xl tracking-tight">Out in the world.</h1>

      <div className="mt-10 space-y-2">
        {stories.length === 0 && (
          <div className="p-10 rounded-xl border border-dashed border-rule text-center text-ink-soft">
            Nothing published yet.
          </div>
        )}
        {stories.map((story) => (
          <div key={story.id} className="flex items-center justify-between gap-4 p-5 rounded-xl border border-rule bg-card">
            <div>
              <div className="font-display text-xl">{story.title}</div>
              <div className="text-xs text-ink-soft mt-1">{story.themeName ?? "Unthemed"} · {formatDate(story.publishedAt ?? story.updatedAt)}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to={`/stories/${story.slug}`} className="text-sm px-3 py-1.5 rounded-full border border-rule hover:border-ink">View</Link>
              <Link to={`/app/write/${story.id}`} className="text-sm px-3 py-1.5 rounded-full border border-rule hover:border-ink">Edit</Link>
              <button onClick={() => handleArchive(story.id)} className="text-sm px-3 py-1.5 rounded-full border border-rule hover:border-ink">
                Archive
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

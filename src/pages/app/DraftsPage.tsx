import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { listUserStories } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { usePageMeta } from "@/lib/use-page-meta";
import type { StoryListItem } from "@/lib/types";

export function DraftsPage() {
  usePageMeta("Drafts — Inkline Journal");

  const [stories, setStories] = useState<StoryListItem[]>([]);

  useEffect(() => {
    listUserStories("draft")
      .then((data) => setStories(data.stories))
      .catch((error) => toast.error(error instanceof Error ? error.message : "Could not load drafts."));
  }, []);

  return (
    <div className="px-6 md:px-12 py-12 max-w-4xl mx-auto">
      <div className="eyebrow mb-2">Drafts</div>
      <h1 className="font-display text-4xl tracking-tight">In progress.</h1>
      <p className="mt-2 text-ink-soft">Stories you&apos;ve started. Nothing here is shared until you choose to publish it.</p>

      <div className="mt-10 space-y-2">
        {stories.length === 0 && (
          <div className="p-10 rounded-xl border border-dashed border-rule text-center text-ink-soft">
            Nothing here yet. <Link to="/app/write" className="text-terracotta hover:underline">Start a story →</Link>
          </div>
        )}
        {stories.map((story) => (
          <Link key={story.id} to={`/app/write/${story.id}`} className="flex items-center justify-between p-5 rounded-xl border border-rule bg-card hover:border-terracotta transition">
            <div>
              <div className="font-display text-xl">{story.title || "Untitled"}</div>
              <div className="text-xs text-ink-soft mt-1">{story.wordCount} words · last edited {formatDate(story.updatedAt)}</div>
            </div>
            <FileText size={16} className="text-ink-soft" />
          </Link>
        ))}
      </div>
    </div>
  );
}

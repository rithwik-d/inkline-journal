import { Link } from "react-router-dom";
import { formatDate } from "@/lib/format";
import type { StoryPreview } from "@/lib/types";

type Variant = "feature" | "default" | "compact";

export function StoryCard({
  story,
  variant = "default",
}: {
  story: StoryPreview;
  variant?: Variant;
}) {
  const isFeature = variant === "feature";

  return (
    <Link
      to={`/stories/${story.slug}`}
      className="group block"
    >
      <div
        className={
          isFeature
            ? "aspect-[16/10] rounded-2xl overflow-hidden mb-5 relative"
            : "aspect-[4/3] rounded-xl overflow-hidden mb-4 relative"
        }
        style={{
          background: `linear-gradient(135deg, ${story.coverGradient[0]} 0%, ${story.coverGradient[1]} 100%)`,
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.35),transparent_60%)]" />
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <span className={`story-cover-tag ${isFeature ? "story-cover-tag--feature" : "story-cover-tag--card"}`}>
            {story.themeName}
          </span>
        </div>
        {story.contentWarning && (
          <div className="absolute top-3 right-3 text-[0.6rem] uppercase tracking-wider px-2 py-1 rounded-full bg-ink/70 text-paper">
            cw · {story.contentWarning}
          </div>
        )}
      </div>

      <h3
        className={
          isFeature
            ? "font-display text-3xl md:text-4xl leading-[1.1] tracking-tight group-hover:text-terracotta transition-colors"
            : "font-display text-xl leading-tight group-hover:text-terracotta transition-colors"
        }
      >
        {story.title}
      </h3>

      <p
        className={
          isFeature
            ? "mt-3 text-ink-soft leading-relaxed font-prose text-lg"
            : "mt-2 text-sm text-ink-soft leading-relaxed"
        }
      >
        {story.dek}
      </p>

      <div className="mt-4 flex items-center gap-3 text-xs text-ink-soft">
        <span className="font-medium text-ink">{story.author}</span>
        <span aria-hidden>·</span>
        <span>{formatDate(story.publishedAt)}</span>
        <span aria-hidden>·</span>
        <span>{story.readingTime} min read</span>
      </div>
    </Link>
  );
}

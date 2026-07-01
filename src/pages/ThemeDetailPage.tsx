import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { StoryCard } from "@/components/marketing/StoryCard";
import { listThemeStories } from "@/lib/api";
import { getThemeBySlug } from "@/lib/theme-catalog";
import { usePageMeta } from "@/lib/use-page-meta";
import type { StoryPreview } from "@/lib/types";

export function ThemeDetailPage() {
  const { slug = "" } = useParams();
  const theme = getThemeBySlug(slug);
  const [stories, setStories] = useState<StoryPreview[]>([]);

  usePageMeta(
    `${theme?.name ?? "Theme"} — Inkline Journal`,
    theme?.description ?? "Stories from Inkline Journal.",
  );

  useEffect(() => {
    if (!theme) {
      return;
    }

    listThemeStories(slug)
      .then((data) => setStories(data.stories))
      .catch(() => setStories([]));
  }, [slug, theme]);

  const hasStories = useMemo(() => stories.length > 0, [stories]);

  if (!theme) {
    return (
      <MarketingLayout>
        <div className="mx-auto max-w-2xl px-6 py-32 text-center">
          <h1 className="font-display text-4xl">Theme not found</h1>
          <Link to="/themes" className="mt-6 inline-block text-terracotta hover:underline">
            Browse all themes →
          </Link>
        </div>
      </MarketingLayout>
    );
  }

  return (
    <MarketingLayout>
      <section
        className="relative"
        style={{
          background: `linear-gradient(135deg, ${theme.gradient[0]} 0%, ${theme.gradient[1]} 100%)`,
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.3),transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
          <div className="eyebrow mb-3 text-ink/70">Life theme</div>
          <h1 className="font-display text-6xl md:text-7xl tracking-tight text-ink">{theme.name}</h1>
          <p className="mt-4 font-prose italic text-ink/80 text-lg">{theme.description}</p>
          <p className="mt-6 max-w-xl mx-auto text-ink/75">{theme.longDescription}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        {!hasStories ? (
          <div className="text-center py-16">
            <p className="font-prose italic text-ink-soft">
              The first stories in this theme are still being written.
            </p>
            <Link to="/auth?mode=signup" className="mt-6 inline-block text-terracotta hover:underline">
              Be the first to write one →
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-x-10 gap-y-14">
            {stories.map((story) => (
              <StoryCard key={story.slug} story={story} />
            ))}
          </div>
        )}
      </section>
    </MarketingLayout>
  );
}

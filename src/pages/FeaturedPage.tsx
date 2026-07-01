import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { StoryCard } from "@/components/marketing/StoryCard";
import { listPublicStories } from "@/lib/api";
import { usePageMeta } from "@/lib/use-page-meta";
import type { StoryPreview } from "@/lib/types";

export function FeaturedPage() {
  usePageMeta(
    "Featured stories — Inkline Journal",
    "Editor's picks and the story of the week from the Inkline Journal community.",
  );

  const [stories, setStories] = useState<StoryPreview[]>([]);

  useEffect(() => {
    listPublicStories(9)
      .then((data) => setStories(data.stories))
      .catch(() => setStories([]));
  }, []);

  const [storyOfTheWeek, ...rest] = useMemo(() => stories, [stories]);

  if (!storyOfTheWeek) {
    return (
      <MarketingLayout>
        <div className="mx-auto max-w-2xl px-6 py-32 text-center">
          <h1 className="font-display text-4xl">Featured stories are on the way</h1>
          <p className="mt-4 text-ink-soft">
            Publish a few stories to start shaping this page.
          </p>
        </div>
      </MarketingLayout>
    );
  }

  return (
    <MarketingLayout>
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-12">
        <div className="eyebrow mb-3">Editor&apos;s picks</div>
        <h1 className="font-display text-5xl md:text-6xl tracking-tight">Featured this week.</h1>
        <p className="mt-5 text-ink-soft max-w-2xl">
          A handful of stories the Inkline editors have asked you to read slowly.
          Rotated weekly.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6">
        <Link to={`/stories/${storyOfTheWeek.slug}`} className="grid md:grid-cols-2 gap-10 group">
          <div
            className="aspect-[4/5] md:aspect-auto rounded-2xl relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${storyOfTheWeek.coverGradient[0]} 0%, ${storyOfTheWeek.coverGradient[1]} 100%)`,
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.35),transparent_55%)]" />
            <div className="absolute inset-0 flex items-center justify-center px-8">
              <span className="story-cover-tag story-cover-tag--spotlight">
                {storyOfTheWeek.themeName}
              </span>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <div className="eyebrow mb-3">Story of the week</div>
            <h2 className="font-display text-5xl leading-[1.05] tracking-tight group-hover:text-terracotta transition-colors">
              {storyOfTheWeek.title}
            </h2>
            <p className="mt-5 font-prose italic text-ink-soft text-lg">{storyOfTheWeek.dek}</p>
            <p className="mt-6 text-ink-soft leading-relaxed">{storyOfTheWeek.excerpt}</p>
            <div className="mt-6 text-sm text-ink-soft">
              {storyOfTheWeek.author} · {storyOfTheWeek.themeName} · {storyOfTheWeek.readingTime} min read
            </div>
          </div>
        </Link>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="eyebrow mb-6">Also featured</div>
        <div className="grid md:grid-cols-3 gap-10">
          {rest.slice(0, 6).map((story) => (
            <StoryCard key={story.slug} story={story} />
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
}

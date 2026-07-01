import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { StoryCard } from "@/components/marketing/StoryCard";
import { listPublicStories } from "@/lib/api";
import { themeCatalog } from "@/lib/theme-catalog";
import { usePageMeta } from "@/lib/use-page-meta";
import type { StoryPreview } from "@/lib/types";

const themeFilters = ["all", ...themeCatalog.map((theme) => theme.slug)];

export function ExplorePage() {
  usePageMeta(
    "Explore — Inkline Journal",
    "Read personal stories about grief, family, identity, healing, migration, first love, and the moments that shape us.",
  );

  const [stories, setStories] = useState<StoryPreview[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    listPublicStories(18)
      .then((data) => setStories(data.stories))
      .catch(() => setStories([]));
  }, []);

  const filteredStories = useMemo(
    () => (filter === "all" ? stories : stories.filter((story) => story.theme === filter)),
    [filter, stories],
  );

  return (
    <MarketingLayout>
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-12">
        <div className="eyebrow mb-3">The journal</div>
        <h1 className="font-display text-5xl md:text-6xl tracking-tight">Stories worth reading slowly.</h1>
        <p className="mt-5 text-ink-soft max-w-2xl">
          A growing collection of real personal writing. Filter by life theme, or let
          the page take you somewhere unexpected.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {themeFilters.map((theme) => {
            const active = filter === theme;
            const label = theme === "all" ? "All" : theme.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

            return (
              <button
                key={theme}
                onClick={() => setFilter(theme)}
                className={
                  (active
                    ? "bg-ink text-paper "
                    : "bg-card border border-rule text-ink-soft hover:text-ink ") +
                  "px-4 py-1.5 rounded-full text-sm transition"
                }
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-x-10 gap-y-14">
          {filteredStories.map((story) => (
            <StoryCard key={story.slug} story={story} />
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link to="/auth" className="text-sm text-terracotta hover:underline underline-offset-4">
            Sign in to save stories to your reading list →
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}

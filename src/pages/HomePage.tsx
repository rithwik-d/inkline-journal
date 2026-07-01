import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { StoryCard } from "@/components/marketing/StoryCard";
import { listPublicStories, listThemes } from "@/lib/api";
import { themeFallbackList } from "@/lib/theme-catalog";
import { usePageMeta } from "@/lib/use-page-meta";
import type { StoryPreview, Theme } from "@/lib/types";

export function HomePage() {
  usePageMeta(
    "Inkline Journal — real stories, held with care",
    "A quiet, story-first place for personal writing. Read real stories about grief, family, identity, healing, and the moments that quietly shape who we become.",
  );

  const [realStories, setRealStories] = useState<StoryPreview[]>([]);
  const [themes, setThemes] = useState<Theme[]>(themeFallbackList);
  const [stats, setStats] = useState<Array<{ n: string; l: string }>>([
    { n: "127", l: "stories shared this month" },
    { n: "42", l: "writers this week" },
    { n: "10", l: "active life themes" },
    { n: "8,300", l: "minutes spent reading" },
  ]);
  const [storyOfWeekIndex, setStoryOfWeekIndex] = useState(0);
  const [incomingStory, setIncomingStory] = useState<StoryPreview | null>(null);
  const [isTransitioningStory, setIsTransitioningStory] = useState(false);
  const storyOfWeekIndexRef = useRef(0);

  useEffect(() => {
    listPublicStories(12)
      .then((storiesData) => {
        setRealStories(storiesData.stories);
        if (storiesData.stats.length > 0) {
          setStats(storiesData.stats);
        }
      })
      .catch(() => undefined);

    listThemes()
      .then((themesData) => {
        setThemes(
          themesData.themes.length > 0
            ? [...themesData.themes].sort((left, right) => left.sortOrder - right.sortOrder)
            : themeFallbackList,
        );
      })
      .catch(() => undefined);
  }, []);

  const stories = useMemo(() => realStories, [realStories]);
  const rotatingStories = useMemo(() => stories.slice(0, 4), [stories]);
  const storyOfWeek = rotatingStories[storyOfWeekIndex] ?? stories[0] ?? null;
  const featuredStories = stories.slice(0, 3);
  const moreStories = stories.slice(3, 6);
  const quoteStory = stories.length > 0 ? stories[new Date().getDate() % stories.length] : null;
  const heroButtonBaseClass =
    "inline-flex h-14 w-[12.25rem] items-center justify-center rounded-full px-8 text-base font-medium transition";

  useEffect(() => {
    storyOfWeekIndexRef.current = storyOfWeekIndex;
  }, [storyOfWeekIndex]);

  useEffect(() => {
    if (rotatingStories.length === 0) {
      setStoryOfWeekIndex(0);
      return;
    }

    setStoryOfWeekIndex((current) => current % rotatingStories.length);
  }, [rotatingStories.length]);

  useEffect(() => {
    if (rotatingStories.length <= 1) {
      setIncomingStory(null);
      setIsTransitioningStory(false);
      return;
    }

    let intervalId = 0;
    let swapTimer = 0;

    const startRotation = () => {
      const nextIndex = (storyOfWeekIndexRef.current + 1) % rotatingStories.length;
      const nextStory = rotatingStories[nextIndex] ?? null;

      if (!nextStory) {
        return;
      }

      setIncomingStory(nextStory);
      setIsTransitioningStory(true);

      swapTimer = window.setTimeout(() => {
        setStoryOfWeekIndex(nextIndex);
        setIncomingStory(null);
        setIsTransitioningStory(false);
      }, 680);
    };

    intervalId = window.setInterval(startRotation, 3800);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(swapTimer);
    };
  }, [rotatingStories]);

  return (
    <MarketingLayout>
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-20">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-start">
          <div className="pt-4">
            <div className="eyebrow mb-4">Where memories become stories EST 2026</div>
            <h1 className="font-display text-6xl md:text-7xl leading-[1.02] tracking-tight">
              If you have something real to share,{" "}
              <span className="italic text-terracotta inline-block md:pl-[0.03em]">you&apos;re in the right place.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-soft leading-relaxed">
              Inkline Journal is built for personal stories, life transitions, and the
              moments that shape who we become. Read between the lines, write honestly,
              and begin where memory opens.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/explore"
                className={`${heroButtonBaseClass} bg-ink text-paper hover:bg-ink/85`}
              >
                Read stories
              </Link>
              <Link
                to="/auth?mode=signup"
                className={`${heroButtonBaseClass} border border-rule bg-card hover:bg-paper-warm`}
              >
                Start writing →
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] bg-card border border-rule p-5 shadow-[0_30px_80px_-40px_rgba(80,50,30,0.35)]">
            {storyOfWeek ? (
              <Link to={`/stories/${storyOfWeek.slug}`} className="block group">
                <div className="story-spotlight-mediaFrame">
                  <StorySpotlightMedia story={storyOfWeek} state={isTransitioningStory ? "exit" : "idle"} />
                  {incomingStory ? (
                    <StorySpotlightMedia story={incomingStory} state="enter" />
                  ) : null}
                </div>
                <div className="mt-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="eyebrow">Story of the week</div>
                    <div className="story-spotlight-progress" aria-hidden="true">
                      {rotatingStories.map((story, index) => {
                        const isActive = story.slug === storyOfWeek.slug;
                        const isIncoming = story.slug === incomingStory?.slug;

                        return (
                          <span
                            key={story.slug}
                            className={`story-spotlight-progress__bar ${isActive ? "is-active" : ""} ${isIncoming ? "is-incoming" : ""}`}
                            style={{ animationDelay: `${index * 60}ms` }}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <div className="story-spotlight-copyFrame">
                    <StorySpotlightCopy story={storyOfWeek} state={isTransitioningStory ? "exit" : "idle"} />
                    {incomingStory ? (
                      <StorySpotlightCopy story={incomingStory} state="enter" />
                    ) : null}
                  </div>
                </div>
              </Link>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-rule px-6 py-10 text-center text-ink-soft">
                Stories will appear here as soon as the public archive is available.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 ink-rule">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <div className="eyebrow mb-3">Featured this week</div>
            <h2 className="font-display text-5xl tracking-tight">Stories worth pausing for</h2>
          </div>
          <Link to="/featured" className="text-sm text-terracotta hover:underline underline-offset-4">
            See all stories →
          </Link>
        </div>
        {featuredStories.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-10">
            {featuredStories.map((story) => (
              <StoryCard key={story.slug} story={story} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-rule px-6 py-10 text-center text-ink-soft">
            Published stories will appear here as soon as the archive is ready.
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 ink-rule">
        <div className="grid lg:grid-cols-[0.7fr_1.3fr] gap-10 items-start">
          <div>
            <div className="eyebrow mb-3">Read by life theme</div>
            <h2 className="font-display text-5xl tracking-tight">Find the season you&apos;re in.</h2>
            <p className="mt-5 text-ink-soft max-w-sm">
              Themes are entry points into the human experience. Follow the one that
              feels nearest to where you are.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {themes.slice(0, 8).map((theme) => (
              <Link
                key={theme.slug}
                to={`/themes/${theme.slug}`}
                className="group relative rounded-2xl overflow-hidden p-6 min-h-40 flex flex-col justify-between hover:-translate-y-0.5 transition-transform"
                style={{
                  background: `linear-gradient(135deg, ${theme.gradientFrom} 0%, ${theme.gradientTo} 100%)`,
                }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.32),transparent_60%)]" />
                <div className="relative">
                  <div className="font-display text-3xl text-ink">{theme.name}</div>
                  <p className="mt-2 text-ink/75 max-w-sm">{theme.description}</p>
                </div>
                <div className="relative text-[0.7rem] uppercase tracking-[0.18em] text-ink/65">
                  {typeof theme.count === "number" ? `${theme.count} stories` : "Open theme"}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {quoteStory ? (
        <section className="mx-auto max-w-4xl px-6 py-20 text-center ink-rule">
          <div className="eyebrow mb-4">From the journal</div>
          <blockquote className="font-display italic text-4xl md:text-5xl leading-tight text-ink">
            “{quoteStory.dek}”
          </blockquote>
          <div className="mt-5 text-sm text-ink-soft">
            {quoteStory.author} · {quoteStory.themeName}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-6 py-16 ink-rule">
        <div className="eyebrow mb-3">Why Inkline exists</div>
        <h2 className="font-display text-5xl tracking-tight">Built from memory.</h2>
        <div className="mt-12 grid md:grid-cols-3 gap-10">
          {[
            {
              t: "Every person has a story to tell.",
              d: "Some stories are big, some are quiet, and some stay with us for years before we are ready to say them out loud. Inkline was made for all of them.",
            },
            {
              t: "People from different places can meet here.",
              d: "This space was built for people from different backgrounds, cities, families, and lives to share what shaped them and recognize something of themselves in someone else.",
            },
            {
              t: "Stories help people connect.",
              d: "Sometimes the strongest connection starts with reading a stranger's experience and feeling, in a very real way, that you are not alone in yours.",
            },
          ].map((item) => (
            <div key={item.t}>
              <div className="w-10 h-px bg-terracotta mb-5" />
              <h3 className="font-display text-3xl leading-tight">{item.t}</h3>
              <p className="mt-4 text-ink-soft leading-relaxed">{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 ink-rule">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <h2 className="font-display text-5xl tracking-tight">More from the journal</h2>
          <Link to="/explore" className="text-sm text-terracotta hover:underline underline-offset-4">
            Explore the full archive →
          </Link>
        </div>
        {moreStories.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-10">
            {moreStories.map((story) => (
              <StoryCard key={story.slug} story={story} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-rule px-6 py-10 text-center text-ink-soft">
            More stories will appear here as the journal grows.
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 ink-rule">
        <div className="eyebrow mb-3">Community pulse</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.l} className="rounded-2xl border border-rule bg-card p-6">
              <div className="font-display text-4xl">{stat.n}</div>
              <div className="mt-2 text-sm text-ink-soft">{stat.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-24 text-center">
        <h2 className="font-display text-6xl md:text-7xl leading-[1] tracking-tight">
          Your story is waiting.
          <br />
          <span className="italic text-terracotta">Begin gently.</span>
        </h2>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-ink-soft leading-relaxed">
          Start with a prompt, begin from scratch, or simply sit with the page until
          the first true sentence arrives. Drafts stay private until you choose to publish.
        </p>
        <Link
          to="/auth?mode=signup"
          className="mt-8 inline-flex items-center px-6 py-3 rounded-full bg-ink text-paper font-medium hover:bg-ink/85 transition"
        >
          Start writing
        </Link>
        <p className="mt-4 text-sm text-ink-soft">
          Free to use. Built for honest stories, not content performance.
        </p>
      </section>
    </MarketingLayout>
  );
}

function StorySpotlightMedia({
  story,
  state,
}: {
  story: StoryPreview;
  state: "idle" | "enter" | "exit";
}) {
  return (
    <div
      className={`story-spotlight-media story-spotlight-media--${state}`}
      style={{
        background: `linear-gradient(135deg, ${story.coverGradient[0]} 0%, ${story.coverGradient[1]} 100%)`,
      }}
    >
      <div className="story-spotlight-media__glow" />
      <div className="absolute inset-0 flex items-center justify-center px-8">
        <span className="story-cover-tag story-cover-tag--spotlight">
          {story.themeName}
        </span>
      </div>
    </div>
  );
}

function StorySpotlightCopy({
  story,
  state,
}: {
  story: StoryPreview;
  state: "idle" | "enter" | "exit";
}) {
  return (
    <div className={`story-spotlight-copy story-spotlight-copy--${state}`}>
      <h2 className="font-display text-3xl tracking-tight group-hover:text-terracotta transition-colors">
        {story.title}
      </h2>
      <p className="mt-3 font-prose italic text-ink-soft text-lg">
        “{story.dek}”
      </p>
      <div className="mt-4 text-sm text-ink-soft">
        {story.author} · {story.readingTime} min read
      </div>
    </div>
  );
}

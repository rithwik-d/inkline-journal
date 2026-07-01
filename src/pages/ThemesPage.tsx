import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { listThemes } from "@/lib/api";
import { themeFallbackList } from "@/lib/theme-catalog";
import { usePageMeta } from "@/lib/use-page-meta";
import type { Theme } from "@/lib/types";

export function ThemesPage() {
  const [themes, setThemes] = useState<Theme[]>(themeFallbackList);

  usePageMeta(
    "Life themes — Inkline Journal",
    "Browse stories by life theme: grief, family, identity, healing, migration, first love, friendship, and more.",
  );

  useEffect(() => {
    listThemes()
      .then((data) => {
        setThemes(
          data.themes.length > 0
            ? [...data.themes].sort((left, right) => left.sortOrder - right.sortOrder)
            : themeFallbackList,
        );
      })
      .catch(() => undefined);
  }, []);

  return (
    <MarketingLayout>
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-10">
        <div className="eyebrow mb-3">Life themes</div>
        <h1 className="font-display text-5xl md:text-6xl tracking-tight">Find the season you&apos;re in.</h1>
        <p className="mt-5 max-w-2xl text-ink-soft">
          Themes are doorways. Pick one that matches what you&apos;re carrying or curious
          about — read stories written by people who have been there.
        </p>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid md:grid-cols-2 gap-5">
          {themes.map((theme) => (
            <Link
              key={theme.slug}
              to={`/themes/${theme.slug}`}
              className="group relative rounded-2xl overflow-hidden p-8 min-h-44 flex flex-col justify-between hover:-translate-y-0.5 transition-transform"
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
      </section>
    </MarketingLayout>
  );
}

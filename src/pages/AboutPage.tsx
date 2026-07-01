import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { usePageMeta } from "@/lib/use-page-meta";

export function AboutPage() {
  usePageMeta(
    "About — Inkline Journal",
    "Inkline Journal is a calm, story-first publication for personal writing. Here's why it exists and how it works.",
  );

  return (
    <MarketingLayout>
      <section className="mx-auto max-w-3xl px-6 pt-20 pb-12">
        <div className="eyebrow mb-4">About</div>
        <h1 className="font-display text-5xl md:text-6xl leading-[1.05] tracking-tight">
          A place for the stories that shape us.
        </h1>
      </section>

      <article className="mx-auto max-w-3xl px-6 pb-24 prose-body space-y-7">
        <p>
          Inkline Journal began with a small frustration: most platforms ask writers
          to perform. Likes, followers, engagement bait, trending feeds. The interface
          itself nudges you toward a particular voice — louder, shorter, sharper, more sellable.
        </p>
        <p>
          We wanted somewhere else to go. A place to write the things you&apos;d actually
          want to read. The harder stories. The grief that doesn&apos;t resolve. The
          migration that changed who you became. The faith that survived, despite reasons.
        </p>
        <p>So we built Inkline Journal around a simple promise: to connect people.</p>
      </article>
    </MarketingLayout>
  );
}

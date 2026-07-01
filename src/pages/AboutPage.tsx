import { Link } from "react-router-dom";
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
          A quiet place for the stories that quietly shape us.
        </h1>
      </section>

      <article className="mx-auto max-w-2xl px-6 pb-24 prose-body space-y-7">
        <p>
          Inkline Journal began with a small frustration: most platforms ask writers
          to perform. Likes, followers, engagement bait, trending feeds. The interface
          itself nudges you toward a particular voice — louder, shorter, sharper, more sellable.
        </p>
        <p>
          We wanted somewhere else to go. A place to write the things you&apos;d actually
          want to read. The harder, slower stories. The grief that doesn&apos;t resolve.
          The first love that still aches. The migration that changed who you became.
          The faith that survived, despite reasons.
        </p>
        <p>So we built Inkline Journal around three quiet promises.</p>

        <h2 className="font-display text-3xl mt-12">Story first, metrics last</h2>
        <p>
          You will not see a like count here. You will not see follower numbers.
          You will not see a trending feed designed to keep you scrolling. The point
          is not to turn memory into performance. The point is to make room for the story itself.
        </p>

        <h2 className="font-display text-3xl mt-12">Guided, not blank</h2>
        <p>
          A blank page is a particular kind of cruelty. We open writing sessions with
          prompts that feel gentle, specific, and human. You can ignore them. But they
          are there when you need a way in.
        </p>

        <h2 className="font-display text-3xl mt-12">Read without the noise</h2>
        <p>
          Readers come here to read, not to race through a feed. Stories are surfaced
          through themes, editorial curation, and the quiet force of good writing.
        </p>

        <div className="mt-16 p-8 rounded-2xl bg-card border border-rule text-center">
          <p className="font-display italic text-2xl">
            "The softest words often carry the heaviest truths."
          </p>
          <Link
            to="/auth?mode=signup"
            className="mt-6 inline-block px-6 py-3 rounded-full bg-terracotta text-primary-foreground font-medium hover:bg-terracotta/90 transition"
          >
            Start writing →
          </Link>
        </div>
      </article>
    </MarketingLayout>
  );
}

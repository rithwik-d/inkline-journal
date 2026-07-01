import { SimplePage } from "@/components/marketing/SimplePage";
import { usePageMeta } from "@/lib/use-page-meta";

export function MissionPage() {
  usePageMeta(
    "Mission — Inkline Journal",
    "Inkline Journal's mission: a quiet, story-first place for personal writing.",
  );

  return (
    <SimplePage eyebrow="Mission" title="Why we made this.">
      <p>Inkline Journal exists because the internet has plenty of places to perform, and very few places to remember.</p>
      <p>We are building a calm, safe, story-first space where personal writing is treated as something precious, not as content to be ranked, optimized, or sold.</p>
      <p>Our long mission is simple: help people write the stories that shape who they become, and help other people read them with care.</p>
    </SimplePage>
  );
}

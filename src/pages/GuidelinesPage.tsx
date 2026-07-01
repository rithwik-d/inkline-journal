import { SimplePage } from "@/components/marketing/SimplePage";
import { usePageMeta } from "@/lib/use-page-meta";

export function GuidelinesPage() {
  usePageMeta(
    "Writing guidelines — Inkline Journal",
    "How to write and read on Inkline Journal: tone, content warnings, comments, and community norms.",
  );

  return (
    <SimplePage eyebrow="Community" title="How we read each other.">
      <p>These guidelines are short on purpose. They are about respecting the small risk every writer takes when they put a real story online.</p>
      <h2 className="font-display text-2xl mt-8">1. Write from memory, not provocation.</h2>
      <p>If you&apos;re writing to perform, this is not the place. Write the thing that mattered.</p>
      <h2 className="font-display text-2xl mt-8">2. Label what needs labelling.</h2>
      <p>Use content warnings for grief, mental health, abuse, addiction, medical detail, and violence. Readers can decide how close they want to come.</p>
      <h2 className="font-display text-2xl mt-8">3. Comment like a human being.</h2>
      <p>Respond with care. Read before you react. This is not a place for pile-ons, sarcasm, or drive-by cruelty.</p>
      <h2 className="font-display text-2xl mt-8">4. Drafts deserve safety.</h2>
      <p>Private work stays private until the writer chooses to publish. Respect that boundary.</p>
      <h2 className="font-display text-2xl mt-8">5. Report what hurts.</h2>
      <p>If you see harassment, doxing, hate speech, or content that endangers a real person, report it.</p>
    </SimplePage>
  );
}

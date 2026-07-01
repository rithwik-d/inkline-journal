import { SimplePage } from "@/components/marketing/SimplePage";
import { usePageMeta } from "@/lib/use-page-meta";

export function FaqPage() {
  usePageMeta(
    "FAQ — Inkline Journal",
    "Frequently asked questions about Inkline Journal: drafts, ownership, comments, and more.",
  );

  return (
    <SimplePage eyebrow="FAQ" title="Common questions.">
      <h2 className="font-display text-2xl">Is Inkline free?</h2>
      <p>Yes. The core product is free. Personal writing will always be free to publish.</p>
      <h2 className="font-display text-2xl mt-8">Who owns my stories?</h2>
      <p>You do. Always. You can delete any story at any time, and we will remove it from our servers.</p>
      <h2 className="font-display text-2xl mt-8">Are drafts private?</h2>
      <p>Yes. Drafts remain private until you choose to publish them.</p>
      <h2 className="font-display text-2xl mt-8">Can readers comment?</h2>
      <p>Yes. You can decide per story whether comments are open, and you can remove comments on your work.</p>
      <h2 className="font-display text-2xl mt-8">Do you train AI on my writing?</h2>
      <p>No. Your stories are not used to train language models. Ever.</p>
    </SimplePage>
  );
}

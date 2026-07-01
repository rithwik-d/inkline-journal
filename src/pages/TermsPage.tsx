import { SimplePage } from "@/components/marketing/SimplePage";
import { usePageMeta } from "@/lib/use-page-meta";

export function TermsPage() {
  usePageMeta("Terms — Inkline Journal", "Terms of service for Inkline Journal.");

  return (
    <SimplePage eyebrow="Terms" title="The agreement.">
      <p>By using Inkline Journal you agree to write in good faith, respect other writers, and follow our community guidelines. We agree to host your work carefully, never sell your data, and remove any of your content at your request.</p>
      <p>Full terms coming soon. For questions: <a className="text-terracotta hover:underline" href="mailto:support@inklinejournal.com">support@inklinejournal.com</a>.</p>
    </SimplePage>
  );
}

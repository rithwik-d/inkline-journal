import { SimplePage } from "@/components/marketing/SimplePage";
import { usePageMeta } from "@/lib/use-page-meta";

export function ContactPage() {
  usePageMeta("Contact — Inkline Journal", "Get in touch with the Inkline Journal team.");

  return (
    <SimplePage eyebrow="Contact" title="Say hello.">
      <p>The journal is run by a small team. We read everything you send us — slowly, but we read it.</p>
      <p>Support: <a className="text-terracotta hover:underline" href="mailto:support@inklinejournal.com">support@inklinejournal.com</a></p>
      <p>General questions: <a className="text-terracotta hover:underline" href="mailto:support@inklinejournal.com">support@inklinejournal.com</a></p>
      <p>Editorial: <a className="text-terracotta hover:underline" href="mailto:support@inklinejournal.com">support@inklinejournal.com</a></p>
    </SimplePage>
  );
}

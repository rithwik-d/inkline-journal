import { SimplePage } from "@/components/marketing/SimplePage";
import { usePageMeta } from "@/lib/use-page-meta";

export function PrivacyPage() {
  usePageMeta("Privacy — Inkline Journal", "Inkline Journal's privacy commitments.");

  return (
    <SimplePage eyebrow="Privacy" title="How we treat your data.">
      <p>Your stories are yours. Your drafts are private until you publish them. We never sell your data, we never train AI models on your writing, and you can delete your account and every story you&apos;ve written at any time.</p>
      <p>Detailed policy coming soon. Questions: <a className="text-terracotta hover:underline" href="mailto:support@inklinejournal.com">support@inklinejournal.com</a>.</p>
    </SimplePage>
  );
}

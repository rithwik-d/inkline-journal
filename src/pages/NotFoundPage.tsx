import { Link } from "react-router-dom";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { usePageMeta } from "@/lib/use-page-meta";

export function NotFoundPage() {
  usePageMeta("Page not found — Inkline Journal");

  return (
    <MarketingLayout>
      <div className="mx-auto max-w-2xl px-6 py-32 text-center">
        <h1 className="font-display text-5xl tracking-tight">Page not found</h1>
        <p className="mt-4 text-ink-soft">
          The page you&apos;re looking for doesn&apos;t exist or has moved somewhere quieter.
        </p>
        <Link to="/" className="mt-6 inline-block text-terracotta hover:underline">
          Return home →
        </Link>
      </div>
    </MarketingLayout>
  );
}

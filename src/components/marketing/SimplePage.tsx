import type { ReactNode } from "react";
import { MarketingLayout } from "./MarketingLayout";

export function SimplePage({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <MarketingLayout>
      <section className="mx-auto max-w-3xl px-6 pt-20 pb-10">
        <div className="eyebrow mb-4">{eyebrow}</div>
        <h1 className="font-display text-5xl leading-[1.1] tracking-tight">{title}</h1>
      </section>
      <article className="mx-auto max-w-2xl px-6 pb-24 prose-body space-y-6">{children}</article>
    </MarketingLayout>
  );
}

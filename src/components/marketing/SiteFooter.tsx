import { Link } from "react-router-dom";

const cols = [
  {
    title: "Read",
    links: [
      { to: "/explore", label: "Explore stories" },
      { to: "/themes", label: "Life themes" },
      { to: "/featured", label: "Featured" },
    ],
  },
  {
    title: "Write",
    links: [
      { to: "/auth", label: "Start writing" },
      { to: "/about", label: "Why Inkline" },
      { to: "/guidelines", label: "Writing guidelines" },
    ],
  },
  {
    title: "Inkline",
    links: [
      { to: "/about", label: "About" },
      { to: "/mission", label: "Mission" },
      { to: "/faq", label: "FAQ" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Quiet print",
    links: [
      { to: "/privacy", label: "Privacy" },
      { to: "/terms", label: "Terms" },
      { to: "/guidelines", label: "Community" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-32 ink-rule border-t border-b-0">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          <div className="md:col-span-2">
            <div className="font-display text-2xl">Inkline Journal</div>
            <p className="mt-3 text-sm text-ink-soft max-w-sm leading-relaxed">
              A quiet, story-first place for personal writing — built for the moments
              that quietly shape who we become.
            </p>
            <form
              className="mt-6 flex items-center gap-2 max-w-sm"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 text-sm rounded-full border border-rule bg-card focus:outline-none focus:ring-2 focus:ring-terracotta/40"
              />
              <button
                type="submit"
                className="px-4 py-2 text-sm rounded-full bg-ink text-paper hover:bg-ink/85 transition"
              >
                Stay close
              </button>
            </form>
            <p className="mt-2 text-xs text-ink-soft">
              A slow letter, once a fortnight. Featured stories, prompts, and gentle notes from the journal.
            </p>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <div className="eyebrow mb-4">{c.title}</div>
              <ul className="space-y-2.5 text-sm">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-ink-soft hover:text-ink transition">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-6 ink-rule flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-ink-soft">
          <div>© {new Date().getFullYear()} Inkline Journal. Written by people, for people.</div>
          <div className="italic font-display text-base">
            "The softest words often carry the heaviest truths."
          </div>
        </div>
      </div>
    </footer>
  );
}

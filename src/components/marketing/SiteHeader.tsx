import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/use-auth";

const navLinks = [
  { to: "/explore", label: "Explore" },
  { to: "/themes", label: "Themes" },
  { to: "/featured", label: "Featured" },
  { to: "/about", label: "About" },
] as const;

export function SiteHeader() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-background/80 ink-rule border-t-0 border-b">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center gap-8">
        <Link to="/" className="flex items-center gap-3 group">
          <span className="grid place-items-center h-9 w-9 rounded-full bg-terracotta-soft text-terracotta font-display text-lg italic">
            IJ
          </span>
          <span className="font-display text-xl tracking-tight">Inkline Journal</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm">
          {navLinks.map((l) => {
            const active = pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={
                  active
                    ? "text-ink underline underline-offset-8 decoration-terracotta decoration-2"
                    : "text-ink-soft hover:text-ink transition-colors"
                }
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {user ? (
            <Link
              to="/app"
              className="px-4 py-2 rounded-full bg-terracotta text-primary-foreground text-sm font-medium hover:bg-terracotta/90 transition"
            >
              Enter your journal
            </Link>
          ) : (
            <>
              <Link to="/auth" className="text-sm text-ink-soft hover:text-ink">
                Sign in
              </Link>
              <Link to="/auth?mode=signup" className="px-4 py-2 rounded-full bg-ink text-paper text-sm font-medium hover:bg-ink/85 transition">
                Start writing
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

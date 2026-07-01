import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  PenLine,
  FileText,
  BookOpen,
  Bookmark,
  Archive,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/use-auth";

const nav: Array<{ to: string; label: string; icon: typeof Home; exact?: boolean }> = [
  { to: "/app", label: "Home", icon: Home, exact: true },
  { to: "/app/drafts", label: "Drafts", icon: FileText },
  { to: "/app/published", label: "Published", icon: BookOpen },
  { to: "/app/reading-list", label: "Reading list", icon: Bookmark },
  { to: "/app/archive", label: "Archive", icon: Archive },
  { to: "/app/notifications", label: "Notifications", icon: Bell },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { user, logOut } = useAuth();
  const navigate = useNavigate();

  async function signOut() {
    await logOut();
    navigate("/");
  }

  return (
    <div className="min-h-screen flex bg-paper-warm">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-rule bg-sidebar sticky top-0 h-screen">
        <div className="px-5 pt-6 pb-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid place-items-center h-9 w-9 rounded-full bg-terracotta-soft text-terracotta font-display text-lg italic">IJ</span>
            <span className="font-display text-lg">Inkline</span>
          </Link>
        </div>

        <div className="px-3">
          <Link
            to="/app/write"
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-terracotta text-primary-foreground text-sm font-medium hover:bg-terracotta/90 transition w-full justify-center"
          >
            <PenLine size={16} />
            Write a story
          </Link>
        </div>

        <nav className="mt-6 flex-1 px-2 space-y-0.5">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={
                  (active
                    ? "bg-paper text-ink "
                    : "text-ink-soft hover:text-ink hover:bg-paper/60 ") +
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition"
                }
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-rule">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="h-8 w-8 rounded-full bg-sage-soft grid place-items-center text-sm font-display">
              {(user?.email ?? "?").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs truncate">{user?.email}</div>
            </div>
            <button onClick={signOut} className="text-ink-soft hover:text-ink" title="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}

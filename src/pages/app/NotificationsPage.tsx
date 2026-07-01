import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { listNotifications, markNotificationsRead } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { usePageMeta } from "@/lib/use-page-meta";
import type { NotificationItem } from "@/lib/types";

export function NotificationsPage() {
  usePageMeta("Notifications — Inkline Journal");

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    listNotifications()
      .then((data) => setNotifications(data.notifications))
      .catch((error) => toast.error(error instanceof Error ? error.message : "Could not load notifications."));
  }, []);

  async function handleMarkRead() {
    try {
      await markNotificationsRead();
      setNotifications((current) => current.map((item) => ({ ...item, readAt: new Date().toISOString() })));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not mark notifications as read.");
    }
  }

  return (
    <div className="px-6 md:px-12 py-12 max-w-3xl mx-auto">
      <div className="eyebrow mb-2">Notifications</div>
      <h1 className="font-display text-4xl tracking-tight">A quiet inbox.</h1>
      <p className="mt-2 text-ink-soft">When a reader leaves a thoughtful comment, you&apos;ll see it here.</p>

      {notifications.length > 0 && (
        <button onClick={handleMarkRead} className="mt-6 text-sm text-terracotta hover:underline">
          Mark all as read
        </button>
      )}

      <div className="mt-10 space-y-3">
        {notifications.length === 0 && (
          <div className="p-10 rounded-xl border border-dashed border-rule text-center text-ink-soft">
            Nothing here yet.
          </div>
        )}
        {notifications.map((item) => (
          <Link
            key={item.id}
            to={`/stories/${item.storySlug}`}
            className={
              (item.readAt ? "bg-card " : "bg-paper ") +
              "block rounded-2xl border border-rule p-5 hover:border-terracotta transition"
            }
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-medium">{item.actorName}</div>
                <p className="mt-1 text-ink-soft">{item.message}</p>
                <div className="mt-2 text-xs text-ink-soft">{item.storyTitle}</div>
              </div>
              <div className="text-xs text-ink-soft whitespace-nowrap">{formatDate(item.createdAt)}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getProfile, updateProfile } from "@/lib/api";
import { usePageMeta } from "@/lib/use-page-meta";
import type { User } from "@/lib/types";

export function SettingsPage() {
  usePageMeta("Settings — Inkline Journal");

  const [profile, setProfile] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProfile()
      .then((data) => setProfile(data.user))
      .catch((error) => toast.error(error instanceof Error ? error.message : "Could not load your profile."));
  }, []);

  async function save() {
    if (!profile) {
      return;
    }

    setSaving(true);
    try {
      const response = await updateProfile({
        displayName: profile.displayName,
        bio: profile.bio,
      });
      setProfile(response.user);
      toast.success("Saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  }

  if (!profile) {
    return <div className="p-12 text-ink-soft">Loading…</div>;
  }

  return (
    <div className="px-6 md:px-12 py-12 max-w-2xl mx-auto">
      <div className="eyebrow mb-2">Settings</div>
      <h1 className="font-display text-4xl tracking-tight">Your profile.</h1>

      <div className="mt-10 space-y-6">
        <Field label="Handle">
          <div className="px-4 py-2.5 rounded-lg bg-paper-warm border border-rule text-sm text-ink-soft">@{profile.handle}</div>
        </Field>
        <Field label="Email">
          <div className="px-4 py-2.5 rounded-lg bg-paper-warm border border-rule text-sm text-ink-soft">{profile.email}</div>
        </Field>
        <Field label="Display name">
          <input
            value={profile.displayName ?? ""}
            onChange={(event) => setProfile({ ...profile, displayName: event.target.value })}
            className="w-full px-4 py-2.5 rounded-lg bg-card border border-rule outline-none focus:ring-2 focus:ring-terracotta/30"
          />
        </Field>
        <Field label="Bio">
          <textarea
            rows={4}
            value={profile.bio ?? ""}
            onChange={(event) => setProfile({ ...profile, bio: event.target.value })}
            placeholder="A sentence or two about what you write about."
            className="w-full px-4 py-3 rounded-lg bg-card border border-rule outline-none focus:ring-2 focus:ring-terracotta/30 font-prose"
          />
        </Field>
        <button onClick={save} disabled={saving} className="px-5 py-2.5 rounded-full bg-ink text-paper text-sm font-medium hover:bg-ink/85 disabled:opacity-60">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="eyebrow mb-2">{label}</div>
      {children}
    </div>
  );
}

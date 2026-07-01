export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || `story-${Date.now()}`;
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function readingTimeMinutes(text: string): number {
  return Math.max(1, Math.round(wordCount(text) / 220));
}

export function formatContentWarning(cw?: string | null): string | null {
  if (!cw || cw === "none") return null;
  return cw.replace(/_/g, " & ");
}
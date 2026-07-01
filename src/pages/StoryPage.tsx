import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { StoryCard } from "@/components/marketing/StoryCard";
import { addComment, deleteComment, getPublicStory, removeStoryFromReadingList, saveStoryToReadingList } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { useAuth } from "@/lib/use-auth";
import { usePageMeta } from "@/lib/use-page-meta";
import type { Comment, StoryDetail, StoryPreview } from "@/lib/types";

export function StoryPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [story, setStory] = useState<StoryDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [related, setRelated] = useState<StoryPreview[]>([]);
  const [commentBody, setCommentBody] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicStory(slug)
      .then((data) => {
        setStory(data.story);
        setComments(data.comments);
        setRelated(data.related);
      })
      .catch(() => {
        setStory(null);
        setComments([]);
        setRelated([]);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  usePageMeta(
    story ? `${story.title} — Inkline Journal` : "Story — Inkline Journal",
    story?.dek ?? "Read a story from Inkline Journal.",
  );

  const paragraphs = useMemo(
    () => story?.body.split(/\n{2,}/).filter(Boolean) ?? [],
    [story?.body],
  );

  async function toggleSave() {
    if (!story || story.source !== "real") {
      return;
    }

    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      if (story.isSaved) {
        await removeStoryFromReadingList(story.id);
        setStory({ ...story, isSaved: false });
        toast.success("Removed from your reading list.");
      } else {
        await saveStoryToReadingList(story.id);
        setStory({ ...story, isSaved: true });
        toast.success("Saved for later.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update your reading list.");
    }
  }

  async function handleCommentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!story || story.source !== "real" || !story.allowComments || !commentBody.trim()) {
      return;
    }

    try {
      const response = await addComment(story.slug, commentBody.trim());
      setComments(response.comments);
      setCommentBody("");
      toast.success("Comment posted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not post comment.");
    }
  }

  async function handleDeleteComment(commentId: string) {
    try {
      await deleteComment(commentId);
      setComments((current) => current.filter((comment) => comment.id !== commentId));
      toast.success("Comment removed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove comment.");
    }
  }

  if (loading) {
    return (
      <MarketingLayout>
        <div className="mx-auto max-w-2xl px-6 py-32 text-center text-ink-soft">Loading story…</div>
      </MarketingLayout>
    );
  }

  if (!story) {
    return (
      <MarketingLayout>
        <div className="mx-auto max-w-2xl px-6 py-32 text-center">
          <h1 className="font-display text-4xl">Story not found</h1>
          <Link to="/explore" className="mt-6 inline-block text-terracotta hover:underline">
            Browse the journal →
          </Link>
        </div>
      </MarketingLayout>
    );
  }

  return (
    <MarketingLayout>
      <div
        className="relative"
        style={{
          background: `linear-gradient(135deg, ${story.coverGradient[0]} 0%, ${story.coverGradient[1]} 100%)`,
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.35),transparent_55%)]" />
        <div className="relative mx-auto max-w-3xl px-6 py-24 text-center">
          <Link to={`/themes/${story.theme}`} className="eyebrow text-ink/70 hover:text-ink">
            {story.themeName}
          </Link>
          <h1 className="mt-5 font-display text-5xl md:text-6xl leading-[1.05] tracking-tight text-ink">
            {story.title}
          </h1>
          <p className="mt-5 font-prose italic text-ink/80 text-lg md:text-xl max-w-xl mx-auto">
            {story.dek}
          </p>
          <div className="mt-7 text-sm text-ink/70">
            By <span className="font-medium text-ink">{story.author}</span> · {formatDate(story.publishedAt)} · {story.readingTime} min read
          </div>
        </div>
      </div>

      <article className="mx-auto max-w-2xl px-6 py-16">
        {story.contentWarning && (
          <div className="mb-10 p-4 rounded-xl bg-card border border-rule text-sm">
            <div className="eyebrow text-ink mb-1">Content warning</div>
            <div className="text-ink-soft">This story touches on {story.contentWarning}. Read with care.</div>
          </div>
        )}

        {story.source === "real" && (
          <div className="mb-10 flex justify-end">
            <button
              type="button"
              onClick={toggleSave}
              className="px-4 py-2 rounded-full border border-rule bg-card text-sm hover:border-terracotta transition"
            >
              {story.isSaved ? "Saved to reading list" : "Save to reading list"}
            </button>
          </div>
        )}

        <div className="prose-body space-y-6">
          {paragraphs.map((paragraph, index) => (
            <p
              key={`${story.slug}-${index}`}
              className={
                index === 0
                  ? "first-letter:font-display first-letter:text-6xl first-letter:float-left first-letter:mr-3 first-letter:leading-[0.85] first-letter:mt-1 first-letter:text-terracotta"
                  : undefined
              }
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-12 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-terracotta-soft grid place-items-center font-display text-lg text-terracotta">
            {story.author.charAt(0)}
          </div>
          <div>
            <div className="font-medium">{story.author}</div>
            <div className="text-sm text-ink-soft">Writing in {story.themeName.toLowerCase()}</div>
          </div>
        </div>
      </article>

      {story.source === "real" && story.allowComments && (
        <section className="mx-auto max-w-3xl px-6 pb-20">
          <div className="ink-rule pt-10">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <div className="eyebrow mb-2">Comments</div>
                <h2 className="font-display text-3xl">Read with care.</h2>
              </div>
            </div>

            {user ? (
              <form onSubmit={handleCommentSubmit} className="mb-8">
                <textarea
                  rows={4}
                  value={commentBody}
                  onChange={(event) => setCommentBody(event.target.value)}
                  placeholder="Leave a thoughtful comment."
                  className="w-full px-4 py-3 rounded-2xl bg-card border border-rule outline-none focus:ring-2 focus:ring-terracotta/30 font-prose"
                />
                <div className="mt-3 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-full bg-ink text-paper text-sm font-medium hover:bg-ink/85 transition"
                  >
                    Post comment
                  </button>
                </div>
              </form>
            ) : (
              <p className="mb-8 text-sm text-ink-soft">
                <Link to="/auth" className="text-terracotta hover:underline">Sign in</Link> to join the conversation.
              </p>
            )}

            <div className="space-y-4">
              {comments.length === 0 && (
                <div className="rounded-2xl border border-dashed border-rule p-6 text-ink-soft text-sm">
                  No comments yet. Be the first to respond with care.
                </div>
              )}
              {comments.map((comment) => (
                <div key={comment.id} className="rounded-2xl border border-rule bg-card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium">{comment.author.displayName}</div>
                      <div className="text-xs text-ink-soft">@{comment.author.handle} · {formatDate(comment.createdAt)}</div>
                    </div>
                    {comment.canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-xs text-ink-soft hover:text-ink"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="mt-3 text-ink-soft leading-relaxed">{comment.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-20 ink-rule border-b-0">
          <h2 className="font-display text-3xl mb-10">More from {story.themeName.toLowerCase()}</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {related.map((item) => (
              <StoryCard key={item.slug} story={item} />
            ))}
          </div>
        </section>
      )}
    </MarketingLayout>
  );
}

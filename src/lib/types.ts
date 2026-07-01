export type StoryStatus = "draft" | "published" | "archived";

export type User = {
  id: string;
  email: string;
  emailVerified: boolean;
  displayName: string;
  handle: string;
  avatarUrl: string | null;
  bio: string | null;
};

export type EmailSignupResult = {
  requiresEmailVerification: true;
  email: string;
  message: string;
};

export type Theme = {
  slug: string;
  name: string;
  description: string;
  gradientFrom: string;
  gradientTo: string;
  sortOrder: number;
  count?: number;
  longDescription?: string;
};

export type Prompt = {
  id: string;
  title: string;
  body: string;
  suggestedTheme: string | null;
  tone: string | null;
};

export type StoryPreview = {
  id?: string;
  slug: string;
  title: string;
  dek: string;
  excerpt: string;
  author: string;
  authorHandle: string;
  authorAvatar?: string | null;
  theme: string;
  themeName: string;
  readingTime: number;
  publishedAt: string;
  coverGradient: [string, string];
  contentWarning?: string | null;
  isSaved?: boolean;
  source: "mock" | "real";
};

export type Comment = {
  id: string;
  body: string;
  createdAt: string;
  author: {
    id: string;
    displayName: string;
    handle: string;
    avatarUrl: string | null;
  };
  canDelete: boolean;
};

export type StoryDetail = {
  id: string;
  slug: string;
  title: string;
  dek: string;
  body: string;
  excerpt: string;
  authorId: string;
  author: string;
  authorHandle: string;
  authorAvatar: string | null;
  theme: string;
  themeName: string;
  readingTime: number;
  publishedAt: string;
  updatedAt: string;
  coverGradient: [string, string];
  contentWarning?: string | null;
  allowComments: boolean;
  isSaved: boolean;
  source: "mock" | "real";
};

export type StoryEditor = {
  id: string;
  slug: string;
  title: string;
  dek: string;
  body: string;
  theme: string | null;
  contentWarning: string | null;
  allowComments: boolean;
  status: StoryStatus;
  wordCount: number;
  readingTimeMinutes: number;
  prompt: Prompt | null;
  updatedAt: string;
  publishedAt: string | null;
};

export type StoryListItem = {
  id: string;
  slug: string;
  title: string;
  status: StoryStatus;
  theme: string | null;
  themeName: string | null;
  wordCount: number;
  readingTimeMinutes: number;
  updatedAt: string;
  publishedAt: string | null;
  coverGradient: [string, string];
  allowComments: boolean;
  commentsCount: number;
};

export type DashboardData = {
  drafts: StoryListItem[];
  published: StoryListItem[];
  prompts: Prompt[];
  todayPrompt: Prompt | null;
};

export type NotificationItem = {
  id: string;
  type: "comment";
  storyId: string;
  storySlug: string;
  storyTitle: string;
  actorName: string;
  message: string;
  createdAt: string;
  readAt: string | null;
};

export type PublicStoryDetailResponse = {
  story: StoryDetail;
  comments: Comment[];
  related: StoryPreview[];
};

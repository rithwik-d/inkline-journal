import type {
  Comment,
  DashboardData,
  EmailSignupResult,
  NotificationItem,
  Prompt,
  PublicStoryDetailResponse,
  StoryEditor,
  StoryListItem,
  StoryPreview,
  Theme,
  User,
} from "@/lib/types";

type RequestOptions = RequestInit & {
  bodyJson?: unknown;
};

type ApiErrorPayload = {
  message?: string;
};

const API_BASE = "/api";

async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { bodyJson, headers, ...rest } = options;
  let response: Response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(headers ?? {}),
      },
      body: bodyJson !== undefined ? JSON.stringify(bodyJson) : rest.body,
      ...rest,
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        "Cannot reach the Inkline server. Restart both dev servers and make sure the API is running on http://localhost:3001.",
      );
    }
    throw error;
  }

  if (!response.ok) {
    let message = "Something went wrong.";

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      try {
        const payload = (await response.json()) as ApiErrorPayload;
        if (payload.message) {
          message = payload.message;
        }
      } catch {
        // Keep the fallback message when the response body is invalid JSON.
      }
    } else {
      try {
        const text = await response.text();
        if (/proxy error|econnrefused|localhost:3001/i.test(text)) {
          message =
            "Cannot reach the Inkline server. Restart both dev servers and make sure the API is running on http://localhost:3001.";
        } else if (response.status >= 500) {
          message = "The Inkline server returned an unexpected response. Restart the backend and try again.";
        }
      } catch {
        // Keep the fallback message when the response body is empty or unreadable.
      }
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function getSession() {
  return apiRequest<{ user: User | null }>("/auth/session");
}

export function signUp(payload: { displayName: string; email: string; password: string }) {
  return apiRequest<EmailSignupResult>("/auth/signup", {
    method: "POST",
    bodyJson: payload,
  });
}

export function signIn(payload: { email: string; password: string }) {
  return apiRequest<{ user: User }>("/auth/login", {
    method: "POST",
    bodyJson: payload,
  });
}

export function signOut() {
  return apiRequest<void>("/auth/logout", { method: "POST" });
}

export function resendVerification(payload: { email: string }) {
  return apiRequest<{ message: string }>("/auth/resend-verification", {
    method: "POST",
    bodyJson: payload,
  });
}

export function listPublicStories(limit?: number) {
  const query = typeof limit === "number" ? `?limit=${limit}` : "";
  return apiRequest<{ stories: StoryPreview[]; stats: Array<{ n: string; l: string }> }>(`/public/stories${query}`);
}

export function getPublicStory(slug: string) {
  return apiRequest<PublicStoryDetailResponse>(`/public/stories/${slug}`);
}

export function listThemeStories(slug: string) {
  return apiRequest<{ stories: StoryPreview[] }>(`/public/themes/${slug}`);
}

export function listThemes() {
  return apiRequest<{ themes: Theme[] }>("/themes");
}

export function listPrompts() {
  return apiRequest<{ prompts: Prompt[] }>("/prompts");
}

export function getDashboardData() {
  return apiRequest<DashboardData>("/app/dashboard");
}

export function createStory(payload: { promptId?: string | null }) {
  return apiRequest<{ storyId: string }>("/stories", {
    method: "POST",
    bodyJson: payload,
  });
}

export function getEditorStory(id: string) {
  return apiRequest<{ story: StoryEditor }>("/stories/" + id);
}

export function updateStory(
  id: string,
  payload: Partial<Pick<StoryEditor, "title" | "dek" | "body" | "theme" | "contentWarning" | "allowComments">>,
) {
  return apiRequest<{ story: StoryEditor }>("/stories/" + id, {
    method: "PATCH",
    bodyJson: payload,
  });
}

export function publishStory(id: string) {
  return apiRequest<{ story: StoryEditor }>("/stories/" + id + "/publish", {
    method: "POST",
  });
}

export function archiveStory(id: string) {
  return apiRequest<{ story: StoryEditor }>("/stories/" + id + "/archive", {
    method: "POST",
  });
}

export function restoreStory(id: string) {
  return apiRequest<{ story: StoryEditor }>("/stories/" + id + "/restore", {
    method: "POST",
  });
}

export function deleteStory(id: string) {
  return apiRequest<void>("/stories/" + id, { method: "DELETE" });
}

export function listUserStories(status: StoryListItem["status"]) {
  return apiRequest<{ stories: StoryListItem[] }>(`/stories?status=${status}`);
}

export function getReadingList() {
  return apiRequest<{ stories: StoryPreview[] }>("/app/reading-list");
}

export function saveStoryToReadingList(storyId: string) {
  return apiRequest<void>("/app/reading-list", {
    method: "POST",
    bodyJson: { storyId },
  });
}

export function removeStoryFromReadingList(storyId: string) {
  return apiRequest<void>("/app/reading-list/" + storyId, {
    method: "DELETE",
  });
}

export function listNotifications() {
  return apiRequest<{ notifications: NotificationItem[] }>("/app/notifications");
}

export function markNotificationsRead() {
  return apiRequest<void>("/app/notifications/read", { method: "POST" });
}

export function getProfile() {
  return apiRequest<{ user: User }>("/app/profile");
}

export function updateProfile(payload: Pick<User, "displayName" | "bio">) {
  return apiRequest<{ user: User }>("/app/profile", {
    method: "PATCH",
    bodyJson: payload,
  });
}

export function addComment(slug: string, body: string) {
  return apiRequest<{ comments: Comment[] }>(`/public/stories/${slug}/comments`, {
    method: "POST",
    bodyJson: { body },
  });
}

export function deleteComment(commentId: string) {
  return apiRequest<void>("/comments/" + commentId, {
    method: "DELETE",
  });
}

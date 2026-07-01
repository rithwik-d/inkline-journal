import { Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/app/AppShell";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
import { AboutPage } from "@/pages/AboutPage";
import { AuthPage } from "@/pages/AuthPage";
import { ContactPage } from "@/pages/ContactPage";
import { ExplorePage } from "@/pages/ExplorePage";
import { FaqPage } from "@/pages/FaqPage";
import { FeaturedPage } from "@/pages/FeaturedPage";
import { GuidelinesPage } from "@/pages/GuidelinesPage";
import { HomePage } from "@/pages/HomePage";
import { MissionPage } from "@/pages/MissionPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PrivacyPage } from "@/pages/PrivacyPage";
import { StoryPage } from "@/pages/StoryPage";
import { TermsPage } from "@/pages/TermsPage";
import { ThemeDetailPage } from "@/pages/ThemeDetailPage";
import { ThemesPage } from "@/pages/ThemesPage";
import { ArchivePage } from "@/pages/app/ArchivePage";
import { DashboardPage } from "@/pages/app/DashboardPage";
import { DraftsPage } from "@/pages/app/DraftsPage";
import { EditorPage } from "@/pages/app/EditorPage";
import { NotificationsPage } from "@/pages/app/NotificationsPage";
import { PublishedPage } from "@/pages/app/PublishedPage";
import { ReadingListPage } from "@/pages/app/ReadingListPage";
import { SettingsPage } from "@/pages/app/SettingsPage";
import { WriteStartPage } from "@/pages/app/WriteStartPage";

function AppLayout() {
  return (
    <AppShell>
      <Routes>
        <Route index element={<DashboardPage />} />
        <Route path="write" element={<WriteStartPage />} />
        <Route path="write/:id" element={<EditorPage />} />
        <Route path="drafts" element={<DraftsPage />} />
        <Route path="published" element={<PublishedPage />} />
        <Route path="reading-list" element={<ReadingListPage />} />
        <Route path="archive" element={<ArchivePage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/explore" element={<ExplorePage />} />
      <Route path="/featured" element={<FeaturedPage />} />
      <Route path="/themes" element={<ThemesPage />} />
      <Route path="/themes/:slug" element={<ThemeDetailPage />} />
      <Route path="/stories/:slug" element={<StoryPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/mission" element={<MissionPage />} />
      <Route path="/faq" element={<FaqPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/guidelines" element={<GuidelinesPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/auth" element={<AuthPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/app/*" element={<AppLayout />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

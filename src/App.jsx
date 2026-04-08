import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import DashboardWorkshop from './pages/DashboardWorkshop';
import BuilderOnboarding from './pages/BuilderOnboarding';
import AdminUserAccounts from './pages/AdminUserAccounts';
import AdminLegalDocuments from './pages/AdminLegalDocuments';
import AdminLegalDocumentEdit from './pages/AdminLegalDocumentEdit';
import LegalDocumentPublic from './pages/LegalDocumentPublic';
import BuilderResources from './pages/BuilderResources';
import BuilderFAQ from './pages/BuilderFAQ';
import AdminIssues from './pages/AdminIssues';
import AdminQAChecklist from './pages/AdminQAChecklist';
import BuilderGuideArticle from './pages/BuilderGuideArticle';
import BuyerFAQ from './pages/BuyerFAQ';
import AdminMarketplaceImageSettings from './pages/AdminMarketplaceImageSettings';
import ImageRatioExperiment from './pages/ImageRatioExperiment';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
    // For auth_required and other errors, allow public browsing
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="/DashboardWorkshop" element={<LayoutWrapper currentPageName="DashboardWorkshop"><DashboardWorkshop /></LayoutWrapper>} />
      <Route path="/BuilderOnboarding" element={<BuilderOnboarding />} />
      <Route path="/AdminUserAccounts" element={<LayoutWrapper currentPageName="AdminUserAccounts"><AdminUserAccounts /></LayoutWrapper>} />
      <Route path="/AdminLegalDocuments" element={<LayoutWrapper currentPageName="AdminLegalDocuments"><AdminLegalDocuments /></LayoutWrapper>} />
      <Route path="/AdminLegalDocumentEdit" element={<LayoutWrapper currentPageName="AdminLegalDocumentEdit"><AdminLegalDocumentEdit /></LayoutWrapper>} />
      <Route path="/BuilderResources" element={<LayoutWrapper currentPageName="BuilderResources"><BuilderResources /></LayoutWrapper>} />
      <Route path="/BuilderFAQ" element={<LayoutWrapper currentPageName="BuilderFAQ"><BuilderFAQ /></LayoutWrapper>} />
      <Route path="/AdminIssues" element={<LayoutWrapper currentPageName="AdminIssues"><AdminIssues /></LayoutWrapper>} />
      <Route path="/AdminQAChecklist" element={<LayoutWrapper currentPageName="AdminQAChecklist"><AdminQAChecklist /></LayoutWrapper>} />
      <Route path="/BuilderGuideArticle" element={<LayoutWrapper currentPageName="BuilderGuideArticle"><BuilderGuideArticle /></LayoutWrapper>} />
      <Route path="/BuyerFAQ" element={<LayoutWrapper currentPageName="BuyerFAQ"><BuyerFAQ /></LayoutWrapper>} />
      <Route path="/AdminMarketplaceImageSettings" element={<LayoutWrapper currentPageName="AdminMarketplaceImageSettings"><AdminMarketplaceImageSettings /></LayoutWrapper>} />
      <Route path="/ImageRatioExperiment" element={<LayoutWrapper currentPageName="ImageRatioExperiment"><ImageRatioExperiment /></LayoutWrapper>} />
      <Route path="/legal/terms-of-use" element={<LayoutWrapper currentPageName="LegalDocumentPublic"><LegalDocumentPublic /></LayoutWrapper>} />
      <Route path="/legal/privacy-policy" element={<LayoutWrapper currentPageName="LegalDocumentPublic"><LegalDocumentPublic /></LayoutWrapper>} />
      <Route path="/legal/builder-terms" element={<LayoutWrapper currentPageName="LegalDocumentPublic"><LegalDocumentPublic /></LayoutWrapper>} />
      <Route path="/legal/buyer-terms" element={<LayoutWrapper currentPageName="LegalDocumentPublic"><LegalDocumentPublic /></LayoutWrapper>} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
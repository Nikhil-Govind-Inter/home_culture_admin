import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AuthProvider, useAuth } from "@/context/AuthContext";

import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const BannersList = React.lazy(() => import("./pages/siteSettings/BannersList"));
const BannersForm = React.lazy(() => import("./pages/siteSettings/BannersForm"));
const MetaDataList = React.lazy(() => import("./pages/siteSettings/MetaDataList"));
const MetaDataForm = React.lazy(() => import("./pages/siteSettings/MetaDataForm"));
const BlogsList = React.lazy(() => import("./pages/blogs/BlogsList"));
const BlogForm = React.lazy(() => import("./pages/blogs/BlogForm"));
const ContactCmsForm = React.lazy(() => import("./pages/contact/ContactCmsForm"));
const AboutCmsForm = React.lazy(() => import("./pages/about/AboutCmsForm"));
const AboutHighlightsList = React.lazy(() => import("./pages/about/AboutHighlightsList"));
const AboutHighlightForm = React.lazy(() => import("./pages/about/AboutHighlightForm"));
const HowItWorksCmsForm = React.lazy(() => import("./pages/howItWorks/HowItWorksCmsForm"));
const SiteSettingsForm = React.lazy(() => import("./pages/siteSettings/SiteSettingsForm"));
const SocialMediaList = React.lazy(() => import("./pages/siteSettings/SocialMediaList"));
const SocialMediaForm = React.lazy(() => import("./pages/siteSettings/SocialMediaForm"));

const queryClient = new QueryClient();

// Layout route: renders once and stays mounted while only the matched child
// route's element swaps inside DashboardLayout's <Outlet />.
function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <DashboardLayout />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Index />} />

                {/* Banners */}
                <Route path="/banners" element={<BannersList />} />
                <Route path="/banners/:id/edit" element={<BannersForm />} />

                {/* Meta Data */}
                <Route path="/meta-data" element={<MetaDataList />} />
                <Route path="/meta-data/:id/edit" element={<MetaDataForm />} />

                {/* Blogs */}
                <Route path="/blogs" element={<BlogsList />} />
                <Route path="/blogs/new" element={<BlogForm />} />
                <Route path="/blogs/:id/edit" element={<BlogForm />} />

                {/* Contact CMS */}
                <Route path="/contact-cms" element={<ContactCmsForm />} />

                {/* About CMS */}
                <Route path="/about-cms" element={<AboutCmsForm />} />
                <Route path="/about-highlights" element={<AboutHighlightsList />} />
                <Route path="/about-highlights/new" element={<AboutHighlightForm />} />
                <Route path="/about-highlights/:id/edit" element={<AboutHighlightForm />} />

                {/* How It Works CMS */}
                <Route path="/how-it-works-cms" element={<HowItWorksCmsForm />} />

                {/* Site Settings */}
                <Route path="/site-settings" element={<SiteSettingsForm />} />

                {/* Social Media */}
                <Route path="/social-media" element={<SocialMediaList />} />
                <Route path="/social-media/new" element={<SocialMediaForm />} />
                <Route path="/social-media/:id/edit" element={<SocialMediaForm />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

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
const PagesList = React.lazy(() => import("./pages/pages/PagesList"));
const PageForm = React.lazy(() => import("./pages/pages/PageForm"));
const BlogsList = React.lazy(() => import("./pages/blogs/BlogsList"));
const BlogForm = React.lazy(() => import("./pages/blogs/BlogForm"));
const ContactCmsForm = React.lazy(() => import("./pages/contact/ContactCmsForm"));
const AboutCmsForm = React.lazy(() => import("./pages/about/AboutCmsForm"));
const SocialMediaList = React.lazy(() => import("./pages/common/SocialMediaList"));
const SocialMediaForm = React.lazy(() => import("./pages/common/SocialMediaForm"));

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
                <Route path="/banners/new" element={<BannersForm />} />
                <Route path="/banners/:id/edit" element={<BannersForm />} />

                {/* Pages */}
                <Route path="/pages" element={<PagesList />} />
                <Route path="/pages/new" element={<PageForm />} />
                <Route path="/pages/:id/edit" element={<PageForm />} />

                {/* Blogs */}
                <Route path="/blogs" element={<BlogsList />} />
                <Route path="/blogs/new" element={<BlogForm />} />
                <Route path="/blogs/:id/edit" element={<BlogForm />} />

                {/* Contact CMS */}
                <Route path="/contact-cms" element={<ContactCmsForm />} />

                {/* About CMS */}
                <Route path="/about-cms" element={<AboutCmsForm />} />

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

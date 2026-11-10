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
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";

const BannersList = React.lazy(() => import("./pages/siteSettings/BannersList"));
const BannersForm = React.lazy(() => import("./pages/siteSettings/BannersForm"));
const MetaDataList = React.lazy(() => import("./pages/siteSettings/MetaDataList"));
const MetaDataForm = React.lazy(() => import("./pages/siteSettings/MetaDataForm"));
const BlogsList = React.lazy(() => import("./pages/blogs/BlogsList"));
const BlogForm = React.lazy(() => import("./pages/blogs/BlogForm"));
const ContactCmsForm = React.lazy(() => import("./pages/contact/ContactCmsForm"));
const PrivacyPolicyForm = React.lazy(() => import("./pages/privacyPolicy/PrivacyPolicyForm"));
const AboutCmsForm = React.lazy(() => import("./pages/about/AboutCmsForm"));
const AboutHighlightsList = React.lazy(() => import("./pages/about/AboutHighlightsList"));
const AboutHighlightForm = React.lazy(() => import("./pages/about/AboutHighlightForm"));
const HowItWorksCmsForm = React.lazy(() => import("./pages/howItWorks/HowItWorksCmsForm"));
const FaqCmsForm = React.lazy(() => import("./pages/faq/FaqCmsForm"));
const FaqList = React.lazy(() => import("./pages/faq/FaqList"));
const FaqForm = React.lazy(() => import("./pages/faq/FaqForm"));
const FaqCategoryList = React.lazy(() => import("./pages/faq/FaqCategoryList"));
const FaqCategoryForm = React.lazy(() => import("./pages/faq/FaqCategoryForm"));
const SiteSettingsForm = React.lazy(() => import("./pages/siteSettings/SiteSettingsForm"));
const WorkshopMaterialList = React.lazy(() => import("./pages/howItWorks/WorkshopMaterialList"));
const WorkshopMaterialForm = React.lazy(() => import("./pages/howItWorks/WorkshopMaterialForm"));
const TestimonialList = React.lazy(() => import("./pages/howItWorks/TestimonialList"));
const TestimonialForm = React.lazy(() => import("./pages/howItWorks/TestimonialForm"));
const JourneyStepList = React.lazy(() => import("./pages/howItWorks/JourneyStepList"));
const JourneyStepForm = React.lazy(() => import("./pages/howItWorks/JourneyStepForm"));
const ExperienceCmsForm = React.lazy(() => import("./pages/experience/ExperienceCmsForm"));
const JourneyProcessList = React.lazy(() => import("./pages/experience/JourneyProcessList"));
const JourneyProcessForm = React.lazy(() => import("./pages/experience/JourneyProcessForm"));
const ExperienceHighlightList = React.lazy(() => import("./pages/experience/ExperienceHighlightList"));
const ExperienceHighlightForm = React.lazy(() => import("./pages/experience/ExperienceHighlightForm"));
const BookingProcessList = React.lazy(() => import("./pages/experience/BookingProcessList"));
const BookingProcessForm = React.lazy(() => import("./pages/experience/BookingProcessForm"));
const ExperienceFaqList = React.lazy(() => import("./pages/experience/ExperienceFaqList"));
const ExperienceFaqForm = React.lazy(() => import("./pages/experience/ExperienceFaqForm"));
const LocationList = React.lazy(() => import("./pages/experience/LocationList"));
const LocationForm = React.lazy(() => import("./pages/experience/LocationForm"));
const ExperienceTimelineList = React.lazy(() => import("./pages/experience/ExperienceTimelineList"));
const ExperienceTimelineForm = React.lazy(() => import("./pages/experience/ExperienceTimelineForm"));
const ExperienceFeatureList = React.lazy(() => import("./pages/experience/ExperienceFeatureList"));
const ExperienceFeatureForm = React.lazy(() => import("./pages/experience/ExperienceFeatureForm"));
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
              <Route path="/forgot-password" element={<ForgotPassword />} />

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

                {/* Privacy Policy */}
                <Route path="/privacy-policy" element={<PrivacyPolicyForm />} />

                {/* About CMS */}
                <Route path="/about-cms" element={<AboutCmsForm />} />
                <Route path="/about-highlights" element={<AboutHighlightsList />} />
                <Route path="/about-highlights/new" element={<AboutHighlightForm />} />
                <Route path="/about-highlights/:id/edit" element={<AboutHighlightForm />} />

                {/* How It Works CMS */}
                <Route path="/how-it-works-cms" element={<HowItWorksCmsForm />} />

                {/* FAQ CMS */}
                <Route path="/faq-cms" element={<FaqCmsForm />} />
                <Route path="/faq-categories" element={<FaqCategoryList />} />
                <Route path="/faq-categories/new" element={<FaqCategoryForm />} />
                <Route path="/faq-categories/:id/edit" element={<FaqCategoryForm />} />
                <Route path="/faqs" element={<FaqList />} />
                <Route path="/faqs/new" element={<FaqForm />} />
                <Route path="/faqs/:id/edit" element={<FaqForm />} />

                {/* Site Settings */}
                <Route path="/site-settings" element={<SiteSettingsForm />} />

                <Route path="/workshop-materials" element={<WorkshopMaterialList />} />
                <Route path="/workshop-materials/new" element={<WorkshopMaterialForm />} />
                <Route path="/workshop-materials/:id/edit" element={<WorkshopMaterialForm />} />
                <Route path="/testimonials" element={<TestimonialList />} />
                <Route path="/testimonials/new" element={<TestimonialForm />} />
                <Route path="/testimonials/:id/edit" element={<TestimonialForm />} />

                {/* Experience CMS */}
                <Route path="/experience-cms" element={<ExperienceCmsForm />} />
                <Route path="/journey-processes" element={<JourneyProcessList />} />
                <Route path="/journey-processes/new" element={<JourneyProcessForm />} />
                <Route path="/journey-processes/:id/edit" element={<JourneyProcessForm />} />
                <Route path="/experience-highlights" element={<ExperienceHighlightList />} />
                <Route path="/experience-highlights/new" element={<ExperienceHighlightForm />} />
                <Route path="/experience-highlights/:id/edit" element={<ExperienceHighlightForm />} />
                <Route path="/booking-processes" element={<BookingProcessList />} />
                <Route path="/booking-processes/new" element={<BookingProcessForm />} />
                <Route path="/booking-processes/:id/edit" element={<BookingProcessForm />} />
                <Route path="/experience-faqs" element={<ExperienceFaqList />} />
                <Route path="/experience-faqs/new" element={<ExperienceFaqForm />} />
                <Route path="/experience-faqs/:id/edit" element={<ExperienceFaqForm />} />
                <Route path="/locations" element={<LocationList />} />
                <Route path="/locations/new" element={<LocationForm />} />
                <Route path="/locations/:id/edit" element={<LocationForm />} />
                <Route path="/experience-timeline" element={<ExperienceTimelineList />} />
                <Route path="/experience-timeline/new" element={<ExperienceTimelineForm />} />
                <Route path="/experience-timeline/:id/edit" element={<ExperienceTimelineForm />} />
                <Route path="/experience-features" element={<ExperienceFeatureList />} />
                <Route path="/experience-features/new" element={<ExperienceFeatureForm />} />
                <Route path="/experience-features/:id/edit" element={<ExperienceFeatureForm />} />
                <Route path="/journey-steps" element={<JourneyStepList />} />
                <Route path="/journey-steps/new" element={<JourneyStepForm />} />
                <Route path="/journey-steps/:id/edit" element={<JourneyStepForm />} />

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

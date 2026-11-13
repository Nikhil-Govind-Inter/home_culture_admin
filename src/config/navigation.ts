import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  LayoutTemplate,
  Users,
  Home,
  Phone,
  Newspaper,
  Images,
  GalleryHorizontal,
  FileText,
  UserSearch,
  SlidersHorizontal,
  Share2,
  Search,
  Settings,
  Star,
  Hammer,
  Quote,
  Route,
  Workflow,
  HelpCircle,
  MessageCircleQuestion,
  Tags,
  ShieldCheck,
  Compass,
  Sparkles,
  CalendarCheck,
  MapPin,
  Clock,
  MessageSquare,
  Gem,
  Briefcase,
  Eye,
  Gift,
  Building2,
  Map,
  Landmark,
  Unlink,
  ListOrdered,
  CheckCircle2,
  Package,
  Palette,
  Ruler,
  Scissors,
  PlusSquare,
} from "lucide-react";

/**
 * Declarative sidebar menu. Only routes backed by this app / the home_culture server.
 * Sections render as labelled blocks; groups render as collapsible menus (a group with a
 * single page and no sub-groups collapses to a plain link).
 */
export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

export interface NavGroup {
  id: string;
  title: string;
  icon: LucideIcon;
  /** Direct links inside this group. */
  items?: NavItem[];
  /** Nested sub-groups, rendered before `items`. */
  children?: NavGroup[];
}

export interface NavSection {
  id: string;
  label: string;
  entries: (NavGroup | NavItem)[];
}

export const isNavGroup = (entry: NavGroup | NavItem): entry is NavGroup =>
  "id" in entry;

export const NAV: NavSection[] = [
  {
    id: "overview",
    label: "Overview",
    entries: [{ title: "Dashboard", url: "/", icon: LayoutDashboard }],
  },
  {
    id: "website",
    label: "Website Content",
    entries: [
      {
        id: "pages",
        title: "Pages",
        icon: LayoutTemplate,
        children: [
          {
            id: "home",
            title: "Home",
            icon: Home,
            items: [
              { title: "Page Content", url: "/home-cms", icon: FileText },
              { title: "Home Banners", url: "/home-banners", icon: Images },
              {
                title: "Broken Process",
                url: "/home-broken-processes",
                icon: Unlink,
              },
              {
                title: "Simply Choose",
                url: "/home-simply-choose",
                icon: CheckCircle2,
              },
              { title: "Highlights", url: "/home-highlights", icon: Star },
              {
                title: "Process Steps",
                url: "/home-process-steps",
                icon: ListOrdered,
              },
              { title: "Experiences", url: "/home-experiences", icon: Compass },
            ],
          },
          {
            id: "about",
            title: "About",
            icon: Users,
            items: [
              { title: "Page Content", url: "/about-cms", icon: FileText },
              { title: "Highlights", url: "/about-highlights", icon: Star },
            ],
          },
          {
            id: "how-it-works",
            title: "How It Works",
            icon: Workflow,
            items: [
              {
                title: "Page Content",
                url: "/how-it-works-cms",
                icon: FileText,
              },
              {
                title: "Workshop Materials",
                url: "/workshop-materials",
                icon: Hammer,
              },
              { title: "Testimonials", url: "/testimonials", icon: Quote },
              { title: "Journey Steps", url: "/journey-steps", icon: Route },
            ],
          },
          {
            id: "experience",
            title: "Experience",
            icon: Compass,
            items: [
              { title: "Page Content", url: "/experience-cms", icon: FileText },
              {
                title: "Journey Process",
                url: "/journey-processes",
                icon: Route,
              },
              { title: "Timeline", url: "/experience-timeline", icon: Clock },
              {
                title: "Highlights",
                url: "/experience-highlights",
                icon: Sparkles,
              },
              { title: "Features", url: "/experience-features", icon: Gem },
              { title: "Locations", url: "/locations", icon: MapPin },
              {
                title: "Booking Process",
                url: "/booking-processes",
                icon: CalendarCheck,
              },
              { title: "FAQs", url: "/experience-faqs", icon: MessageSquare },
            ],
          },
          {
            id: "career",
            title: "Career",
            icon: Briefcase,
            items: [
              { title: "Page Content", url: "/career-cms", icon: FileText },
              { title: "Vision", url: "/career-visions", icon: Eye },
              { title: "Benefits", url: "/career-benefits", icon: Gift },
              { title: "Departments", url: "/departments", icon: Building2 },
              { title: "Jobs", url: "/jobs", icon: UserSearch },
            ],
          },
          {
            id: "faq",
            title: "FAQ",
            icon: HelpCircle,
            items: [
              { title: "Page Content", url: "/faq-cms", icon: FileText },
              { title: "Categories", url: "/faq-categories", icon: Tags },
              { title: "FAQs", url: "/faqs", icon: MessageCircleQuestion },
            ],
          },
          {
            id: "contact",
            title: "Contact",
            icon: Phone,
            items: [
              { title: "Page Content", url: "/contact-cms", icon: FileText },
            ],
          },
          {
            id: "privacy-policy",
            title: "Privacy Policy",
            icon: ShieldCheck,
            items: [
              { title: "Page Content", url: "/privacy-policy", icon: FileText },
            ],
          },
        ],
      },
      { title: "Banners", url: "/banners", icon: GalleryHorizontal },
    ],
  },
  {
    id: "catalog",
    label: "Catalog",
    entries: [
      {
        id: "products",
        title: "Products",
        icon: Package,
        items: [
          { title: "Page Content", url: "/product-cms", icon: FileText },
          { title: "Products", url: "/products", icon: Package },
        ],
      },
      {
        id: "product-setup",
        title: "Product Setup",
        icon: SlidersHorizontal,
        items: [
          { title: "Styles", url: "/product-styles", icon: Palette },
          { title: "Trims", url: "/product-trims", icon: Scissors },
          { title: "Sizes", url: "/product-sizes", icon: Ruler },
          { title: "Add-ons", url: "/product-add-ons", icon: PlusSquare },
        ],
      },
    ],
  },
  {
    id: "marketing",
    label: "Marketing & Content",
    entries: [
      {
        id: "blogs",
        title: "Blogs",
        icon: Newspaper,
        items: [
          { title: "Page Content", url: "/blog-cms", icon: FileText },
          { title: "Categories", url: "/blog-categories", icon: Tags },
          { title: "Blogs", url: "/blogs", icon: Newspaper },
        ],
      },
    ],
  },
  {
    id: "reference",
    label: "Reference Data",
    entries: [
      {
        id: "masters",
        title: "Masters",
        icon: Landmark,
        items: [
          { title: "States", url: "/states", icon: Map },
          { title: "Cities", url: "/cities", icon: MapPin },
        ],
      },
    ],
  },
  {
    id: "seo",
    label: "SEO",
    entries: [{ title: "Meta Data", url: "/meta-data", icon: Search }],
  },
  {
    id: "settings",
    label: "Settings",
    entries: [
      { title: "Site Settings", url: "/site-settings", icon: Settings },
      { title: "Social Media", url: "/social-media", icon: Share2 },
    ],
  },
];

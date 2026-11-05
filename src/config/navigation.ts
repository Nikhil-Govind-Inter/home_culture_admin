import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  LayoutTemplate,
  Info,
  Phone,
  Newspaper,
  PanelBottom,
  Image,
  Share2,
  Search,
  Settings,
  Star,
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

export const isNavGroup = (entry: NavGroup | NavItem): entry is NavGroup => "id" in entry;

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
            id: "about",
            title: "About",
            icon: Info,
            items: [
              { title: "Page Content", url: "/about-cms", icon: Info },
              { title: "Highlights", url: "/about-highlights", icon: Star },
            ],
          },
          {
            id: "contact",
            title: "Contact",
            icon: Phone,
            items: [{ title: "Page Content", url: "/contact-cms", icon: Phone }],
          },
        ],
      },
      {
        id: "blogs",
        title: "Blogs",
        icon: Newspaper,
        items: [{ title: "Blogs", url: "/blogs", icon: Newspaper }],
      },
      {
        id: "site-elements",
        title: "Site Elements",
        icon: PanelBottom,
        items: [
          { title: "Site Settings", url: "/site-settings", icon: Settings },
          { title: "Banners", url: "/banners", icon: Image },
          { title: "Meta Data", url: "/meta-data", icon: Search },
          { title: "Social Media", url: "/social-media", icon: Share2 },
        ],
      },
    ],
  },
];

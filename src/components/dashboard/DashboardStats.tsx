import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  MessageCircleQuestion,
  MapPin,
  Newspaper,
  Package,
  Quote,
  UserSearch,
} from "lucide-react";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { fetchBlogsList } from "@/services/blogs/blogApi";
import { fetchProductList } from "@/services/product/productApi";
import { fetchFaqList } from "@/services/faq/faqApi";
import { fetchJobList } from "@/services/career/jobApi";
import { fetchCityList } from "@/services/masters/cityApi";
import { fetchTestimonialList } from "@/services/howItWorks/testimonialApi";

interface Stat {
  key: string;
  title: string;
  href: string;
  icon: LucideIcon;
  fetchTotal: () => Promise<number>;
}

const stats: Stat[] = [
  {
    key: "blogs",
    title: "Blogs",
    href: "/blogs",
    icon: Newspaper,
    fetchTotal: async () => (await fetchBlogsList(1, 1)).data.pagination.totalCount,
  },
  {
    key: "products",
    title: "Products",
    href: "/products",
    icon: Package,
    fetchTotal: async () => (await fetchProductList(1, 1)).data.pagination.totalCount,
  },
  {
    key: "faqs",
    title: "FAQs",
    href: "/faqs",
    icon: MessageCircleQuestion,
    fetchTotal: async () => (await fetchFaqList(1, 1)).data.pagination.totalCount,
  },
  {
    key: "jobs",
    title: "Jobs",
    href: "/jobs",
    icon: UserSearch,
    fetchTotal: async () => (await fetchJobList(1, 1)).data.pagination.totalCount,
  },
  {
    key: "cities",
    title: "Cities",
    href: "/cities",
    icon: MapPin,
    fetchTotal: async () => (await fetchCityList(1, 1)).data.pagination.totalCount,
  },
  {
    key: "testimonials",
    title: "Testimonials",
    href: "/testimonials",
    icon: Quote,
    fetchTotal: async () =>
      (await fetchTestimonialList(1, 1)).data.pagination.totalCount,
  },
];

export function DashboardStats() {
  // undefined = loading, null = failed
  const [totals, setTotals] = useState<Record<string, number | null | undefined>>({});

  useEffect(() => {
    let cancelled = false;
    stats.forEach((stat) => {
      stat
        .fetchTotal()
        .then((n) => !cancelled && setTotals((t) => ({ ...t, [stat.key]: n })))
        .catch(() => !cancelled && setTotals((t) => ({ ...t, [stat.key]: null })));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {stats.map((stat) => {
        const total = totals[stat.key];
        return (
          <Link key={stat.key} to={stat.href} className="block">
            <MetricsCard
              title={stat.title}
              icon={stat.icon}
              value={total === undefined || total === null ? "—" : total}
              description={total === null ? "Unavailable" : "Total records"}
            />
          </Link>
        );
      })}
    </div>
  );
}

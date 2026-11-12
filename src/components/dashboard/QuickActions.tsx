import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NAV, isNavGroup, type NavGroup } from "@/config/navigation";

interface Link_ {
  title: string;
  url: string;
  icon: LucideIcon;
}

/** Only the CMS ("Page Content") entries are shown as quick actions. */
const CMS_ITEM_TITLE = "Page Content";

/** Flatten a group (and its sub-groups) into labelled links, e.g. "Home · Banners". */
const collectLinks = (group: NavGroup, prefix = ""): Link_[] => {
  const label = prefix ? `${prefix} · ${group.title}` : group.title;
  const items = group.items ?? [];
  const own = items
    .filter((item) => item.title === CMS_ITEM_TITLE)
    .map((item) => ({
      title: items.length === 1 ? label : `${label} · ${item.title}`,
      url: item.url,
      icon: item.icon,
    }));
  const nested = (group.children ?? []).flatMap((child) =>
    collectLinks(child, group.id === "pages" ? "" : label),
  );
  return [...nested, ...own];
};

const sections = NAV.filter((s) => s.id !== "overview").map((section) => ({
  id: section.id,
  label: section.label,
  links: section.entries.flatMap((entry) =>
    isNavGroup(entry)
      ? collectLinks(entry)
      : [],
  ),
})).filter((section) => section.links.length > 0);

export function QuickActions() {
  return (
    <Card className="shadow-healthcare-sm">
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
        <CardDescription>Jump straight to any section</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {sections.map((section) => (
          <div key={section.id} className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section.label}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {section.links.map((link) => {
                const Icon = link.icon;
                return (
                  <Button
                    key={link.url}
                    variant="outline"
                    className="h-auto justify-start gap-2 px-3 py-2 text-left"
                    asChild
                  >
                    <Link to={link.url}>
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="font-medium">{link.title}</span>
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

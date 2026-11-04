import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Image, Info, Share2, Newspaper, Phone } from "lucide-react";

const quickActions = [
  { title: "Blogs", description: "Manage blog posts", icon: Newspaper, href: "/blogs", variant: "outline" as const },
  { title: "Contact CMS", description: "Edit the contact page content", icon: Phone, href: "/contact-cms", variant: "outline" as const },
  {
    title: "Banners",
    description: "Manage banners",
    icon: Image,
    href: "/banners",
    variant: "gradient" as const,
  },
  {
    title: "About CMS",
    description: "Edit the about page content",
    icon: Info,
    href: "/about-cms",
    variant: "default" as const,
  },
  {
    title: "Social Media",
    description: "Manage social media links",
    icon: Share2,
    href: "/social-media",
    variant: "outline" as const,
  },
];

export function QuickActions() {
  return (
    <Card className="shadow-healthcare-sm">
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
        <CardDescription>Frequently used tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {quickActions.map((action) => {
          const IconComponent = action.icon;
          return (
            <Button
              key={action.title}
              variant={action.variant}
              className="h-auto p-4 flex flex-col items-start space-y-2 text-left"
              asChild
            >
              <Link to={action.href}>
                <div className="flex items-center space-x-2">
                  <IconComponent className="h-4 w-4" />
                  <span className="font-medium">{action.title}</span>
                </div>
                <span className="text-xs opacity-80">{action.description}</span>
              </Link>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}

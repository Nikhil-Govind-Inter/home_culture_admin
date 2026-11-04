import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import * as LucideIcons from "lucide-react";

const iconCategories = {
  common: {
    label: "Common",
    icons: [
      "Home", "User", "Settings", "Search", "Heart", "Star", "Check", "X", 
      "Plus", "Minus", "Mail", "Phone", "MapPin", "Calendar", "Clock", "Bell"
    ]
  },
  arrows: {
    label: "Arrows & Direction",
    icons: [
      "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "ChevronUp", "ChevronDown",
      "ChevronLeft", "ChevronRight", "MoveUp", "MoveDown", "ArrowUpRight", "ArrowDownLeft",
      "CornerDownLeft", "CornerUpRight", "TrendingUp", "TrendingDown"
    ]
  },
  social: {
    label: "Social & Communication",
    icons: [
      "MessageCircle", "MessageSquare", "Send", "Share", "ThumbsUp", "ThumbsDown",
      "Users", "UserPlus", "UserMinus", "AtSign", "Hash", "Mention", "Video",
      "Mic", "MicOff", "Camera", "Image", "Link", "Globe", "Wifi"
    ]
  },
  business: {
    label: "Business & Finance",
    icons: [
      "Briefcase", "Building", "DollarSign", "TrendingUp", "BarChart", "PieChart",
      "Target", "Award", "Trophy", "Zap", "Lightbulb", "Rocket", "Gem", "Crown",
      "BadgeCheck", "Shield", "Lock", "Unlock"
    ]
  },
  media: {
    label: "Media & Files",
    icons: [
      "Play", "Pause", "Stop", "SkipForward", "SkipBack", "Rewind", "FastForward",
      "Volume2", "VolumeX", "Download", "Upload", "File", "FileText", "Image",
      "Video", "Music", "Headphones", "Camera", "Mic", "Monitor", "Smartphone"
    ]
  },
  system: {
    label: "System & Tools",
    icons: [
      "Settings", "Tool", "Wrench", "Cog", "Filter", "RefreshCw", "RotateCcw",
      "Maximize", "Minimize", "Copy", "Cut", "Paste", "Trash", "Archive",
      "FolderOpen", "Folder", "Save", "Edit", "Eye", "EyeOff"
    ]
  }
};

interface IconSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIcon: (iconName: string, iconSvg: string) => void;
}

export function IconSelector({ isOpen, onClose, onSelectIcon }: IconSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("common");

  const filteredIcons = useMemo(() => {
    const categoryIcons = iconCategories[selectedCategory as keyof typeof iconCategories].icons;
    
    if (!searchTerm) return categoryIcons;
    
    return categoryIcons.filter(iconName =>
      iconName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, selectedCategory]);

  const allFilteredIcons = useMemo(() => {
    if (!searchTerm) return [];
    
    const allIcons = Object.values(iconCategories).flatMap(category => category.icons);
    return allIcons.filter(iconName =>
      iconName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleIconSelect = (iconName: string) => {
    const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as React.ComponentType<{className?: string}>;
    
    if (IconComponent) {
      const iconElement = React.createElement(IconComponent, { className: "w-4 h-4" });
      const iconSvg = `<lucide-icon name="${iconName}" class="inline w-4 h-4" />`;
      onSelectIcon(iconName, iconSvg);
    }
    onClose();
  };

  const IconButton = ({ iconName }: { iconName: string }) => {
    const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as React.ComponentType<{className?: string}>;
    
    if (!IconComponent) return null;
    
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleIconSelect(iconName)}
        className="w-16 h-16 flex flex-col items-center justify-center gap-1 p-2"
        title={iconName}
      >
        <IconComponent className="w-5 h-5" />
        <span className="text-xs truncate max-w-full">{iconName}</span>
      </Button>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Icon</DialogTitle>
          <DialogDescription>
            Choose an icon to insert into your content
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search Icons</Label>
            <Input
              id="search"
              placeholder="Search for icons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {searchTerm ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Search Results ({allFilteredIcons.length})</h3>
              <ScrollArea className="h-64 w-full border rounded-md p-4">
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                  {allFilteredIcons.map((iconName) => (
                    <IconButton key={iconName} iconName={iconName} />
                  ))}
                </div>
                {allFilteredIcons.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    No icons found matching "{searchTerm}"
                  </div>
                )}
              </ScrollArea>
            </div>
          ) : (
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                {Object.entries(iconCategories).map(([key, category]) => (
                  <TabsTrigger key={key} value={key} className="text-xs">
                    {category.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.entries(iconCategories).map(([key, category]) => (
                <TabsContent key={key} value={key}>
                  <ScrollArea className="h-64 w-full border rounded-md p-4">
                    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                      {filteredIcons.map((iconName) => (
                        <IconButton key={iconName} iconName={iconName} />
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { FileUpload } from "./FileUpload";

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertImage: (src: string, alt: string, title?: string) => void;
}

export function ImageUploadModal({ isOpen, onClose, onInsertImage }: ImageUploadModalProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [titleText, setTitleText] = useState("");
  const [activeTab, setActiveTab] = useState("upload");

  const handleReset = () => {
    setUploadedFile(null);
    setImageUrl("");
    setAltText("");
    setTitleText("");
    setActiveTab("upload");
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleInsert = () => {
    let src = "";
    
    if (activeTab === "upload" && uploadedFile) {
      src = URL.createObjectURL(uploadedFile);
    } else if (activeTab === "url" && imageUrl.trim()) {
      src = imageUrl.trim();
    }
    
    if (src && altText.trim()) {
      onInsertImage(src, altText.trim(), titleText.trim() || undefined);
      handleClose();
    }
  };

  const canInsert = () => {
    const hasValidSrc = (activeTab === "upload" && uploadedFile) || 
                       (activeTab === "url" && imageUrl.trim());
    return hasValidSrc && altText.trim();
  };

  const getPreviewSrc = () => {
    if (activeTab === "upload" && uploadedFile) {
      return URL.createObjectURL(uploadedFile);
    } else if (activeTab === "url" && imageUrl.trim()) {
      return imageUrl.trim();
    }
    return null;
  };

  const previewSrc = getPreviewSrc();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Insert Image</DialogTitle>
          <DialogDescription>
            Upload an image or provide a URL to insert into your content
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload Image</TabsTrigger>
              <TabsTrigger value="url">Image URL</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              <div>
                <Label>Upload Image File</Label>
                <FileUpload
                  value={uploadedFile}
                  onChange={setUploadedFile}
                  accept="image/*"
                  placeholder="Drop an image file here or click to browse"
                  preview={true}
                  className="mt-2"
                  enableCropping={false}
                />
              </div>
            </TabsContent>

            <TabsContent value="url" className="space-y-4">
              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  type="url"
                />
              </div>
            </TabsContent>
          </Tabs>

          {/* Preview */}
          {previewSrc && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="border rounded-md p-4 bg-muted/50">
                <img
                  src={previewSrc}
                  alt={altText || "Preview"}
                  className="max-w-full h-auto max-h-48 rounded border"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          {/* Alt Text - Required */}
          <div>
            <Label htmlFor="altText">Alt Text *</Label>
            <Textarea
              id="altText"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the image for accessibility (required)"
              rows={2}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Alt text is required for accessibility and SEO
            </p>
          </div>

          {/* Title Text - Optional */}
          <div>
            <Label htmlFor="titleText">Title Text (optional)</Label>
            <Input
              id="titleText"
              value={titleText}
              onChange={(e) => setTitleText(e.target.value)}
              placeholder="Additional information shown on hover"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleInsert} 
            disabled={!canInsert()}
          >
            Insert Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
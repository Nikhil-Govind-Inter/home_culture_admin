import React, { useRef } from "react";
import Cropper, { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Crop, RotateCcw, RotateCw } from "lucide-react";

interface ImageCropperProps {
  image: string;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedImageBlob: Blob) => void;
  targetWidth?: number;
  targetHeight?: number;
  outputMime?: "image/png" | "image/jpeg" | "image/webp";
  outputQuality?: number;
}

export function ImageCropper({
  image,
  isOpen,
  onClose,
  onCropComplete,
  targetWidth,
  targetHeight,
  outputMime = "image/webp",
  outputQuality = 0.92,
}: ImageCropperProps) {
  const cropperRef = useRef<ReactCropperElement>(null);
  const aspect =
    targetWidth && targetHeight ? targetWidth / targetHeight : undefined;

  const getCropData = () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;

    const canvas = cropper.getCroppedCanvas({
      ...(targetWidth && targetHeight
        ? { width: targetWidth, height: targetHeight }
        : {}),
      fillColor: outputMime === "image/jpeg" ? "#ffffff" : "transparent",
      imageSmoothingEnabled: true,
      imageSmoothingQuality: "high",
    });

    canvas.toBlob(
      (blob: Blob | null) => {
        if (blob) {
          onCropComplete(blob);
          onClose();
        }
      },
      outputMime,
      outputMime === "image/png" ? undefined : outputQuality
    );
  };

  const resetCropper = () => {
    if (typeof cropperRef.current?.cropper !== "undefined") {
      cropperRef.current.cropper.reset();
    }
  };

  const handleRotateLeft = () => {
    if (typeof cropperRef.current?.cropper !== "undefined") {
      cropperRef.current.cropper.rotate(-90);
    }
  };

  const handleRotateRight = () => {
    if (typeof cropperRef.current?.cropper !== "undefined") {
      cropperRef.current.cropper.rotate(90);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl lg:max-w-4xl max-h-[90vh] w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-full p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Crop className="h-5 w-5" />
            Crop Image{targetWidth && targetHeight ? ` – ${targetWidth}×${targetHeight}px` : ""}
          </DialogTitle>
        </DialogHeader>

        <div className="relative h-64 sm:h-72 md:h-80 lg:h-96 bg-gray-100 mx-3 sm:mx-4 md:mx-6">
          <Cropper
            ref={cropperRef}
            style={{ height: "100%", width: "100%" }}
            zoomable={false}
            initialAspectRatio={aspect}
            aspectRatio={aspect}
            preview=".img-preview"
            src={image}
            viewMode={1}
            minCropBoxHeight={50}
            minCropBoxWidth={50}
            background={false}
            responsive={true}
            restore={false}
            autoCropArea={1}
            checkOrientation={true}
            guides={true}
            center={true}
            highlight={true}
            dragMode="crop"
            cropBoxMovable={true}
            cropBoxResizable={true}
            toggleDragModeOnDblclick={false}
            ready={() => {
              // Ensure initial quality settings
              if (cropperRef.current?.cropper) {
                cropperRef.current.cropper.setDragMode("crop");
              }
            }}
          />
        </div>

        <div className="px-3 sm:px-4 md:px-6 pb-4 space-y-3 md:space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 md:gap-3">
            <Button variant="outline" size="sm" onClick={handleRotateLeft} className="w-full sm:w-auto">
              <RotateCcw className="h-4 w-4 mr-2" />
              Rotate Left
            </Button>
            <Button variant="outline" size="sm" onClick={handleRotateRight} className="w-full sm:w-auto">
              <RotateCw className="h-4 w-4 mr-2" />
              Rotate Right
            </Button>
          </div>
        </div>

        <DialogFooter className="p-3 sm:p-4 md:p-6 pt-2 flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={resetCropper} className="w-full sm:w-auto">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={getCropData} className="w-full sm:w-auto">Crop & Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

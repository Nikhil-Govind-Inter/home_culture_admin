import React, { useRef, useState } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Crop, RotateCcw, RotateCw, ZoomIn, ZoomOut } from "lucide-react";

interface ImageCropperProps {
  image: string;
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedImageBlob: Blob) => void;
  aspect?: number;
  outputFormat?: "png" | "jpeg" | "webp";
  outputQuality?: number;
  maxOutputSize?: number;
}

export function ImageCropper({ 
  image, 
  isOpen, 
  onClose, 
  onCropComplete, 
  aspect = undefined,
  outputFormat = "webp",
  outputQuality = 1.0,
  maxOutputSize = 4096
}: ImageCropperProps) {
  const cropperRef = useRef<HTMLImageElement>(null);
  const [zoom, setZoom] = useState(1);

  // const getCropData = () => {
  //   if (typeof cropperRef.current?.cropper !== "undefined") {
  //     cropperRef.current.cropper.getCroppedCanvas().toBlob((blob: Blob | null) => {
  //       if (blob) {
  //         onCropComplete(blob);
  //         onClose();
  //       }
  //     }, 'image/jpeg', 0.9);
  //   }
  // };

  const getCropData = () => {
    if (typeof cropperRef.current?.cropper !== "undefined") {
      // Get crop box data to maintain original resolution
      const cropBoxData = cropperRef.current.cropper.getCropBoxData();
      const canvasData = cropperRef.current.cropper.getCanvasData();
      
      // Calculate optimal canvas size to maintain quality
      const scale = canvasData.naturalWidth / canvasData.width;
      const outputWidth = Math.round(cropBoxData.width * scale);
      const outputHeight = Math.round(cropBoxData.height * scale);
      
      const canvas = cropperRef.current.cropper.getCroppedCanvas({
        width: outputWidth,
        height: outputHeight,
        minWidth: 256,
        minHeight: 256,
        maxWidth: maxOutputSize,
        maxHeight: maxOutputSize,
        fillColor: outputFormat === "jpeg" ? "#ffffff" : "transparent",
        imageSmoothingEnabled: true,
        imageSmoothingQuality: "high",
      });

      const mimeType = outputFormat === "jpeg" ? "image/jpeg" : 
                      outputFormat === "webp" ? "image/webp" : "image/png";
      
      canvas.toBlob(
        (blob: Blob | null) => {
          if (blob) {
            onCropComplete(blob);
            onClose();
          }
        },
        mimeType,
        outputFormat === "png" ? undefined : outputQuality
      );
    }
  };

  const resetCropper = () => {
    if (typeof cropperRef.current?.cropper !== "undefined") {
      cropperRef.current.cropper.reset();
      setZoom(1);
    }
  };

  const handleZoom = (value: number[]) => {
    const newZoom = value[0];
    setZoom(newZoom);
    if (typeof cropperRef.current?.cropper !== "undefined") {
      cropperRef.current.cropper.zoomTo(newZoom);
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

  const handleZoomIn = () => {
    if (typeof cropperRef.current?.cropper !== "undefined") {
      const newZoom = Math.min(zoom + 0.1, 3);
      setZoom(newZoom);
      cropperRef.current.cropper.zoomTo(newZoom);
    }
  };

  const handleZoomOut = () => {
    if (typeof cropperRef.current?.cropper !== "undefined") {
      const newZoom = Math.max(zoom - 0.1, 0.1);
      setZoom(newZoom);
      cropperRef.current.cropper.zoomTo(newZoom);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl lg:max-w-4xl max-h-[90vh] w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-full p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Crop className="h-5 w-5" />
            Crop Image
          </DialogTitle>
        </DialogHeader>

        <div className="relative h-64 sm:h-72 md:h-80 lg:h-96 bg-gray-100 mx-3 sm:mx-4 md:mx-6">
          <Cropper
            ref={cropperRef}
            style={{ height: "100%", width: "100%" }}
            zoomTo={zoom}
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
            autoCropArea={0.8}
            checkOrientation={true}
            guides={true}
            center={true}
            highlight={true}
            dragMode="move"
            cropBoxMovable={true}
            cropBoxResizable={true}
            toggleDragModeOnDblclick={false}
            wheelZoomRatio={0.1}
            ready={() => {
              // Ensure initial quality settings
              if (cropperRef.current?.cropper) {
                cropperRef.current.cropper.setDragMode("move");
              }
            }}
          />
        </div>

        <div className="px-3 sm:px-4 md:px-6 pb-4 space-y-3 md:space-y-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <div className="flex-1 space-y-2">
              <Label htmlFor="zoom">Zoom: {zoom.toFixed(1)}x</Label>
              <Slider id="zoom" min={0.1} max={3} step={0.1} value={[zoom]} onValueChange={handleZoom} />
            </div>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

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

import { useState, useRef } from "react";
import { X, Upload, GripVertical, Plus } from "lucide-react";

interface ImageItem {
  id?: string;
  url: string;
  isNew?: boolean;
  file?: File;
}

interface MultiImageUploaderProps {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  maxImages?: number;
}

export default function MultiImageUploader({
  images,
  onChange,
  maxImages = 10,
}: MultiImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

    setIsUploading(true);

    try {
      const uploadedImages: ImageItem[] = [];

      for (const file of filesToUpload) {
        const response = await fetch("/api/upload-image", {
          method: "POST",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        });

        if (response.ok) {
          const data = await response.json();
          uploadedImages.push({
            url: data.imagePath,
            isNew: true,
          });
        }
      }

      onChange([...images, ...uploadedImages]);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUrlAdd = () => {
    const url = prompt("Unesi URL slike:");
    if (url && url.trim()) {
      onChange([...images, { url: url.trim(), isNew: true }]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedItem = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
    onChange(newImages);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-300">
          Slike ({images.length}/{maxImages})
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleUrlAdd}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            + Dodaj URL
          </button>
        </div>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {images.map((image, index) => (
          <div
            key={index}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`relative aspect-video bg-slate-800 rounded-lg overflow-hidden group cursor-move border-2 transition-all ${
              draggedIndex === index
                ? "border-blue-500 opacity-50"
                : "border-transparent hover:border-slate-600"
            }`}
          >
            <img
              src={image.url}
              alt={`Slika ${index + 1}`}
              className="w-full h-full object-cover"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <div className="text-white/70">
                <GripVertical className="w-5 h-5" />
              </div>
            </div>

            {/* Order badge */}
            <div className="absolute top-2 left-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
              {index + 1}
            </div>

            {/* Remove button */}
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>

            {/* New badge */}
            {image.isNew && (
              <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-green-600 rounded text-xs text-white">
                Nova
              </div>
            )}
          </div>
        ))}

        {/* Add Button */}
        {images.length < maxImages && (
          <label
            className={`aspect-video border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-slate-800/50 transition-all ${
              isUploading ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            {isUploading ? (
              <div className="flex flex-col items-center text-slate-400">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
                <span className="text-sm">Uploading...</span>
              </div>
            ) : (
              <>
                <Plus className="w-8 h-8 text-slate-500 mb-2" />
                <span className="text-sm text-slate-500">Dodaj slike</span>
              </>
            )}
          </label>
        )}
      </div>

      <p className="text-xs text-slate-500">
        Povuci i ispusti za promjenu redoslijeda. Prva slika će biti glavna slika.
      </p>
    </div>
  );
}

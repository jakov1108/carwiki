import { useState, useRef } from "react";
import { X, Upload, GripVertical, Plus } from "lucide-react";
import { compressImage } from "../lib/imageCompression";

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
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const dragCounter = useRef(0);

  const uploadFiles = async (files: File[]) => {
    const remainingSlots = maxImages - images.length;
    const filesToUpload = files.filter(f => f.type.startsWith('image/')).slice(0, remainingSlots);
    if (filesToUpload.length === 0) return;

    setIsUploading(true);

    try {
      const uploadedImages: ImageItem[] = [];

      for (const file of filesToUpload) {
        const compressed = await compressImage(file);
        const response = await fetch("/api/upload-image", {
          method: "POST",
          headers: {
            "Content-Type": compressed.type,
          },
          body: compressed,
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
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await uploadFiles(Array.from(files));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // File drop zone handlers
  const handleDropZoneDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.types.includes('Files')) {
      setIsDraggingFile(true);
    }
  };

  const handleDropZoneDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDraggingFile(false);
    }
  };

  const handleDropZoneDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDropZoneDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
    dragCounter.current = 0;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await uploadFiles(files);
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
    <div
      ref={dropZoneRef}
      className={`space-y-4 relative rounded-xl transition-all ${isDraggingFile ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900' : ''}`}
      onDragEnter={handleDropZoneDragEnter}
      onDragLeave={handleDropZoneDragLeave}
      onDragOver={handleDropZoneDragOver}
      onDrop={handleDropZoneDrop}
    >
      {/* Drop overlay */}
      {isDraggingFile && (
        <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-500 rounded-xl z-20 flex items-center justify-center">
          <div className="text-center">
            <Upload className="w-12 h-12 text-blue-400 mx-auto mb-2" />
            <p className="text-blue-400 font-semibold text-lg">Ispustite slike ovdje</p>
          </div>
        </div>
      )}
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

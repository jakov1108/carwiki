import { useState, useRef } from "react";
import { Upload, Loader2 } from "lucide-react";
import { compressImage } from "../lib/imageCompression";

interface ObjectUploaderProps {
  onUploadComplete: (imagePath: string) => void;
  currentImage?: string;
}

export function ObjectUploader({ onUploadComplete, currentImage }: ObjectUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Molimo odaberite sliku");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Slika mora biti manja od 10MB");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      const compressed = await compressImage(file);
      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: compressed,
        headers: {
          "Content-Type": compressed.type,
        },
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Greška pri uploadu");
      }

      const { imagePath } = await response.json();
      onUploadComplete(imagePath);
    } catch (err: any) {
      setError(err.message || "Greška pri uploadu");
      setPreview(currentImage || null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
        data-testid="input-image-file"
      />
      
      <div 
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`
          border-2 border-dashed border-slate-600 rounded-lg p-4 
          flex flex-col items-center justify-center cursor-pointer
          hover:border-blue-500 transition-colors min-h-[120px]
          ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
        `}
        data-testid="button-upload-image"
      >
        {preview ? (
          <div className="relative w-full">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-32 object-cover rounded"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                <Loader2 className="w-8 h-8 animate-spin text-white keep-white" />
              </div>
            )}
          </div>
        ) : (
          <>
            {isUploading ? (
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            ) : (
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
            )}
            <span className="text-sm text-slate-400">
              {isUploading ? "Učitavanje..." : "Kliknite za upload slike"}
            </span>
          </>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500" data-testid="text-upload-error">{error}</p>
      )}
    </div>
  );
}

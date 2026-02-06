import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, GripVertical } from "lucide-react";

interface PhotoUploadProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  readOnly?: boolean;
}

export function PhotoUpload({ photos, onChange, readOnly }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newPhotos = Array.from(files).map((file) =>
      URL.createObjectURL(file)
    );
    onChange([...photos, ...newPhotos]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removePhoto = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  if (readOnly) {
    return (
      <div>
        <p className="mb-1 text-xs text-muted-foreground">Photos</p>
        {photos.length === 0 ? (
          <p className="text-sm text-muted-foreground">No photos</p>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {photos.map((photo, i) => (
              <div
                key={i}
                className="relative aspect-square overflow-hidden rounded-lg border border-border"
              >
                <img
                  src={photo}
                  alt={`Photo ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <p className="mb-2 text-xs text-muted-foreground">Photos</p>

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="mb-3 grid grid-cols-4 gap-2">
          {photos.map((photo, i) => (
            <div
              key={i}
              className="group relative aspect-square overflow-hidden rounded-lg border border-border"
            >
              <img
                src={photo}
                alt={`Photo ${i + 1}`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-start justify-between bg-black/0 p-1 opacity-0 transition-opacity group-hover:bg-black/30 group-hover:opacity-100">
                <GripVertical className="h-4 w-4 text-white/70" />
                <button
                  onClick={() => removePhoto(i)}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 transition-colors ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/40 hover:bg-secondary/50"
        }`}
      >
        <ImagePlus className="mb-2 h-6 w-6 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">
          Drop photos here or click to upload
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          JPG, PNG, WebP · Max 10MB each
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}

import { useState, useCallback } from 'react';
import { Upload, Image, X, FileType, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function UploadZone({ file, setFile, preview, setPreview }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
    }
  }, [setFile, setPreview]);

  const handleFileSelect = useCallback((e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  }, [setFile, setPreview]);

  const removeFile = useCallback(() => {
    setFile(null);
    setPreview(null);
  }, [setFile, setPreview]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-lg flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          Upload Floor Plan
        </h3>
        {file && (
          <Button variant="ghost" size="sm" onClick={removeFile} className="text-muted-foreground hover:text-destructive">
            <X className="w-4 h-4 mr-1" />
            Remove
          </Button>
        )}
      </div>

      {!file ? (
        <label
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative flex flex-col items-center justify-center w-full aspect-[4/3] rounded-xl border-2 border-dashed cursor-pointer transition-all",
            isDragging
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
          )}
        >
          <input
            type="file"
            className="hidden"
            accept="image/*,.pdf,.svg"
            onChange={handleFileSelect}
          />
          <div className="flex flex-col items-center gap-4 p-8 text-center">
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors",
              isDragging ? "bg-primary text-primary-foreground" : "bg-muted"
            )}>
              <Image className="w-7 h-7" />
            </div>
            <div>
              <p className="font-medium mb-1">
                {isDragging ? "Drop your floor plan here" : "Click to upload or drag floor plan here"}
              </p>
              <p className="text-sm text-muted-foreground">
                Supports JPG, PNG, PDF, SVG formats, max 20MB
              </p>
            </div>
          </div>
        </label>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-border bg-muted/30">
          <img
            src={preview}
            alt="Floor plan preview"
            className="w-full aspect-[4/3] object-contain bg-black/20"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <FileType className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{file.name}</p>
                <p className="text-xs text-white/60">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20">
                <Check className="w-3 h-3 text-primary" />
                <span className="text-xs text-primary font-medium">Ready</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
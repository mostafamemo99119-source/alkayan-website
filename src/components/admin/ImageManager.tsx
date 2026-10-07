import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export interface ManagedImage {
  id: string; // Used for identifying the image to delete
  url: string; // Display URL
  alt?: string;
}

interface ImageManagerProps {
  title: string;
  subtitle?: string;
  images: ManagedImage[];
  newImages: File[];
  onNewImagesChange: (files: File[]) => void;
  onDelete: (id: string) => void;
}

export function ImageManager({
  title,
  subtitle,
  images,
  newImages,
  onNewImagesChange,
  onDelete,
}: ImageManagerProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="md:col-span-2 rounded-xl border border-white/10 bg-white/5 p-5 mt-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-primary">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className="relative">
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                const fileArray = Array.from(e.target.files);
                onNewImagesChange([...newImages, ...fileArray]);
              }
              // Reset input securely
              setTimeout(() => {
                if (fileRef.current) fileRef.current.value = '';
              }, 0);
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="cursor-pointer inline-flex items-center justify-center rounded-md bg-primary/20 hover:bg-primary/30 border border-primary/50 px-4 py-2 text-sm font-medium text-primary transition-colors"
          >
            اختر صور
          </button>
        </div>
      </div>

      {images.length > 0 || newImages.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {/* Existing Images */}
          {images.map((image) => {
            let finalUrl = image.url;
            if (!finalUrl.startsWith("http") && !finalUrl.startsWith("blob:") && !finalUrl.startsWith("data:")) {
              // Assume standard bucket if not absolute. If the bucket was different, they could pass a bucketName prop, 
              // but per project standards it's almost always 'space-images'.
              finalUrl = supabase.storage.from("space-images").getPublicUrl(image.url).data.publicUrl;
            }
            
            return (
            <div key={image.id} className="relative group aspect-[4/3] rounded-lg overflow-hidden border border-white/10 bg-black/20">
              <img src={finalUrl} alt={image.alt || "صورة"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <button
                type="button"
                onClick={() => onDelete(image.id)}
                className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-destructive/90 text-white hover:bg-destructive shadow-lg transition-colors"
                title="حذف الصورة"
              >
                <X className="size-4" />
              </button>
            </div>
            );
          })}

          {/* New Images Preview */}
          {newImages.map((file, idx) => (
            <div key={`new-${idx}`} className="relative group aspect-[4/3] rounded-lg overflow-hidden border-2 border-primary border-dashed bg-primary/5">
              <img src={URL.createObjectURL(file)} alt="New preview" className="w-full h-full object-cover opacity-70" />
              <button
                type="button"
                onClick={() => onNewImagesChange(newImages.filter((_, i) => i !== idx))}
                className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-destructive/90 text-white hover:bg-destructive shadow-lg transition-colors z-10"
                title="إزالة الصورة الجديدة"
              >
                <X className="size-4" />
              </button>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="bg-black/80 px-2 py-1 text-xs text-primary font-medium rounded-md shadow">جديد (Preview)</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/10 bg-black/10 py-10 text-muted-foreground">
          <ImagePlus className="size-10 opacity-30 mb-3" />
          <p className="text-sm">لم يتم إضافة صور حتى الآن</p>
        </div>
      )}
    </div>
  );
}

import { useRef, useState } from "react";
import { ImagePlus, X, Video, Image, Youtube, UploadCloud } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export interface ManagedImage {
  id: string; // Used for identifying the image to delete
  url: string; // Display URL
  alt?: string;
}

interface ImageManagerProps {
  title?: string;
  subtitle?: string;
  images: ManagedImage[];
  newImages: File[];
  onNewImagesChange: (files: File[]) => void;
  onDelete: (id: string) => void;
  youtubeLink?: string;
  onYoutubeLinkChange?: (link: string) => void;
}

export function ImageManager({
  title = "معرض الوسائط (صور وفيديو)",
  subtitle = "أضف صوراً عالية الجودة وفيديو جولة المكان لإبراز الفخامة",
  images,
  newImages,
  onNewImagesChange,
  onDelete,
  youtubeLink = "",
  onYoutubeLinkChange,
}: ImageManagerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [activeMediaTab, setActiveMediaTab] = useState<"images" | "video">("images");
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (fileArray.length > 0) {
      onNewImagesChange([...newImages, ...fileArray]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="md:col-span-2 rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-b from-[#14100a]/90 to-[#0a0805]/95 p-5 md:p-6 mt-4 shadow-xl shadow-black/40">
      {/* Header & Section Title */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-lg font-bold text-[#D4AF37] flex items-center gap-2">
            {title}
          </h3>
          {subtitle && <p className="text-xs text-zinc-400 mt-1">{subtitle}</p>}
        </div>

        {/* Modern Switcher Tabs */}
        <div className="inline-flex items-center rounded-xl bg-black/60 p-1 border border-white/10">
          <button
            type="button"
            onClick={() => setActiveMediaTab("images")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeMediaTab === "images"
                ? "bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Image className="size-3.5" />
            معرض الصور ({images.length + newImages.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveMediaTab("video")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeMediaTab === "video"
                ? "bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Video className="size-3.5" />
            فيديو الجولة {youtubeLink ? "✓" : ""}
          </button>
        </div>
      </div>

      {/* ─── TAB 1: Images Section ─── */}
      {activeMediaTab === "images" && (
        <div className="space-y-4">
          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all cursor-pointer ${
              isDragging
                ? "border-[#D4AF37] bg-[#D4AF37]/10 scale-[1.01]"
                : "border-[#D4AF37]/30 bg-black/30 hover:border-[#D4AF37]/60 hover:bg-black/50"
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFiles(e.target.files);
                }
                setTimeout(() => {
                  if (fileRef.current) fileRef.current.value = "";
                }, 0);
              }}
            />
            <div className="size-12 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] mb-3">
              <UploadCloud className="size-6" />
            </div>
            <p className="text-sm font-medium text-zinc-200">
              اسحب الصور وأفلتها هنا أو <span className="text-[#D4AF37] underline">تصفح من جهازك</span>
            </p>
            <p className="text-xs text-zinc-500 mt-1">يدعم صيغ JPG، PNG، WEBP (بحد أقصى 10 ميجابايت لكل صورة)</p>
          </div>

          {/* Thumbnails Gallery */}
          {images.length > 0 || newImages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
              {/* Existing Images */}
              {images.map((image) => {
                let finalUrl = image.url;
                if (!finalUrl.startsWith("http") && !finalUrl.startsWith("blob:") && !finalUrl.startsWith("data:")) {
                  finalUrl = supabase.storage.from("space-images").getPublicUrl(image.url).data.publicUrl;
                }

                return (
                  <div
                    key={image.id}
                    className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-black/40 shadow-inner"
                  >
                    <img
                      src={finalUrl}
                      alt={image.alt || "صورة"}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                      <span className="text-[10px] text-zinc-300 truncate max-w-[80px]">محفوظة</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(image.id);
                        }}
                        className="grid size-7 place-items-center rounded-lg bg-destructive text-white hover:bg-destructive/80 transition-colors shadow-lg cursor-pointer"
                        title="حذف الصورة"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* New Images Preview */}
              {newImages.map((file, idx) => (
                <div
                  key={`new-${idx}`}
                  className="group relative aspect-[4/3] rounded-xl overflow-hidden border-2 border-[#D4AF37]/60 border-dashed bg-[#D4AF37]/5"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt="New preview"
                    className="w-full h-full object-cover opacity-85"
                  />
                  <div className="absolute top-2 left-2 bg-black/80 text-[#D4AF37] px-2 py-0.5 rounded text-[10px] font-bold border border-[#D4AF37]/40 shadow">
                    جديد
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNewImagesChange(newImages.filter((_, i) => i !== idx));
                    }}
                    className="absolute top-2 right-2 grid size-7 place-items-center rounded-lg bg-destructive text-white hover:bg-destructive/80 transition-colors shadow-lg cursor-pointer z-10"
                    title="إزالة الصورة الجديدة"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-black/20 py-8 text-muted-foreground">
              <ImagePlus className="size-8 opacity-30 mb-2" />
              <p className="text-xs">لم يتم اختيار أي صور حتى الآن</p>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: Video Section ─── */}
      {activeMediaTab === "video" && (
        <div className="space-y-4 py-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-200 flex items-center gap-2">
              <Youtube className="size-5 text-red-500 shrink-0" />
              رابط جولة يوتيوب (اختياري)
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-red-500">
                <Youtube className="size-5" />
              </div>
              <input
                type="url"
                name="youtubeLink"
                placeholder="https://www.youtube.com/watch?v=... أو https://youtu.be/..."
                value={youtubeLink}
                onChange={(e) => onYoutubeLinkChange?.(e.target.value)}
                className="w-full rounded-xl border border-[#D4AF37]/40 bg-black/60 px-4 py-3 pr-11 text-sm text-foreground placeholder:text-zinc-600 focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] transition-all"
                dir="ltr"
              />
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              أدخل رابط فيديو أو شورتس من يوتيوب ليعرض للعملاء كجولة مرئية داخل تفاصيل المساحة.
            </p>
          </div>

          {/* YouTube Video Preview if link provided */}
          {youtubeLink && (
            <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-3">
              <p className="text-xs font-semibold text-zinc-300 mb-2 flex items-center gap-2">
                <span className="size-2 rounded-full bg-green-500 animate-pulse" />
                معاينة الرابط المدخل:
              </p>
              <a
                href={youtubeLink}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#D4AF37] underline break-all hover:text-white"
                dir="ltr"
              >
                {youtubeLink}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

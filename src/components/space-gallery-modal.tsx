import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpLeft, ChevronLeft, ChevronRight, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getSpaceImageUrl, formatPrice, type Space } from "@/lib/spaces";
import { useQuery } from "@tanstack/react-query";
import { siteSettingsQuery, whatsappLink } from "@/lib/site-settings";

export function SpaceGalleryModal({ space, onClose }: { space: Space | null; onClose: () => void }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => setCurrent(0), [space?.id]);
  const images = space?.space_images ?? [];
  const active = images[current];
  const { data: settings } = useQuery(siteSettingsQuery);
  const whatsappNumber = settings?.whatsapp;

  return (
    <Dialog.Root open={space !== null} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-all duration-300" />
        <Dialog.Content 
          dir="rtl" 
          className="glass-modal fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] md:max-h-[95vh] w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] max-w-7xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.15)] lg:flex-row rounded-2xl md:rounded-3xl border border-[#D4AF37]/30"
        >
          {space && (
            <>
              <Dialog.Close asChild>
                <Button variant="icon" className="absolute left-3 top-3 md:left-4 md:top-4 z-50 border-white/20 bg-black/60 text-white hover:bg-destructive hover:border-destructive size-9 md:size-11" aria-label="إغلاق">
                  <X className="size-5" />
                </Button>
              </Dialog.Close>

              {/* Image Gallery Column (takes ~55% width on desktop, h-56 md:h-96 on mobile/tablet) */}
              <div className="relative flex h-56 sm:h-72 md:h-96 min-h-[14rem] sm:min-h-[18rem] md:min-h-[24rem] lg:min-h-[350px] lg:h-auto w-full flex-col bg-black/50 lg:w-[55%] shrink-0">
                {active && (
                  <img 
                    src={getSpaceImageUrl(active)} 
                    alt={active.alt_text || space.name} 
                    className="h-full w-full object-cover lg:absolute lg:inset-0" 
                  />
                )}
                {images.length > 1 && (
                  <>
                    <button onClick={() => setCurrent((current - 1 + images.length) % images.length)} className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 flex h-9 w-9 md:h-12 md:w-12 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-white/20 hover:text-primary shadow-[0_0_15px_rgba(0,0,0,0.5)]" aria-label="الصورة السابقة">
                      <ChevronRight className="size-5 md:size-8" />
                    </button>
                    <button onClick={() => setCurrent((current + 1) % images.length)} className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 flex h-9 w-9 md:h-12 md:w-12 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-white/20 hover:text-primary shadow-[0_0_15px_rgba(0,0,0,0.5)]" aria-label="الصورة التالية">
                      <ChevronLeft className="size-5 md:size-8" />
                    </button>
                    <div className="absolute inset-x-0 bottom-4 md:bottom-6 flex justify-center gap-2 md:gap-3">
                      {images.map((image, index) => (
                        <button key={image.id} onClick={() => setCurrent(index)} aria-label={`عرض الصورة ${index + 1}`} className={`h-1.5 rounded-full transition-all duration-300 ${index === current ? "w-8 md:w-10 bg-primary shadow-[0_0_10px_rgba(212,175,55,0.8)]" : "w-3 md:w-4 bg-white/50 hover:bg-white"}`} />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Text & Details Column (takes ~45% width on desktop) */}
              <div className="relative flex flex-1 w-full flex-col bg-surface/90 p-4 sm:p-6 md:p-10 lg:h-[80vh] lg:w-[45%] overflow-hidden">
                {/* Scrollable Content Area */}
                <div className="flex-1 max-h-[85vh] overflow-y-auto overscroll-contain pb-10 pr-1 pl-1">
                  <p className="text-xs sm:text-sm tracking-widest text-primary font-medium">{space.eyebrow}</p>
                  <Dialog.Title className="mt-2 font-display text-2xl md:text-4xl text-zinc-100">{space.name}</Dialog.Title>
                  
                  <Dialog.Description className="mt-4 text-base md:text-lg leading-relaxed text-zinc-300">
                    {space.description}
                  </Dialog.Description>
                  
                  <div className="my-6 md:my-8 flex justify-between border-y border-white/10 py-4 md:py-6 text-sm md:text-base">
                    <span className="flex items-center gap-2 md:gap-3 text-zinc-400">
                      <Users className="size-4 md:size-5 text-primary" /> السعة القصوى
                    </span>
                    <strong className="text-zinc-100">{space.capacity}</strong>
                  </div>
                  
                  {space.pricing_packages && space.pricing_packages.length > 0 && (
                    <div className="mb-6 flex flex-col gap-3">
                      <h4 className="mb-1 text-xs md:text-sm text-zinc-400">باقات الأسعار</h4>
                      <div className="flex flex-col gap-3 w-full">
                        {space.pricing_packages.map((pkg, i) => (
                          <div 
                            key={i} 
                            className="w-full flex items-center justify-between bg-black/50 border border-white/10 rounded-xl p-3 md:p-4 transition-all duration-300 hover:border-[#D4AF37] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:-translate-y-1 hover:bg-black/80"
                          >
                            <span className="text-base md:text-lg font-medium text-zinc-200">{pkg.packageName}</span>
                            <span className="text-lg md:text-xl font-bold text-[#D4AF37]">{formatPrice(pkg.price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {space.youtubeLink && (
                    <div className="mb-6">
                      <a
                        href={space.youtubeLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-3 w-full py-3.5 px-4 rounded-xl border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all font-medium text-sm shadow-lg shadow-red-500/5 group"
                      >
                        <span className="size-2.5 rounded-full bg-red-500 animate-ping" />
                        مشاهدة جولة الفيديو على يوتيوب
                        <ArrowUpLeft className="size-4 transform group-hover:-translate-x-1 transition-transform" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Fixed CTA at the bottom */}
                <div className="mt-4 md:mt-6 border-t border-white/10 pt-4 md:pt-6">
                  {whatsappNumber ? (
                    <Button asChild size="lg" className="h-12 md:h-14 w-full bg-primary text-base md:text-lg text-black shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:bg-gold-bright">
                      <a href={whatsappLink(whatsappNumber, `مرحباً، أريد الاستفسار عن حجز ${space.name}`)} target="_blank" rel="noreferrer">
                        طلب حجز عبر واتساب <ArrowUpLeft className="mr-2 size-5" />
                      </a>
                    </Button>
                  ) : (
                    <Button disabled size="lg" className="h-12 md:h-14 w-full bg-zinc-800 text-base md:text-lg text-zinc-400">
                      رقم الواتساب غير متاح حالياً
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
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
          className="glass-modal fixed left-1/2 top-1/2 z-50 flex max-h-[95vh] min-h-[75vh] w-[calc(100%-2rem)] max-w-7xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.15)] lg:flex-row"
        >
          {space && (
            <>
              <Dialog.Close asChild>
                <Button variant="icon" className="absolute left-4 top-4 z-50 border-white/20 bg-black/40 text-white hover:bg-destructive hover:border-destructive" aria-label="إغلاق">
                  <X className="size-5" />
                </Button>
              </Dialog.Close>

              {/* Image Gallery Column (takes ~55% width on desktop) */}
              <div className="relative flex min-h-[350px] w-full flex-col bg-black/50 lg:w-[55%]">
                {active && (
                  <img 
                    src={getSpaceImageUrl(active)} 
                    alt={active.alt_text || space.name} 
                    className="h-full w-full object-cover lg:absolute lg:inset-0" 
                  />
                )}
                {images.length > 1 && (
                  <>
                    <button onClick={() => setCurrent((current - 1 + images.length) % images.length)} className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-white/20 hover:text-primary shadow-[0_0_15px_rgba(0,0,0,0.5)]" aria-label="الصورة السابقة">
                      <ChevronRight className="size-8" />
                    </button>
                    <button onClick={() => setCurrent((current + 1) % images.length)} className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-white/20 hover:text-primary shadow-[0_0_15px_rgba(0,0,0,0.5)]" aria-label="الصورة التالية">
                      <ChevronLeft className="size-8" />
                    </button>
                    <div className="absolute inset-x-0 bottom-6 flex justify-center gap-3">
                      {images.map((image, index) => (
                        <button key={image.id} onClick={() => setCurrent(index)} aria-label={`عرض الصورة ${index + 1}`} className={`h-1.5 rounded-full transition-all duration-300 ${index === current ? "w-10 bg-primary shadow-[0_0_10px_rgba(212,175,55,0.8)]" : "w-4 bg-white/50 hover:bg-white"}`} />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Text & Details Column (takes ~45% width on desktop) */}
              <div className="relative flex w-full flex-col bg-surface/80 p-6 md:p-10 lg:h-[80vh] lg:w-[45%]">
                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto pr-2">
                  <p className="text-sm tracking-widest text-primary">{space.eyebrow}</p>
                  <Dialog.Title className="mt-3 font-display text-4xl text-zinc-100 md:text-5xl">{space.name}</Dialog.Title>
                  
                  <Dialog.Description className="mt-6 text-base leading-9 text-zinc-300">
                    {space.description}
                  </Dialog.Description>
                  
                  <div className="my-8 flex justify-between border-y border-white/10 py-6 text-base">
                    <span className="flex items-center gap-3 text-zinc-400">
                      <Users className="size-5 text-primary" /> السعة القصوى
                    </span>
                    <strong className="text-zinc-100">{space.capacity}</strong>
                  </div>
                  
                  {space.pricing_packages && space.pricing_packages.length > 0 && (
                    <div className="mb-6 flex flex-col gap-3">
                      <h4 className="mb-2 text-sm text-zinc-400">باقات الأسعار</h4>
                      <div className="flex flex-wrap gap-3">
                        {space.pricing_packages.map((pkg, i) => (
                          <div key={i} className="flex flex-col rounded-2xl border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-md transition-colors hover:bg-primary/5 hover:border-primary/50">
                            <span className="text-sm text-zinc-400">{pkg.packageName}</span>
                            <span className="mt-1 text-xl font-bold text-primary">{formatPrice(pkg.price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Fixed CTA at the bottom */}
                <div className="mt-6 border-t border-white/10 pt-6">
                  {whatsappNumber ? (
                    <Button asChild size="lg" className="h-14 w-full bg-primary text-lg text-black shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:bg-gold-bright">
                      <a href={whatsappLink(whatsappNumber, `مرحباً، أريد الاستفسار عن حجز ${space.name}`)} target="_blank" rel="noreferrer">
                        طلب حجز عبر واتساب <ArrowUpLeft className="mr-2 size-5" />
                      </a>
                    </Button>
                  ) : (
                    <Button disabled size="lg" className="h-14 w-full bg-zinc-800 text-lg text-zinc-400">
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
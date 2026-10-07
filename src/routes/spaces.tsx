import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { SiteHeader, Brand } from "@/components/site-header";
import { SpaceGalleryModal } from "@/components/space-gallery-modal";
import { fetchSpaces, getSpaceImageUrl, formatPrice, type Space } from "@/lib/spaces";
import { siteSettingsQuery, defaultContent } from "@/lib/site-settings";
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

export const Route = createFileRoute("/spaces")({
  head: () => ({
    meta: [
      { title: "المساحات | الكيان" },
      { name: "description", content: "استكشف المكاتب وقاعات الاجتماعات ومساحات العمل المشتركة في الكيان." },
      { property: "og:title", content: "مساحات الكيان" },
      { property: "og:description", content: "خيارات عمل مرنة وفاخرة تناسب طموحك." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SpacesPage,
});

function SpacesPage() {
  const [active, setActive] = useState<Space | null>(null);
  
      
  // Spaces data
  const { data = [], isLoading, refetch } = useQuery({
    queryKey: ["spaces"],
    queryFn: () => fetchSpaces(),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  // Site settings for dynamic headings
  const { data: settings } = useQuery(siteSettingsQuery);
  const content = settings ?? defaultContent;

  // Real-time updates
  useEffect(() => {
    const channel = supabase
      .channel("public-spaces")
      .on("postgres_changes", { event: "*", schema: "public", table: "spaces" }, () => refetch())
      .on("postgres_changes", { event: "*", schema: "public", table: "space_images" }, () => refetch())
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [refetch]);

  if (isLoading) {
    return <div className="min-h-screen grid place-items-center bg-background"><p className="text-primary animate-pulse text-xl font-display">جاري التحميل...</p></div>;
  }

  return (
    <main dir="rtl" className="relative w-full min-h-screen overflow-hidden text-foreground">

      <SiteHeader solid />

      <section className="relative z-10 overflow-hidden bg-transparent min-h-screen">

        <div className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-20 md:px-10 md:pt-28">
          {/* Dynamic heading from CMS */}
          <p className="text-xl tracking-widest text-primary">{content.spacesPage.label}</p>
          <h1 className="mt-4 font-display text-5xl text-zinc-100 md:text-7xl">
            {content.spacesPage.title}{" "}
            <span className="gold-text">{content.spacesPage.titleHighlight}</span>
          </h1>
          <p className="mt-6 max-w-2xl leading-8 text-gray-300 text-lg">{content.spacesPage.text}</p>

        {/* Spaces grid */}
        {isLoading ? (
          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="space-card group text-right w-full block animate-pulse border border-primary/20 bg-[#170c06]/80">
                <div className="aspect-[4/3] overflow-hidden bg-[#1f1008]/60" />
                <div className="p-6">
                  <div className="h-3 w-16 bg-primary/30 rounded mb-3" />
                  <div className="h-6 w-3/4 bg-white/10 rounded mb-5" />
                  <div className="mt-5 flex flex-col gap-4 border-t border-border pt-4 text-right">
                    <div className="h-4 w-12 bg-white/10 rounded" />
                    <div className="flex flex-wrap gap-2">
                       <div className="h-10 w-20 bg-white/5 border border-white/5 rounded-lg" />
                       <div className="h-10 w-20 bg-white/5 border border-white/5 rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-14 w-full max-w-7xl mx-auto px-4 py-12 justify-items-center">
              {data.map((space) => {
                const image = space.space_images[0];
                return (
                  <button
                    key={space.id}
                    type="button"
                    onClick={() => setActive(space)}
                    className="w-full max-w-[350px] sm:max-w-[400px] bg-gradient-to-b from-black/90 to-[#1a1a1a] border border-[#D4AF37]/30 transition-all duration-500 hover:-translate-y-2 hover:border-[#D4AF37] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] rounded-2xl overflow-hidden cursor-pointer group text-right block"
                  >
                  {space.space_images && space.space_images.length > 0 && (
                    <div 
                      className="aspect-[4/3] overflow-hidden bg-[#1f1008]/40 grid gap-1 p-1"
                      style={{
                        gridTemplateColumns: space.space_images.length >= 3 ? "2fr 1fr" : space.space_images.length === 2 ? "1fr 1fr" : "1fr",
                        gridTemplateRows: space.space_images.length >= 3 ? "1fr 1fr" : "1fr"
                      }}
                    >
                      {space.space_images.slice(0, 3).map((img, idx) => (
                        <img
                          key={img.id}
                          src={getSpaceImageUrl(img)}
                          alt={img.alt_text || space.name}
                          loading={idx === 0 ? "eager" : "lazy"}
                          fetchPriority={idx === 0 ? "high" : "auto"}
                          className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
                            space.space_images.length >= 3 && idx === 0 ? "row-span-2" : ""
                          }`}
                        />
                      ))}
                    </div>
                  )}
                  <div className="p-6">
                    <p className="text-xs text-primary">{space.eyebrow}</p>
                    <h2 className="mt-2 font-display text-2xl font-bold text-[#D4AF37]">{space.name}</h2>
                    <p className="mt-3 text-sm text-zinc-400 line-clamp-2">{space.description}</p>
                    <div className="mt-5 flex flex-col gap-4 border-t border-border pt-4 text-right">
                      <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="size-5 text-primary" />
                        {space.capacity}
                      </span>
                      {space.pricing_packages && space.pricing_packages.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {space.pricing_packages.map((pkg, i) => (
                            <div key={i} className="flex flex-col rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 backdrop-blur-sm transition-colors hover:border-primary/30">
                              <span className="text-xs text-muted-foreground">{pkg.packageName}</span>
                              <span className="text-base font-semibold text-primary">{formatPrice(pkg.price)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
            </div>
          </div>
        )}
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto flex max-w-7xl items-center justify-between border-t border-border px-6 py-9 md:px-10">
        <Brand />
        <p className="text-xs text-muted-foreground">{content.footer.text}</p>
      </footer>

      <SpaceGalleryModal space={active} onClose={() => setActive(null)} />
    </main>
  );
}
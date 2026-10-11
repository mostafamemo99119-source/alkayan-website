import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useSearch, Link } from "@tanstack/react-router";
import { Users, ArrowRight, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { SiteHeader, Brand } from "@/components/site-header";
import { SpaceGalleryModal } from "@/components/space-gallery-modal";
import { fetchSpaces, getSpaceImageUrl, formatPrice, type Space } from "@/lib/spaces";
import { siteSettingsQuery, defaultContent } from "@/lib/site-settings";
import { supabase } from "@/integrations/supabase/client";

type SpacesSearch = {
  category?: string;
};

export const Route = createFileRoute("/spaces")({
  validateSearch: (search: Record<string, unknown>): SpacesSearch => ({
    category: typeof search.category === "string" ? search.category : undefined,
  }),
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

const INITIAL_VISIBLE_COUNT = 4;
const LOAD_MORE_INCREMENT = 4;

function SpacesPage() {
  const [active, setActive] = useState<Space | null>(null);
  const search = useSearch({ from: "/spaces" });
  const [selectedCategory, setSelectedCategory] = useState<string>(search.category || "All");
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_VISIBLE_COUNT);

  useEffect(() => {
    if (search.category) {
      setSelectedCategory(search.category);
    }
  }, [search.category]);

  // Reset pagination when category changes
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  };
      
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

  const filteredSpaces = data.filter((space) => {
    if (selectedCategory === "All") return true;
    return space.category === selectedCategory;
  });

  const visibleSpaces = filteredSpaces.slice(0, visibleCount);
  const hasMore = visibleCount < filteredSpaces.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + LOAD_MORE_INCREMENT);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <p className="text-primary animate-pulse text-xl font-display">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <main dir="rtl" className="relative w-full max-w-full min-h-screen overflow-x-hidden text-foreground">

      <SiteHeader solid />

      <section className="relative z-10 overflow-hidden bg-transparent min-h-screen">

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 pb-24 pt-24 md:px-10 md:pt-32">
          {/* Back link to Categories */}
          <div className="mb-6">
            <Link
              to="/rooms"
              className="inline-flex items-center gap-2 text-sm text-[#D4AF37] hover:underline"
            >
              <ArrowRight className="size-4" />
              العودة لتصنيفات الغرف
            </Link>
          </div>

          {/* Dynamic heading from CMS */}
          <p className="text-xl tracking-widest text-primary">{content.spacesPage.label}</p>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl text-zinc-100 md:text-7xl">
            {content.spacesPage.title}{" "}
            <span className="gold-text">{content.spacesPage.titleHighlight}</span>
          </h1>
          <p className="mt-6 max-w-2xl leading-8 text-gray-300 text-base md:text-lg">{content.spacesPage.text}</p>

          {/* Sticky and Scrollable Category Filter Bar */}
          <div className="sticky top-20 z-40 bg-black/80 backdrop-blur-md pt-4 pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 border-b border-white/10 mt-6 transition-all">
            <div className="flex gap-3 overflow-x-auto whitespace-nowrap no-scrollbar hide-scrollbar py-1">
              <button
                type="button"
                onClick={() => handleCategorySelect("All")}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === "All"
                    ? "bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20"
                    : "bg-black/60 text-zinc-300 border border-white/10 hover:border-[#D4AF37]/50"
                }`}
              >
                جميع الغرف ({data.length})
              </button>
              <button
                type="button"
                onClick={() => handleCategorySelect("Full Time")}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === "Full Time"
                    ? "bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20"
                    : "bg-black/60 text-zinc-300 border border-white/10 hover:border-[#D4AF37]/50"
                }`}
              >
                Full Time (دوام كامل) ({data.filter((s) => s.category === "Full Time" || !s.category).length})
              </button>
              <button
                type="button"
                onClick={() => handleCategorySelect("Share Time")}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === "Share Time"
                    ? "bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20"
                    : "bg-black/60 text-zinc-300 border border-white/10 hover:border-[#D4AF37]/50"
                }`}
              >
                Share Time (مشاركة / ساعات) ({data.filter((s) => s.category === "Share Time").length})
              </button>
            </div>
          </div>

          {/* Spaces Grid */}
          {filteredSpaces.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-zinc-400 text-lg">لا توجد غرف متاحة في هذا التصنيف حالياً.</p>
              <button
                type="button"
                onClick={() => handleCategorySelect("All")}
                className="mt-4 text-[#D4AF37] underline text-sm cursor-pointer"
              >
                عرض جميع الغرف
              </button>
            </div>
          ) : (
            <div className="w-full mt-10">
              {/* Responsive 1-col on mobile, 2-col on tablet, 3-col on desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
                {visibleSpaces.map((space) => {
                  return (
                    <button
                      key={space.id}
                      type="button"
                      onClick={() => setActive(space)}
                      className="w-full max-w-full bg-gradient-to-b from-black/90 to-[#16120b] border border-[#D4AF37]/30 transition-all duration-500 hover:-translate-y-1.5 hover:border-[#D4AF37] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] rounded-2xl overflow-hidden cursor-pointer group text-right block"
                    >
                      {space.space_images && space.space_images.length > 0 && (
                        <div 
                          className="aspect-[16/9] md:aspect-[4/3] w-full overflow-hidden bg-[#1f1008]/40 grid gap-1 p-1"
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
                      <div className="p-5 md:p-6">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-primary font-medium">{space.eyebrow}</p>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            space.category === "Share Time" 
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" 
                              : "bg-primary/20 text-primary border border-primary/30"
                          }`}>
                            {space.category || "Full Time"}
                          </span>
                        </div>
                        <h2 className="mt-2 font-display text-xl md:text-2xl font-bold text-[#D4AF37] group-hover:text-white transition-colors">
                          {space.name}
                        </h2>
                        <p className="mt-2 text-sm text-zinc-400 line-clamp-2 leading-relaxed">
                          {space.description}
                        </p>
                        <div className="mt-5 flex flex-col gap-4 border-t border-white/10 pt-4 text-right">
                          <span className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="size-4.5 text-primary" />
                            {space.capacity}
                          </span>
                          {space.pricing_packages && space.pricing_packages.length > 0 && (
                            <div className="flex flex-col gap-3 w-full">
                              {space.pricing_packages.map((pkg, i) => (
                                <div 
                                  key={i} 
                                  className="w-full flex items-center justify-between bg-black/50 border border-white/10 rounded-xl p-4 transition-all duration-300 hover:border-[#D4AF37] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:-translate-y-1 hover:bg-black/80"
                                >
                                  <span className="text-lg font-medium text-zinc-200">{pkg.packageName}</span>
                                  <span className="text-xl font-bold text-[#D4AF37]">{formatPrice(pkg.price)}</span>
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

              {/* Load More Button */}
              {hasMore && (
                <div className="mt-14 flex flex-col items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    className="inline-flex items-center gap-2 border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-[#D4AF37]/10 transition-all duration-300 cursor-pointer text-base hover:-translate-y-0.5"
                  >
                    عرض المزيد من الغرف
                    <ChevronDown className="size-5" />
                  </button>
                  <p className="text-xs text-zinc-500 mt-2">
                    تم عرض {visibleSpaces.length} من أصل {filteredSpaces.length} غرفة
                  </p>
                </div>
              )}
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
import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Users, Sparkles, ArrowLeft } from "lucide-react";
import { SiteHeader, Brand } from "@/components/site-header";
import { useQuery } from "@tanstack/react-query";
import { siteSettingsQuery, defaultContent } from "@/lib/site-settings";
import { fetchRoomsContent, defaultRoomsContent } from "@/lib/rooms-content";

export const Route = createFileRoute("/rooms/")({
  head: () => ({
    meta: [
      { title: "تصنيفات الغرف والمساحات | الكيان" },
      { name: "description", content: "اختر نظام العمل المناسب لك: دوام كامل (Full Time) أو مساحات مشتركة بالساعات (Share Time)." },
      { property: "og:title", content: "تصنيفات الغرف | الكيان" },
      { property: "og:description", content: "خيارات عمل مرنة وفاخرة في بغداد." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: RoomsCategoryPage,
});

function RoomsCategoryPage() {
  const { data: settings } = useQuery(siteSettingsQuery);
  const content = settings ?? defaultContent;

  // Dynamic Rooms Page Content Query
  const { data: roomsContent = defaultRoomsContent, isLoading: isContentLoading } = useQuery({
    queryKey: ["rooms-content"],
    queryFn: fetchRoomsContent,
    staleTime: 5 * 60 * 1000,
  });

  const bgImage = content?.story?.statsBgImage || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1920";

  return (
    <main
      dir="rtl"
      className="relative w-full max-w-full min-h-screen overflow-x-hidden text-foreground bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Dark luxury backdrop blur overlay matching home page */}
      <div className="absolute inset-0 bg-[#0a0602]/90 backdrop-blur-[2px]" />

      <SiteHeader solid />

      <section className="relative z-10 pt-32 pb-24 px-6 md:px-10 max-w-7xl mx-auto min-h-screen flex flex-col justify-center items-center">
        {/* Brand Logo & Header */}
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="mb-6 transform hover:scale-105 transition-transform duration-500">
            <Brand favicon={content.seo?.favicon} />
          </div>

          {isContentLoading ? (
            <div className="flex flex-col items-center gap-3 animate-pulse">
              <div className="h-6 w-36 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30" />
              <div className="h-10 w-72 md:w-96 rounded-xl bg-white/10" />
              <div className="h-4 w-60 md:w-80 rounded bg-white/5" />
            </div>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-semibold tracking-wider mb-4">
                <Sparkles className="size-3.5" />
                {roomsContent.badgeText || defaultRoomsContent.badgeText}
              </div>
              <h1 className="font-display text-4xl md:text-6xl text-white mb-4">
                {roomsContent.mainTitle || defaultRoomsContent.mainTitle}{" "}
                <span className="gold-text">
                  {roomsContent.mainTitleHighlight || defaultRoomsContent.mainTitleHighlight}
                </span>
              </h1>
              <p className="text-zinc-400 text-base md:text-lg max-w-xl mx-auto">
                {roomsContent.mainSubtitle || defaultRoomsContent.mainSubtitle}
              </p>
            </>
          )}
        </div>

        {/* Important Notice */}
        <div className="mx-auto mt-8 mb-10 max-w-2xl px-6 py-4 rounded-xl border border-red-500/20 bg-black/40 backdrop-blur-md shadow-[0_8px_30px_rgba(220,38,38,0.15)] flex items-center justify-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-500">
            ⚠️
          </span>
          <p className="text-sm md:text-base text-gray-200 font-medium">
            <span className="text-red-400 font-bold ml-1">تنويه هام:</span>
            حجز جميع مساحات العمل المستقلة يتطلب إيداع شهر تأمين مقدماً.
          </p>
        </div>

        {/* The Two Grand Luxury Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 w-full max-w-5xl">
          {/* Card 1: Full Time */}
          <Link
            to="/spaces"
            search={{ category: "Full Time" }}
            className="group relative flex flex-col justify-between p-8 md:p-12 rounded-3xl bg-gradient-to-b from-[#16120b]/90 to-[#0a0805]/95 border-2 border-[#D4AF37]/40 hover:border-[#D4AF37] shadow-2xl shadow-black/80 hover:shadow-[0_0_50px_rgba(212,175,55,0.3)] backdrop-blur-md transition-all duration-500 hover:-translate-y-2 cursor-pointer overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none group-hover:bg-[#D4AF37]/15 transition-all duration-500" />
            
            <div className="relative z-10">
              <div className="size-16 rounded-2xl border border-[#D4AF37]/50 bg-black/60 flex items-center justify-center text-[#D4AF37] mb-8 shadow-inner group-hover:scale-110 group-hover:border-[#D4AF37] transition-all duration-500">
                <Clock className="size-8" />
              </div>

              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                  {roomsContent.fullTimeBadge || defaultRoomsContent.fullTimeBadge}
                </span>
                <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#D4AF37]/30" />
              </div>

              <div className="flex items-baseline gap-3 mb-4">
                <h2 className="font-display text-3xl md:text-4xl font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                  {roomsContent.fullTimeTitle || defaultRoomsContent.fullTimeTitle}
                </h2>
                {roomsContent.fullTimeSubtitle && (
                  <span className="text-sm font-medium text-zinc-400">
                    ({roomsContent.fullTimeSubtitle})
                  </span>
                )}
              </div>

              <p className="text-zinc-400 text-sm md:text-base leading-relaxed mb-8">
                {roomsContent.fullTimeDesc || defaultRoomsContent.fullTimeDesc}
              </p>
            </div>

            <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-6">
              <span className="text-sm font-semibold text-zinc-300 group-hover:text-white">
                استكشف غرف {roomsContent.fullTimeTitle || "Full Time"}
              </span>
              <div className="size-10 rounded-full border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                <ArrowLeft className="size-5 transform group-hover:-translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Card 2: Share Time */}
          <Link
            to="/spaces"
            search={{ category: "Share Time" }}
            className="group relative flex flex-col justify-between p-8 md:p-12 rounded-3xl bg-gradient-to-b from-[#16120b]/90 to-[#0a0805]/95 border-2 border-[#D4AF37]/40 hover:border-[#D4AF37] shadow-2xl shadow-black/80 hover:shadow-[0_0_50px_rgba(212,175,55,0.3)] backdrop-blur-md transition-all duration-500 hover:-translate-y-2 cursor-pointer overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none group-hover:bg-[#D4AF37]/15 transition-all duration-500" />
            
            <div className="relative z-10">
              <div className="size-16 rounded-2xl border border-[#D4AF37]/50 bg-black/60 flex items-center justify-center text-[#D4AF37] mb-8 shadow-inner group-hover:scale-110 group-hover:border-[#D4AF37] transition-all duration-500">
                <Users className="size-8" />
              </div>

              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                  {roomsContent.shareTimeBadge || defaultRoomsContent.shareTimeBadge}
                </span>
                <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#D4AF37]/30" />
              </div>

              <div className="flex items-baseline gap-3 mb-4">
                <h2 className="font-display text-3xl md:text-4xl font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                  {roomsContent.shareTimeTitle || defaultRoomsContent.shareTimeTitle}
                </h2>
                {roomsContent.shareTimeSubtitle && (
                  <span className="text-sm font-medium text-zinc-400">
                    ({roomsContent.shareTimeSubtitle})
                  </span>
                )}
              </div>

              <p className="text-zinc-400 text-sm md:text-base leading-relaxed mb-8">
                {roomsContent.shareTimeDesc || defaultRoomsContent.shareTimeDesc}
              </p>
            </div>

            <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-6">
              <span className="text-sm font-semibold text-zinc-300 group-hover:text-white">
                استكشف غرف {roomsContent.shareTimeTitle || "Share Time"}
              </span>
              <div className="size-10 rounded-full border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                <ArrowLeft className="size-5 transform group-hover:-translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 mx-auto flex max-w-7xl items-center justify-between border-t border-border px-6 py-9 md:px-10">
        <Brand />
        <p className="text-xs text-muted-foreground">{content.footer.text}</p>
      </footer>
    </main>
  );
}

export default RoomsCategoryPage;

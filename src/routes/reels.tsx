import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reels")({
  component: ReelsPage,
});

function getEmbedUrl(url: string) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com") || parsed.hostname.includes("youtu.be")) {
      let videoId = "";
      if (parsed.pathname.includes("/shorts/")) {
        videoId = parsed.pathname.split("/shorts/")[1];
      } else if (parsed.searchParams.has("v")) {
        videoId = parsed.searchParams.get("v") || "";
      } else if (parsed.hostname.includes("youtu.be")) {
        videoId = parsed.pathname.slice(1);
      }
      if (videoId) return `https://www.youtube.com/embed/${videoId}?rel=0`;
    }
  } catch (e) {
    console.error("Invalid URL:", url);
  }
  return url;
}

export function ReelsPage() {
  const { data: reels = [], isLoading } = useQuery({
    queryKey: ["reels"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reels").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <main id="top" dir="rtl" className="relative w-full min-h-screen overflow-hidden text-foreground">
      <SiteHeader solid={true} />
      
      <section className="relative z-10 pt-36 pb-24 px-6 md:px-10 max-w-7xl mx-auto min-h-screen">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-6xl text-white mb-4">
            جولة في <span className="gold-text">الكيان</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            شاهد مقتطفات وجولات سريعة داخل مساحاتنا الفاخرة
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="size-12 animate-pulse rounded-full bg-primary/20 border border-primary"></div>
          </div>
        ) : reels.length === 0 ? (
          <div className="text-center text-zinc-500 py-20">
            لا توجد مقاطع فيديو حالياً
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full">
            <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-14 w-full max-w-7xl mx-auto py-10 pb-16 px-4 md:justify-items-center">
              {reels.map((reel) => (
                <div 
                  key={reel.id}
                  className="w-[70vw] sm:w-[50vw] max-h-[400px] md:max-h-none shrink-0 snap-center md:w-full max-w-[280px] md:max-w-[400px] aspect-[9/16] h-auto relative rounded-3xl overflow-hidden border border-[#D4AF37]/40 shadow-2xl shadow-[#D4AF37]/10 bg-black/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[#D4AF37]/30 hover:border-[#D4AF37]/80 cursor-pointer"
                >
                  <iframe
                    src={getEmbedUrl(reel.youtube_url)}
                    title={reel.title}
                    className="w-full h-full absolute top-0 left-0 object-cover"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Video } from "lucide-react";
import { toast } from "sonner";

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

export function ReelsManager() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: reels = [], isLoading } = useQuery({
    queryKey: ["reels"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reels").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const handleAddReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;
    
    setIsAdding(true);
    try {
      const { error } = await supabase.from("reels").insert({
        title,
        youtube_url: url
      });
      if (error) throw error;
      
      setTitle("");
      setUrl("");
      await queryClient.invalidateQueries({ queryKey: ["reels"] });
    } catch (err: any) {
      console.error("Error adding reel:", err);
      toast.error(err.message || "حدث خطأ غير معروف");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteReel = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المقطع؟")) return;
    
    setDeletingId(id);
    try {
      const { error } = await supabase.from("reels").delete().eq("id", id);
      if (error) throw error;
      
      await queryClient.invalidateQueries({ queryKey: ["reels"] });
    } catch (err: any) {
      console.error("Error deleting reel:", err);
      toast.error(err.message || "حدث خطأ غير معروف");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleAddReel} className="admin-panel p-6">
        <h3 className="text-xl font-display text-primary mb-6 flex items-center gap-2">
          <Video className="size-5" />
          إضافة مقطع جديد
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">عنوان المقطع</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="مثال: جولة في قاعة الاجتماعات"
              className="bg-white/5 border-white/10 text-white"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url" className="text-white">رابط يوتيوب (Shorts أو عادي)</Label>
            <Input 
              id="url" 
              value={url} 
              onChange={(e) => setUrl(e.target.value)} 
              placeholder="https://youtube.com/shorts/..."
              className="bg-white/5 border-white/10 text-white"
              dir="ltr"
              required
            />
          </div>
        </div>
        <Button 
          type="submit" 
          disabled={isAdding}
          className="mt-6 w-full md:w-auto bg-primary text-black hover:bg-primary/90"
        >
          {isAdding ? "جاري الإضافة..." : "إضافة فيديو"}
        </Button>
      </form>

      <div className="admin-panel p-6">
        <h3 className="text-xl font-display text-primary mb-6">المقاطع الحالية ({reels.length})</h3>
        
        {isLoading ? (
          <div className="text-center text-zinc-400 py-10">جاري التحميل...</div>
        ) : reels.length === 0 ? (
          <div className="text-center text-zinc-500 py-10">لم يتم إضافة مقاطع بعد</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {reels.map((reel) => (
              <div key={reel.id} className="relative rounded-xl overflow-hidden border border-white/10 bg-black/50 group">
                <div className="aspect-[9/16] w-full">
                  <iframe
                    src={getEmbedUrl(reel.youtube_url)}
                    title={reel.title}
                    className="w-full h-full border-0 pointer-events-none"
                  ></iframe>
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center">
                  <p className="text-white font-medium mb-4">{reel.title}</p>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteReel(reel.id)}
                    disabled={deletingId === reel.id}
                    className="gap-2 pointer-events-auto"
                  >
                    <Trash2 className="size-4" />
                    {deletingId === reel.id ? "جاري الحذف..." : "حذف"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { supabase } from "@/integrations/supabase/client";
import { signPaths } from "@/lib/site-settings";

export type SpaceImage = { id: string; image_url: string; storage_path: string | null; alt_text: string; display_order: number; url?: string };
export type PricingPackage = { packageName: string; price: number };
export type SpaceCategory = "Full Time" | "Share Time";

export type Space = {
  id: string;
  name: string;
  eyebrow: string;
  description: string;
  capacity: string;
  category?: SpaceCategory;
  pricing_packages: PricingPackage[];
  is_active: boolean;
  display_order: number;
  space_images: SpaceImage[];
};

export function getSpaceImageUrl(image: SpaceImage) {
  const url = image.url ?? image.image_url;
  // If it's a relative path (old format) from storage, get public url on the fly
  if (url && !url.startsWith("http")) {
    const { data } = supabase.storage.from("space-images").getPublicUrl(url);
    return data.publicUrl;
  }
  return url;
}

export function formatPrice(price: number): string {
  return `${new Intl.NumberFormat('en-US').format(price)} ج.م`;
}

export async function fetchSpaces(includeInactive = false) {
  let query = supabase.from("spaces").select("*").order("display_order").order("created_at");
  if (!includeInactive) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error) throw error;
  
  // Also fetch space_images
  const spaceIds = (data ?? []).map((s) => s.id);
  let imagesBySpace: Record<string, SpaceImage[]> = {};
  if (spaceIds.length > 0) {
    const { data: imagesData } = await supabase
      .from("space_images")
      .select("id, space_id, image_url, storage_path, alt_text, display_order")
      .in("space_id", spaceIds)
      .order("display_order");
    
    (imagesData ?? []).forEach((img) => {
      if (!imagesBySpace[img.space_id]) imagesBySpace[img.space_id] = [];
      imagesBySpace[img.space_id].push({ ...img, url: img.image_url });
    });
  }

  return (data ?? []).map((space: any) => ({
    ...space,
    category: (space.category as SpaceCategory) || (space.pricing_packages?.[0]?.category as SpaceCategory) || "Full Time",
    pricing_packages: (space.pricing_packages as PricingPackage[]) || [],
    space_images: imagesBySpace[space.id] || [],
  })) as Space[];
}

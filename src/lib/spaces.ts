import { supabase } from "@/integrations/supabase/client";
import { signPaths } from "@/lib/site-settings";

export type SpaceImage = { id: string; image_url: string; storage_path: string | null; alt_text: string; display_order: number; url?: string };
export type PricingPackage = { packageName: string; price: number };
export type Space = { id: string; name: string; eyebrow: string; description: string; capacity: string; pricing_packages: PricingPackage[]; is_active: boolean; display_order: number; space_images: SpaceImage[] };

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
  let query = supabase.from("spaces").select("id, name, eyebrow, description, capacity, pricing_packages, is_active, display_order, space_images(id, image_url, storage_path, alt_text, display_order)").order("display_order").order("created_at");
  if (!includeInactive) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error) throw error;
  
  return (data ?? []).map((space) => ({
    ...space,
    pricing_packages: (space.pricing_packages as PricingPackage[]) || [],
    space_images: [...(space.space_images || [])].sort((a, b) => a.display_order - b.display_order).map((image) => ({ ...image, url: image.image_url })),
  })) as Space[];
}

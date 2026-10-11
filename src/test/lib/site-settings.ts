import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export const BUCKET = "space-images";

export type SiteContent = {
  hero: { eyebrow: string; title: string; titleHighlight: string; text: string; primaryCta: string; secondaryCta: string };
  heroSlides: string[];
  story: { label: string; title: string; titleHighlight: string; text: string; image: string; videoUrl: string; videoCaption: string; statsBgImage?: string; stats: { value: string; label: string }[] };
  features: { label: string; title: string; text: string; items: { title: string; text: string; icon: string }[] };
  spacesPage: { label: string; title: string; titleHighlight: string; text: string };
  contact: { label: string; title: string; text: string; cta: string; address: string; googleMapUrl: string; contactBgImage?: string; };
  footer: { text: string };
  whatsapp: string;
  phoneNumber: string;
  socials: { instagram: string; facebook: string; x: string; tiktok: string; youtube: string; email: string };
  seo: { siteName: string; description: string; favicon: string };
  workHours: string;
  holidayMessage?: string;
  testimonials: { 
    name: string; 
    username: string;
    platform: "twitter" | "linkedin" | "facebook" | "google";
    avatar: string;
    date: string;
    text: string;
  }[];
  navbar: { link1: string; link2: string; link3: string; link4: string; cta: string };
};

export const defaultContent: SiteContent = {
  hero: { eyebrow: "مساحات صُممت لأصحاب الرؤية", title: "مساحتك لصناعة", titleHighlight: "شيءٍ استثنائي", text: "في الكيان، نوفر لك أكثر من مكان للعمل. بيئة راقية تجمع الهدوء والإلهام والخدمة المتكاملة، لتمنح أفكارك المساحة التي تستحقها.", primaryCta: "استكشف المساحات", secondaryCta: "اكتشف الكيان" },
  heroSlides: [],
  story: { label: "تجربة الكيان", title: "كل تفصيل صُمم", titleHighlight: "ليدفعك إلى الأمام", text: "من لحظة دخولك وحتى نهاية يومك، تجد بيئة متكاملة تهتم بأدق التفاصيل. هدوء يساعدك على التركيز، ضيافة تشعرك بالترحاب، وتقنيات تجعل العمل أكثر سلاسة.", image: "", videoUrl: "", videoCaption: "جولة داخل الكيان", statsBgImage: "", stats: [{ value: "24/7", label: "دخول مرن" }, { value: "+12", label: "مساحة متنوعة" }, { value: "100%", label: "جاهزية للعمل" }] },
  features: { 
    label: "ما نقدمه لك", 
    title: "كل ما تحتاجه. وأكثر.", 
    text: "خدمات مدروسة بعناية تمنحك يوماً أكثر تركيزاً وإنتاجية وراحة.", 
    items: [
      { title: "مكتب خاص يوفر الخصوصية الكاملة", text: "مساحتك الخاصة والمغلقة للعمل بتركيز وهدوء تام بعيداً عن المشتتات.", icon: "Briefcase" },
      { title: "استقبال وسكرتارية احترافية", text: "فريق واجهة محترف لاستقبال ضيوفك وعملائك وإدارة المراسلات.", icon: "Users" },
      { title: "إنترنت فائق السرعة", text: "اتصال قوي ومستمر بشبكة الألياف الضوئية لضمان سير أعمالك بدون انقطاع.", icon: "Wifi" },
      { title: "غرفة اجتماعات مجهزة", text: "قاعات فخمة مزودة بأحدث التقنيات لعقد صفقاتك واجتماعاتك الهامة.", icon: "Monitor" },
      { title: "تطبيق ذكي للحجز التلقائي", text: "تحكم كامل وإدارة لحجوزاتك بضغطة زر عبر تطبيقنا المخصص لعملائنا.", icon: "Smartphone" },
      { title: "خدمة الطباعة وكوفي بريك", text: "خدمات مكتبية متكاملة ومشروبات متنوعة لضيافتك وضيافة عملائك.", icon: "Coffee" },
      { title: "نظافة دورية وأمن 24 ساعة", text: "بيئة عمل آمنة ومراقبة بالكاميرات مع عناية فائقة بالنظافة على مدار الساعة.", icon: "Shield" },
    ] 
  },
  spacesPage: { label: "مساحات الكيان", title: "اختر المساحة التي", titleHighlight: "تشبه طموحك", text: "مكاتب وقاعات ومساحات مرنة، جاهزة لتمنح يومك خصوصية وتركيزاً وتجربة ضيافة متكاملة." },
  contact: { label: "خطوتك التالية", title: "مكانك الجديد بانتظارك", text: "اختر مساحتك ودعنا نهتم بالباقي. تواصل معنا لترتيب زيارة أو حجز مباشر.", cta: "استعرض المساحات", address: "بغداد، الكرادة", contactBgImage: "", googleMapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d106653.07255979201!2d44.351659936830744!3d33.31174984186591!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15577f67a0a74193%3A0x9deda9d2a3b16f2c!2sBaghdad%2C%20Iraq!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s" },
  footer: { text: "© 2026 الكيان لمساحات العمل. جميع الحقوق محفوظة." },
  whatsapp: "",
  phoneNumber: "",
  socials: { instagram: "", facebook: "", x: "", tiktok: "", youtube: "", email: "" },
  seo: { siteName: "الكيان لمساحات العمل", description: "مساحات عمل مشتركة ومكاتب وقاعات اجتماعات فاخرة صُممت لأصحاب الرؤية في بغداد.", favicon: "" },
  workHours: "يومياً من 9 صباحاً حتى 11 مساءً",
  holidayMessage: "",
  testimonials: [
    { name: "أحمد العلي", username: "@ahmed_ali", platform: "twitter", avatar: "", date: "12 Oct 2026", text: "أفضل بيئة عمل وجدتها في بغداد، الهدوء والخدمات المتكاملة ساعدتني على إنجاز الكثير." },
    { name: "سارة محمد", username: "@sara_m_design", platform: "linkedin", avatar: "", date: "09 Oct 2026", text: "تصميم المكان رائع وملهم جداً، كل زاوية فيه مصممة بعناية لتعطيك طاقة إيجابية." },
  ],
  navbar: { link1: "الرئيسية", link2: "المساحات", link3: "المزايا", link4: "تواصل معنا", cta: "احجز مساحتك" },
};

function merge<T>(base: T, value: unknown): T {
  if (Array.isArray(base)) {
    if (!Array.isArray(value)) return base;
    if (base.length > 0 && typeof base[0] === "object") {
      const template = base[0];
      const maxLen = Math.max(base.length, value.length);
      const result = [];
      for (let i = 0; i < maxLen; i++) {
        const baseItem = i < base.length ? base[i] : template;
        const valItem = i < value.length ? value[i] : undefined;
        result.push(valItem === undefined ? baseItem : merge(baseItem, valItem));
      }
      return result as unknown as T;
    }
    return value.filter((v) => typeof v === "string") as T;
  }
  if (base && typeof base === "object") {
    const src = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
    return Object.fromEntries(Object.entries(base).map(([k, v]) => [k, merge(v, src[k])])) as T;
  }
  return (typeof value === typeof base ? value : base) as T;
}

export type SiteSettings = SiteContent & { imageUrls: Record<string, string> };

export async function signPaths(paths: string[]) {
  const unique = [...new Set(paths.filter(Boolean))];
  if (!unique.length) return {} as Record<string, string>;
  const { data } = await supabase.storage.from(BUCKET).createSignedUrls(unique, 60 * 60 * 6);
  return Object.fromEntries((data ?? []).flatMap((item) => (item.signedUrl && item.path ? [[item.path, item.signedUrl]] : [])));
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase.from("site_settings").select("content").eq("id", 1).maybeSingle();
  if (error) throw error;
  const content = merge(defaultContent, data?.content);
  
  // Force update logo from user's manual upload if empty
  if (!content.seo.favicon || content.seo.favicon === "") {
    content.seo.favicon = "https://skvdiqbhydwiwyxsjgzq.supabase.co/storage/v1/object/public/space-images/downlo1111ad.png";
    await saveSiteSettings(content).catch(console.error);
  }
  
  // Collect paths that need signing
  const pathsToSign = [...content.heroSlides, content.story.image];
  
  const imageUrls = await signPaths(pathsToSign);
  return { ...content, imageUrls };
}

export const siteSettingsQuery = queryOptions({ queryKey: ["site-settings"], queryFn: fetchSiteSettings, staleTime: 5 * 60 * 1000 });

export async function saveSiteSettings(content: SiteContent) {
  const { data, error } = await supabase.from("site_settings").upsert({ 
    id: 1, 
    content: content as unknown as Json, 
    updated_at: new Date().toISOString() 
  }).select();
  
  console.log("DB Update Result:", data, error);
  
  if (error) {
    console.error("DB Update Error:", error);
    throw new Error(`فشل حفظ الإعدادات: ${error.message}`);
  }
  
  if (!data || data.length === 0) {
    throw new Error("لم يتم تحديث أي بيانات. يرجى التحقق من صلاحيات UPDATE (RLS Policy) في جدول site_settings.");
  }
}

export function whatsappLink(number: string, text: string) {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function youtubeEmbed(url: string) {
  const match = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

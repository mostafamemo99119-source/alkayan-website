import { supabase } from "@/integrations/supabase/client";

export type RoomsPageContent = {
  badgeText: string;
  mainTitle: string;
  mainTitleHighlight: string;
  mainSubtitle: string;
  fullTimeBadge: string;
  fullTimeTitle: string;
  fullTimeSubtitle: string;
  fullTimeDesc: string;
  shareTimeBadge: string;
  shareTimeTitle: string;
  shareTimeSubtitle: string;
  shareTimeDesc: string;
  isNoticeEnabled?: boolean;
  noticeTitle?: string;
  noticeText?: string;
};

export const defaultRoomsContent: RoomsPageContent = {
  badgeText: "أنظمة ومساحات العمل",
  mainTitle: "اختر نظام عملك",
  mainTitleHighlight: "المناسب",
  mainSubtitle: "نوفر لك بيئة مصممة لراحتك وإنتاجيتك سواءً كنت تبحث عن استقرار دائم أو مرونة في الساعات",
  fullTimeBadge: "باقات شهرية وثابتة",
  fullTimeTitle: "Full Time",
  fullTimeSubtitle: "دوام كامل",
  fullTimeDesc: "مكاتب خاصة وقاعات مخصصة بدوام كامل على مدار الساعة. خصوصية تامة، استقرار مهني، وخدمات VIP متكاملة تلبي طموح فريقك وشركتك.",
  shareTimeBadge: "مرونة بالساعات والأيام",
  shareTimeTitle: "Share Time",
  shareTimeSubtitle: "مشاركة / ساعات",
  shareTimeDesc: "مساحات عمل مشتركة وقاعات اجتماعات بنظام المشاركة والساعات. مرونة غير محدودة، لقاءات مثمرة، وتكاليف مدروسة حسب استخدامك الفعلي.",
  isNoticeEnabled: true,
  noticeTitle: "تنويه هام:",
  noticeText: "حجز جميع مساحات العمل المستقلة يتطلب إيداع شهر تأمين مقدماً.",
};

export async function fetchRoomsContent(): Promise<RoomsPageContent> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("content")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching rooms content:", error);
    return defaultRoomsContent;
  }

  const savedContent = (data?.content as any)?.rooms_page_content;
  if (!savedContent) return defaultRoomsContent;

  return {
    ...defaultRoomsContent,
    ...savedContent,
  };
}

export async function saveRoomsContent(content: RoomsPageContent): Promise<void> {
  // 1. Fetch current site_settings content
  const { data } = await supabase
    .from("site_settings")
    .select("content")
    .eq("id", 1)
    .maybeSingle();

  const currentSettings = (data?.content as Record<string, unknown>) || {};
  const updatedSettings = {
    ...currentSettings,
    rooms_page_content: content,
  };

  // 2. Save back to database
  const { error } = await supabase
    .from("site_settings")
    .upsert({
      id: 1,
      content: updatedSettings as any,
      updated_at: new Date().toISOString(),
    })
    .select();

  if (error) {
    throw new Error(`فشل حفظ إعدادات نصوص الغرف: ${error.message}`);
  }
}

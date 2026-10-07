import { useQuery } from "@tanstack/react-query";
import { siteSettingsQuery, whatsappLink } from "@/lib/site-settings";
import { MessageCircle } from "lucide-react";

export function FloatingWhatsapp() {
  const { data: settings } = useQuery(siteSettingsQuery);
  const whatsappNumber = settings?.whatsapp;

  if (!whatsappNumber) return null;

  return (
    <a
      href={whatsappLink(whatsappNumber, "مرحباً، أود الاستفسار عن المساحات")}
      target="_blank"
      rel="noreferrer"
      aria-label="تواصل معنا عبر واتساب"
      className="fixed bottom-8 left-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#111] border-2 border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-transform hover:scale-110 md:bottom-10 md:left-10"
      dir="ltr"
    >
      <div className="absolute inset-0 animate-ping rounded-full bg-[#D4AF37]/40"></div>
      <MessageCircle className="relative z-10 size-7 text-[#D4AF37]" />
    </a>
  );
}

import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowUpLeft,
  ChevronDown,
  Coffee,
  MonitorPlay,
  Sparkles,
  Wifi,
  Facebook,
  Instagram,
  Twitter,ي
  Youtube,
  Linkedin,
  Mail,
  MessageCircle,
  Repeat,
  Heart,
  Share,
  MapPin,
  Phone,
  Briefcase,
  Users,
  Monitor,
  Smartphone,
  Shield,
  Star,
  CheckCircle,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";

import heroImage from "@/assets/alkayan-hero.jpg";
import meetingImage from "@/assets/meeting-room.jpg";
import officeImage from "@/assets/private-office.jpg";
import sharedImage from "@/assets/shared-space.jpg";
import { Button } from "@/components/ui/button";
import { Brand, SiteHeader } from "@/components/site-header";
import { siteSettingsQuery, defaultContent, youtubeEmbed, whatsappLink } from "@/lib/site-settings";
import { Reveal } from "@/components/ui/reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "الكيان | مساحات عمل استثنائية في بغداد" },
      { name: "description", content: "مساحات عمل مشتركة ومكاتب وقاعات اجتماعات فاخرة صُممت لأصحاب الرؤية في بغداد." },
      { property: "og:title", content: "الكيان | مساحات عمل استثنائية" },
      { property: "og:description", content: "بيئة راقية تجمع الهدوء والإلهام والخدمة المتكاملة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

/* Static fallback slides (used when heroSlides is empty in CMS) */
const staticSlides = [heroImage, officeImage, meetingImage, sharedImage];

const ICON_MAP: Record<string, React.ElementType> = {
  Briefcase, Users, Wifi, Monitor, Smartphone, Coffee, Shield, Sparkles, Star, CheckCircle, MonitorPlay
};

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z" />
    </svg>
  );
}

function SectionHeading({ label, title, text }: { label: string; title: string; text?: string }) {
  return (
    <Reveal className="mx-auto mb-12 max-w-2xl text-center md:mb-16">
      <p className="mb-4 flex items-center justify-center gap-3 text-xl md:text-4xl font-semibold tracking-wider text-primary">
        <span className="h-px w-8 bg-primary" /> {label} <span className="h-px w-8 bg-primary" />
      </p>
      <h2 className="font-display text-4xl leading-tight text-foreground md:text-6xl">{title}</h2>
      {text && <p className="mt-5 leading-8 text-muted-foreground">{text}</p>}
    </Reveal>
  );
}

function HomePage() {
  const { data: settings, isLoading } = useQuery(siteSettingsQuery);
  const content = settings ?? defaultContent;
  const imageUrls = settings?.imageUrls ?? {};

  // Update Meta Tags
  useEffect(() => {
    if (content.seo) {
      document.title = content.seo.siteName || "الكيان | مساحات عمل استثنائية";
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      if (content.seo.description) metaDesc.setAttribute('content', content.seo.description);
      
      if (content.seo.favicon) {
        let link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = content.seo.favicon;
      }
    }
  }, [content.seo]);

  // Resolve hero slides: prefer CMS storage paths, fall back to static assets
  const heroSlides =
    content.heroSlides.length > 0
      ? content.heroSlides.map((p) => imageUrls[p] ?? p)
      : staticSlides;

  const [slide, setSlide] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(
      () => setSlide((value) => (value + 1) % heroSlides.length),
      5500,
    );
    return () => window.clearInterval(timer);
  }, [heroSlides.length]);


  // YouTube embed with fallback
  const videoUrlRaw = content.story.videoUrl;
  const embedUrl = youtubeEmbed(videoUrlRaw) || "https://www.youtube.com/embed/ScMzIvxBSi4";


  // WhatsApp link
  const waLink = content.whatsapp
    ? whatsappLink(content.whatsapp, "مرحباً، أود الاستفسار عن مساحات الكيان")
    : null;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 animate-pulse rounded-full bg-primary/20 border border-primary"></div>
          <p className="text-sm text-primary tracking-widest animate-pulse">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <main id="top" dir="rtl" className="relative w-full min-h-screen overflow-hidden text-foreground">

      <SiteHeader />

      {/* ─── Hero Slider ─── */}
      <section className="relative z-10 bg-transparent h-[40vh] md:h-auto md:min-h-[94svh] overflow-hidden">
        {heroSlides.map((image, index) => (
          <img
            key={image}
            src={image}
            alt="مساحات الكيان الفاخرة"
            width={1920}
            height={1152}
            className={`hero-slide ${slide === index ? "hero-slide-active" : ""}`}
          />
        ))}
        <div className="hero-overlay absolute inset-0" />
        <div className="relative z-10 mx-auto flex h-[40vh] md:h-auto md:min-h-[94svh] max-w-7xl items-center px-6 pb-10 pt-20 md:pb-24 md:pt-36 md:px-10">
          <div className="max-w-3xl reveal-up">
            <p className="mb-6 flex items-center gap-3 text-xl md:text-4xl font-semibold tracking-wider text-primary">
              <Sparkles className="size-4 md:size-8" /> {content.hero.eyebrow}
            </p>
            <h1 className="font-display text-2xl leading-[1.22] text-foreground sm:text-5xl md:text-8xl">
              {content.hero.title}
              <span className="gold-text block">{content.hero.titleHighlight}</span>
            </h1>
            <p className="mt-7 max-w-xl text-sm leading-6 text-foreground/75 md:text-lg md:leading-8">
              {content.hero.text}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/spaces">
                  {content.hero.primaryCta} <ArrowLeft className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="glass">
                <a href="#story">{content.hero.secondaryCta}</a>
              </Button>
            </div>
          </div>
        </div>
        <a
          href="#story"
          aria-label="انتقل إلى القسم التالي"
          className="absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-[10px] tracking-[0.18em] text-foreground/60"
        >
          اكتشف أكثر <ChevronDown className="size-4 animate-bounce text-primary" />
        </a>
        <div className="absolute bottom-9 right-6 z-20 flex gap-2 md:right-10">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setSlide(index)}
              aria-label={`عرض الصورة ${index + 1}`}
              className={`h-1 transition-all ${slide === index ? "w-10 bg-primary" : "w-5 bg-foreground/40"}`}
            />
          ))}
        </div>
      </section>

      {/* ─── Middle Sections Wrapper (Unified Background) ─── */}
      <div className="relative z-10 bg-transparent">
        {/* ─── Story ─── */}
        <section id="story" className="section-shell relative z-10 bg-cover bg-center bg-fixed py-24 md:py-32" style={{ backgroundImage: (content?.story?.statsBgImage) ? 'url(' + content.story.statsBgImage + ')' : 'url(https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1920)' }}>
          <div className="absolute inset-0 bg-[#0a0602]/90 backdrop-blur-[2px]" />
          <div className="mx-auto max-w-5xl px-6 text-center md:px-10 relative z-10">
            {/* Centered Heading */}
            <Reveal>
              <p className="mb-4 flex items-center justify-center gap-3 text-xl md:text-4xl font-semibold tracking-wider text-primary">
                <span className="h-px w-8 bg-primary" /> {content.story.label} <span className="h-px w-8 bg-primary" />
              </p>
              <h2 className="font-display text-4xl leading-tight text-white md:text-6xl">
                {content.story.title}
                <span className="gold-text mt-3 block">{content.story.titleHighlight}</span>
              </h2>
              <p className="mx-auto mt-6 max-w-2xl leading-8 text-zinc-400">
                {content.story.text}
              </p>
            </Reveal>
            
            {/* Centered Stats */}
            <Reveal delay={200} className="mx-auto mt-10 grid max-w-3xl grid-cols-3 border-y border-white/10 py-6">
              {content.story.stats.map((stat) => (
                <div key={stat.label}>
                  <strong className="font-display text-3xl text-primary md:text-4xl">{stat.value}</strong>
                  <span className="mt-2 block text-xs text-zinc-500 md:text-sm">{stat.label}</span>
                </div>
              ))}
            </Reveal>

            {/* Cinematic Video Player */}
            <Reveal delay={400} className="mx-auto mt-16 aspect-video w-full overflow-hidden rounded-2xl shadow-[0_0_15px_rgba(218,165,32,0.3)] relative group bg-black">
              <iframe
                src={embedUrl}
                title={content.story.videoCaption}
                className="h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </Reveal>
          </div>
        </section>

        {/* ─── Features ─── */}
        <section 
          id="features"
          className="relative z-10 w-full overflow-hidden py-32 border-none bg-transparent"
        >

          {/* حاوية المحتوى */}
          <div className="relative z-10 container mx-auto px-6 md:px-10">
            <SectionHeading
              label={content.features.label}
              title={content.features.title}
              text={content.features.text}
            />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {content.features.items.map((item, index) => {
                const Icon = item.icon ? (ICON_MAP[item.icon] ?? Sparkles) : Sparkles;
                return (
                  <Reveal 
                    key={index}
                    delay={(index % 3) * 100}
                    className="w-full glass-card group relative overflow-hidden p-2 sm:p-3 md:p-9 transition-all duration-500 hover:-translate-y-2 hover:border-primary/40 hover:shadow-[0_0_40px_rgba(212,175,55,0.15)]"
                  >
                    {/* Subtle inner glow on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    
                    <div className="relative z-10">
                      <span className="mb-3 md:mb-8 flex size-8 md:size-12 items-center justify-center border border-gold-soft bg-black/40 text-primary backdrop-blur-md transition-all duration-500 group-hover:-translate-y-1 group-hover:border-primary group-hover:bg-primary/20 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                        <Icon className="size-5 md:size-6" />
                      </span>
                      <span className="mb-3 block text-xs font-bold tracking-widest text-primary/60 transition-colors duration-300 group-hover:text-primary">
                        0{index + 1}
                      </span>
                      <h3 className="font-display text-sm md:text-2xl text-zinc-100 transition-colors duration-300 group-hover:text-primary">
                        {item.title}
                      </h3>
                      <p className="mt-2 md:mt-4 text-xs md:text-sm leading-5 md:leading-7 text-zinc-400 transition-colors duration-300 group-hover:text-zinc-300">
                        {item.text}
                      </p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── Testimonials ─── */}
        {content.testimonials && content.testimonials.length > 0 && (
          <section className="relative z-10 bg-transparent border-t border-white/10 py-24 md:py-32">
            <SectionHeading label="آراء العملاء" title="ماذا يقولون عنا" />
            <div className="w-full overflow-hidden py-10 relative">
              {/* Fade edges */}
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
              
              <div className="flex w-max animate-marquee gap-8 px-4 hover:[animation-play-state:paused]">
                {[...content.testimonials, ...content.testimonials, ...content.testimonials].map((t, i) => {
                  const platform = (t as any).platform || "twitter";
                  const PlatformIcon = platform === "twitter" ? Twitter : platform === "linkedin" ? Linkedin : platform === "facebook" ? Facebook : Star;
                  
                  return (
                  <Reveal
                    key={i}
                    delay={i * 100}
                    className="group relative flex w-[350px] sm:w-[450px] shrink-0 flex-col justify-between overflow-hidden rounded-2xl border border-white/5 bg-[#0a0a0a]/80 p-6 backdrop-blur-md transition-all hover:border-primary/20 hover:bg-[#111]"
                  >
                    {/* Header: Avatar, Name, Handle, Platform Icon */}
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img 
                          src={(t as any).avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=random`} 
                          alt={t.name} 
                          className="size-12 rounded-full border border-white/10 object-cover"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-white">{t.name}</span>
                          <span className="text-left text-xs text-zinc-500" dir="ltr">
                            {(t as any).username || `@${t.name.replace(/\s+/g, '')}`}
                          </span>
                        </div>
                      </div>
                      <div className="text-zinc-600">
                        <PlatformIcon className="size-5" />
                      </div>
                    </div>

                    {/* Text */}
                    <p className="mb-4 text-right text-sm leading-relaxed text-zinc-300">
                      {t.text}
                    </p>

                    {/* Footer: Date & Engagement */}
                    <div className="mt-auto flex flex-col gap-3 border-t border-white/5 pt-4">
                      <span className="text-[11px] text-zinc-500">{(t as any).date || "Oct 2026"}</span>
                      
                      <div className="flex items-center justify-between text-zinc-600">
                        <button aria-label="Reply" className="flex items-center gap-2 transition-colors hover:text-primary">
                          <MessageCircle className="size-4" />
                        </button>
                        <button aria-label="Repost" className="flex items-center gap-2 transition-colors hover:text-green-500">
                          <Repeat className="size-4" />
                        </button>
                        <button aria-label="Like" className="flex items-center gap-2 transition-colors hover:text-red-500">
                          <Heart className="size-4" />
                        </button>
                        <button aria-label="Share" className="flex items-center gap-2 transition-colors hover:text-blue-500">
                          <Share className="size-4" />
                        </button>
                      </div>
                    </div>
                  </Reveal>
                )})}
              </div>
            </div>
          </section>
        )}

        {/* ─── Contact CTA ─── */}
        <section id="contact" className="relative z-10 bg-cover bg-center bg-fixed border-y border-white/10 py-24 md:py-32" style={{ backgroundImage: content?.contact?.contactBgImage ? `url(${content.contact.contactBgImage})` : `url('https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&q=80&w=1920')` }}>
          <div className="absolute inset-0 bg-[#0a0602]/80 backdrop-blur-sm" />
          <div className="mx-auto flex max-w-5xl flex-col items-center px-6 text-center relative z-10">
          <Reveal>
            <p className="mb-4 text-xl md:text-4xl font-semibold tracking-wider text-primary">
            {content.contact.label}
          </p>
          <h2 className="font-display text-4xl leading-tight md:text-6xl">{content.contact.title}</h2>
          <p className="mt-5 max-w-xl leading-8 text-muted-foreground">{content.contact.text}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/spaces">
                {content.contact.cta} <ArrowLeft className="size-4" />
              </Link>
            </Button>
            {waLink && (
              <Button asChild variant="glass">
                <a href={waLink} target="_blank" rel="noopener noreferrer">
                  تواصل عبر واتساب <ArrowUpLeft className="size-4" />
                </a>
              </Button>
            )}
          </div>
          </Reveal>
        </div>
      </section>
      </div>

      {/* ─── Location Map ─── */}
      {(content.contact.googleMapUrl || content.contact.address) && (
        <section className="relative z-10 bg-transparent pb-20 pt-10">
          <div className="mx-auto max-w-7xl px-6 md:px-10">
            <Reveal>
              <div className="mb-10 text-center flex flex-col items-center">
                <h3 className="font-display text-3xl md:text-4xl text-zinc-100 flex items-center justify-center gap-3">
                  موقعنا
                  <MapPin className="size-8 text-primary" />
                </h3>
                {content.contact.address && (
                  <p className="mt-4 max-w-xl text-lg text-zinc-400">{content.contact.address}</p>
                )}
              </div>
              
              <div className="overflow-hidden rounded-2xl border border-primary/20 bg-white/5 backdrop-blur-md p-2 shadow-[0_0_30px_rgba(212,175,55,0.05)]">
                <div className="relative h-[350px] md:h-[450px] w-full overflow-hidden rounded-xl bg-[#0a0602]">
                  <iframe
                    src={content.contact.googleMapUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d106653.07255979201!2d44.351659936830744!3d33.31174984186591!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x15577f67a0a74193%3A0x9deda9d2a3b16f2c!2sBaghdad%2C%20Iraq!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-full w-full grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ─── Luxury Contact & Footer ─── */}
      <footer id="contact-footer" className="relative z-10 border-t border-primary/20 bg-transparent pb-8 pt-20">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="grid gap-12 md:grid-cols-3">
            
            {/* Column 1: Branding & Short About */}
            <div className="flex flex-col gap-4">
              <Brand />
              <p className="mt-2 max-w-sm text-sm leading-8 text-zinc-400">
                {content.hero.text.length > 120 ? content.hero.text.substring(0, 120) + "..." : content.hero.text}
              </p>
              <div className="flex flex-col gap-2 mt-4 items-start w-fit">
                {content.workHours && (
                  <div className="inline-flex w-fit items-center gap-3 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary">
                    <div className="size-2 rounded-full bg-green-500 animate-pulse"></div>
                    {content.workHours}
                  </div>
                )}
                {content.holidayMessage && (
                  <div className="inline-flex w-fit items-center gap-3 rounded-full border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive font-medium shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                    <div className="size-2 rounded-full bg-destructive animate-pulse"></div>
                    {content.holidayMessage}
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Direct Contact */}
            <div className="flex flex-col gap-5">
              <h4 className="font-display text-xl text-primary">تواصل معنا</h4>
              <div className="flex flex-col gap-3">
                {waLink && (
                  <a href={waLink} target="_blank" rel="noreferrer" className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-zinc-300 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-primary/10 hover:text-primary hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]">
                    <MessageCircle className="size-5" /> واتساب
                  </a>
                )}
                {content.phoneNumber && (
                  <a href={`tel:${content.phoneNumber}`} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-zinc-300 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-primary/10 hover:text-primary hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]" dir="ltr">
                    <span className="flex-1 text-right">{content.phoneNumber}</span>
                    <Phone className="size-5" />
                  </a>
                )}
                {content.socials.email && (
                  <a href={`mailto:${content.socials.email}`} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-zinc-300 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-primary/10 hover:text-primary hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]">
                    <Mail className="size-5" /> البريد الإلكتروني
                  </a>
                )}
              </div>
            </div>

            {/* Column 3: Social Media */}
            <div className="flex flex-col gap-5">
              <h4 className="font-display text-xl text-primary">تابعنا</h4>
              <div className="flex flex-wrap gap-3">
                {content.socials.instagram && (
                  <a href={content.socials.instagram} target="_blank" rel="noreferrer" aria-label="انستجرام" className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 transition-all duration-300 hover:-translate-y-2 hover:border-primary hover:bg-primary hover:text-black hover:shadow-[0_10px_20px_rgba(212,175,55,0.3)]">
                    <Instagram className="size-5" />
                  </a>
                )}
                {content.socials.facebook && (
                  <a href={content.socials.facebook} target="_blank" rel="noreferrer" aria-label="فيسبوك" className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 transition-all duration-300 hover:-translate-y-2 hover:border-primary hover:bg-primary hover:text-black hover:shadow-[0_10px_20px_rgba(212,175,55,0.3)]">
                    <Facebook className="size-5" />
                  </a>
                )}
                {content.socials.x && (
                  <a href={content.socials.x} target="_blank" rel="noreferrer" aria-label="إكس" className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 transition-all duration-300 hover:-translate-y-2 hover:border-primary hover:bg-primary hover:text-black hover:shadow-[0_10px_20px_rgba(212,175,55,0.3)]">
                    <Twitter className="size-5" />
                  </a>
                )}
                {content.socials.tiktok && (
                  <a href={content.socials.tiktok} target="_blank" rel="noreferrer" aria-label="تيك توك" className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 transition-all duration-300 hover:-translate-y-2 hover:border-primary hover:bg-primary hover:text-black hover:shadow-[0_10px_20px_rgba(212,175,55,0.3)]">
                    <TikTokIcon className="size-5" />
                  </a>
                )}
                {content.socials.youtube && (
                  <a href={content.socials.youtube} target="_blank" rel="noreferrer" aria-label="يوتيوب" className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 transition-all duration-300 hover:-translate-y-2 hover:border-primary hover:bg-primary hover:text-black hover:shadow-[0_10px_20px_rgba(212,175,55,0.3)]">
                    <Youtube className="size-5" />
                  </a>
                )}
              </div>
            </div>

          </div>

          <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-center md:flex-row md:text-right">
            <p className="text-xs text-zinc-500">{content.footer.text}</p>
            <a
              className="text-xs tracking-widest text-zinc-500 transition-colors hover:text-primary"
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              العودة للأعلى ↑
            </a>
          </div>
        </div>
      </footer>

    </main>
  );
}

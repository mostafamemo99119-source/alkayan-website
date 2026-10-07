import { ImagePlus, Save, X, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { defaultContent, saveSiteSettings, BUCKET, type SiteContent } from "@/lib/site-settings";
import { ImageManager } from "./ImageManager";
import { ContactSettingsPanel } from "./ContactSettingsPanel";

/* ─────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────── */

function Field({
  label,
  name,
  value,
  onChange,
  multiline = false,
  dir = "rtl",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  multiline?: boolean;
  dir?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
      {multiline ? (
        <textarea
          name={name}
          dir={dir}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          rows={3}
          className="admin-input min-h-20 py-2.5"
        />
      ) : (
        <input
          name={name}
          dir={dir}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className="admin-input"
        />
      )}
    </label>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-5 mt-8 flex items-center gap-3 font-display text-lg text-primary first:mt-0">
      <span className="h-px flex-1 bg-border" />
      {children}
      <span className="h-px flex-1 bg-border" />
    </h3>
  );
}

/* ─────────────────────────────────────────────────────────────
   Image upload helper
───────────────────────────────────────────────────────────── */

async function uploadFile(file: File): Promise<string | null> {
  if (!file.type.startsWith("image/") && file.type !== "video/mp4") return null;
  // Increase limit for videos to 50MB (images still fine)
  if (file.size > 50 * 1024 * 1024) return null;
  const ext = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "jpg";
  const path = `site/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
  return error ? null : path;
}

/* ─────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────── */

export function GeneralSettingsPanel({
  settings,
  onSaved,
}: {
  settings: SiteContent;
  onSaved: () => void;
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<SiteContent>(settings);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"seo" | "hero" | "story" | "content" | "contact">("seo");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [newHeroImages, setNewHeroImages] = useState<File[]>([]);
  // file refs
  const storyImageRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  async function handleBgUpload(e: React.ChangeEvent<HTMLInputElement>, fieldPath: "story.statsBgImage" | "contact.contactBgImage") {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار ملف صورة صالح");
      return;
    }

    try {
      const ext = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "jpg";
      const path = `site/${crypto.randomUUID()}.${ext}`;
      
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      
      setDraft((prev) => {
        const next = structuredClone(prev);
        if (fieldPath === "story.statsBgImage") next.story.statsBgImage = data.publicUrl;
        if (fieldPath === "contact.contactBgImage") next.contact.contactBgImage = data.publicUrl;
        return next;
      });
      
      toast.success("تم رفع صورة الخلفية بنجاح! لا تنسَ حفظ الإعدادات.");
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء الرفع");
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("يرجى اختيار ملف صورة صالح");
      return;
    }

    setUploadingLogo(true);
    setError("");

    try {
      const ext = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "jpg";
      const path = `site/${crypto.randomUUID()}.${ext}`;
      
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
      
      if (uploadError) {
        console.error("Supabase Storage Upload Error:", uploadError);
        toast.error(`فشل الرفع: ${uploadError.message}`);
        return; // أوقِف العملية، لا تستدعِ getPublicUrl ولا تحدّث قاعدة البيانات
      }
      
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      
      console.log("Uploaded Logo Public URL:", data.publicUrl);
      
      const updatedDraft = {
        ...draft,
        seo: { ...draft.seo, favicon: data.publicUrl }
      };
      
      setDraft(updatedDraft);
      
      // Auto-save to database immediately as requested
      await saveSiteSettings(updatedDraft);
      
      // Force UI to fetch fresh settings across all pages
      await queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      
      toast.success("تم رفع الشعار وحفظه بنجاح!");
      
    } catch (err) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء رفع اللوجو";
      console.error(err);
      toast.error(msg);
      setError(msg);
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) {
        logoInputRef.current.value = "";
      }
    }
  }

  // generic updater for nested keys using dot-notation
  function set(path: string, value: string) {
    setDraft((prev) => {
      const next = structuredClone(prev);
      const keys = path.split(".");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let obj: any = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys.at(-1)!] = value;
      return next;
    });
  }

  // update a stat (story.stats[index].value|label)
  function setStat(index: number, key: "value" | "label", value: string) {
    setDraft((prev) => {
      const next = structuredClone(prev);
      next.story.stats[index][key] = value;
      return next;
    });
  }

  // update features item
  function setFeatureItem(index: number, key: "title" | "text" | "icon", value: string) {
    setDraft((prev) => {
      const next = structuredClone(prev);
      next.features.items[index][key] = value;
      return next;
    });
  }

  function addFeatureItem() {
    setDraft((prev) => {
      const next = structuredClone(prev);
      if (next.features.items.length < 12) {
        next.features.items.push({ title: "", text: "", icon: "Sparkles" });
      }
      return next;
    });
  }

  function removeFeatureItem(index: number) {
    setDraft((prev) => {
      const next = structuredClone(prev);
      if (next.features.items.length > 1) {
        next.features.items.splice(index, 1);
      }
      return next;
    });
  }
  // update testimonials
  function setTestimonial(index: number, key: "name" | "username" | "platform" | "avatar" | "date" | "text", value: string) {
    setDraft((prev) => {
      const next = structuredClone(prev);
      if (!next.testimonials) next.testimonials = [];
      if (!next.testimonials[index]) next.testimonials[index] = { name: "", username: "", platform: "twitter", avatar: "", date: "", text: "" };
      next.testimonials[index][key] = value as any;
      return next;
    });
  }

  function addTestimonial() {
    setDraft((prev) => {
      const next = structuredClone(prev);
      if (!next.testimonials) next.testimonials = [];
      next.testimonials.push({ name: "", username: "", platform: "twitter", avatar: "", date: "", text: "" });
      return next;
    });
  }

  function removeTestimonial(index: number) {
    setDraft((prev) => {
      const next = structuredClone(prev);
      if (next.testimonials && next.testimonials.length > 0) {
        next.testimonials.splice(index, 1);
      }
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      let updatedDraft = structuredClone(draft);

      // Upload hero slides
      const heroFiles = newHeroImages;
      if (heroFiles?.length) {
        const paths: string[] = [];
        for (const file of Array.from(heroFiles)) {
          const path = await uploadFile(file);
          if (path) paths.push(path);
        }
        if (paths.length) {
          updatedDraft = { ...updatedDraft, heroSlides: [...updatedDraft.heroSlides, ...paths] };
        }
      }

      // Upload story image
      const storyFile = storyImageRef.current?.files?.[0];
      if (storyFile) {
        const path = await uploadFile(storyFile);
        if (path) updatedDraft = { ...updatedDraft, story: { ...updatedDraft.story, image: path } };
      }

      await saveSiteSettings(updatedDraft);
      
      // Update local state and UI caches
      setDraft(updatedDraft);
      setNewHeroImages([]);
      await queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      
      setSuccess(true);
      toast.success("تم حفظ الإعدادات بنجاح");
      setTimeout(() => setSuccess(false), 3000);
      onSaved();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء الحفظ";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  function removeHeroSlide(index: number) {
    setDraft((prev) => {
      const next = structuredClone(prev);
      next.heroSlides.splice(index, 1);
      return next;
    });
  }

  return (
    <div className="space-y-6 flex flex-col h-full">
      
      {/* ── Tabs Navigation ── */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        <Button variant={activeTab === "seo" ? "default" : "outline"} onClick={() => setActiveTab("seo")}>الهوية والسيو</Button>
        <Button variant={activeTab === "hero" ? "default" : "outline"} onClick={() => setActiveTab("hero")}>الهيرو والسلايدر</Button>
        <Button variant={activeTab === "story" ? "default" : "outline"} onClick={() => setActiveTab("story")}>الفيديو وعن الكيان</Button>
        <Button variant={activeTab === "content" ? "default" : "outline"} onClick={() => setActiveTab("content")}>آراء العملاء والمميزات</Button>
        <Button variant={activeTab === "contact" ? "default" : "outline"} onClick={() => setActiveTab("contact")}>التواصل والسوشيال</Button>
      </div>

      {/* ── Tab Content ── */}
      <div className="flex-1">
        
        {activeTab === "seo" && (
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* ── SEO & Branding ── */}
      <SectionTitle>السيو والهوية (SEO & Branding)</SectionTitle>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="اسم الموقع (Site Name)" name="seo.siteName" value={draft.seo?.siteName || ""} onChange={set} />
        <Field label="وصف الموقع لمحركات البحث" name="seo.description" value={draft.seo?.description || ""} onChange={set} multiline />
        <div className="col-span-full md:col-span-2 space-y-2">
          <label className="mb-2 block text-sm font-medium text-primary">الشعار (اللوجو) / العلامة المائية</label>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {draft.seo?.favicon && (
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#0a0602] p-3 shadow-inner">
                <img src={draft.seo.favicon} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
              </div>
            )}
            <div className="flex flex-1 flex-col gap-2">
              <input 
                type="file" 
                accept="image/png, image/jpeg, image/webp" 
                ref={logoInputRef}
                onChange={handleLogoUpload}
                disabled={uploadingLogo}
                className="hidden"
                id="logo-upload"
              />
              <label 
                htmlFor="logo-upload" 
                className={`flex cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed border-white/20 bg-white/5 px-6 py-6 text-sm font-medium text-zinc-300 transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary ${uploadingLogo ? "opacity-50 pointer-events-none" : ""}`}
              >
                {uploadingLogo ? (
                  <>
                    <Loader2 className="size-5 animate-spin text-primary" />
                    جاري الرفع وإعداد الصورة...
                  </>
                ) : (
                  <>
                    <ImagePlus className="size-5 text-primary" />
                    اضغط هنا لاختيار صورة الشعار
                  </>
                )}
              </label>
              <p className="text-[11px] text-zinc-500">الصيغ المدعومة: PNG (بخلفية شفافة)، JPEG، WEBP. المقاس المفضل: 1000x1000 بيكسل.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Navbar ── */}
      <SectionTitle>إعدادات القوائم العلوية (Navbar)</SectionTitle>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="اسم الرابط الأول (الرئيسية)" name="navbar.link1" value={draft.navbar?.link1 || ""} onChange={set} />
        <Field label="اسم الرابط الثاني (المساحات)" name="navbar.link2" value={draft.navbar?.link2 || ""} onChange={set} />
        <Field label="اسم الرابط الثالث (المزايا)" name="navbar.link3" value={draft.navbar?.link3 || ""} onChange={set} />
        <Field label="اسم الرابط الرابع (تواصل معنا)" name="navbar.link4" value={draft.navbar?.link4 || ""} onChange={set} />
        <Field label="نص زر الحجز (CTA Button)" name="navbar.cta" value={draft.navbar?.cta || ""} onChange={set} />
      </div>
      
      {/* ── Socials & Hours ── */}
      <SectionTitle>التواصل ومواعيد العمل</SectionTitle>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="العنوان (Address)" name="contact.address" value={draft.contact.address || ""} onChange={set} />
        <Field label="رابط تضمين الخريطة (Google Map Embed URL)" name="contact.googleMapUrl" value={draft.contact.googleMapUrl || ""} onChange={set} dir="ltr" />
        <Field label="رقم الواتساب" name="whatsapp" value={draft.whatsapp || ""} onChange={set} dir="ltr" />
        <Field label="رقم الهاتف" name="phoneNumber" value={draft.phoneNumber || ""} onChange={set} dir="ltr" />
        <Field label="مواعيد العمل" name="workHours" value={draft.workHours || ""} onChange={set} />
        <Field label="رسالة الإجازة (اتركها فارغة للإخفاء)" name="holidayMessage" value={draft.holidayMessage || ""} onChange={set} />
        <Field label="البريد الإلكتروني" name="socials.email" value={draft.socials?.email || ""} onChange={set} dir="ltr" />
        <Field label="رابط فيسبوك" name="socials.facebook" value={draft.socials?.facebook || ""} onChange={set} dir="ltr" />
        <Field label="رابط إنستجرام" name="socials.instagram" value={draft.socials?.instagram || ""} onChange={set} dir="ltr" />
      </div>

      
            {/* ── Contact CTA ── */}
      <SectionTitle>قسم التواصل (Contact CTA)</SectionTitle>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="التسمية العلوية" name="contact.label" value={draft.contact.label} onChange={set} />
        <Field label="العنوان" name="contact.title" value={draft.contact.title} onChange={set} />
        <Field label="نص الزر" name="contact.cta" value={draft.contact.cta} onChange={set} />
        <Field label="النص التعريفي" name="contact.text" value={draft.contact.text} onChange={set} multiline />
      </div>

      
            {/* ── Footer ── */}
      <SectionTitle>نص التذييل (Footer)</SectionTitle>
      <Field label="نص حقوق الملكية" name="footer.text" value={draft.footer.text} onChange={set} />

      
          </div>
        )}

        {activeTab === "hero" && (
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* ── Hero ── */}
            <SectionTitle>قسم الهيرو (الصفحة الرئيسية)</SectionTitle>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="العبارة العلوية الصغيرة" name="hero.eyebrow" value={draft.hero.eyebrow} onChange={set} />
              <Field label="العنوان الرئيسي" name="hero.title" value={draft.hero.title} onChange={set} />
              <Field label="الجزء المميز من العنوان (ذهبي)" name="hero.titleHighlight" value={draft.hero.titleHighlight} onChange={set} />
              <Field label="نص زر التواصل الثانوي" name="hero.secondaryCta" value={draft.hero.secondaryCta} onChange={set} />
              <Field label="نص زر الاستكشاف الأول" name="hero.primaryCta" value={draft.hero.primaryCta} onChange={set} />
              <Field label="النص التعريفي أسفل العنوان" name="hero.text" value={draft.hero.text} onChange={set} multiline />
            </div>

            {/* Hero Slides */}
            <ImageManager
              title="صور السلايدر (Hero Slider)"
              subtitle="المقاس المفضل: 1920x1080 بيكسل - نسبة 16:9 (يمكنك تحديد عدة صور معاً)"
              images={draft.heroSlides.map((path, i) => ({
                id: i.toString(),
                url: path, // Will be rendered safely in ImageManager
                alt: `Slide ${i + 1}`
              }))}
              newImages={newHeroImages}
              onNewImagesChange={setNewHeroImages}
              onDelete={(id) => removeHeroSlide(parseInt(id, 10))}
            />

            {/* Background Parallax Images */}
            <SectionTitle className="mt-8">صور خلفيات الأقسام (Parallax Backgrounds)</SectionTitle>
            <div className="grid gap-4 md:grid-cols-2 border-t border-border pt-4">
              <div className="p-4 border border-white/10 rounded-xl bg-white/5">
                <p className="text-sm font-semibold mb-2 text-primary">صورة خلفية قسم الإحصائيات (Parallax Background)</p>
                {draft.story.statsBgImage && (
                  <img src={draft.story.statsBgImage} alt="Stats Bg" className="h-24 w-full object-cover rounded-md mb-3 border border-white/10" />
                )}
                <input type="file" accept="image/*" onChange={(e) => handleBgUpload(e, "story.statsBgImage")} className="text-sm" />
                <p className="text-sm text-gray-400 mt-1">المقاس الموصى به: 1920x1080 بيكسل (لضمان أفضل جودة تأثير Parallax)</p>
              </div>

              <div className="p-4 border border-white/10 rounded-xl bg-white/5">
                <p className="text-sm font-semibold mb-2 text-primary">صورة خلفية قسم خطوتك التالية (Parallax Background)</p>
                {draft.contact?.contactBgImage && (
                  <img src={draft.contact.contactBgImage} alt="Contact Bg" className="h-24 w-full object-cover rounded-md mb-3 border border-white/10" />
                )}
                <input type="file" accept="image/*" onChange={(e) => handleBgUpload(e, "contact.contactBgImage")} className="text-sm" />
                <p className="text-sm text-gray-400 mt-1">المقاس الموصى به: 1920x1080 بيكسل (لضمان أفضل جودة تأثير Parallax)</p>
              </div>
            </div>

          </div>
        )}

        {activeTab === "story" && (
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* ── Story ── */}
      <SectionTitle>قسم "عن الكيان" (Story)</SectionTitle>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="التسمية العلوية" name="story.label" value={draft.story.label} onChange={set} />
        <Field label="عنوان القسم" name="story.title" value={draft.story.title} onChange={set} />
        <Field label="الجزء المميز من العنوان (ذهبي)" name="story.titleHighlight" value={draft.story.titleHighlight} onChange={set} />
        <Field label="تسمية الفيديو" name="story.videoCaption" value={draft.story.videoCaption} onChange={set} />
        <Field label="رابط يوتيوب للفيديو" name="story.videoUrl" value={draft.story.videoUrl} onChange={set} dir="ltr" />
        <Field label="نص الوصف" name="story.text" value={draft.story.text} onChange={set} multiline />
      </div>

      {/* Stats */}
      <div className="mt-2">
        <span className="mb-3 block text-xs font-semibold text-muted-foreground">الإحصائيات (3 أرقام)</span>
        <div className="grid gap-3 md:grid-cols-3">
          {draft.story.stats.map((stat, i) => (
            <div key={i} className="flex gap-2">
              <label className="flex-1">
                <span className="mb-1.5 block text-xs text-muted-foreground">القيمة</span>
                <input
                  value={stat.value}
                  onChange={(e) => setStat(i, "value", e.target.value)}
                  className="admin-input"
                  dir="ltr"
                />
              </label>
              <label className="flex-1">
                <span className="mb-1.5 block text-xs text-muted-foreground">التسمية</span>
                <input
                  value={stat.label}
                  onChange={(e) => setStat(i, "label", e.target.value)}
                  className="admin-input"
                />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Story Image & Video */}
      <div className="mt-4 grid gap-4 md:grid-cols-2 border-t border-border pt-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            صورة قسم الكيان (حالياً: {draft.story.image || "لم تُحدَّد"})</span><span className="mb-3 block text-xs font-normal text-muted-foreground">المقاس المفضل: 1200x800 بيكسل - نسبة 3:2
          </span>
          <input
            ref={storyImageRef}
            type="file"
            accept="image/*"
            className="admin-input file:ml-4 file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:text-primary-foreground"
          />
        </label>
        <Field 
          label="رابط فيديو يوتيوب (YouTube URL)" 
          name="story.videoUrl" 
          value={draft.story.videoUrl} 
          onChange={set}
        />
      </div>

      
            {/* ── Spaces Page ── */}
      <SectionTitle>صفحة المساحات</SectionTitle>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="التسمية العلوية" name="spacesPage.label" value={draft.spacesPage.label} onChange={set} />
        <Field label="عنوان الصفحة" name="spacesPage.title" value={draft.spacesPage.title} onChange={set} />
        <Field label="الجزء المميز (ذهبي)" name="spacesPage.titleHighlight" value={draft.spacesPage.titleHighlight} onChange={set} />
        <Field label="النص التعريفي" name="spacesPage.text" value={draft.spacesPage.text} onChange={set} multiline />
      </div>

      
          </div>
        )}

        {activeTab === "content" && (
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* ── Testimonials ── */}
      <SectionTitle>آراء العملاء (Testimonials)</SectionTitle>
      <div className="mt-5 flex items-center justify-between">
        <span className="block text-sm font-semibold text-primary">الآراء والمراجعات</span>
        <Button type="button" variant="outline" size="sm" onClick={addTestimonial}>
          + إضافة رأي جديد
        </Button>
      </div>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        {draft.testimonials?.map((item, i) => (
          <div key={i} className="relative rounded-xl border border-white/5 bg-white/5 p-4 shadow-sm md:col-span-2">
            <button
              type="button"
              onClick={() => removeTestimonial(i)}
              className="absolute left-3 top-3 grid size-6 place-items-center rounded-full bg-destructive/10 text-destructive transition-colors hover:bg-destructive hover:text-white"
              aria-label="حذف"
            >
              <X className="size-3" />
            </button>
            <span className="mb-3 block text-xs font-bold text-primary">عميل {i + 1}</span>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <label className="block">
                <span className="mb-1.5 block text-xs text-muted-foreground">الاسم (Name)</span>
                <input value={item.name || ""} onChange={(e) => setTestimonial(i, "name", e.target.value)} className="admin-input" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs text-muted-foreground">اسم المستخدم (@username)</span>
                <input value={item.username || ""} onChange={(e) => setTestimonial(i, "username", e.target.value)} className="admin-input" dir="ltr" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs text-muted-foreground">المنصة (Platform)</span>
                <select 
                  value={item.platform || "twitter"} 
                  onChange={(e) => setTestimonial(i, "platform", e.target.value as any)} 
                  className="admin-input bg-black"
                >
                  <option value="twitter">Twitter / X</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="facebook">Facebook</option>
                  <option value="google">Google</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs text-muted-foreground">رابط الصورة (Avatar URL)</span>
                <input value={item.avatar || ""} onChange={(e) => setTestimonial(i, "avatar", e.target.value)} className="admin-input" dir="ltr" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs text-muted-foreground">التاريخ (Date)</span>
                <input value={item.date || ""} onChange={(e) => setTestimonial(i, "date", e.target.value)} className="admin-input" dir="ltr" placeholder="12 Oct 2026" />
              </label>
              <label className="block md:col-span-2 lg:col-span-3">
                <span className="mb-1.5 block text-xs text-muted-foreground">محتوى الرأي (Review Text)</span>
                <textarea value={item.text || ""} onChange={(e) => setTestimonial(i, "text", e.target.value)} rows={3} className="admin-input min-h-20 py-2" />
              </label>
            </div>
          </div>
        ))}
      </div>

      
            
        {/* ── Features ── */}
      <SectionTitle>قسم المزايا (Features)</SectionTitle>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="التسمية العلوية" name="features.label" value={draft.features.label} onChange={set} />
        <Field label="عنوان القسم" name="features.title" value={draft.features.title} onChange={set} />
        <Field label="النص التعريفي" name="features.text" value={draft.features.text} onChange={set} multiline />
      </div>
      <div className="mt-5 flex items-center justify-between">
        <span className="block text-sm font-semibold text-primary">المزايا (حتى 7 أو أكثر)</span>
        <Button type="button" variant="outline" size="sm" onClick={addFeatureItem}>
          + إضافة ميزة
        </Button>
      </div>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        {draft.features.items.map((item, i) => (
          <div key={i} className="relative rounded-xl border border-white/5 bg-white/5 p-4 shadow-sm">
            <button
              type="button"
              onClick={() => removeFeatureItem(i)}
              className="absolute left-3 top-3 grid size-6 place-items-center rounded-full bg-destructive/10 text-destructive transition-colors hover:bg-destructive hover:text-white"
              aria-label="حذف"
            >
              <X className="size-3" />
            </button>
            <span className="mb-3 block text-xs font-bold text-primary">ميزة {i + 1}</span>
            <div className="grid gap-3">
              <label className="block">
                <span className="mb-1.5 block text-xs text-muted-foreground">الأيقونة (Lucide)</span>
                <select
                  value={item.icon || "Sparkles"}
                  onChange={(e) => setFeatureItem(i, "icon", e.target.value)}
                  className="admin-input"
                  dir="ltr"
                >
                  <option value="Briefcase">Briefcase</option>
                  <option value="Users">Users</option>
                  <option value="Wifi">Wifi</option>
                  <option value="Monitor">Monitor</option>
                  <option value="Smartphone">Smartphone</option>
                  <option value="Coffee">Coffee</option>
                  <option value="Shield">Shield</option>
                  <option value="Sparkles">Sparkles</option>
                  <option value="Star">Star</option>
                  <option value="CheckCircle">CheckCircle</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs text-muted-foreground">العنوان</span>
                <input
                  value={item.title}
                  onChange={(e) => setFeatureItem(i, "title", e.target.value)}
                  className="admin-input"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs text-muted-foreground">الوصف</span>
                <textarea
                  value={item.text}
                  onChange={(e) => setFeatureItem(i, "text", e.target.value)}
                  rows={2}
                  className="admin-input min-h-16 py-2"
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      
          </div>
        )}

        {activeTab === "contact" && (
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ContactSettingsPanel settings={settings} onSaved={onSaved} />
          </div>
        )}
      </div>

      {/* ── Save Button ── */}
      <div className="sticky bottom-0 mt-8 border-t border-border bg-background pb-2 pt-5">
        {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
        {success && <p className="mb-3 text-sm text-green-500">✓ تم الحفظ بنجاح!</p>}
        <Button size="lg" className="w-full" onClick={handleSave} disabled={saving}>
          <Save className="size-4" />
          {saving ? "جارٍ الحفظ..." : "حفظ الإعدادات العامة"}
        </Button>
      </div>
    </div>
  );

}

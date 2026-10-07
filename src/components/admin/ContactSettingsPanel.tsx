import { Facebook, Instagram, Mail, MessageCircle, Phone, Save, Twitter, Youtube } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { saveSiteSettings, whatsappLink, type SiteContent } from "@/lib/site-settings";

/* ─────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────── */

function SocialField({
  label,
  icon: Icon,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </span>
      <input
        dir="ltr"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="admin-input"
      />
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
   TikTok icon (not in lucide-react)
───────────────────────────────────────────────────────────── */

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────── */

export function ContactSettingsPanel({
  settings,
  onSaved,
}: {
  settings: SiteContent;
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<SiteContent>(settings);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function setSocial(key: keyof SiteContent["socials"], value: string) {
    setDraft((prev) => ({
      ...prev,
      socials: { ...prev.socials, [key]: value },
    }));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      await saveSiteSettings(draft);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  }
  // Live preview of whatsapp link
  const waPreview = draft.whatsapp
    ? whatsappLink(draft.whatsapp, "مرحباً، أود الاستفسار عن مساحات الكيان")
    : null;

  const activeSocials = [
    { key: "instagram" as const, label: "إنستغرام", href: draft.socials.instagram, Icon: Instagram },
    { key: "facebook" as const, label: "فيسبوك", href: draft.socials.facebook, Icon: Facebook },
    { key: "x" as const, label: "X", href: draft.socials.x, Icon: Twitter },
    { key: "youtube" as const, label: "يوتيوب", href: draft.socials.youtube, Icon: Youtube },
    { key: "tiktok" as const, label: "تيك توك", href: draft.socials.tiktok, Icon: TikTokIcon },
  ].filter((s) => s.href);

  return (
    <div className="space-y-2">
      {/* ── WhatsApp ── */}
      <SectionTitle>واتساب</SectionTitle>
      <label className="block">
        <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <MessageCircle className="size-3.5 text-green-500" />
          رقم الواتساب (للحجوزات)
        </span>
        <div className="flex flex-row-reverse items-stretch border border-border rounded-md overflow-hidden bg-background focus-within:ring-1 focus-within:ring-primary">
          <div className="flex items-center gap-2 bg-[#1f1008] px-3 border-l border-border" dir="ltr">
            <span>🇪🇬</span>
            <span className="text-muted-foreground text-sm font-semibold">+20</span>
          </div>
          <input
            dir="ltr"
            value={draft.whatsapp ? draft.whatsapp.replace(/^20/, "") : ""}
            placeholder="10xxxxxxx"
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setDraft((prev) => ({ ...prev, whatsapp: val ? `20${val}` : "" }));
            }}
            className="flex-1 px-3 py-2 bg-transparent outline-none text-sm placeholder:text-muted-foreground/50 text-left"
          />
        </div>
      </label>
      {waPreview && (
        <div className="mt-2 rounded border border-border bg-card px-4 py-3 text-xs">
          <span className="text-muted-foreground">معاينة الرابط: </span>
          <a
            href={waPreview}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-primary hover:underline"
            dir="ltr"
          >
            {waPreview}
          </a>
        </div>
      )}

      {/* ── Phone Number ── */}
      <SectionTitle>رقم الهاتف المباشر</SectionTitle>
      <label className="block">
        <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Phone className="size-3.5 text-primary" />
          رقم الهاتف للاتصال المباشر
        </span>
        <input
          dir="ltr"
          value={draft.phoneNumber}
          placeholder="مثال: +9647801234567"
          onChange={(e) => setDraft((prev) => ({ ...prev, phoneNumber: e.target.value }))}
          className="admin-input"
        />
      </label>
      {draft.phoneNumber && (
        <div className="mt-2 rounded border border-border bg-card px-4 py-3 text-xs">
          <span className="text-muted-foreground">معاينة الاتصال: </span>
          <a href={`tel:${draft.phoneNumber}`} className="text-primary hover:underline" dir="ltr">
            {draft.phoneNumber}
          </a>
        </div>
      )}

      {/* ── Email ── */}
      <SectionTitle>البريد الإلكتروني</SectionTitle>
      <SocialField
        label="عنوان البريد الإلكتروني للشركة"
        icon={Mail}
        value={draft.socials.email}
        placeholder="info@alkayan.iq"
        onChange={(v) => setSocial("email", v)}
      />
      {draft.socials.email && (
        <div className="mt-2 rounded border border-border bg-card px-4 py-3 text-xs">
          <span className="text-muted-foreground">رابط سريع: </span>
          <a href={`mailto:${draft.socials.email}`} className="text-primary hover:underline" dir="ltr">
            {draft.socials.email}
          </a>
        </div>
      )}

      {/* ── Socials ── */}
      <SectionTitle>منصات التواصل الاجتماعي</SectionTitle>
      <div className="grid gap-4 md:grid-cols-2">
        <SocialField
          label="إنستغرام"
          icon={Instagram}
          value={draft.socials.instagram}
          placeholder="https://instagram.com/alkayan"
          onChange={(v) => setSocial("instagram", v)}
        />
        <SocialField
          label="فيسبوك"
          icon={Facebook}
          value={draft.socials.facebook}
          placeholder="https://facebook.com/alkayan"
          onChange={(v) => setSocial("facebook", v)}
        />
        <SocialField
          label="تويتر / X"
          icon={Twitter}
          value={draft.socials.x}
          placeholder="https://x.com/alkayan"
          onChange={(v) => setSocial("x", v)}
        />
        <SocialField
          label="يوتيوب"
          icon={Youtube}
          value={draft.socials.youtube}
          placeholder="https://youtube.com/@alkayan"
          onChange={(v) => setSocial("youtube", v)}
        />
        <SocialField
          label="تيك توك"
          icon={TikTokIcon}
          value={draft.socials.tiktok}
          placeholder="https://tiktok.com/@alkayan"
          onChange={(v) => setSocial("tiktok", v)}
        />
      </div>

      {/* ── Live Preview ── */}
      {activeSocials.length > 0 && (
        <div className="mt-4 rounded border border-border bg-card p-4">
          <p className="mb-3 text-xs font-semibold text-muted-foreground">معاينة الروابط النشطة:</p>
          <div className="flex flex-wrap gap-3">
            {activeSocials.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded bg-surface px-3 py-1.5 text-xs text-primary hover:underline"
              >
                <Icon className="size-3" /> {label}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── Save Button ── */}
      <div className="sticky bottom-0 mt-8 border-t border-border bg-background pb-2 pt-5">
        {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
        {success && <p className="mb-3 text-sm text-green-500">✓ تم الحفظ بنجاح!</p>}
        <Button size="lg" className="w-full" onClick={handleSave} disabled={saving}>
          <Save className="size-4" />
          {saving ? "جارٍ الحفظ..." : "حفظ بيانات التواصل"}
        </Button>
      </div>
    </div>
  );
}

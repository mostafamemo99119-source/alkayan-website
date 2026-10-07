import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Contact,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  Pencil,
  Plus,
  Settings,
  Trash2,
  X,
  Video,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { z } from "zod";
import { GeneralSettingsPanel } from "@/components/admin/GeneralSettingsPanel";
import { ContactSettingsPanel } from "@/components/admin/ContactSettingsPanel";
import { ReelsManager } from "@/components/admin/ReelsManager";
import { ImageManager } from "@/components/admin/ImageManager";
import { Brand } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { fetchSpaces, getSpaceImageUrl, type Space } from "@/lib/spaces";
import { fetchSiteSettings, defaultContent, type SiteContent } from "@/lib/site-settings";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "لوحة الإدارة | الكيان" },
      { name: "description", content: "إدارة مساحات وأسعار وصور وإعدادات الكيان." },
      { property: "og:title", content: "لوحة إدارة الكيان" },
      { property: "og:description", content: "نظام إدارة محتوى الكيان." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

/* ─────────────────────────────────────────────────────────────
   Space form schema
───────────────────────────────────────────────────────────── */

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  eyebrow: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(1200),
  capacity: z.string().trim().min(1).max(80),
  pricing_packages: z.array(z.object({
    packageName: z.string().trim().min(1),
    price: z.coerce.number().min(0)
  })),
  display_order: z.coerce.number().int().min(0),
  is_active: z.boolean(),
});

/* ─────────────────────────────────────────────────────────────
   Tab type
───────────────────────────────────────────────────────────── */

type Tab = "spaces" | "general" | "contact" | "reels";

/* ─────────────────────────────────────────────────────────────
   Main AdminPage
───────────────────────────────────────────────────────────── */

function AdminPage() {
  const navigate = useNavigate({ from: "/admin" });
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("spaces");

  // ── Spaces data ──
  const { data = [], isLoading: spacesLoading } = useQuery({
    queryKey: ["admin-spaces"],
    queryFn: () => fetchSpaces(true),
  });

  const { data: siteSettingsData, isLoading: settingsLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: fetchSiteSettings,
    staleTime: 5 * 60 * 1000,
  });

  const siteSettings: SiteContent = siteSettingsData ?? defaultContent;

  const isLoading = spacesLoading || settingsLoading;

  // ── Space form state ──
  const [editing, setEditing] = useState<Space | null | "new">(null);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setNewImages([]);
  }, [editing]);

  async function refreshSpaces() {
    await queryClient.invalidateQueries({ queryKey: ["admin-spaces"] });
    await queryClient.invalidateQueries({ queryKey: ["spaces"] });
  }

  async function refreshSettings() {
    await queryClient.invalidateQueries({ queryKey: ["site-settings"] });
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const packageNames = form.getAll("packageName[]");
    const packagePrices = form.getAll("packagePrice[]");
    const pricing_packages = packageNames.map((name, i) => ({
      packageName: String(name),
      price: Number(packagePrices[i]),
    }));

    const parsed = schema.safeParse({
      name: form.get("name"),
      eyebrow: form.get("eyebrow"),
      description: form.get("description"),
      capacity: form.get("capacity"),
      pricing_packages,
      display_order: form.get("display_order"),
      is_active: form.get("is_active") === "on",
    });
    if (!parsed.success) {
      setError("تحقق من الحقول والقيم المدخلة. تأكد من إدخال اسم وسعر لكل باقة.");
      return;
    }
    setSaving(true);

    const result =
      editing === "new"
        ? await supabase.from("spaces").insert(parsed.data).select("id").single()
        : await supabase
            .from("spaces")
            .update({ ...parsed.data, updated_at: new Date().toISOString() })
            .eq("id", editing?.id ?? "")
            .select("id")
            .single();

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    const files = newImages;
    const spaceId = result.data.id;
    if (files.length) {
      for (const [index, file] of files.entries()) {
        if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) continue;
        const extension = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "jpg";
        const path = `${spaceId}/${crypto.randomUUID()}.${extension}`;
        
        const upload = await supabase.storage
          .from("space-images")
          .upload(path, file, { contentType: file.type });
          
        if (upload.error) {
          console.error("Upload error:", upload.error);
          import("sonner").then(({ toast }) => toast.error(`فشل رفع الصورة: ${upload.error.message}`));
          continue;
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from("space-images")
          .getPublicUrl(path);
          
        const insertResult = await supabase.from("space_images").insert({
          space_id: spaceId,
          image_url: publicUrl,
          storage_path: path,
          alt_text: parsed.data.name,
          display_order: index + (editing && editing !== "new" ? editing.space_images.length : 0),
        });
        
        if (insertResult.error) {
           console.error("DB Insert error:", insertResult.error);
           import("sonner").then(({ toast }) => toast.error(`فشل ربط الصورة: ${insertResult.error.message}`));
        }
      }
    }

    await refreshSpaces();
    setEditing(null);
    setSaving(false);
    import("sonner").then(({ toast }) => toast.success("تم الحفظ بنجاح"));
  }

  async function removeSpace(space: Space) {
    if (!window.confirm(`حذف ${space.name} نهائياً؟`)) return;
    const paths = space.space_images.flatMap((image) =>
      image.storage_path ? [image.storage_path] : [],
    );
    if (paths.length) await supabase.storage.from("space-images").remove(paths);
    await supabase.from("spaces").delete().eq("id", space.id);
    await refreshSpaces();
  }

  async function removeImage(
    space: Space,
    imageId: string,
    path: string | null,
  ) {
    if (path) await supabase.storage.from("space-images").remove([path]);
    await supabase.from("space_images").delete().eq("id", imageId);
    await refreshSpaces();
    setEditing({
      ...space,
      space_images: space.space_images.filter((image) => image.id !== imageId),
    });
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    localStorage.removeItem("alkayan_admin_auth");
    await navigate({ to: "/auth", replace: true });
  }

  if (isLoading) {
    return <div className="min-h-screen grid place-items-center bg-background"><p className="text-primary animate-pulse text-xl font-display">جاري التحميل...</p></div>;
  }

  const value = editing === "new" ? null : editing;

  /* ── Tab navigation items ── */
  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "spaces", label: "إدارة المساحات", icon: LayoutDashboard },
    { id: "general", label: "الإعدادات العامة", icon: Settings },
    { id: "contact", label: "التواصل والسوشيال", icon: Contact },
    { id: "reels", label: "مقاطع الفيديو (Reels)", icon: Video },
  ];

  return (
    <main dir="rtl" className="min-h-screen bg-background text-foreground">
      {/* ─── Header ─── */}
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-10">
          <Brand />
          <Button variant="ghost" onClick={signOut}>
            <LogOut className="size-4" />
            تسجيل الخروج
          </Button>
        </div>
      </header>

      {/* ─── Tab bar ─── */}
      <div className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl overflow-x-auto px-5 md:px-10">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-5 py-4 text-sm transition-colors ${
                activeTab === id
                  ? "border-primary font-semibold text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Content ─── */}
      <section className="mx-auto max-w-7xl px-5 py-10 md:px-10">

        {/* ════════ TAB: Spaces ════════ */}
        {activeTab === "spaces" && (
          <>
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="text-xs text-primary">لوحة التحكم</p>
                <h1 className="mt-2 font-display text-4xl">إدارة المساحات</h1>
              </div>
              <Button onClick={() => setEditing("new")}>
                <Plus className="size-4" />
                إضافة مساحة
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-8 grid gap-5 md:grid-cols-[1fr_2fr]">
              <div className="glass-card p-6">
                <p className="text-sm text-muted-foreground">إجمالي الغرف المسجلة</p>
                <strong className="mt-4 block font-display text-6xl text-primary">{data.length}</strong>
              </div>
              <div className="glass-card p-6">
                <p className="text-sm text-muted-foreground">الغرف الظاهرة للزوار</p>
                <strong className="mt-4 block font-display text-6xl">
                  {data.filter((space) => space.is_active).length}
                </strong>
              </div>
            </div>

            {/* Table */}
            <div className="mt-8 overflow-x-auto border border-border">
              {isLoading ? (
                <p className="p-8 text-muted-foreground">جارٍ التحميل...</p>
              ) : (
                <table className="w-full min-w-2xl text-right">
                  <thead className="bg-surface text-xs text-muted-foreground">
                    <tr>
                      <th className="p-4">المساحة</th>
                      <th className="p-4">السعة</th>
                      <th className="p-4">الأسعار</th>
                      <th className="p-4">الحالة</th>
                      <th className="p-4">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((space) => (
                      <tr key={space.id} className="border-t border-border">
                        <td className="p-4 font-semibold">
                          {space.name}
                          <small className="block text-muted-foreground">{space.space_images.length} صور</small>
                        </td>
                        <td className="p-4 text-sm">{space.capacity}</td>
                        <td className="p-4 text-sm">
                          <div className="flex flex-col gap-1">
                            {space.pricing_packages.map((pkg, i) => (
                              <span key={i} className="rounded border border-primary/20 bg-primary/5 px-2 py-1 text-xs text-primary">
                                {pkg.packageName}: {new Intl.NumberFormat('en-US').format(pkg.price)} ج.م
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 text-sm text-primary">{space.is_active ? "منشورة" : "مخفية"}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button variant="icon" onClick={() => setEditing(space)} aria-label="تعديل">
                              <Pencil className="size-4" />
                            </Button>
                            <Button variant="icon" onClick={() => removeSpace(space)} aria-label="حذف">
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {/* ════════ TAB: General Settings ════════ */}
        {activeTab === "general" && (
          <>
            <div className="mb-8">
              <p className="text-xs text-primary">لوحة التحكم</p>
              <h1 className="mt-2 font-display text-4xl">الإعدادات العامة</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                تعديل النصوص والصور الثابتة التي تظهر في الصفحة الرئيسية وصفحة المساحات.
              </p>
            </div>
            <div className="glass-card p-6 md:p-8">
              <GeneralSettingsPanel settings={siteSettings} onSaved={refreshSettings} />
            </div>
          </>
        )}

        {/* ════════ TAB: Contact & Socials ════════ */}
        {activeTab === "contact" && (
          <>
            <div className="mb-8">
              <p className="text-xs text-primary">لوحة التحكم</p>
              <h1 className="mt-2 font-display text-4xl">التواصل والسوشيال</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                تحكم في أرقام الواتساب والبريد الإلكتروني وروابط منصات التواصل الاجتماعي.
              </p>
            </div>
            <div className="glass-card p-6 md:p-8">
              <ContactSettingsPanel settings={siteSettings} onSaved={refreshSettings} />
            </div>
          </>
        )}
        
        {/* ════════ TAB: Reels ════════ */}
        {activeTab === "reels" && (
          <>
            <div className="mb-8">
              <p className="text-xs text-primary">لوحة التحكم</p>
              <h1 className="mt-2 font-display text-4xl">مقاطع الفيديو (Reels)</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                إدارة مقاطع فيديو يوتيوب (جولة الكيان) التي تظهر للعملاء.
              </p>
            </div>
            <ReelsManager />
          </>
        )}
      </section>

      {/* ─── Space Edit Modal ─── */}
      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-overlay p-4 backdrop-blur-md">
          <form
            onSubmit={save}
            className="glass-modal max-h-[94vh] w-full max-w-2xl overflow-auto p-6 md:p-9"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl">
                {editing === "new" ? "إضافة مساحة جديدة" : "تعديل المساحة"}
              </h2>
              <Button type="button" variant="icon" onClick={() => setEditing(null)} aria-label="إغلاق">
                <X className="size-4" />
              </Button>
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <Field label="اسم المساحة" name="name" defaultValue={value?.name} />
              <Field label="العبارة القصيرة" name="eyebrow" defaultValue={value?.eyebrow} />
              <Field label="السعة" name="capacity" defaultValue={value?.capacity} />
              <Field
                label="ترتيب العرض"
                name="display_order"
                type="number"
                defaultValue={value?.display_order ?? data.length + 1}
              />
              <label className="flex items-center gap-3 self-end py-3">
                <input
                  name="is_active"
                  type="checkbox"
                  defaultChecked={value?.is_active ?? true}
                  className="size-4 accent-primary"
                />
                إظهار المساحة للزوار
              </label>

              <PricingPackagesInput initialPackages={value?.pricing_packages} />
              <label className="md:col-span-2">
                الوصف
                <textarea
                  name="description"
                  required
                  minLength={10}
                  maxLength={1200}
                  defaultValue={value?.description}
                  className="admin-input mt-2 min-h-28 py-3"
                />
              </label>
              <ImageManager
                title="صور المساحة"
                subtitle="أضف صوراً جذابة تبرز جمالية المكان"
                images={value?.space_images?.map(img => ({ id: img.id, url: getSpaceImageUrl(img), alt: img.alt_text })) || []}
                newImages={newImages}
                onNewImagesChange={setNewImages}
                onDelete={(id) => {
                  const img = value?.space_images.find(i => i.id === id);
                  if (img) removeImage(value, img.id, img.storage_path);
                }}
              />
            </div>

            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

            <Button type="submit" size="lg" className="mt-7 w-full" disabled={saving}>
              <ImagePlus className="size-4" />
              {saving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
            </Button>
          </form>
        </div>
      )}
    </main>
  );
}

/* ─────────────────────────────────────────────────────────────
   Dynamic Pricing Packages Input
───────────────────────────────────────────────────────────── */

function PricingPackagesInput({ initialPackages }: { initialPackages?: { packageName: string; price: number }[] }) {
  const [packages, setPackages] = useState(initialPackages?.length ? initialPackages : [{ packageName: "", price: 0 }]);

  return (
    <div className="md:col-span-2 mt-4 space-y-4 rounded-xl border border-border bg-white/5 p-5">
      <div className="flex items-center justify-between">
        <label className="font-semibold">باقات الأسعار</label>
        <Button type="button" variant="outline" size="sm" onClick={() => setPackages([...packages, { packageName: "", price: 0 }])}>
          <Plus className="mr-2 size-4" /> إضافة تسعير جديد
        </Button>
      </div>
      <div className="grid gap-3">
        {packages.map((pkg, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <input
              type="text"
              name="packageName[]"
              placeholder="اسم الباقة (مثال: شهر، سنة)"
              required
              value={pkg.packageName}
              onChange={(e) => {
                const newPkgs = [...packages];
                newPkgs[idx].packageName = e.target.value;
                setPackages(newPkgs);
              }}
              className="admin-input flex-1"
            />
            <input
              type="number"
              name="packagePrice[]"
              placeholder="السعر بالجنيه المصري"
              required
              min={0}
              value={pkg.price || ""}
              onChange={(e) => {
                const newPkgs = [...packages];
                newPkgs[idx].price = Number(e.target.value);
                setPackages(newPkgs);
              }}
              className="admin-input flex-1"
            />
            <Button
              type="button"
              variant="icon"
              className="shrink-0 text-destructive hover:bg-destructive/10"
              onClick={() => {
                setPackages(packages.filter((_, i) => i !== idx));
              }}
              disabled={packages.length === 1}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Small reusable field for space form
───────────────────────────────────────────────────────────── */

function Field({
  label,
  name,
  type = "text",
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number | undefined;
}) {
  return (
    <label>
      {label}
      <input
        name={name}
        type={type}
        required
        maxLength={type === "text" ? 120 : undefined}
        min={type === "number" ? 0 : undefined}
        defaultValue={defaultValue}
        className="admin-input mt-2"
      />
    </label>
  );
}
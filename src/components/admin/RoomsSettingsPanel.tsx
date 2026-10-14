import { useState, useEffect } from "react";
import { Save, Sparkles, Clock, Users, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  fetchRoomsContent,
  saveRoomsContent,
  defaultRoomsContent,
  type RoomsPageContent,
} from "@/lib/rooms-content";
import { toast } from "sonner";

export function RoomsSettingsPanel({ onSaved }: { onSaved?: () => void }) {
  const [data, setData] = useState<RoomsPageContent>(defaultRoomsContent);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const res = await fetchRoomsContent();
        setData(res);
      } catch (err) {
        console.error("Failed to load rooms content:", err);
        toast.error("فشل تحميل نصوص الصفحة، تم استخدام القيم الافتراضية");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleChange = <K extends keyof RoomsPageContent>(field: K, value: RoomsPageContent[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await saveRoomsContent(data);
      toast.success("تم حفظ نصوص أنظمة العمل بنجاح");
      onSaved?.();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "حدث خطأ أثناء حفظ التعديلات");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center text-muted-foreground animate-pulse">
        جاري تحميل بيانات نصوص الغرف...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-10">
      {/* ─── قسم العنوان الرئيسي ─── */}
      <div className="space-y-5 rounded-2xl border border-border bg-surface/50 p-6">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="size-9 rounded-lg border border-primary/30 bg-primary/10 flex items-center justify-center text-primary">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">العنوان الرئيسي والهيدر</h2>
            <p className="text-xs text-muted-foreground">النصوص والشارات الظاهرة في أعلى صفحة أنظمة العمل</p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">شارة القسم العلوية (Badge)</span>
            <input
              type="text"
              required
              value={data.badgeText}
              onChange={(e) => handleChange("badgeText", e.target.value)}
              className="admin-input mt-2"
              placeholder="مثال: أنظمة ومساحات العمل"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">العنوان الرئيسي (الجزء الأول)</span>
            <input
              type="text"
              required
              value={data.mainTitle}
              onChange={(e) => handleChange("mainTitle", e.target.value)}
              className="admin-input mt-2"
              placeholder="مثال: اختر نظام عملك"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">الكلمة المميزة باللون الذهبي (Highlight)</span>
            <input
              type="text"
              required
              value={data.mainTitleHighlight}
              onChange={(e) => handleChange("mainTitleHighlight", e.target.value)}
              className="admin-input mt-2"
              placeholder="مثال: المناسب"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-medium">الوصف والفقرة التوضيحية</span>
            <textarea
              required
              rows={3}
              value={data.mainSubtitle}
              onChange={(e) => handleChange("mainSubtitle", e.target.value)}
              className="admin-input mt-2"
              placeholder="نص الفقرة الفرعية أسفل العنوان الرئيسي..."
            />
          </label>
        </div>
      </div>

      {/* ─── قسم التنويه الهام ─── */}
      <div className="space-y-5 rounded-2xl border border-red-500/30 bg-gradient-to-b from-red-950/20 to-surface/40 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg border border-red-500/40 bg-red-500/10 flex items-center justify-center text-red-400">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-white">صندوق التنويه الهام</h2>
              <p className="text-xs text-muted-foreground">تخصيص شريط التنبيه وإدارته في صفحة أنظمة العمل</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-xl border border-border">
            <span className="text-sm font-medium text-white">تفعيل التنويه في الموقع</span>
            <Switch
              checked={data.isNoticeEnabled ?? true}
              onCheckedChange={(checked) => handleChange("isNoticeEnabled", checked)}
            />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">عنوان التنويه (البادئة)</span>
            <input
              type="text"
              value={data.noticeTitle ?? ""}
              onChange={(e) => handleChange("noticeTitle", e.target.value)}
              className="admin-input mt-2"
              placeholder="مثال: تنويه هام:"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-medium">محتوى نص التنويه الهام</span>
            <textarea
              rows={2}
              value={data.noticeText ?? ""}
              onChange={(e) => handleChange("noticeText", e.target.value)}
              className="admin-input mt-2"
              placeholder="مثال: حجز جميع مساحات العمل المستقلة يتطلب إيداع شهر تأمين مقدماً."
            />
          </label>
        </div>
      </div>

      {/* ─── قسم بطاقة Full Time ─── */}
      <div className="space-y-5 rounded-2xl border border-primary/30 bg-gradient-to-b from-[#16120b]/60 to-surface/40 p-6">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="size-9 rounded-lg border border-primary/40 bg-black/50 flex items-center justify-center text-primary">
            <Clock className="size-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-white">بطاقة نظام Full Time</h2>
            <p className="text-xs text-muted-foreground">نصوص ومزايا خيار الدوام الكامل والاستقرار الدائم</p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">شارة البطاقة (Badge)</span>
            <input
              type="text"
              required
              value={data.fullTimeBadge}
              onChange={(e) => handleChange("fullTimeBadge", e.target.value)}
              className="admin-input mt-2"
              placeholder="مثال: باقات شهرية وثابتة"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">عنوان البطاقة الإنجليزي</span>
            <input
              type="text"
              required
              value={data.fullTimeTitle}
              onChange={(e) => handleChange("fullTimeTitle", e.target.value)}
              className="admin-input mt-2"
              placeholder="Full Time"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">العنوان العربي الفرعي</span>
            <input
              type="text"
              required
              value={data.fullTimeSubtitle}
              onChange={(e) => handleChange("fullTimeSubtitle", e.target.value)}
              className="admin-input mt-2"
              placeholder="دوام كامل"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-medium">وصف باقة الـ Full Time</span>
            <textarea
              required
              rows={3}
              value={data.fullTimeDesc}
              onChange={(e) => handleChange("fullTimeDesc", e.target.value)}
              className="admin-input mt-2"
              placeholder="مكاتب خاصة وقاعات مخصصة بدوام كامل..."
            />
          </label>
        </div>
      </div>

      {/* ─── قسم بطاقة Share Time ─── */}
      <div className="space-y-5 rounded-2xl border border-primary/30 bg-gradient-to-b from-[#16120b]/60 to-surface/40 p-6">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="size-9 rounded-lg border border-primary/40 bg-black/50 flex items-center justify-center text-primary">
            <Users className="size-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-white">بطاقة نظام Share Time</h2>
            <p className="text-xs text-muted-foreground">نصوص ومزايا خيار المساحات المشتركة والساعات</p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">شارة البطاقة (Badge)</span>
            <input
              type="text"
              required
              value={data.shareTimeBadge}
              onChange={(e) => handleChange("shareTimeBadge", e.target.value)}
              className="admin-input mt-2"
              placeholder="مثال: مرونة بالساعات والأيام"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">عنوان البطاقة الإنجليزي</span>
            <input
              type="text"
              required
              value={data.shareTimeTitle}
              onChange={(e) => handleChange("shareTimeTitle", e.target.value)}
              className="admin-input mt-2"
              placeholder="Share Time"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">العنوان العربي الفرعي</span>
            <input
              type="text"
              required
              value={data.shareTimeSubtitle}
              onChange={(e) => handleChange("shareTimeSubtitle", e.target.value)}
              className="admin-input mt-2"
              placeholder="مشاركة / ساعات"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-medium">وصف باقة الـ Share Time</span>
            <textarea
              required
              rows={3}
              value={data.shareTimeDesc}
              onChange={(e) => handleChange("shareTimeDesc", e.target.value)}
              className="admin-input mt-2"
              placeholder="مساحات عمل مشتركة وقاعات اجتماعات بنظام المشاركة والساعات..."
            />
          </label>
        </div>
      </div>

      {/* زر الحفظ */}
      <div className="flex justify-end pt-4">
        <Button type="submit" size="lg" className="min-w-44" disabled={isSaving}>
          <Save className="size-4" />
          {isSaving ? "جارٍ الحفظ..." : "حفظ التعديلات"}
        </Button>
      </div>
    </form>
  );
}

export default RoomsSettingsPanel;

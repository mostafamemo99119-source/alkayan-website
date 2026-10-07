const fs = require('fs');
let c = fs.readFileSync('src/components/admin/ContactSettingsPanel.tsx', 'utf8');

const uploadFn = `  async function handleBgUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("يرجى اختيار ملف صورة صالح");
      return;
    }
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const ext = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "jpg";
      const path = \`site/\${crypto.randomUUID()}.\${ext}\`;
      const { error: uploadError } = await supabase.storage.from("space-images").upload(path, file, { contentType: file.type });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("space-images").getPublicUrl(path);
      
      setDraft((prev) => {
        const next = structuredClone(prev);
        if (!next.contact) next.contact = {} as any;
        next.contact.contactBgImage = data.publicUrl;
        return next;
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError("حدث خطأ أثناء الرفع");
    }
  }
`;

c = c.replace(
  '  // Live preview of whatsapp link',
  uploadFn + '\n  // Live preview of whatsapp link'
);

const bgUI = `
      <SectionTitle>خلفية قسم "خطوتك التالية" (CTA Parallax)</SectionTitle>
      <div className="p-4 border border-border rounded-xl bg-background">
        {draft.contact?.contactBgImage && (
          <img src={draft.contact.contactBgImage} alt="Contact Bg" className="h-24 w-full object-cover rounded-md mb-3 border border-border" />
        )}
        <input type="file" accept="image/*" onChange={handleBgUpload} className="text-sm" />
      </div>
`;

c = c.replace(
  '{/* ── WhatsApp ── */}',
  bgUI + '\n\n      {/* ── WhatsApp ── */}'
);

fs.writeFileSync('src/components/admin/ContactSettingsPanel.tsx', c);
console.log('done');

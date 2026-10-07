const fs = require('fs');
let c = fs.readFileSync('src/components/admin/GeneralSettingsPanel.tsx', 'utf8');

const uploadFn = `  // file refs
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
      const path = \`site/\${crypto.randomUUID()}.\${ext}\`;
      
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
  }`;

c = c.replace(/\s*\/\/\s*file refs\s*const storyImageRef[^\n]+\n\s*const logoInputRef[^\n]+\n/, '\n' + uploadFn + '\n');

// Next, add the UI field for Stats Background Image in the Story Tab
const statsBgUI = `
        <div className="col-span-1 md:col-span-2 mt-4 p-4 border border-white/10 rounded-xl bg-white/5">
          <p className="text-sm font-semibold mb-2">خلفية قسم الإحصائيات (Parallax)</p>
          {draft.story.statsBgImage && (
            <img src={draft.story.statsBgImage} alt="Stats Bg" className="h-24 w-full object-cover rounded-md mb-3 border border-white/10" />
          )}
          <input type="file" accept="image/*" onChange={(e) => handleBgUpload(e, "story.statsBgImage")} className="text-sm" />
        </div>
`;

c = c.replace(/\{\/\*\s*── Features ──\s*\*\/\}/, statsBgUI + '\n\n        {/* ── Features ── */}');

fs.writeFileSync('src/components/admin/GeneralSettingsPanel.tsx', c);
console.log('done');

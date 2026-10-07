const fs = require('fs');
let c = fs.readFileSync('src/components/admin/GeneralSettingsPanel.tsx', 'utf8');

// 1. Remove from story tab
const storyUploaderRegex = /<div className="col-span-1 md:col-span-2 mt-4 p-4 border border-white\/10 rounded-xl bg-white\/5">[\s\S]*?<\/div>\s*\{\/\* ── Features ── \*\/\}/;
c = c.replace(storyUploaderRegex, '{/* ── Features ── */}');

// 2. Add to hero tab
const heroUploaders = `
            {/* Background Parallax Images */}
            <SectionTitle>صور خلفيات الأقسام (Parallax Backgrounds)</SectionTitle>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border border-white/10 rounded-xl bg-white/5">
                <p className="text-sm font-semibold mb-2 text-primary">صورة خلفية قسم الإحصائيات (Parallax Background)</p>
                {draft.story.statsBgImage && (
                  <img src={draft.story.statsBgImage} alt="Stats Bg" className="h-24 w-full object-cover rounded-md mb-3 border border-white/10" />
                )}
                <input type="file" accept="image/*" onChange={(e) => handleBgUpload(e, "story.statsBgImage")} className="text-sm" />
              </div>

              <div className="p-4 border border-white/10 rounded-xl bg-white/5">
                <p className="text-sm font-semibold mb-2 text-primary">صورة خلفية قسم خطوتك التالية (Parallax Background)</p>
                {draft.contact?.contactBgImage && (
                  <img src={draft.contact.contactBgImage} alt="Contact Bg" className="h-24 w-full object-cover rounded-md mb-3 border border-white/10" />
                )}
                <input type="file" accept="image/*" onChange={(e) => handleBgUpload(e, "contact.contactBgImage")} className="text-sm" />
              </div>
            </div>
`;

c = c.replace(
  '              onDelete={(id) => removeHeroSlide(parseInt(id, 10))}\n              />\n            </div>\n          )}',
  '              onDelete={(id) => removeHeroSlide(parseInt(id, 10))}\n              />\n' + heroUploaders + '\n            </div>\n          )}'
);

fs.writeFileSync('src/components/admin/GeneralSettingsPanel.tsx', c);
console.log('done');

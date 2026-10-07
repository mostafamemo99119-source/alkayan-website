import re

file_path = r'c:\Users\user\Desktop\New folder (5)\elkayan-luxe-space-main\src\components\admin\GeneralSettingsPanel.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

hero_sec = re.search(r'\{/\* ── Hero ── \*/\}(.*?)(?=\{/\* ── Story ── \*/\})', content, re.DOTALL).group(0)
story_sec = re.search(r'\{/\* ── Story ── \*/\}(.*?)(?=\{/\* ── Features ── \*/\})', content, re.DOTALL).group(0)
features_sec = re.search(r'\{/\* ── Features ── \*/\}(.*?)(?=\{/\* ── Contact CTA ── \*/\})', content, re.DOTALL).group(0)
contact_sec = re.search(r'\{/\* ── Contact CTA ── \*/\}(.*?)(?=\{/\* ── Spaces Page ── \*/\})', content, re.DOTALL).group(0)
spaces_sec = re.search(r'\{/\* ── Spaces Page ── \*/\}(.*?)(?=\{/\* ── Testimonials ── \*/\})', content, re.DOTALL).group(0)
testi_sec = re.search(r'\{/\* ── Testimonials ── \*/\}(.*?)(?=\{/\* ── SEO & Branding ── \*/\})', content, re.DOTALL).group(0)
seo_sec = re.search(r'\{/\* ── SEO & Branding ── \*/\}(.*?)(?=\{/\* ── Socials & Hours ── \*/\})', content, re.DOTALL).group(0)
social_sec = re.search(r'\{/\* ── Socials & Hours ── \*/\}(.*?)(?=\{/\* ── Footer ── \*/\})', content, re.DOTALL).group(0)
footer_sec = re.search(r'\{/\* ── Footer ── \*/\}(.*?)(?=\{/\* ── Save Button ── \*/\})', content, re.DOTALL).group(0)

# We already added helper text to hero_sec via replace_file_content! Let's check if it exists:
if "المقاس المفضل: 1920x1080" not in hero_sec:
    hero_sec = hero_sec.replace(
        '<span className="mb-2 block text-xs font-semibold text-muted-foreground">صور السلايدر (Hero Slider)</span>',
        '<span className="mb-1 block text-sm font-semibold text-primary">صور السلايدر (Hero Slider)</span><span className="mb-3 block text-xs text-muted-foreground">المقاس المفضل: 1920x1080 بيكسل - نسبة 16:9</span>'
    )

story_sec = story_sec.replace(
    'صورة قسم الكيان (حالياً: {draft.story.image || "لم تُحدَّد"})',
    'صورة قسم الكيان (حالياً: {draft.story.image || "لم تُحدَّد"})</span><span className="mb-3 block text-xs font-normal text-muted-foreground">المقاس المفضل: 1200x800 بيكسل - نسبة 3:2'
)

seo_sec = seo_sec.replace(
    'رابط أيقونة المتصفح (Favicon URL)" name="seo.favicon"',
    'رابط اللوجو/العلامة المائية (المقاس المفضل: 1000x1000 بيكسل - PNG شفافة)" name="seo.favicon"'
)

tabs_ui = f'''  return (
    <div className="space-y-6 flex flex-col h-full">
      
      {{/* ── Tabs Navigation ── */}}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        <Button variant={{activeTab === "seo" ? "default" : "outline"}} onClick={{() => setActiveTab("seo")}}>الهوية والسيو</Button>
        <Button variant={{activeTab === "hero" ? "default" : "outline"}} onClick={{() => setActiveTab("hero")}}>الهيرو والسلايدر</Button>
        <Button variant={{activeTab === "story" ? "default" : "outline"}} onClick={{() => setActiveTab("story")}}>الفيديو وعن الكيان</Button>
        <Button variant={{activeTab === "content" ? "default" : "outline"}} onClick={{() => setActiveTab("content")}}>آراء العملاء والمميزات</Button>
      </div>

      {{/* ── Tab Content ── */}}
      <div className="flex-1">
        
        {{activeTab === "seo" && (
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {seo_sec}
            {social_sec}
            {contact_sec}
            {footer_sec}
          </div>
        )}}

        {{activeTab === "hero" && (
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {hero_sec}
          </div>
        )}}

        {{activeTab === "story" && (
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {story_sec}
            {spaces_sec}
          </div>
        )}}

        {{activeTab === "content" && (
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {testi_sec}
            {features_sec}
          </div>
        )}}

      </div>

      {{/* ── Save Button ── */}}
      <div className="sticky bottom-0 mt-8 border-t border-border bg-background pb-2 pt-5">
        {{error && <p className="mb-3 text-sm text-destructive">{{error}}</p>}}
        {{success && <p className="mb-3 text-sm text-green-500">✓ تم الحفظ بنجاح!</p>}}
        <Button size="lg" className="w-full" onClick={{handleSave}} disabled={{saving}}>
          <Save className="size-4" />
          {{saving ? "جارٍ الحفظ..." : "حفظ الإعدادات العامة"}}
        </Button>
      </div>
    </div>
  );
'''

# Find the start of the return statement
start_idx = content.find('  return (\n    <div className="space-y-6 flex flex-col h-full">')
if start_idx == -1:
    start_idx = content.find('  return (\n    <div className="space-y-2">')

end_idx = content.find('  );\n}\n') + 4

new_content = content[:start_idx] + tabs_ui + content[end_idx:]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Update successful!")

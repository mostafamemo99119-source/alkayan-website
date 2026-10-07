const fs = require('fs');
let c = fs.readFileSync('src/components/admin/GeneralSettingsPanel.tsx', 'utf8').split('\n');

if (!c.some(l => l.includes('import { ContactSettingsPanel }'))) {
  const impIdx = c.findIndex(l => l.includes('import { ImageManager }'));
  if (impIdx !== -1) {
    c.splice(impIdx + 1, 0, 'import { ContactSettingsPanel } from "./ContactSettingsPanel";');
  }
}

const idx = c.findIndex(l => l.includes('activeTab === "content"'));
if (idx !== -1 && !c[idx + 1].includes('"contact"')) {
  c.splice(idx + 1, 0, '        <Button variant={activeTab === "contact" ? "default" : "outline"} onClick={() => setActiveTab("contact")}>التواصل والسوشيال</Button>');
}

const contactPanelCode = `        {activeTab === "contact" && (
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ContactSettingsPanel settings={settings} onSaved={onSaved} />
          </div>
        )}`;

// insert at the end of the content tab
const endIdx = c.lastIndexOf('      </div>');
if (endIdx !== -1 && !c.join('').includes('<ContactSettingsPanel')) {
  c.splice(endIdx, 0, contactPanelCode);
}

fs.writeFileSync('src/components/admin/GeneralSettingsPanel.tsx', c.join('\n'));
console.log('Script ran successfully');

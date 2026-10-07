const fs = require('fs');
let c = fs.readFileSync('src/components/admin/GeneralSettingsPanel.tsx', 'utf8');
const lines = c.split('\n');

const endIdx = lines.findIndex(l => l.includes('{/* ── Save Button ── */}'));
if (endIdx !== -1 && !c.includes('<ContactSettingsPanel')) {
  // insert before the closing </div> that comes before Save Button
  lines.splice(endIdx - 2, 0, `        {activeTab === "contact" && (
          <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <ContactSettingsPanel settings={settings} onSaved={onSaved} />
          </div>
        )}`);
}

fs.writeFileSync('src/components/admin/GeneralSettingsPanel.tsx', lines.join('\n'));
console.log('Done!');

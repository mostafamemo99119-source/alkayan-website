const fs = require('fs');
let c = fs.readFileSync('src/routes/__root.tsx', 'utf8');

if (!c.includes('import { Preloader }')) {
  c = c.replace('import { FloatingWhatsapp } from "@/components/floating-whatsapp";', 'import { FloatingWhatsapp } from "@/components/floating-whatsapp";\nimport { Preloader } from "@/components/preloader";\nimport { useLocation } from "@tanstack/react-router";');
}

if (!c.includes('const location = useLocation();')) {
  c = c.replace('function RootComponent() {\n  const { queryClient } = Route.useRouteContext();', 'function RootComponent() {\n  const { queryClient } = Route.useRouteContext();\n  const location = useLocation();');
}

if (!c.includes('<Preloader />')) {
  c = c.replace('      <Outlet />', '      <Preloader />\n      <div key={location.pathname} className="animate-in fade-in duration-500 fill-mode-both">\n        <Outlet />\n      </div>');
}

fs.writeFileSync('src/routes/__root.tsx', c);
console.log('done');

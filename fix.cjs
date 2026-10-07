const fs = require('fs');
let c = fs.readFileSync('src/routes/_authenticated/admin.tsx', 'utf8');

c = c.replace(
  /const \{ data = \[\], isLoading \} = useQuery\(\{[\s\S]*?const siteSettings: SiteContent = siteSettingsData \?\? defaultContent;/m,
  `const { data = [], isLoading: spacesLoading } = useQuery({
    queryKey: ["admin-spaces"],
    queryFn: () => fetchSpaces(true),
  });

  const { data: siteSettingsData, isLoading: settingsLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: fetchSiteSettings,
    staleTime: 5 * 60 * 1000,
  });

  const siteSettings: SiteContent = siteSettingsData ?? defaultContent;

  const isLoading = spacesLoading || settingsLoading;`
);

fs.writeFileSync('src/routes/_authenticated/admin.tsx', c);
console.log('Done');

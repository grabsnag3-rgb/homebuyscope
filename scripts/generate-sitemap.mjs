import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const siteKey = process.env.VITE_SITE_KEY || 'homebuyscope';
const siteUrl = 'https://www.homebuyscope.com';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const { data: pages, error } = await supabase
  .from('page_assemblies')
  .select('slug, updated_at')
  .eq('site_key', siteKey)
  .eq('status', 'published')
  .order('created_at', { ascending: true });

if (error) {
  throw error;
}

const urls = [
  {
    loc: `${siteUrl}/`,
    changefreq: 'weekly',
    priority: '1.0',
  },
  ...(pages || []).map((page) => ({
    loc: `${siteUrl}/p/${page.slug}`,
    changefreq: 'monthly',
    priority: '0.8',
    lastmod: page.updated_at?.slice(0, 10),
  })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((url) => `  <url>
    <loc>${url.loc}</loc>${url.lastmod ? `
    <lastmod>${url.lastmod}</lastmod>` : ''}
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`)
  .join('\n')}
</urlset>
`;

const publicDir = path.resolve('public');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);

console.log(`Generated sitemap.xml with ${urls.length} URLs`);
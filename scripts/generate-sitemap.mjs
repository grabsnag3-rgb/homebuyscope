import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

function loadDotEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local');

  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) continue;

    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=').trim();

    if (!process.env[key]) {
      process.env[key] = value.replace(/^["']|["']$/g, '');
    }
  }
}

function escapeXml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function formatDate(value) {
  if (!value) return new Date().toISOString().slice(0, 10);
  return new Date(value).toISOString().slice(0, 10);
}

loadDotEnvLocal();

const siteKey = process.env.VITE_SITE_KEY;
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!siteKey) {
  throw new Error('Missing VITE_SITE_KEY');
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const { data: siteRow, error: siteError } = await supabase
  .from('sites')
  .select('canonical_host')
  .eq('site_key', siteKey)
  .single();

if (siteError) {
  throw siteError;
}

const canonicalHost = siteRow?.canonical_host;

if (!canonicalHost) {
  throw new Error(`Missing canonical_host for site_key: ${siteKey}`);
}

const { data: pages, error: pageError } = await supabase
  .from('page_assemblies')
  .select('canonical_url, updated_at')
  .eq('site_key', siteKey)
  .eq('status', 'published')
  .eq('exposure_state', 'exposed')
  .in('url_role', ['standalone_decision', 'hub', 'tool', 'landing'])
  .is('canonical_target_url', null)
  .not('canonical_url', 'is', null)
  .order('updated_at', { ascending: false });

if (pageError) {
  throw pageError;
}

const urls = [
  {
    loc: canonicalHost,
    lastmod: new Date().toISOString(),
    changefreq: 'weekly',
    priority: '1.0',
  },
  ...(pages || []).map((page) => ({
    loc: page.canonical_url,
    lastmod: page.updated_at,
    changefreq: 'monthly',
    priority: '0.8',
  })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${formatDate(url.lastmod)}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

fs.mkdirSync(path.resolve(process.cwd(), 'public'), { recursive: true });
fs.writeFileSync(path.resolve(process.cwd(), 'public/sitemap.xml'), xml);

console.log(
  `Generated sitemap for ${siteKey}: ${urls.length} total URLs (${pages?.length || 0} exposed page URLs)`
);
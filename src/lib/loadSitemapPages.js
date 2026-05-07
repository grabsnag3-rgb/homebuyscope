import { supabase } from './supabase';

export async function loadSitemapPages() {
  const siteKey = import.meta.env.VITE_SITE_KEY;

  const { data, error } = await supabase
    .from('page_assemblies')
    .select('canonical_url, updated_at')
    .eq('site_key', siteKey)
    .eq('status', 'published')
    .not('canonical_url', 'is', null)
    .order('updated_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}
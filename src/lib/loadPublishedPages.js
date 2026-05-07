import { supabase } from './supabase';

export async function loadPublishedPages() {
  const siteKey = import.meta.env.VITE_SITE_KEY;

  const { data, error } = await supabase
    .from('page_assemblies')
    .select('slug, title, seo_description, updated_at')
    .eq('site_key', siteKey)
    .eq('status', 'published')
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
}
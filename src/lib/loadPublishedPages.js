import { supabase } from './supabase';

export async function loadPublishedPages() {
  const siteKey = import.meta.env.VITE_SITE_KEY;

  console.log('[loadPublishedPages] VITE_SITE_KEY:', siteKey);

  const { data, error } = await supabase
    .from('page_assemblies')
    .select('slug, title, seo_description, updated_at')
    .eq('site_key', siteKey)
    .eq('status', 'published')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[loadPublishedPages] Supabase error:', error);
    throw error;
  }

  console.log('[loadPublishedPages] rows:', data?.length, data);

  return (data || []).map((page) => ({
    ...page,
    cluster_key: 'decision_guides',
  }));
}
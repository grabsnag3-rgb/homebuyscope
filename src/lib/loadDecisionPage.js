import { supabase } from './supabase';

export async function loadDecisionPage(slug) {
  const siteKey = import.meta.env.VITE_SITE_KEY;

  const { data: page, error: pageError } = await supabase
    .from('page_assemblies')
    .select('*')
    .eq('site_key', siteKey)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (pageError || !page) {
    return null;
  }

  const { data: blocks, error: blocksError } = await supabase
    .from('content_blocks')
    .select('*')
    .eq('decision_record_id', page.decision_record_id)
    .eq('status', 'active')
    .order('sort_order', { ascending: true });

  if (blocksError) {
    throw blocksError;
  }

  return { page, blocks };
}
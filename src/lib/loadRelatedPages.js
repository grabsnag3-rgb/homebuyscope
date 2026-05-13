import { supabase } from "./supabase";

export async function loadRelatedPages(fromDecisionRecordId, limit = 6) {
  const siteKey = import.meta.env.VITE_SITE_KEY;

  const { data, error } = await supabase
    .from("public_related_decisions")
    .select("slug, title, seo_description, edge_type, reason, confidence_score")
    .eq("site_key", siteKey)
    .eq("from_decision_record_id", fromDecisionRecordId)
    .order("confidence_score", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data || [];
}
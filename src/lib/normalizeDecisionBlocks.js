const ZONE_BY_BLOCK_TYPE = {
  quick_call: "decision",
  what_changes_call: "conditions",

  risk_signals: "evidence",
  proof_needed: "evidence",
  walk_away_triggers: "evidence",

  next_move: "action",
  checklist: "action",
  tool_cta: "action",

  disclaimer: "legal",
};

const LABEL_BY_BLOCK_TYPE = {
  quick_call: "The call",
  what_changes_call: "What changes the call",
  risk_signals: "Risk signals",
  proof_needed: "Proof needed",
  walk_away_triggers: "Walk-away triggers",
  next_move: "Next move",
  checklist: "Checklist",
  tool_cta: "Decision tool",
  disclaimer: "Important note",
};

function normalizePayload(payload) {
  if (!payload) return { text: "", items: [] };

  if (typeof payload === "string") {
    return { text: payload, items: [] };
  }

  return {
    title: payload.title || payload.heading || "",
    text: payload.text || payload.summary || payload.body || payload.answer || "",
    items: Array.isArray(payload.items)
      ? payload.items
      : Array.isArray(payload.checklist)
        ? payload.checklist
        : Array.isArray(payload.points)
          ? payload.points
          : [],
    ctaLabel: payload.cta_label || payload.button_text || "",
    ctaHref: payload.cta_href || payload.url || "",
  };
}

export function normalizeDecisionBlocks(blocks = []) {
  const zones = {
    decision: [],
    conditions: [],
    evidence: [],
    action: [],
    legal: [],
    other: [],
  };

  for (const block of blocks) {
    const zone = ZONE_BY_BLOCK_TYPE[block.block_type] || "other";
    const payload = normalizePayload(block.payload);

    zones[zone].push({
      id: block.id,
      type: block.block_type,
      label: LABEL_BY_BLOCK_TYPE[block.block_type] || block.block_type,
      sortOrder: block.sort_order ?? 999,
      ...payload,
    });
  }

  for (const zone of Object.keys(zones)) {
    zones[zone].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  return zones;
}

export function getPrimaryText(zones, zoneName) {
  const block = zones?.[zoneName]?.find((item) => item.text);
  return block?.text || "";
}
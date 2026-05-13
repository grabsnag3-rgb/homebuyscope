const repairscope = {
  siteKey: 'repairscope',
  name: 'RepairScope',
  shortName: 'RepairScope',
  verticalLabel: 'repair vs replace decisions',
  canonicalHost: 'https://repairscope.com',
  themeClass: 'theme-repair',

  home: {
    eyebrow: 'Repair or replace decision support',
    headline: 'Decide whether repair or replacement makes more sense.',
    subhead:
      'Compare repair cost, age, repeat failures, warranty status, urgency, and replacement timing before spending.',
  },

  labels: {
    quick_call: 'Quick call',
    what_changes_call: 'What changes the answer',
    risk_signals: 'Risk signals',
    proof_needed: 'Proof you need',
    next_move: 'Next move',
    checklist: 'Checklist',
    disclaimer: 'Important note',
    related: 'Related repair decisions',
  },

  clusters: {
    appliance_repair_replace: 'Appliance repair or replace',
    hvac_repair_replace: 'HVAC repair or replace',
    water_heater_repair_replace: 'Water heater decisions',
    roof_repair_replace: 'Roof repair or replace',
    car_repair_replace: 'Car repair or replace',
    phone_laptop_repair_replace: 'Phone and laptop repair',
  },

  disclaimer:
    'This is general educational decision support, not contractor, safety, legal, or professional advice.',
};

export default repairscope;
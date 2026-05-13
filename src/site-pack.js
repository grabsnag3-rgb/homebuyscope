import homebuyscope from './sites/homebuyscope/site';
import autobuyscope from './sites/autobuyscope/site';
import repairscope from './sites/repairscope/site';

import './sites/homebuyscope/theme.css';
import './sites/autobuyscope/theme.css';
import './sites/repairscope/theme.css';

const SITE_PACKS = {
  homebuyscope,
  autobuyscope,
  repairscope,
};

const siteKey = import.meta.env.VITE_SITE_KEY || 'homebuyscope';

export const site =
  SITE_PACKS[siteKey] || {
    siteKey,
    name: 'DecisionScope',
    shortName: 'DecisionScope',
    verticalLabel: 'decision guides',
    canonicalHost: '',
    themeClass: 'theme-default',

    home: {
      eyebrow: 'Decision support',
      headline: 'Make the next decision clearer.',
      subhead:
        'Use structured decision blocks to understand risks, proof, and next moves.',
    },

    labels: {
      quick_call: 'Quick call',
      what_changes_call: 'What changes the answer',
      risk_signals: 'Risk signals',
      proof_needed: 'Proof you need',
      next_move: 'Next move',
      checklist: 'Checklist',
      disclaimer: 'Important note',
      related: 'Related decisions',
    },

    clusters: {},

    disclaimer:
      'This is general educational decision support and should not replace professional advice.',
  };

export function getClusterLabel(clusterKey) {
  if (!clusterKey) return 'Decision guides';

  return (
    site.clusters?.[clusterKey] ||
    String(clusterKey)
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
}
# HomeBuyScope V2 Checkpoint

## Clean V2 cohort confirmed

Date: 2026-05-07

Status:
- 7 scouts generated
- 7 page_assemblies published
- 7 matching decision_records
- 9 active content_blocks per page
- Local frontend renders all pages

## Working pipeline

Approved scout
→ n8n model generation
→ Parse JSON with current Split In Batches item
→ save_scout_asset(input)
→ published page_assembly
→ frontend renders /p/:slug

## Do not reintroduce

- Separate Insert Decision Record node
- Separate Insert Content Blocks node
- Separate Insert Page Assembly node
- Separate Update Scout node
- Parse JSON using `.first()` or stale item references

## Current stable cohort

- ask-for-repair-credit-after-inspection
- walk-away-after-bad-home-inspection
- repair-credit-vs-seller-repair-after-inspection
- seller-refuses-repairs-after-inspection
- get-contractor-estimate-before-repair-credit
- roof-issue-repair-credit-after-inspection
- request-inspection-extension-after-inspection
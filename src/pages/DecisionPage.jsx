import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { loadDecisionPage } from "../lib/loadDecisionPage";
import {
  normalizeDecisionBlocks,
  getPrimaryText,
} from "../lib/normalizeDecisionBlocks";
import { loadRelatedPages } from "../lib/loadRelatedPages";
import { site } from "../site-pack";
import "./DecisionPage.css";

function BlockCard({ block, variant = "default" }) {
  const hasItems = Array.isArray(block.items) && block.items.length > 0;
  const label = site.labels?.[block.type] || block.label || block.type;

  return (
    <section className={`decision-card decision-card--${variant}`}>
      <div className="decision-card__eyebrow">{label}</div>

      {block.title ? <h3>{block.title}</h3> : null}

      {block.text ? <p>{block.text}</p> : null}

      {hasItems ? (
        <ul>
          {block.items.map((item, index) => (
            <li key={`${block.type}-${index}`}>
              {typeof item === "string"
                ? item
                : item.text || item.label || JSON.stringify(item)}
            </li>
          ))}
        </ul>
      ) : null}

      {block.ctaLabel && block.ctaHref ? (
        <a className="decision-button" href={block.ctaHref}>
          {block.ctaLabel}
        </a>
      ) : null}
    </section>
  );
}

function Zone({ title, subtitle, blocks, variant }) {
  if (!blocks?.length) return null;

  return (
    <section className="decision-zone">
      <div className="decision-zone__header">
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>

      <div className="decision-zone__grid">
        {blocks.map((block) => (
          <BlockCard key={block.id || block.type} block={block} variant={variant} />
        ))}
      </div>
    </section>
  );
}

function RelatedDecisions({ pages }) {
  if (!pages?.length) return null;

  return (
    <section className="decision-related">
      <div className="decision-zone__header">
        <h2>{site.labels?.related || "Related decisions"}</h2>
        <p>Keep pressure-testing nearby decisions before you commit.</p>
      </div>

      <div className="decision-related__grid">
        {pages.map((page) => (
          <Link className="decision-related__card" key={page.slug} to={`/p/${page.slug}`}>
            <h3>{page.title}</h3>
            {page.seo_description ? <p>{page.seo_description}</p> : null}
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function DecisionPage() {
  const { slug } = useParams();

  const [state, setState] = useState({
    loading: true,
    page: null,
    blocks: [],
    relatedPages: [],
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setState((current) => ({
          ...current,
          loading: true,
          error: null,
        }));

        const result = await loadDecisionPage(slug);

        if (!result) {
          if (!cancelled) {
            setState({
              loading: false,
              page: null,
              blocks: [],
              relatedPages: [],
              error: "not_found",
            });
          }
          return;
        }

        const relatedPages = result.page?.decision_record_id
          ? await loadRelatedPages(result.page.decision_record_id, 6)
          : [];

        if (cancelled) return;

        setState({
          loading: false,
          page: result.page,
          blocks: result.blocks || [],
          relatedPages: relatedPages || [],
          error: null,
        });
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setState({
            loading: false,
            page: null,
            blocks: [],
            relatedPages: [],
            error: "load_failed",
          });
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const zones = useMemo(
    () => normalizeDecisionBlocks(state.blocks),
    [state.blocks]
  );

  useEffect(() => {
    if (!state.page) return;

    const title = state.page.title || `${site.name} Decision Guide`;
    const description =
      state.page.seo_description ||
      `A structured ${site.name} decision guide.`;

    document.title = `${title} | ${site.name}`;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", description);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }

    const canonicalHref =
      state.page.canonical_url ||
      (site.canonicalHost ? `${site.canonicalHost}/p/${slug}` : `/p/${slug}`);

    canonical.setAttribute("href", canonicalHref);
  }, [state.page, slug]);

  if (state.loading) {
    return (
      <main className="decision-shell">
        <p className="decision-muted">Loading decision guide…</p>
      </main>
    );
  }

  if (state.error || !state.page) {
    return (
      <main className="decision-shell">
        <Link className="decision-back" to="/">
          ← Back to {site.name}
        </Link>
        <h1>Decision guide not found</h1>
        <p className="decision-muted">
          This {site.name} page may have moved or is not published yet.
        </p>
      </main>
    );
  }

  const primaryCall = getPrimaryText(zones, "decision");

  return (
    <main className="decision-shell">
      <Link className="decision-back" to="/">
        ← Back to {site.name}
      </Link>

      <header className="decision-hero">
        <div className="decision-hero__label">
          {site.decisionEyebrow || site.labels?.decision_guide || "Decision guide"}
        </div>

        <h1>{state.page.title}</h1>

        {state.page.seo_description ? (
          <p className="decision-hero__dek">{state.page.seo_description}</p>
        ) : null}

        {primaryCall ? (
          <div className="decision-hero__call">
            <span>{site.labels?.quick_call || "Quick call"}</span>
            <p>{primaryCall}</p>
          </div>
        ) : null}
      </header>

      <Zone
        title="Decision"
        subtitle="Start with the practical call before getting buried in details."
        blocks={zones.decision.filter((block) => block.type !== "quick_call")}
        variant="strong"
      />

      <Zone
        title={site.labels?.what_changes_call || "What changes the answer"}
        subtitle="These are the conditions that can flip the decision."
        blocks={zones.conditions}
        variant="default"
      />

      <Zone
        title="Evidence and risk"
        subtitle="Use this section to separate a real issue from a guess."
        blocks={zones.evidence}
        variant="warning"
      />

      <Zone
        title={site.labels?.next_move || "Next move"}
        subtitle="Turn the decision into a concrete action."
        blocks={zones.action}
        variant="action"
      />

      <RelatedDecisions pages={state.relatedPages} />

      {zones.legal?.length ? (
        <section className="decision-legal">
          {zones.legal.map((block) => (
            <p key={block.id || block.type}>{block.text}</p>
          ))}
        </section>
      ) : (
        <section className="decision-legal">
          <p>{site.disclaimer}</p>
        </section>
      )}
    </main>
  );
}
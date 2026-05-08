import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { loadDecisionPage } from "../lib/loadDecisionPage";
import {
  normalizeDecisionBlocks,
  getPrimaryText,
} from "../lib/normalizeDecisionBlocks";
import "./DecisionPage.css";

function BlockCard({ block, variant = "default" }) {
  const hasItems = Array.isArray(block.items) && block.items.length > 0;

  return (
    <section className={`decision-card decision-card--${variant}`}>
      <div className="decision-card__eyebrow">{block.label}</div>

      {block.title ? <h3>{block.title}</h3> : null}

      {block.text ? <p>{block.text}</p> : null}

      {hasItems ? (
        <ul>
          {block.items.map((item, index) => (
            <li key={`${block.type}-${index}`}>
              {typeof item === "string" ? item : item.text || item.label || JSON.stringify(item)}
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

export default function DecisionPage() {
  const { slug } = useParams();
  const [state, setState] = useState({
    loading: true,
    page: null,
    blocks: [],
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setState((current) => ({ ...current, loading: true, error: null }));

        const result = await loadDecisionPage(slug);

        if (cancelled) return;

        if (!result) {
          setState({
            loading: false,
            page: null,
            blocks: [],
            error: "not_found",
          });
          return;
        }

        setState({
          loading: false,
          page: result.page,
          blocks: result.blocks || [],
          error: null,
        });
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setState({
            loading: false,
            page: null,
            blocks: [],
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

    const title = state.page.title || "HomeBuyScope Decision Guide";
    const description =
      state.page.seo_description ||
      "A structured HomeBuyScope decision guide for home buyers.";

    document.title = `${title} | HomeBuyScope`;

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
    canonical.setAttribute("href", `https://www.homebuyscope.com/p/${slug}`);
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
          ← Back to HomeBuyScope
        </Link>
        <h1>Decision guide not found</h1>
        <p className="decision-muted">
          This HomeBuyScope page may have moved or is not published yet.
        </p>
      </main>
    );
  }

  const primaryCall = getPrimaryText(zones, "decision");

  return (
    <main className="decision-shell">
      <Link className="decision-back" to="/">
        ← Back to HomeBuyScope
      </Link>

      <header className="decision-hero">
        <div className="decision-hero__label">Home buyer decision guide</div>
        <h1>{state.page.title}</h1>

        {state.page.seo_description ? (
          <p className="decision-hero__dek">{state.page.seo_description}</p>
        ) : null}

        {primaryCall ? (
          <div className="decision-hero__call">
            <span>The short call</span>
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
        title="What changes the answer"
        subtitle="These are the conditions that can flip the decision."
        blocks={zones.conditions}
        variant="default"
      />

      <Zone
        title="Evidence and risk"
        subtitle="Use this section to separate a real issue from a negotiation guess."
        blocks={zones.evidence}
        variant="warning"
      />

      <Zone
        title="Next move"
        subtitle="Turn the decision into a concrete action."
        blocks={zones.action}
        variant="action"
      />

      {zones.legal?.length ? (
        <section className="decision-legal">
          {zones.legal.map((block) => (
            <p key={block.id || block.type}>{block.text}</p>
          ))}
        </section>
      ) : null}
    </main>
  );
}
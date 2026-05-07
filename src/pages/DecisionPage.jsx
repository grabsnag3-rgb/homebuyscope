import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { loadDecisionPage } from '../lib/loadDecisionPage';

function Block({ block }) {
  const payload = block.payload || {};

  if (block.block_type === 'tool_cta') {
    return (
      <section className="block cta">
        <h2>{block.title}</h2>
        <p>{payload.text}</p>
        <a href={payload.cta_url}>{payload.cta_label}</a>
      </section>
    );
  }

  if (Array.isArray(payload.items)) {
    return (
      <section className="block">
        <h2>{block.title}</h2>
        <ul>
          {payload.items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section className="block">
      <h2>{block.title}</h2>
      <p>{payload.text}</p>
    </section>
  );
}

export default function DecisionPage() {
  const { slug } = useParams();
  const [state, setState] = useState({
    loading: true,
    page: null,
    blocks: [],
    error: null
  });

  useEffect(() => {
    let alive = true;

    loadDecisionPage(slug)
      .then((result) => {
        if (!alive) return;

        if (!result) {
          setState({ loading: false, page: null, blocks: [], error: null });
          return;
        }

        setState({
          loading: false,
          page: result.page,
          blocks: result.blocks,
          error: null
        });

        document.title = result.page.seo_title || result.page.title;
      })
      .catch((error) => {
        console.error(error);
        if (!alive) return;
        setState({ loading: false, page: null, blocks: [], error });
      });

    return () => {
      alive = false;
    };
  }, [slug]);

  if (state.loading) {
    return <main className="page">Loading...</main>;
  }

  if (state.error) {
    return <main className="page">Error loading page.</main>;
  }

  if (!state.page) {
    return <main className="page">Not found.</main>;
  }

  return (
    <main className="page">
      <header className="hero">
        <p className="eyebrow">{import.meta.env.VITE_SITE_NAME}</p>
        <h1>{state.page.title}</h1>
        {state.page.seo_description && <p>{state.page.seo_description}</p>}
      </header>

      <div className="blocks">
        {state.blocks.map((block) => (
          <Block key={block.id} block={block} />
        ))}
      </div>
    </main>
  );
}
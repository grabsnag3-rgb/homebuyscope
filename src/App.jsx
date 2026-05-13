import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import DecisionPage from './pages/DecisionPage';
import { loadPublishedPages } from './lib/loadPublishedPages';
import { site, getClusterLabel } from './site-pack';
import './App.css';

function groupPagesByCluster(pages) {
  return pages.reduce((groups, page) => {
    const key = page.cluster_key || 'decision_guides';
    if (!groups[key]) groups[key] = [];
    groups[key].push(page);
    return groups;
  }, {});
}

function Home() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    loadPublishedPages()
      .then((rows) => {
        console.log('[Home] loaded pages:', rows);
        setPages(rows || []);
      })
      .catch((error) => {
        console.error('[Home] loadPublishedPages error:', error);
        setLoadError(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const groupedPages = groupPagesByCluster(pages);

  return (
    <main className="page">
      <header className="hero">
        <p className="eyebrow">{site.home.eyebrow}</p>
        <h1>{site.home.headline}</h1>
        <p>{site.home.subhead}</p>
      </header>

      <section className="home-section">
        <div className="section-heading">
          <p className="eyebrow">{site.verticalLabel}</p>
          <h2>Browse decisions</h2>

          <p style={{ color: 'var(--color-muted)' }}>
            {loading && 'Loading pages...'}
            {!loading && !loadError && `Loaded ${pages.length} pages`}
          </p>

          {loadError && (
            <pre style={{ color: 'red', whiteSpace: 'pre-wrap' }}>
              {String(loadError.message || loadError)}
            </pre>
          )}
        </div>

        {Object.entries(groupedPages).map(([clusterKey, clusterPages]) => (
          <section className="cluster-section" key={clusterKey}>
            <div className="cluster-heading">
              <h3>{getClusterLabel(clusterKey)}</h3>
              <p>{clusterPages.length} decisions</p>
            </div>

            <div className="blocks">
              {clusterPages.map((page) => (
                <Link className="block page-card" key={page.slug} to={`/p/${page.slug}`}>
                  <h2>{page.title}</h2>
                  {page.seo_description && <p>{page.seo_description}</p>}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </section>
    </main>
  );
}

export default function App() {
  return (
    <div className={`app ${site.themeClass}`}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/p/:slug" element={<DecisionPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
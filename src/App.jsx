import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import DecisionPage from './pages/DecisionPage';
import { loadPublishedPages } from './lib/loadPublishedPages';
import './App.css';

function Home() {
  const [pages, setPages] = useState([]);

  useEffect(() => {
    loadPublishedPages()
      .then(setPages)
      .catch(console.error);
  }, []);

  return (
    <main className="page">
      <header className="hero">
        <p className="eyebrow">HomeBuyScope</p>
        <h1>Pressure-test the home-buying decision before you move forward.</h1>
        <p>
          Start with inspection decisions, repair credits, seller pushback,
          and walk-away signals.
        </p>
      </header>

      <section className="blocks">
        {pages.map((page) => (
          <Link className="block page-card" key={page.slug} to={`/p/${page.slug}`}>
            <h2>{page.title}</h2>
            {page.seo_description && <p>{page.seo_description}</p>}
          </Link>
        ))}
      </section>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/p/:slug" element={<DecisionPage />} />
      </Routes>
    </BrowserRouter>
  );
}
import React, { useEffect, useMemo, useState } from 'https://esm.sh/react@18.2.0';
import { createRoot } from 'https://esm.sh/react-dom@18.2.0/client';

const scriptBaseUrl = new URL('.', import.meta.url);
const toolsUrl = new URL('data/tools.json', scriptBaseUrl).toString();

const DEFAULT_HERO = {
  eyebrow: 'Tools Marketplace',
  title: '🛠️ Buy Tools & Bots',
  subtitle: 'Ready-made internal tools to save your team hours.',
  copy: 'Browse proven automations, Slack bots, and AI sidekicks your team can start using this week.',
};

const MARKETPLACE_SUBTITLE =
  'Every tool is delivered with onboarding, documentation, and live support.';

function isExternalLink(href) {
  return typeof href === 'string' && /^https?:/i.test(href);
}

function linkProps(href) {
  if (isExternalLink(href)) {
    return {
      target: '_blank',
      rel: 'noreferrer noopener',
    };
  }
  return {};
}

function resolveAssetPath(path) {
  if (!path) return '';
  if (/^(?:[a-z]+:|\/\/|data:)/i.test(path)) {
    return path;
  }
  return new URL(path.replace(/^\.?\/?/, ''), scriptBaseUrl).toString();
}

function parsePrice(priceString) {
  if (!priceString) return Number.POSITIVE_INFINITY;
  const numeric = Number(priceString.replace(/[^0-9.]/g, ''));
  return Number.isFinite(numeric) ? numeric : Number.POSITIVE_INFINITY;
}

function buildToolDetailUrl(slug) {
  if (!slug) return null;

  if (typeof window !== 'undefined' && window.location?.href) {
    try {
      const currentUrl = new URL(window.location.href);
      if (/\/tools(?:\/index\.html)?$/.test(currentUrl.pathname)) {
        const detailUrl = new URL(currentUrl.href);
        detailUrl.pathname = currentUrl.pathname.replace(/\/tools(?:\/index\.html)?$/, '/tool');
        detailUrl.search = '';
        detailUrl.hash = '';
        detailUrl.searchParams.set('slug', slug);
        return detailUrl.toString();
      }

      if (/tool(?:\.html)?$/.test(currentUrl.pathname)) {
        const detailUrl = new URL(currentUrl.href);
        detailUrl.search = '';
        detailUrl.hash = '';
        detailUrl.searchParams.set('slug', slug);
        return detailUrl.toString();
      }
    } catch (error) {
      console.error('Unable to resolve tool detail URL from location', error);
    }
  }

  const fallback = new URL('tool.html', scriptBaseUrl);
  fallback.searchParams.set('slug', slug);
  return fallback.toString();
}

async function loadTools() {
  const response = await fetch(toolsUrl);
  if (!response.ok) {
    throw new Error(`Failed to load tools: ${response.status}`);
  }
  return response.json();
}

function Header() {
  const logoSrc = resolveAssetPath('assets/tako-logo.svg');
  return (
    <header className="site-header">
      <div className="container nav">
        <div className="logo">
          <img src={logoSrc} alt="Tako logo" className="logo-icon" />
          <span className="logo-text">Tako</span>
        </div>
        <nav className="nav-links" aria-label="Main navigation">
          <a href="../index.html#hero">Home</a>
          <a href="." aria-current="page">
            Tools
          </a>
          <a href="../index.html#contact">Contact</a>
        </nav>
        <a
          className="cta-link"
          href="mailto:hello@takotools.com?subject=Tako%20Tools%20Marketplace"
          {...linkProps('mailto:hello@takotools.com?subject=Tako%20Tools%20Marketplace')}
        >
          Talk to Tako
        </a>
      </div>
    </header>
  );
}

function ToolsHero({ hero }) {
  return (
    <section className="tools-hero" id="tools-hero">
      <div className="container tools-hero__content">
        <p className="tools-hero__eyebrow">{hero.eyebrow}</p>
        <h1 className="tools-hero__title">{hero.title}</h1>
        <p className="tools-hero__subtitle">{hero.subtitle}</p>
        <p className="tools-hero__copy">{hero.copy}</p>
      </div>
    </section>
  );
}

function SortControl({ sort, onChange }) {
  return (
    <div className="tools-marketplace__controls" aria-label="Marketplace controls">
      <label htmlFor="sort-select" className="tools-marketplace__label">
        Sort
      </label>
      <select
        id="sort-select"
        className="tools-marketplace__select"
        value={sort}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="featured">Featured</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
      </select>
    </div>
  );
}

function MarketplaceCard({ tool }) {
  const imageSrc = resolveAssetPath(tool?.image);
  const primaryLink = tool?.checkout_url || tool?.link || '#contact';
  const primaryLabel = tool?.ctaText || (tool?.checkout_url ? 'Buy Now' : 'Learn More');
  const secondaryLink = tool?.secondaryCta?.link || (tool?.slug ? buildToolDetailUrl(tool.slug) : null);
  const secondaryLabel = tool?.secondaryCta?.text || (secondaryLink ? 'See features' : null);

  return (
    <article className="marketplace-card">
      {tool?.featured ? <span className="marketplace-card__badge">Featured</span> : null}
      <div className="marketplace-card__media">
        <img src={imageSrc} alt={tool?.title || 'Tool preview'} />
      </div>
      <div className="marketplace-card__content">
        <h3 className="marketplace-card__title">{tool?.title || 'Untitled tool'}</h3>
        {tool?.price ? <p className="marketplace-card__price">{tool.price}</p> : null}
        {tool?.description ? (
          <p className="marketplace-card__description">{tool.description}</p>
        ) : null}
        <div className="marketplace-card__actions">
          <a
            className="btn primary marketplace-card__cta"
            href={primaryLink}
            {...linkProps(primaryLink)}
          >
            {primaryLabel}
          </a>
          {secondaryLink && secondaryLabel ? (
            <a
              className="btn secondary marketplace-card__cta"
              href={secondaryLink}
              {...linkProps(secondaryLink)}
            >
              {secondaryLabel}
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function Marketplace({ sort, onSortChange, toolsState }) {
  const { status, items, error } = toolsState;

  const sortedTools = useMemo(() => {
    if (status !== 'ready') {
      return [];
    }

    if (sort === 'price-asc') {
      return [...items].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    }

    if (sort === 'price-desc') {
      return [...items].sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    }

    // Default ordering: featured items first, then the rest in original order
    return [...items].sort((a, b) => {
      if (a.featured === b.featured) return 0;
      return a.featured ? -1 : 1;
    });
  }, [items, sort, status]);

  return (
    <section className="tools-marketplace" aria-labelledby="marketplace-heading">
      <div className="container">
        <div className="tools-marketplace__header">
          <div>
            <h2 id="marketplace-heading">Shop the latest from Tako</h2>
            <p className="tools-marketplace__subtitle">{MARKETPLACE_SUBTITLE}</p>
          </div>
          <SortControl sort={sort} onChange={onSortChange} />
        </div>

        {status === 'loading' ? (
          <p className="tools-empty">Loading tools...</p>
        ) : null}

        {status === 'error' ? (
          <p className="tools-empty">
            {error?.message || "We're having trouble loading tools right now. Please refresh to try again."}
          </p>
        ) : null}

        {status === 'ready' && sortedTools.length === 0 ? (
          <p className="tools-empty">No tools are available right now. Check back soon!</p>
        ) : null}

        {sortedTools.length > 0 ? (
          <div className="marketplace-grid" aria-live="polite">
            {sortedTools.map((tool) => (
              <MarketplaceCard key={tool.slug || tool.title} tool={tool} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Footer() {
  const logoSrc = resolveAssetPath('assets/tako-logo.svg');
  return (
    <footer className="site-footer tools-footer">
      <div className="container footer-inner">
        <div className="logo footer-logo">
          <img src={logoSrc} alt="Tako logo" className="logo-icon" />
          <span className="logo-text">Tako</span>
        </div>
        <p className="footer-copy">
          Need something custom?{' '}
          <a href="mailto:hello@takotools.com" {...linkProps('mailto:hello@takotools.com')}>
            Email hello@takotools.com
          </a>
        </p>
      </div>
    </footer>
  );
}

function App() {
  const [toolsState, setToolsState] = useState({ status: 'loading', items: [], error: null });
  const [sort, setSort] = useState('featured');

  useEffect(() => {
    let cancelled = false;

    async function fetchTools() {
      try {
        const data = await loadTools();
        if (cancelled) return;
        const items = Array.isArray(data?.items) ? data.items : [];
        setToolsState({ status: 'ready', items, error: null });
      } catch (error) {
        if (cancelled) return;
        console.error(error);
        setToolsState({ status: 'error', items: [], error });
      }
    }

    fetchTools();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Header />
      <main>
        <ToolsHero hero={DEFAULT_HERO} />
        <Marketplace sort={sort} onSortChange={setSort} toolsState={toolsState} />
      </main>
      <Footer />
    </>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}

import React, { useEffect, useMemo, useState } from 'https://esm.sh/react@18.2.0';
import { createRoot } from 'https://esm.sh/react-dom@18.2.0/client';

const scriptBaseUrl = new URL('.', import.meta.url);
const toolsUrl = new URL('data/tools.json', scriptBaseUrl).toString();

const DEFAULT_CONTACT = {
  href: 'mailto:hello@takotools.com',
  label: 'Talk to Tako',
};

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
  return new URL(path, scriptBaseUrl).toString();
}

function getSlugFromLocation() {
  if (typeof window === 'undefined') {
    return null;
  }

  const currentUrl = new URL(window.location.href);
  const searchSlug = currentUrl.searchParams.get('slug');
  if (searchSlug) return searchSlug;

  const segments = window.location.pathname
    .replace(/index\.html$/, '')
    .split('/')
    .filter(Boolean);
  const toolsIndex = segments.indexOf('tools');
  if (toolsIndex !== -1 && segments.length > toolsIndex + 1) {
    const raw = segments[toolsIndex + 1];
    return raw.replace(/\.html$/, '');
  }
  return null;
}

function replaceUrlWithSlug(slug) {
  if (typeof window === 'undefined' || !slug) return;

  const currentUrl = new URL(window.location.href);
  const desiredPathname = window.location.pathname;

  let hasChanges = false;

  if (currentUrl.pathname !== desiredPathname) {
    currentUrl.pathname = desiredPathname;
    hasChanges = true;
  }

  if (currentUrl.searchParams.get('slug') !== slug) {
    currentUrl.searchParams.set('slug', slug);
    hasChanges = true;
  }

  if (hasChanges) {
    history.replaceState(null, '', currentUrl.toString());
  }
}

function buildToolDetailUrl(slug) {
  if (!slug) return null;

  if (typeof window !== 'undefined' && window.location?.href) {
    const detailUrl = new URL(window.location.href);
    detailUrl.search = '';
    detailUrl.hash = '';
    detailUrl.searchParams.set('slug', slug);
    return detailUrl.toString();
  }

  const fallback = new URL('tool.html', scriptBaseUrl);
  fallback.searchParams.set('slug', slug);
  return fallback.toString();
}

function Header({ navCta }) {
  const cta = navCta ?? DEFAULT_CONTACT;
  return (
    <header className="site-header">
      <div className="container nav">
        <div className="logo">
          <img src="assets/tako-logo.svg" alt="Tako logo" className="logo-icon" />
          <span className="logo-text">Tako</span>
        </div>
        <nav className="nav-links" aria-label="Main navigation">
          <a href="index.html#hero">Home</a>
          <a href="tools/" aria-current="page">
            Tools
          </a>
          <a href="index.html#contact">Contact</a>
        </nav>
        <a className="cta-link" id="detail-nav-cta" href={cta.href} {...linkProps(cta.href)}>
          {cta.label}
        </a>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="logo footer-logo">
          <img src="assets/tako-logo.svg" alt="Tako logo" className="logo-icon" />
          <span className="logo-text">Tako</span>
        </div>
        <p className="footer-copy">
          Need something custom? <a href="mailto:hello@takotools.com">Email hello@takotools.com</a>
        </p>
      </div>
    </footer>
  );
}

function HeroSection({ status, tool, primaryCta, secondaryCta }) {
  const tags = Array.isArray(tool?.tags) ? tool.tags : [];
  const hasTags = tags.length > 0;
  const summaryHtml = tool?.summary || tool?.description || '';
  const imageSource = tool?.image ? resolveAssetPath(tool.image) : '';
  return (
    <section className="tool-detail-hero" id="tool-hero">
      <div className="container tool-hero__inner">
        <a className="back-link" href="tools/">
          &larr; Back to all tools
        </a>
        <p className="tool-hero__tagline" id="tool-tags" hidden={!hasTags}>
          {hasTags &&
            tags.map((tag, index) => (
              <span key={`${tag}-${index}`} className="tool-tag">
                {tag}
              </span>
            ))}
        </p>
        <h1 className="tool-hero__title" id="tool-title">
          {status === 'loading' ? 'Loading...' : tool?.title || 'Tool'}
        </h1>
        <p
          className="tool-hero__summary"
          id="tool-summary"
          hidden={!summaryHtml}
          dangerouslySetInnerHTML={{ __html: summaryHtml }}
        />
        <div className="tool-hero__media" id="tool-media" hidden={!imageSource}>
          {imageSource && (
            <img id="tool-image" src={imageSource} alt={tool?.title ? `${tool.title} preview` : 'Tool visual'} />
          )}
        </div>
        <div className="tool-hero__actions">
          {primaryCta ? (
            <a className="btn primary" id="tool-primary-cta" href={primaryCta.href} {...linkProps(primaryCta.href)}>
              {primaryCta.label}
            </a>
          ) : null}
          {secondaryCta ? (
            <a className="btn secondary" id="tool-secondary-cta" href={secondaryCta.href} {...linkProps(secondaryCta.href)}>
              {secondaryCta.label}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection({ features }) {
  if (!Array.isArray(features) || features.length === 0) {
    return null;
  }
  return (
    <section className="tool-detail-section" id="tool-features">
      <div className="container">
        <h2 className="tool-section-title">🔧 What This Tool Can Do</h2>
        <div className="feature-grid" id="tool-feature-grid">
          {features.map((feature, index) => (
            <article key={feature.title || index} className="feature-card">
              {feature.icon ? (
                <span className="feature-card__icon" aria-hidden="true">
                  {feature.icon}
                </span>
              ) : null}
              <h3>{feature.title || 'Feature'}</h3>
              {feature.description ? (
                <p dangerouslySetInnerHTML={{ __html: feature.description }} />
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function StepsSection({ steps }) {
  if (!Array.isArray(steps) || steps.length === 0) {
    return null;
  }
  return (
    <section className="tool-detail-section" id="tool-how">
      <div className="container">
        <h2 className="tool-section-title">🧠 How It Works</h2>
        <ol className="tool-steps" id="tool-steps">
          {steps.map((step, index) => (
            <li key={index} className="tool-step">
              <span className="tool-step__number">{index + 1}</span>
              <div className="tool-step__content">
                {typeof step === 'string' ? (
                  <p dangerouslySetInnerHTML={{ __html: step }} />
                ) : (
                  <>
                    <h3>{step.title || `Step ${index + 1}`}</h3>
                    {step.description ? (
                      <p dangerouslySetInnerHTML={{ __html: step.description }} />
                    ) : null}
                  </>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function VideoSection({ videoUrl }) {
  if (!videoUrl) {
    return null;
  }
  return (
    <section className="tool-detail-section" id="tool-video">
      <div className="container">
        <div className="video-frame">
          <iframe
            id="tool-video-embed"
            src={videoUrl}
            title="Tool walkthrough video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}

function BenefitsSection({ benefits }) {
  if (!Array.isArray(benefits) || benefits.length === 0) {
    return null;
  }
  return (
    <section className="tool-detail-section" id="tool-benefits">
      <div className="container">
        <h2 className="tool-section-title">💡 Why Use This Tool?</h2>
        <ul className="benefit-list" id="tool-benefits-list">
          {benefits.map((benefit, index) => (
            <li key={index} dangerouslySetInnerHTML={{ __html: benefit }} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function PricingSection({ tool }) {
  const hasPricing = Boolean(tool?.price || tool?.checkout_url);
  if (!hasPricing) {
    return null;
  }

  const checkoutUrl = tool.checkout_url || tool.link || '#';
  const pricingLabel = tool.checkoutCtaText || tool.ctaText || 'Buy Now';
  const contactLink = tool.link || DEFAULT_CONTACT.href;

  return (
    <section className="tool-detail-section tool-pricing" id="pricing">
      <div className="container tool-pricing__inner">
        <div>
          <h2 className="tool-section-title">Pricing</h2>
          <p className="tool-pricing__price" id="tool-price">
            {tool.price || ''}
          </p>
          <p className="tool-pricing__support" id="tool-support">
            {tool.support_policy || ''}
          </p>
        </div>
        <div className="tool-pricing__actions">
          <a
            className="btn primary"
            id="tool-pricing-cta"
            href={checkoutUrl}
            {...linkProps(checkoutUrl)}
          >
            {pricingLabel}
          </a>
          <a
            className="btn secondary"
            id="tool-contact"
            href={contactLink}
            {...linkProps(contactLink)}
          >
            Talk to Tako
          </a>
        </div>
      </div>
    </section>
  );
}

function RelatedSection({ currentSlug, tools }) {
  if (!Array.isArray(tools) || tools.length === 0) {
    return null;
  }

  const related = tools.filter((tool) => tool.slug && tool.slug !== currentSlug).slice(0, 3);
  if (!related.length) {
    return null;
  }

  return (
    <section className="tool-detail-section tool-related" id="tool-related">
      <div className="container">
        <h2 className="tool-section-title">Related Tools</h2>
        <div className="related-grid" id="related-grid">
          {related.map((tool) => {
            const imageSource = resolveAssetPath(tool.image);
            return (
              <article key={tool.slug} className="related-card">
                {imageSource ? (
                  <img src={imageSource} alt={tool.title ? `${tool.title} preview` : 'Related tool'} />
                ) : null}
                <div className="related-card__content">
                  <h3>{tool.title || 'Tool'}</h3>
                  {tool.summary ? <p>{tool.summary}</p> : null}
                  <a className="btn secondary" href={buildToolDetailUrl(tool.slug)}>
                    See features
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ErrorSection() {
  return (
    <section className="tool-detail-section" id="tool-error">
      <div className="container">
        <div className="tool-error">
          <h1>Tool not found</h1>
          <p>We couldn&apos;t find that tool. It might be unpublished or the link is outdated.</p>
          <a className="btn primary" href="tools/">
            Browse all tools
          </a>
        </div>
      </div>
    </section>
  );
}

function PageLayout({ navCta, children }) {
  return (
    <>
      <Header navCta={navCta} />
      {children}
      <Footer />
    </>
  );
}

function ToolDetailPage() {
  const slug = useMemo(() => getSlugFromLocation(), []);
  const [state, setState] = useState(() => ({
    status: slug ? 'loading' : 'missing-slug',
    tool: null,
    tools: [],
  }));

  useEffect(() => {
    document.body.classList.add('tool-detail-page');
    return () => {
      document.body.classList.remove('tool-detail-page');
    };
  }, []);

  useEffect(() => {
    if (!slug) {
      return;
    }

    let cancelled = false;

    async function fetchTools() {
      try {
        const response = await fetch(toolsUrl);
        if (!response.ok) {
          throw new Error(`Failed to load tool data: ${response.status}`);
        }
        const data = await response.json();
        const items = Array.isArray(data?.items) ? data.items : [];
        const tool = items.find((item) => item.slug === slug) ?? null;

        if (!cancelled) {
          if (tool) {
            setState({ status: 'loaded', tool, tools: items });
          } else {
            setState({ status: 'not-found', tool: null, tools: items });
          }
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setState({ status: 'error', tool: null, tools: [] });
        }
      }
    }

    fetchTools();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (state.status === 'loaded' && slug && state.tool) {
      replaceUrlWithSlug(slug);
      document.title = state.tool.title ? `${state.tool.title} • Tako` : 'Tako Tool';
    } else if (state.status === 'loading') {
      document.title = 'Loading tool • Tako';
    } else if (state.status === 'not-found' || state.status === 'missing-slug') {
      document.title = 'Tool not found • Tako';
    } else if (state.status === 'error') {
      document.title = 'Error loading tool • Tako';
    }
  }, [slug, state]);

  const navCta = useMemo(() => {
    if (state.status === 'loaded' && state.tool) {
      if (state.tool.link) {
        return { href: state.tool.link, label: state.tool.ctaText || 'Talk to Tako' };
      }
      if (state.tool.checkout_url) {
        return { href: state.tool.checkout_url, label: state.tool.ctaText || 'Buy Now' };
      }
    }
    return DEFAULT_CONTACT;
  }, [state]);

  if (state.status === 'missing-slug' || state.status === 'not-found' || state.status === 'error') {
    return (
      <PageLayout navCta={navCta}>
        <main id="tool-detail" className="tool-detail" aria-live="polite">
          <ErrorSection />
        </main>
      </PageLayout>
    );
  }

  if (state.status === 'loading') {
    return (
      <PageLayout navCta={navCta}>
        <main id="tool-detail" className="tool-detail" aria-live="polite">
          <HeroSection status="loading" tool={null} primaryCta={null} secondaryCta={null} />
        </main>
      </PageLayout>
    );
  }

  const tool = state.tool;
  const tools = state.tools;

  const primaryCta = tool?.checkout_url
    ? {
        href: tool.checkout_url,
        label: tool.ctaText || 'Buy Now',
      }
    : null;

  const secondaryCta = {
    href: tool?.secondaryCta?.link || tool?.link || DEFAULT_CONTACT.href,
    label: tool?.secondaryCta?.text || 'Request setup',
  };

  return (
    <PageLayout navCta={navCta}>
      <main id="tool-detail" className="tool-detail" aria-live="polite">
        <HeroSection status="loaded" tool={tool} primaryCta={primaryCta} secondaryCta={secondaryCta} />
        <FeaturesSection features={tool?.features} />
        <StepsSection steps={tool?.how_it_works} />
        <VideoSection videoUrl={tool?.video_url} />
        <BenefitsSection benefits={tool?.benefits} />
        <PricingSection tool={tool} />
        <RelatedSection currentSlug={tool?.slug} tools={tools} />
      </main>
    </PageLayout>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<ToolDetailPage />);
}

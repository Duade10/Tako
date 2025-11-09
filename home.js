import React, { useEffect, useState } from 'https://esm.sh/react@18.2.0';
import { createRoot } from 'https://esm.sh/react-dom@18.2.0/client';

const scriptBaseUrl = new URL('.', import.meta.url);
const contentUrl = new URL('data/content.json', scriptBaseUrl).toString();
const toolsUrl = new URL('data/tools.json', scriptBaseUrl).toString();

const DEFAULT_HERO = {
  title: 'Internal Tools That Work Like Magic 🐙',
  subtitle: 'We build Slack bots, automations, and AI assistants so your team doesn\'t have to.',
  ctaText: 'Book a Free Demo',
  ctaLink: '#contact',
};

const DEFAULT_FOOTER_COPY = '© Tako. All rights reserved.';

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

async function loadJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status}`);
  }
  return response.json();
}

function resolveAssetPath(path) {
  if (!path) return '';
  if (/^(?:[a-z]+:|\/\/|data:)/i.test(path)) {
    return path;
  }
  return new URL(path.replace(/^\.?\/?/, ''), scriptBaseUrl).toString();
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

function Header({ hero }) {
  const ctaText = hero?.ctaText || DEFAULT_HERO.ctaText;
  const ctaLink = hero?.ctaLink || DEFAULT_HERO.ctaLink;
  const logoSrc = resolveAssetPath('assets/tako-logo.svg');

  return (
    <header className="site-header">
      <div className="container nav">
        <div className="logo">
          <img src={logoSrc} alt="Tako logo" className="logo-icon" />
          <span className="logo-text">Tako</span>
        </div>
        <nav className="nav-links" aria-label="Main navigation">
          <a href="#what-we-build">What We Build</a>
          <a href="#use-cases">Use Cases</a>
          <a href="tools/">Tools</a>
          <a href="#pricing">Pricing</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="cta-link" id="nav-cta" href={ctaLink} {...linkProps(ctaLink)}>
          {ctaText}
        </a>
      </div>
    </header>
  );
}

function HeroSection({ hero }) {
  const note = hero?.note;
  const ctaLink = hero?.ctaLink || DEFAULT_HERO.ctaLink;
  const ctaText = hero?.ctaText || DEFAULT_HERO.ctaText;
  const octopusSrc = resolveAssetPath('assets/octopus.svg');

  return (
    <section className="hero" id="hero">
      <div className="container hero-content">
        <div className="hero-text">
          <h1 id="hero-title">{hero?.title || DEFAULT_HERO.title}</h1>
          <p id="hero-subtitle">{hero?.subtitle || DEFAULT_HERO.subtitle}</p>
          <div className="hero-cta">
            <a id="hero-cta" className="btn primary" href={ctaLink} {...linkProps(ctaLink)}>
              {ctaText}
            </a>
            {note ? (
              <span className="hero-note" id="hero-note">
                {note}
              </span>
            ) : null}
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="octopus-illustration">
            <img src={octopusSrc} alt="Friendly octopus mascot" />
          </div>
          <div className="bubble bubble-one"></div>
          <div className="bubble bubble-two"></div>
        </div>
      </div>
    </section>
  );
}

function CapabilitiesSection({ capabilities }) {
  const items = Array.isArray(capabilities?.items) ? capabilities.items : [];

  return (
    <section className="section light" id="what-we-build">
      <div className="container">
        <h2 className="section-title">{capabilities?.title || 'What We Build'}</h2>
        <ul className="pill-list" aria-label="Capabilities">
          {items.map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function UseCasesSection({ useCases }) {
  const cards = Array.isArray(useCases?.cards) ? useCases.cards : [];

  return (
    <section className="section" id="use-cases">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{useCases?.title || 'Popular Use Cases'}</h2>
          {useCases?.subtitle ? <p className="section-subtitle">{useCases.subtitle}</p> : null}
        </div>
        <div className="card-grid" aria-live="polite">
          {cards.map((card, index) => (
            <article key={`${card.title}-${index}`} className="card">
              {card.icon ? (
                <span className="card-icon" aria-hidden="true">
                  {card.icon}
                </span>
              ) : null}
              <h3>{card.title || 'Untitled'}</h3>
              {card.description ? <p>{card.description}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function StepsSection({ howItWorks }) {
  const steps = Array.isArray(howItWorks?.steps) ? howItWorks.steps : [];

  return (
    <section className="section light" id="how-it-works">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{howItWorks?.title || 'How It Works'}</h2>
          {howItWorks?.subtitle ? <p className="section-subtitle">{howItWorks.subtitle}</p> : null}
        </div>
        <div className="stepper">
          {steps.map((step, index) => (
            <article key={`${step.title}-${index}`} className="step">
              <span className="step-number">{index + 1}</span>
              <h3>{step.title || `Step ${index + 1}`}</h3>
              {step.description ? <p>{step.description}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
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

function MarketplaceSection({ marketplace, toolsState }) {
  const { status, items, error } = toolsState;
  const subtitle = marketplace?.subtitle;

  return (
    <section className="section" id="tool-marketplace">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{marketplace?.title || 'Buy Tools & Bots'}</h2>
          {subtitle ? <p className="section-subtitle">{subtitle}</p> : null}
        </div>
        {status === 'loading' ? (
          <p className="tools-empty">Loading tools...</p>
        ) : null}
        {status === 'error' ? (
          <p className="tools-empty">
            {error?.message || "We're having trouble loading tools right now. Please refresh to try again."}
          </p>
        ) : null}
        {status === 'ready' && items.length === 0 ? (
          <p className="tools-empty">No tools are available right now. Check back soon!</p>
        ) : null}
        {items.length > 0 ? (
          <div className="card-grid tool-grid" aria-live="polite">
            {items.map((tool) => (
              <MarketplaceCard key={tool.slug || tool.title} tool={tool} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function PricingSection({ pricing }) {
  const tiers = Array.isArray(pricing?.tiers) ? pricing.tiers : [];

  return (
    <section className="section light" id="pricing">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{pricing?.title || 'Pricing'}</h2>
          {pricing?.subtitle ? <p className="section-subtitle">{pricing.subtitle}</p> : null}
        </div>
        <div className="pricing-grid">
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className={`pricing-card${tier.highlight ? ' highlight' : ''}`}
            >
              <h3>{tier.name}</h3>
              {tier.price ? <p className="pricing-price">{tier.price}</p> : null}
              {tier.description ? <p>{tier.description}</p> : null}
              {Array.isArray(tier.features) ? (
                <ul className="pricing-features">
                  {tier.features.map((feature, index) => (
                    <li key={`${tier.name}-feature-${index}`}>{feature}</li>
                  ))}
                </ul>
              ) : null}
              {tier.cta ? (
                <a className="btn primary" href={tier.cta.link || '#contact'} {...linkProps(tier.cta.link)}>
                  {tier.cta.text || 'Talk to us'}
                </a>
              ) : null}
            </article>
          ))}
        </div>
        {pricing?.note ? <p className="pricing-note">{pricing.note}</p> : null}
      </div>
    </section>
  );
}

function ContactSection({ footer }) {
  const contactSection = footer?.contactSection;
  const contactItems = Array.isArray(footer?.contact) ? footer.contact : [];
  const footerLinks = Array.isArray(footer?.links) ? footer.links : [];

  return (
    <section className="section" id="contact">
      <div className="container contact">
        <div className="contact-card">
          <h2>{contactSection?.title || 'Ready to talk to Tako?'}</h2>
          {contactSection?.copy ? <p>{contactSection.copy}</p> : null}
          <a
            className="btn primary"
            href={contactSection?.cta?.link || 'mailto:hello@takotools.com'}
            {...linkProps(contactSection?.cta?.link)}
          >
            {contactSection?.cta?.text || 'Book a Free Demo'}
          </a>
        </div>
        <div className="contact-details">
          <h3>Contact</h3>
          <ul>
            {contactItems.map((item, index) => (
              <li key={`${item.label}-${index}`}>
                <strong>{item.label}:</strong> {item.value}
              </li>
            ))}
          </ul>
          <h3>Links</h3>
          <ul className="footer-links">
            {footerLinks.map((link) => (
              <li key={link.label}>
                <a href={link.href || '#'} {...linkProps(link.href)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Footer({ footer }) {
  const copy = footer?.copy || DEFAULT_FOOTER_COPY;
  const logoSrc = resolveAssetPath('assets/tako-logo.svg');
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="logo footer-logo">
          <img src={logoSrc} alt="Tako logo" className="logo-icon" />
          <span className="logo-text">Tako</span>
        </div>
        <p className="footer-copy">{copy}</p>
      </div>
    </footer>
  );
}

function App() {
  const [contentState, setContentState] = useState({ status: 'loading', data: null, error: null });
  const [toolsState, setToolsState] = useState({ status: 'loading', items: [], error: null });

  useEffect(() => {
    let cancelled = false;

    async function fetchContent() {
      try {
        const data = await loadJson(contentUrl);
        if (cancelled) return;
        setContentState({ status: 'ready', data, error: null });
      } catch (error) {
        if (cancelled) return;
        console.error(error);
        setContentState({ status: 'error', data: null, error });
      }
    }

    async function fetchTools() {
      try {
        const data = await loadJson(toolsUrl);
        if (cancelled) return;
        const items = Array.isArray(data?.items) ? data.items : [];
        setToolsState({ status: 'ready', items, error: null });
      } catch (error) {
        if (cancelled) return;
        console.error(error);
        setToolsState({ status: 'error', items: [], error });
      }
    }

    fetchContent();
    fetchTools();

    return () => {
      cancelled = true;
    };
  }, []);

  const content = contentState.data || {};
  const hero = content.hero || DEFAULT_HERO;

  return (
    <>
      <Header hero={hero} />
      <main>
        <HeroSection hero={hero} />
        {contentState.status === 'error' ? (
          <section className="section">
            <div className="container">
              <p className="tools-empty" role="alert">
                {contentState.error?.message ||
                  "We're having trouble loading the latest content. Please refresh to try again."}
              </p>
            </div>
          </section>
        ) : null}
        <CapabilitiesSection capabilities={content.capabilities} />
        <UseCasesSection useCases={content.useCases} />
        <StepsSection howItWorks={content.howItWorks} />
        <MarketplaceSection marketplace={content.marketplace} toolsState={toolsState} />
        <PricingSection pricing={content.pricing} />
        <ContactSection footer={content.footer} />
      </main>
      <Footer footer={content.footer} />
    </>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}

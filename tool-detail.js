const scriptBaseUrl = (() => {
  if (typeof document !== 'undefined') {
    const currentScript = document.currentScript;
    if (currentScript?.src) {
      return new URL('.', currentScript.src);
    }
  }
  return new URL('.', window.location.href);
})();

const toolsUrl = new URL('data/tools.json', scriptBaseUrl).toString();

async function loadTools() {
  const response = await fetch(toolsUrl);
  if (!response.ok) {
    throw new Error(`Failed to load tool data: ${response.status}`);
  }
  return response.json();
}

function configureLinkTarget(anchor, href) {
  if (!anchor) return;
  if (href && href.startsWith('http')) {
    anchor.target = '_blank';
    anchor.rel = 'noreferrer noopener';
  } else {
    anchor.removeAttribute('target');
    anchor.removeAttribute('rel');
  }
}

function resolveAssetPath(path) {
  if (!path) return '';
  if (/^(?:[a-z]+:|\/\/|data:)/i.test(path)) {
    return path;
  }
  return new URL(path, scriptBaseUrl).toString();
}

function getSlugFromLocation() {
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
  if (!slug) return;

  const currentUrl = new URL(window.location.href);
  const toolHtmlUrl = new URL('tool.html', scriptBaseUrl);

  let hasChanges = false;

  if (currentUrl.pathname !== toolHtmlUrl.pathname) {
    currentUrl.pathname = toolHtmlUrl.pathname;
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

function populateTags(tags) {
  const tagsContainer = document.getElementById('tool-tags');
  if (!tagsContainer) return;
  if (!Array.isArray(tags) || !tags.length) {
    tagsContainer.textContent = '';
    tagsContainer.hidden = true;
    return;
  }

  tagsContainer.hidden = false;
  tagsContainer.innerHTML = '';
  tags.forEach((tag) => {
    const pill = document.createElement('span');
    pill.className = 'tool-tag';
    pill.textContent = tag;
    tagsContainer.appendChild(pill);
  });
}

function populateFeatures(features = []) {
  const section = document.getElementById('tool-features');
  const grid = document.getElementById('tool-feature-grid');
  if (!section || !grid) return;

  if (!Array.isArray(features) || !features.length) {
    section.hidden = true;
    return;
  }

  grid.innerHTML = '';
  features.forEach((feature) => {
    const card = document.createElement('article');
    card.className = 'feature-card';

    if (feature.icon) {
      const icon = document.createElement('span');
      icon.className = 'feature-card__icon';
      icon.textContent = feature.icon;
      icon.setAttribute('aria-hidden', 'true');
      card.appendChild(icon);
    }

    const title = document.createElement('h3');
    title.textContent = feature.title || 'Feature';
    card.appendChild(title);

    if (feature.description) {
      const description = document.createElement('p');
      description.innerHTML = feature.description;
      card.appendChild(description);
    }

    grid.appendChild(card);
  });

  section.hidden = false;
}

function populateSteps(steps = []) {
  const section = document.getElementById('tool-how');
  const list = document.getElementById('tool-steps');
  if (!section || !list) return;

  if (!Array.isArray(steps) || !steps.length) {
    section.hidden = true;
    return;
  }

  list.innerHTML = '';
  steps.forEach((step, index) => {
    const item = document.createElement('li');
    item.className = 'tool-step';

    const badge = document.createElement('span');
    badge.className = 'tool-step__number';
    badge.textContent = index + 1;
    item.appendChild(badge);

    const content = document.createElement('div');
    content.className = 'tool-step__content';

    if (typeof step === 'string') {
      const text = document.createElement('p');
      text.innerHTML = step;
      content.appendChild(text);
    } else {
      const title = document.createElement('h3');
      title.textContent = step.title || `Step ${index + 1}`;
      content.appendChild(title);

      if (step.description) {
        const description = document.createElement('p');
        description.innerHTML = step.description;
        content.appendChild(description);
      }
    }

    item.appendChild(content);
    list.appendChild(item);
  });

  section.hidden = false;
}

function populateVideo(videoUrl) {
  const section = document.getElementById('tool-video');
  const iframe = document.getElementById('tool-video-embed');
  if (!section || !iframe) return;
  if (!videoUrl) {
    section.hidden = true;
    iframe.src = '';
    return;
  }

  iframe.src = videoUrl;
  section.hidden = false;
}

function populateBenefits(benefits = []) {
  const section = document.getElementById('tool-benefits');
  const list = document.getElementById('tool-benefits-list');
  if (!section || !list) return;

  if (!Array.isArray(benefits) || !benefits.length) {
    section.hidden = true;
    return;
  }

  list.innerHTML = '';
  benefits.forEach((benefit) => {
    const item = document.createElement('li');
    item.innerHTML = benefit;
    list.appendChild(item);
  });

  section.hidden = false;
}

function populatePricing(tool) {
  const section = document.getElementById('pricing');
  const priceEl = document.getElementById('tool-price');
  const supportEl = document.getElementById('tool-support');
  const pricingCta = document.getElementById('tool-pricing-cta');
  const contactCta = document.getElementById('tool-contact');
  const heroPrimary = document.getElementById('tool-primary-cta');
  const heroSecondary = document.getElementById('tool-secondary-cta');
  const navCta = document.getElementById('detail-nav-cta');

  if (!section) return;

  if (!tool.price && !tool.checkout_url) {
    section.hidden = true;
  } else {
    if (priceEl) priceEl.textContent = tool.price || '';
    if (supportEl) supportEl.textContent = tool.support_policy || '';
    section.hidden = false;
  }

  const checkoutUrl = tool.checkout_url || tool.link || '#';
  if (pricingCta) {
    pricingCta.href = checkoutUrl;
    pricingCta.textContent = tool.checkoutCtaText || tool.ctaText || 'Buy Now';
    configureLinkTarget(pricingCta, checkoutUrl);
  }

  if (heroPrimary) {
    heroPrimary.hidden = !tool.checkout_url;
    if (tool.checkout_url) {
      heroPrimary.href = tool.checkout_url;
      heroPrimary.textContent = tool.ctaText || 'Buy Now';
      configureLinkTarget(heroPrimary, tool.checkout_url);
    }
  }

  if (heroSecondary) {
    const secondaryLink = tool.secondaryCta?.link || tool.link || 'mailto:hello@takotools.com';
    const secondaryLabel = tool.secondaryCta?.text || 'Request setup';
    heroSecondary.hidden = false;
    heroSecondary.href = secondaryLink;
    heroSecondary.textContent = secondaryLabel;
    configureLinkTarget(heroSecondary, secondaryLink);
  }

  if (contactCta) {
    const contactLink = tool.link || 'mailto:hello@takotools.com';
    contactCta.href = contactLink;
    configureLinkTarget(contactCta, contactLink);
  }

  if (navCta) {
    if (tool.link) {
      navCta.href = tool.link;
      navCta.textContent = tool.ctaText || 'Talk to Tako';
      configureLinkTarget(navCta, tool.link);
    } else if (tool.checkout_url) {
      navCta.href = tool.checkout_url;
      navCta.textContent = tool.ctaText || 'Buy Now';
      configureLinkTarget(navCta, tool.checkout_url);
    }
  }
}

function populateHero(tool) {
  const titleEl = document.getElementById('tool-title');
  const summaryEl = document.getElementById('tool-summary');
  const mediaWrapper = document.getElementById('tool-media');
  const imageEl = document.getElementById('tool-image');

  if (titleEl) titleEl.textContent = tool.title || 'Tool';
  if (summaryEl) summaryEl.innerHTML = tool.summary || tool.description || '';

  if (tool.image && mediaWrapper && imageEl) {
    imageEl.src = resolveAssetPath(tool.image);
    imageEl.alt = tool.title ? `${tool.title} preview` : 'Tool visual';
    mediaWrapper.hidden = false;
  } else if (mediaWrapper) {
    mediaWrapper.hidden = true;
  }

  document.title = tool.title ? `${tool.title} • Tako` : 'Tako Tool';
}

function populateRelated(currentSlug, tools = []) {
  const section = document.getElementById('tool-related');
  const grid = document.getElementById('related-grid');
  if (!section || !grid) return;

  const related = tools.filter((tool) => tool.slug && tool.slug !== currentSlug).slice(0, 3);
  if (!related.length) {
    section.hidden = true;
    return;
  }

  grid.innerHTML = '';
  related.forEach((tool) => {
    const card = document.createElement('article');
    card.className = 'related-card';

    const imageSource = resolveAssetPath(tool.image);
    if (imageSource) {
      const img = document.createElement('img');
      img.src = imageSource;
      img.alt = tool.title ? `${tool.title} preview` : 'Related tool';
      card.appendChild(img);
    }

    const content = document.createElement('div');
    content.className = 'related-card__content';

    const title = document.createElement('h3');
    title.textContent = tool.title || 'Tool';
    content.appendChild(title);

    if (tool.summary) {
      const summary = document.createElement('p');
      summary.textContent = tool.summary;
      content.appendChild(summary);
    }

    const link = document.createElement('a');
    link.className = 'btn secondary';
    link.href = `tool.html?slug=${encodeURIComponent(tool.slug)}`;
    link.textContent = 'See features';
    content.appendChild(link);

    card.appendChild(content);
    grid.appendChild(card);
  });

  section.hidden = false;
}

function showErrorState() {
  const heroSection = document.getElementById('tool-hero');
  const sections = document.querySelectorAll('.tool-detail-section');
  sections.forEach((section) => {
    if (section.id === 'tool-error') {
      section.hidden = false;
    } else {
      section.hidden = true;
    }
  });
  if (heroSection) heroSection.hidden = true;
  document.title = 'Tool not found • Tako';
}

async function init() {
  const slug = getSlugFromLocation();
  if (!slug) {
    showErrorState();
    return;
  }

  try {
    const data = await loadTools();
    const tools = Array.isArray(data?.items) ? data.items : [];
    const tool = tools.find((item) => item.slug === slug);
    if (!tool) {
      showErrorState();
      return;
    }

    replaceUrlWithSlug(slug);
    populateHero(tool);
    populateTags(tool.tags);
    populateFeatures(tool.features);
    populateSteps(tool.how_it_works);
    populateVideo(tool.video_url);
    populateBenefits(tool.benefits);
    populatePricing(tool);
    populateRelated(tool.slug, tools);
  } catch (error) {
    console.error(error);
    showErrorState();
  }
}

document.addEventListener('DOMContentLoaded', init);

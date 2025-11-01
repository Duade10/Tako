const contentUrl = 'data/content.json';
const toolsUrl = 'data/tools.json';

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`);
  }
  return response.json();
}

function populateHero(hero) {
  if (!hero) return;
  const titleEl = document.getElementById('hero-title');
  const subtitleEl = document.getElementById('hero-subtitle');
  const heroCta = document.getElementById('hero-cta');
  const navCta = document.getElementById('nav-cta');
  const heroNote = document.getElementById('hero-note');

  if (hero.title && titleEl) titleEl.textContent = hero.title;
  if (hero.subtitle && subtitleEl) subtitleEl.textContent = hero.subtitle;
  if (hero.ctaText) {
    if (heroCta) heroCta.textContent = hero.ctaText;
    if (navCta) navCta.textContent = hero.ctaText;
  }
  if (hero.ctaLink) {
    if (heroCta) heroCta.href = hero.ctaLink;
    if (navCta) navCta.href = hero.ctaLink;
  }
  if (heroNote) {
    heroNote.textContent = hero.note || '';
  }
}

function populateCapabilities({ title, items } = {}) {
  const titleEl = document.getElementById('capabilities-title');
  const listEl = document.getElementById('capabilities-list');
  if (title && titleEl) titleEl.textContent = title;
  if (!Array.isArray(items) || !listEl) return;

  listEl.innerHTML = '';
  items.forEach((capability) => {
    const li = document.createElement('li');
    li.textContent = capability;
    listEl.appendChild(li);
  });
}

function createCard({ title, description, icon }) {
  const card = document.createElement('article');
  card.className = 'card';

  if (icon) {
    const iconEl = document.createElement('span');
    iconEl.className = 'card-icon';
    iconEl.textContent = icon;
    iconEl.setAttribute('aria-hidden', 'true');
    card.appendChild(iconEl);
  }

  const heading = document.createElement('h3');
  heading.textContent = title || 'Untitled';
  card.appendChild(heading);

  if (description) {
    const descriptionEl = document.createElement('p');
    descriptionEl.textContent = description;
    card.appendChild(descriptionEl);
  }

  return card;
}

function populateUseCases({ title, subtitle, cards } = {}) {
  const titleEl = document.getElementById('use-cases-title');
  const subtitleEl = document.getElementById('use-cases-subtitle');
  const gridEl = document.getElementById('use-cases-grid');

  if (title && titleEl) titleEl.textContent = title;
  if (subtitle && subtitleEl) subtitleEl.textContent = subtitle;

  if (!Array.isArray(cards) || !gridEl) return;
  gridEl.innerHTML = '';

  cards.forEach((card) => {
    const cardEl = createCard(card);
    gridEl.appendChild(cardEl);
  });
}

function populateSteps({ title, subtitle, steps } = {}) {
  const titleEl = document.getElementById('how-it-works-title');
  const subtitleEl = document.getElementById('how-it-works-subtitle');
  const stepperEl = document.getElementById('steps');

  if (title && titleEl) titleEl.textContent = title;
  if (subtitle && subtitleEl) subtitleEl.textContent = subtitle;
  if (!Array.isArray(steps) || !stepperEl) return;

  stepperEl.innerHTML = '';
  steps.forEach((step, index) => {
    const stepEl = document.createElement('article');
    stepEl.className = 'step';

    const stepNumber = document.createElement('span');
    stepNumber.className = 'step-number';
    stepNumber.textContent = index + 1;
    stepEl.appendChild(stepNumber);

    const heading = document.createElement('h3');
    heading.textContent = step.title;
    stepEl.appendChild(heading);

    if (step.description) {
      const description = document.createElement('p');
      description.textContent = step.description;
      stepEl.appendChild(description);
    }

    stepperEl.appendChild(stepEl);
  });
}

function populatePricing({ title, subtitle, tiers, note } = {}) {
  const titleEl = document.getElementById('pricing-title');
  const subtitleEl = document.getElementById('pricing-subtitle');
  const gridEl = document.getElementById('pricing-grid');
  const noteEl = document.getElementById('pricing-note');

  if (title && titleEl) titleEl.textContent = title;
  if (subtitle && subtitleEl) subtitleEl.textContent = subtitle;
  if (noteEl) noteEl.textContent = note || '';

  if (!Array.isArray(tiers) || !gridEl) return;
  gridEl.innerHTML = '';

  tiers.forEach((tier) => {
    const card = document.createElement('article');
    card.className = 'pricing-card';
    if (tier.highlight) card.classList.add('highlight');

    const name = document.createElement('h3');
    name.textContent = tier.name;
    card.appendChild(name);

    const price = document.createElement('p');
    price.className = 'pricing-price';
    price.textContent = tier.price;
    card.appendChild(price);

    if (tier.description) {
      const desc = document.createElement('p');
      desc.textContent = tier.description;
      card.appendChild(desc);
    }

    if (Array.isArray(tier.features)) {
      const featureList = document.createElement('ul');
      featureList.className = 'pricing-features';
      tier.features.forEach((feature) => {
        const li = document.createElement('li');
        li.textContent = feature;
        featureList.appendChild(li);
      });
      card.appendChild(featureList);
    }

    if (tier.cta) {
      const button = document.createElement('a');
      button.className = 'btn primary';
      button.href = tier.cta.link || '#contact';
      button.textContent = tier.cta.text || 'Talk to us';
      card.appendChild(button);
    }

    gridEl.appendChild(card);
  });
}

function populateFooter({ contact, links, copy, contactSection } = {}) {
  const contactListEl = document.getElementById('contact-details-list');
  const footerLinksEl = document.getElementById('footer-links');
  const footerCopyEl = document.getElementById('footer-copy');
  const contactTitleEl = document.getElementById('contact-title');
  const contactCopyEl = document.getElementById('contact-copy');
  const contactCtaEl = document.getElementById('contact-cta');

  if (contactTitleEl && contactSection?.title) {
    contactTitleEl.textContent = contactSection.title;
  }
  if (contactCopyEl && contactSection?.copy) {
    contactCopyEl.textContent = contactSection.copy;
  }
  if (contactCtaEl && contactSection?.cta) {
    contactCtaEl.textContent = contactSection.cta.text || contactCtaEl.textContent;
    contactCtaEl.href = contactSection.cta.link || contactCtaEl.href;
  }

  if (contactListEl && Array.isArray(contact)) {
    contactListEl.innerHTML = '';
    contact.forEach((item) => {
      const li = document.createElement('li');
      const label = document.createElement('strong');
      label.textContent = `${item.label}: `;
      const span = document.createElement('span');
      span.textContent = item.value;
      li.appendChild(label);
      li.appendChild(span);
      contactListEl.appendChild(li);
    });
  }

  if (footerLinksEl && Array.isArray(links)) {
    footerLinksEl.innerHTML = '';
    links.forEach((link) => {
      const li = document.createElement('li');
      const anchor = document.createElement('a');
      anchor.href = link.href;
      anchor.textContent = link.label;
      if (link.external) {
        anchor.target = '_blank';
        anchor.rel = 'noreferrer noopener';
      }
      li.appendChild(anchor);
      footerLinksEl.appendChild(li);
    });
  }

  if (footerCopyEl && copy) {
    footerCopyEl.textContent = copy;
  }
}

function populateMarketplace({ title, subtitle } = {}, tools = []) {
  const titleEl = document.getElementById('marketplace-title');
  const subtitleEl = document.getElementById('marketplace-subtitle');
  const gridEl = document.getElementById('tool-grid');

  if (title && titleEl) titleEl.textContent = title;
  if (subtitle && subtitleEl) subtitleEl.textContent = subtitle;
  if (!Array.isArray(tools) || !gridEl) return;

  gridEl.innerHTML = '';
  tools.forEach((tool) => {
    const card = document.createElement('article');
    card.className = 'card';

    const media = document.createElement('div');
    media.className = 'tool-media';
    const image = document.createElement('img');
    image.src = tool.image;
    image.alt = tool.title || 'Tool preview';
    media.appendChild(image);
    card.appendChild(media);

    const content = document.createElement('div');
    content.className = 'tool-content';

    const titleEl = document.createElement('h3');
    titleEl.textContent = tool.title;
    content.appendChild(titleEl);

    const priceEl = document.createElement('p');
    priceEl.className = 'tool-price';
    priceEl.textContent = tool.price;
    content.appendChild(priceEl);

    const descriptionEl = document.createElement('p');
    descriptionEl.textContent = tool.description;
    content.appendChild(descriptionEl);

    const actions = document.createElement('div');
    actions.className = 'tool-actions';

    const primary = document.createElement('a');
    primary.className = 'btn primary';
    primary.href = tool.link || '#contact';
    primary.textContent = tool.ctaText || 'Buy Now';
    actions.appendChild(primary);

    if (tool.secondaryCta) {
      const secondary = document.createElement('a');
      secondary.className = 'btn secondary';
      secondary.href = tool.secondaryCta.link;
      secondary.textContent = tool.secondaryCta.text;
      actions.appendChild(secondary);
    }

    content.appendChild(actions);
    card.appendChild(content);
    gridEl.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const [content, tools] = await Promise.all([loadJson(contentUrl), loadJson(toolsUrl)]);

    populateHero(content.hero);
    populateCapabilities(content.capabilities);
    populateUseCases(content.useCases);
    populateSteps(content.howItWorks);
    populatePricing(content.pricing);
    const toolItems = Array.isArray(tools?.items) ? tools.items : [];
    populateMarketplace(content.marketplace, toolItems);
    populateFooter(content.footer);
  } catch (error) {
    console.error(error);
    const heroNote = document.getElementById('hero-note');
    if (heroNote) {
      heroNote.textContent = 'Having trouble loading content. Refresh to try again!';
      heroNote.style.color = 'var(--color-error)';
    }
  }
});

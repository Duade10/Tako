const toolsUrl = 'data/tools.json';

async function loadTools() {
  const response = await fetch(toolsUrl);
  if (!response.ok) {
    throw new Error(`Failed to load tools: ${response.status}`);
  }
  return response.json();
}

function parsePrice(priceString) {
  if (!priceString) return Number.POSITIVE_INFINITY;
  const numeric = Number(priceString.replace(/[^0-9.]/g, ''));
  return Number.isFinite(numeric) ? numeric : Number.POSITIVE_INFINITY;
}

function createToolCard(tool) {
  const card = document.createElement('article');
  card.className = 'marketplace-card';

  if (tool.featured) {
    const badge = document.createElement('span');
    badge.className = 'marketplace-card__badge';
    badge.textContent = 'Featured';
    card.appendChild(badge);
  }

  const media = document.createElement('div');
  media.className = 'marketplace-card__media';
  const image = document.createElement('img');
  image.src = tool.image;
  image.alt = tool.title || 'Tool preview';
  media.appendChild(image);
  card.appendChild(media);

  const content = document.createElement('div');
  content.className = 'marketplace-card__content';

  const title = document.createElement('h3');
  title.className = 'marketplace-card__title';
  title.textContent = tool.title || 'Untitled tool';
  content.appendChild(title);

  if (tool.price) {
    const price = document.createElement('p');
    price.className = 'marketplace-card__price';
    price.textContent = tool.price;
    content.appendChild(price);
  }

  if (tool.description) {
    const description = document.createElement('p');
    description.className = 'marketplace-card__description';
    description.textContent = tool.description;
    content.appendChild(description);
  }

  const actions = document.createElement('div');
  actions.className = 'marketplace-card__actions';

  const primaryCta = document.createElement('a');
  primaryCta.className = 'btn primary marketplace-card__cta';
  primaryCta.href = tool.link || '#contact';
  primaryCta.textContent = tool.ctaText || 'Learn More';
  const primaryOpensNewTab = tool.link?.startsWith('http');
  primaryCta.target = primaryOpensNewTab ? '_blank' : '_self';
  if (primaryOpensNewTab) {
    primaryCta.rel = 'noreferrer noopener';
  }
  actions.appendChild(primaryCta);

  if (tool.secondaryCta) {
    const secondaryCta = document.createElement('a');
    secondaryCta.className = 'btn secondary marketplace-card__cta';
    secondaryCta.href = tool.secondaryCta.link || '#contact';
    secondaryCta.textContent = tool.secondaryCta.text;
    if (tool.secondaryCta.link?.startsWith('http')) {
      secondaryCta.target = '_blank';
      secondaryCta.rel = 'noreferrer noopener';
    } else {
      secondaryCta.target = '_self';
    }
    actions.appendChild(secondaryCta);
  }

  content.appendChild(actions);
  card.appendChild(content);

  return card;
}

function renderTools(tools = []) {
  const grid = document.getElementById('tools-grid');
  const emptyState = document.getElementById('tools-empty');
  if (!grid || !emptyState) return;

  grid.innerHTML = '';
  if (!tools.length) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;
  tools.forEach((tool) => {
    const card = createToolCard(tool);
    grid.appendChild(card);
  });
}

function sortTools(tools, sort) {
  if (sort === 'price-asc') {
    return [...tools].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
  }
  if (sort === 'price-desc') {
    return [...tools].sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
  }
  return [...tools];
}

async function initMarketplace() {
  const sortSelect = document.getElementById('sort-select');
  let originalTools = [];

  try {
    const toolsData = await loadTools();
    originalTools = Array.isArray(toolsData?.items) ? toolsData.items : [];
    renderTools(originalTools);
  } catch (error) {
    console.error(error);
    const emptyState = document.getElementById('tools-empty');
    if (emptyState) {
      emptyState.textContent = 'We\'re having trouble loading tools right now. Please refresh to try again.';
      emptyState.hidden = false;
    }
    return;
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (event) => {
      const sorted = sortTools(originalTools, event.target.value);
      renderTools(sorted);
    });
  }
}

document.addEventListener('DOMContentLoaded', initMarketplace);

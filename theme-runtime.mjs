export const ISLAND_SKINS = ['day-island', 'night-island', 'island-mascot'];
export const ISLAND_INTRO_VISUALS = ['island', 'mascot'];
export const ISLAND_DEFAULTS = { skin: 'day-island', introVisual: 'island' };

export function normalizeIslandPreferences(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  return {
    skin: ISLAND_SKINS.includes(source.skin) ? source.skin : ISLAND_DEFAULTS.skin,
    introVisual: ISLAND_INTRO_VISUALS.includes(source.introVisual) ? source.introVisual : ISLAND_DEFAULTS.introVisual,
  };
}

export function installIslandTheme(document, window, options = {}) {
  const SKINS = ['day-island', 'night-island', 'island-mascot'];
  const INTRO_VISUALS = ['island', 'mascot'];
  const DEFAULTS = { skin: 'day-island', introVisual: 'island' };
  const INTRO_DURATION_MS = 6000;
  const INTRO_CLOSE_MS = 260;

  function normalize(raw) {
    const source = raw && typeof raw === 'object' ? raw : {};
    return {
      skin: SKINS.includes(source.skin) ? source.skin : DEFAULTS.skin,
      introVisual: INTRO_VISUALS.includes(source.introVisual) ? source.introVisual : DEFAULTS.introVisual,
    };
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function prefersReducedMotion() {
    try {
      return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;
    } catch {
      return false;
    }
  }

  function buildIntroOverlay(visual) {
    const overlay = el('div', 'island-intro');
    overlay.dataset.visual = visual;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'ISLAND intro');

    overlay.append(
      el('div', 'island-intro-art'),
      el('div', 'island-intro-halo'),
      el('i', 'island-intro-orbit'),
      el('i', 'island-intro-orbit two'),
      el('div', 'island-intro-scan'),
      el('div', 'island-intro-scan island-intro-scan--secondary'),
      el('div', 'island-intro-energy'),
      el('div', 'island-intro-reticle'),
      (() => {
        const particles = el('div', 'island-intro-particles');
        for (let index = 0; index < 8; index += 1) {
          const particle = el('i');
          particle.style.setProperty('--particle-index', String(index));
          particles.append(particle);
        }
        return particles;
      })(),
      el('div', 'island-intro-frame'),
    );

    const copy = el('div', 'island-intro-copy');
    copy.append(
      el('div', 'island-intro-kicker', 'DEEPSEEK HARNESS · ISLAND'),
      (() => {
        const title = el('div', 'island-intro-title');
        title.append(document.createTextNode('晨光浮岛'), el('br'), el('em', undefined, '全息唤醒'));
        return title;
      })(),
      el('div', 'island-intro-sub', 'A BRIGHT PLACE FOR DEEP WORK'),
    );
    overlay.append(copy);

    overlay.append(
      el('div', 'island-intro-pet'),
      el('div', 'island-intro-chip', 'ISLAND / ARRIVAL'),
    );

    const bottom = el('div', 'island-intro-bottom');
    const progress = el('div', 'island-intro-progress');
    progress.append(el('i'));
    const skip = el('button', 'island-intro-skip', '跳过片头');
    skip.type = 'button';
    bottom.append(progress, el('small', undefined, 'ARRIVAL SEQUENCE · 00:06'), skip);
    overlay.append(bottom);
    return { overlay, skip };
  }

  function preloadArtwork(sources, onEach) {
    if (typeof window.Image !== 'function') return;
    for (const [name, src] of Object.entries(sources)) {
      if (!src) continue;
      const image = new window.Image();
      image.onload = () => onEach(name, src);
      image.src = src;
    }
  }

  const body = document.body;
  let closed = false;
  let preferences = normalize(options.config);
  let overlayState;

  const artworks = {
    'island-day': options.assets?.['island-day'],
    'island-night': options.assets?.['island-night'],
    'island-mascot': options.assets?.['island-mascot'],
  };

  const ambientNodes = [
    el('div', 'island-skin-glow'),
    el('i', 'island-skin-orbit'),
    el('i', 'island-skin-orbit island-orbit--two'),
    el('div', 'island-skin-holo'),
    el('div', 'island-skin-pet'),
  ];

  function applyArtwork(name, src) {
    if (closed) return;
    body.style.setProperty(`--island-artwork-${name}`, `url("${src}")`);
  }

  function applyPreferences(raw) {
    preferences = normalize(raw);
    body.dataset.islandSkin = preferences.skin;
    body.dataset.islandIntro = preferences.introVisual;
  }

  function closeIntro() {
    const state = overlayState;
    if (!state || state.closing) return;
    state.closing = true;
    window.clearTimeout(state.autoTimer);
    window.clearTimeout(state.removeTimer);
    window.removeEventListener('keydown', state.onKeydown, true);
    state.overlay.classList.add('island-intro--closing');
    state.removeTimer = window.setTimeout(() => {
      state.overlay.remove();
      if (state.previousFocus?.isConnected) state.previousFocus.focus({ preventScroll: true });
      if (overlayState === state) overlayState = undefined;
    }, options.closeDuration ?? INTRO_CLOSE_MS);
  }

  function showIntro() {
    if (window.__islandIntroPlayed) return;
    window.__islandIntroPlayed = true;
    if (prefersReducedMotion()) return;
    const { overlay, skip } = buildIntroOverlay(preferences.introVisual);
    const state = {
      overlay,
      previousFocus: document.activeElement,
      closing: false,
      onKeydown: (event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          closeIntro();
          return;
        }
        if (event.key === 'Tab') {
          const focusable = Array.from(overlay.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), [tabindex]:not([tabindex="-1"])'))
            .filter(element => element.getAttribute('aria-hidden') !== 'true');
          const first = focusable[0];
          const last = focusable.at(-1);
          if (!first) {
            event.preventDefault();
            overlay.focus({ preventScroll: true });
          } else if (!overlay.contains(document.activeElement)) {
            event.preventDefault();
            first.focus({ preventScroll: true });
          } else if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus({ preventScroll: true });
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus({ preventScroll: true });
          }
        }
      },
      autoTimer: undefined,
      removeTimer: undefined,
    };
    skip.addEventListener('click', closeIntro);
    window.addEventListener('keydown', state.onKeydown, true);
    state.autoTimer = window.setTimeout(closeIntro, options.introDuration ?? INTRO_DURATION_MS);
    overlayState = state;
    body.append(overlay);
    skip.focus({ preventScroll: true });
  }

  applyPreferences(preferences);
  body.append(...ambientNodes);
  preloadArtwork(artworks, applyArtwork);

  const ready = options.ready ?? Promise.resolve(preferences);
  ready.then(config => {
    if (closed) return;
    if (config !== undefined) applyPreferences(config);
    showIntro();
  }).catch(() => {
    if (!closed) showIntro();
  });

  return {
    update: applyPreferences,
    dispose() {
      closed = true;
      if (overlayState) {
        const state = overlayState;
        window.clearTimeout(state.autoTimer);
        window.clearTimeout(state.removeTimer);
        window.removeEventListener('keydown', state.onKeydown, true);
        state.overlay.remove();
        if (state.previousFocus?.isConnected) state.previousFocus.focus({ preventScroll: true });
        overlayState = undefined;
      }
      ambientNodes.forEach(node => node.remove());
      for (const name of Object.keys(artworks)) body.style.removeProperty(`--island-artwork-${name}`);
      delete body.dataset.islandSkin;
      delete body.dataset.islandIntro;
    },
  };
}

/**
 * Host CSS-module class names.
 *
 * The host ships CSS Modules, so every host build rehashes each component's
 * class prefix (`hIlkoa_sessionRow` -> `wnFoaW_sessionRow`). The stylesheets in
 * this package are authored against the *legacy* prefixes that the theme was
 * originally written for, and `retargetCss` rewrites them to the prefix that is
 * actually mounted.
 *
 * Two layers keep that working:
 *  - `current` is the prefix baked into this release. `scripts/host-classes.mjs`
 *    recomputes it from the installed app.asar, so a host update is one command
 *    plus a review of the diff.
 *  - `anchor` is a class local name that exists in exactly one host component.
 *    At runtime the client reads the mounted class off that anchor, so a host
 *    rebuild that keeps the component's class list self-heals without a rebuild.
 *
 * A group with neither an anchor nor a known prefix keeps its legacy names and
 * simply does not apply; it never matches the wrong component.
 */
export const HOST_CLASS_GROUPS = {
  // workspace sidebar rows and their hover/selection state
  hIlkoa: { current: 'wnFoaW', anchor: 'sessionRow' },
  // workspace list, group sections, header actions
  _9lTDKa: { current: 'GAkraW', anchor: 'groupSection' },
  // sidebar column wrapper
  BynINW: { current: 'mP3x-q', anchor: 'sidebarCol' },
  // conversation pane: composer hero, embedded body, header, tabs
  Dc7zOa: { current: 'an3WzG', anchor: 'composerHero' },
  // conversation composer: dock, input, tools, cards
  RlGAzG: { current: 'GRgSLq', anchor: 'standardControls' },
  // transcript flow
  xz4KEq: { current: 'V4vHZW', anchor: 'flowItem' },
  // model selection menu and its effort trigger
  wq12jW: { current: '_9r0rkG', anchor: 'triggerEffort' },
  // usage pill inside the composer
  iq1doa: { current: 'hNGZaa', anchor: 'pill' },
  // session title preview card
  'Hqq-bq': { current: 'WOwLGG', anchor: 'titleGroup' },
  // sidebar / app home page
  _2H3hWW: { current: 'wtg9ga', anchor: 'logoRow' },
  // page wrappers whose classes are too generic to anchor safely
  v5IAXa: { current: 'v5IAXa' },
  _2WTFBq: { current: '_2WTFBq' },
};

/** Legacy-prefix -> prefix mapping for the host build this release targets. */
export const HOST_CLASS_CURRENT = Object.fromEntries(
  Object.entries(HOST_CLASS_GROUPS).map(([legacy, group]) => [legacy, group.current]),
);

/**
 * Rewrite authored (legacy) prefixes to the prefixes that are actually mounted.
 * Only `legacy_` tokens are touched, so hand-written suffix selectors such as
 * `[class*="_sessionRow"]` survive untouched.
 */
export function retargetCss(css, map) {
  let out = css;
  for (const legacy of Object.keys(map)) {
    if (legacy === map[legacy]) continue;
    out = out.split(legacy + '_').join(map[legacy] + '_');
  }
  return out;
}

/**
 * Read the mounted prefix for every anchored group from the live DOM. A group
 * whose anchor is not mounted keeps its baked `current` value, so the returned
 * map is always usable and never guesses.
 */
export function resolveHostClasses(document, groups) {
  const map = {};
  for (const [legacy, group] of Object.entries(groups)) {
    map[legacy] = group.current;
    if (!group.anchor || legacy === group.current) continue;
    const pattern = new RegExp('(?:^|\\s)([A-Za-z0-9_-]+)_' + group.anchor + '(?:\\s|$)');
    for (const element of document.querySelectorAll('[class*="_' + group.anchor + '"]')) {
      const match = pattern.exec(element.getAttribute('class') || '');
      if (match) { map[legacy] = match[1]; break; }
    }
  }
  return map;
}

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { installIslandTheme, normalizeIslandPreferences } from './theme-runtime.mjs';

const FAST = { introDuration: 30, closeDuration: 10 };
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const flush = () => sleep(0);

function setup({ reducedMotion = false } = {}) {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
  const { window } = dom;
  window.matchMedia = (query) => ({
    matches: reducedMotion && query.includes('prefers-reduced-motion'),
    media: query,
    addEventListener() {},
    removeEventListener() {},
  });
  return { dom, window, document: window.document };
}

test('normalize falls back to defaults for unknown values', () => {
  assert.deepEqual(normalizeIslandPreferences({ skin: 'night-island', introVisual: 'mascot' }), { skin: 'night-island', introVisual: 'mascot' });
  assert.deepEqual(normalizeIslandPreferences({ skin: 'nope' }), { skin: 'day-island', introVisual: 'island' });
  assert.deepEqual(normalizeIslandPreferences('mascot'), { skin: 'day-island', introVisual: 'island' });
});

test('applies skin and intro attributes plus ambient nodes immediately', async () => {
  const { document, window } = setup();
  installIslandTheme(document, window, { ...FAST, config: { skin: 'night-island', introVisual: 'mascot' } });
  assert.equal(document.body.dataset.islandSkin, 'night-island');
  assert.equal(document.body.dataset.islandIntro, 'mascot');
  for (const cls of ['island-skin-glow', 'island-skin-orbit', 'island-skin-holo', 'island-skin-pet']) {
    assert.ok(document.querySelector(`.${cls}`), cls);
  }
  assert.equal(document.querySelectorAll('.island-skin-orbit').length, 2);
});

test('mounts one intro overlay with the chosen visual and auto-closes it', async () => {
  const { document, window } = setup();
  installIslandTheme(document, window, { ...FAST, config: { introVisual: 'mascot' } });
  await flush();
  const overlay = document.querySelector('.island-intro');
  assert.ok(overlay);
  assert.equal(overlay.dataset.visual, 'mascot');
  await sleep(60);
  assert.ok(overlay.classList.contains('island-intro--closing'));
  await sleep(30);
  assert.equal(document.querySelector('.island-intro'), null);
});

test('skip button and Escape close the intro immediately', async () => {
  const { document, window } = setup();
  installIslandTheme(document, window, FAST);
  await flush();
  document.querySelector('.island-intro-skip').click();
  await sleep(30);
  assert.equal(document.querySelector('.island-intro'), null);

  window.__islandIntroPlayed = false;
  installIslandTheme(document, window, { ...FAST, introDuration: 60000 });
  await flush();
  window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
  await sleep(30);
  assert.equal(document.querySelector('.island-intro'), null);
});

test('intro mounts at most once per window', async () => {
  const { document, window } = setup();
  installIslandTheme(document, window, FAST);
  await flush();
  installIslandTheme(document, window, FAST);
  await flush();
  assert.equal(document.querySelectorAll('.island-intro').length, 1);
});

test('reduced motion bypasses the intro but keeps the skin', async () => {
  const { document, window } = setup({ reducedMotion: true });
  installIslandTheme(document, window, { ...FAST, config: { skin: 'island-mascot' } });
  await flush();
  await sleep(60);
  assert.equal(document.querySelector('.island-intro'), null);
  assert.equal(document.body.dataset.islandSkin, 'island-mascot');
});

test('update applies a new skin live and dispose cleans everything', async () => {
  const { document, window } = setup();
  const handle = installIslandTheme(document, window, FAST);
  await flush();
  handle.update({ skin: 'island-mascot', introVisual: 'mascot' });
  assert.equal(document.body.dataset.islandSkin, 'island-mascot');
  handle.dispose();
  assert.equal(document.body.dataset.islandSkin, undefined);
  assert.equal(document.body.dataset.islandIntro, undefined);
  assert.equal(document.querySelector('.island-intro'), null);
  assert.equal(document.querySelector('.island-skin-glow'), null);
  assert.equal(document.querySelector('.island-skin-pet'), null);
});

test('resolved remote config wins and artwork variables are applied after decode', async () => {
  const { document, window } = setup();
  const sources = [];
  window.Image = class {
    set src(value) { sources.push(value); queueMicrotask(() => this.onload?.()); }
  };
  const ready = Promise.resolve({ skin: 'night-island', introVisual: 'mascot' });
  installIslandTheme(document, window, { ...FAST, ready, assets: { 'island-day': 'data:day', 'island-night': 'data:night', 'island-mascot': 'data:pet' } });
  await flush();
  assert.equal(document.body.dataset.islandSkin, 'night-island');
  assert.equal(document.querySelector('.island-intro').dataset.visual, 'mascot');
  assert.deepEqual(sources, ['data:day', 'data:night', 'data:pet']);
  assert.equal(document.body.style.getPropertyValue('--island-artwork-island-night'), 'url("data:night")');
});

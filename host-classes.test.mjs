import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { HOST_CLASS_GROUPS, HOST_CLASS_CURRENT, resolveHostClasses, retargetCss } from './host-classes.mjs';

const dom = html => new JSDOM('<!doctype html><html><body>' + html + '</body></html>').window.document;

test('retarget rewrites authored prefixes and leaves everything else alone', () => {
  const css = 'body .hIlkoa_sessionRow { color: red } body [class*="_sessionRow"] { padding: 0 } body .island-effort-range { width: 1px }';
  const out = retargetCss(css, { hIlkoa: 'ZZtop1' });
  assert.match(out, /\.ZZtop1_sessionRow/);
  assert.match(out, /\[class\*="_sessionRow"\]/);
  assert.match(out, /\.island-effort-range/);
  assert.doesNotMatch(out, /hIlkoa/);
});

test('retarget is a no-op for groups whose prefix did not change', () => {
  const css = 'body .v5IAXa_root { color: red }';
  assert.equal(retargetCss(css, { v5IAXa: 'v5IAXa' }), css);
});

test('resolver reads the mounted prefix from the anchor class', () => {
  const document = dom('<div class="AbCd12_sessionRow"><span class="AbCd12_title">x</span></div>');
  const map = resolveHostClasses(document, { hIlkoa: { current: 'stale', anchor: 'sessionRow' } });
  assert.equal(map.hIlkoa, 'AbCd12');
});

test('resolver keeps the baked prefix when the anchor is not mounted', () => {
  const document = dom('<div class="owWO65_sessionRow"></div>');
  const map = resolveHostClasses(document, { wq12jW: { current: '_9r0rkG', anchor: 'triggerEffort' } });
  assert.equal(map.wq12jW, '_9r0rkG');
});

test('resolver accepts hyphens and leading underscores in host prefixes', () => {
  const document = dom('<nav class="mP3x-q_sidebarCol"></nav><div class="_9r0rkG_triggerEffort"></div>');
  const map = resolveHostClasses(document, {
    BynINW: { current: 'stale', anchor: 'sidebarCol' },
    wq12jW: { current: 'stale', anchor: 'triggerEffort' },
  });
  assert.equal(map.BynINW, 'mP3x-q');
  assert.equal(map.wq12jW, '_9r0rkG');
});

test('every authored host class belongs to a declared group', () => {
  const files = ['theme.css', 'workbench.css', 'interactions.css', 'visuals.css'];
  const stray = new Set();
  for (const file of files) {
    const text = readFileSync(new URL('./' + file, import.meta.url), 'utf8');
    for (const match of text.matchAll(/\.([A-Za-z0-9_-]{4,12})_([A-Za-z][A-Za-z0-9]+)/g)) {
      if (!(match[1] in HOST_CLASS_GROUPS)) stray.add(`${file}: ${match[1]}_${match[2]}`);
    }
  }
  assert.deepEqual([...stray], [], 'host classes must be declared in host-classes.mjs');
});

test('baked map covers every group and is retargetable', () => {
  const css = ['theme.css', 'workbench.css', 'interactions.css', 'visuals.css']
    .map(file => readFileSync(new URL('./' + file, import.meta.url), 'utf8'))
    .join('\n');
  const out = retargetCss(css, HOST_CLASS_CURRENT);
  for (const [legacy, prefix] of Object.entries(HOST_CLASS_CURRENT)) {
    if (legacy === prefix) continue;
    assert.doesNotMatch(out, new RegExp('\\.' + legacy.replace(/[-]/g, '\\-') + '_'), `legacy prefix ${legacy} still present`);
    assert.match(out, new RegExp(prefix.replace(/[-]/g, '\\-') + '_'), `target prefix ${prefix} missing`);
  }
  assert.deepEqual(Object.keys(HOST_CLASS_CURRENT).sort(), Object.keys(HOST_CLASS_GROUPS).sort());
});

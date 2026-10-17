import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('registers offline style injection and releases it on disposal', async () => {
  const { apply } = await import('./index.mjs');
  let event, handler, disposed = false;
  const routes = [];
  const scope = {
    webServer: { register(route) { routes.push(route); return () => {}; } },
    effect() {},
  };
  const dispose = apply({
    on(name, cb) { event = name; handler = cb; return () => { disposed = true; }; },
    inject(deps, cb) { cb(scope); },
  });
  assert.equal(event, 'webserver/index-inject');
  assert.equal(routes.length, 1);
  assert.equal(routes[0].kind, 'exact');
  assert.equal(routes[0].path, '/__island-theme/config');
  const table = [];
  handler(table);
  assert.equal(table.length, 1);
  assert.equal(table[0].kind, 'style');
  assert.match(table[0].text, /#fafbf6/);
  assert.match(table[0].text, /data-ds-dark-theme/);
  assert.match(table[0].text, /island-intro/);
  assert.doesNotMatch(table[0].text, /@import|https?:\/\//);
  dispose();
  assert.equal(disposed, true);
});

test('body text and lime-button colors retain accessible contrast', () => {
  function l(hex) { const rgb = hex.match(/[\da-f]{2}/gi).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4); return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722; }
  function ratio(a,b){return (Math.max(l(a),l(b))+.05)/(Math.min(l(a),l(b))+.05);}
  for (const pair of [['242a22','fafbf6'],['f0f2e9','141814'],['253319','cef76c'],['616b58','ffffff'],['a4ae9d','1c211b']]) assert(ratio(...pair)>=4.5,pair.join('/'));
  const css = readFileSync(new URL('./theme.css', import.meta.url),'utf8');
  const value = name => css.match(new RegExp('--island-'+name+': #([a-f0-9]{6})'))[1];
  for (const text of ['moss','caption','muted']) for (const background of ['paper','surface','subtle','sidebar']) {
    assert(ratio(value(text),value(background))>=4.5,text+'/'+background);
  }
});

test('generated client embeds the three island skins without source checkout paths', () => {
  const client = readFileSync(new URL('./client.js', import.meta.url), 'utf8');
  assert.equal((client.match(/data:image\/webp;base64,/g) ?? []).length, 3);
  for (const skin of ['day-island', 'night-island', 'island-mascot']) assert(client.includes(skin));
  assert.doesNotMatch(client, /D:\/project\/my-blog/i);
});

test('generated client registers the settings card and config endpoint', () => {
  const client = readFileSync(new URL('./client.js', import.meta.url), 'utf8');
  assert.match(client, /settings\.plugins\.tab/);
  assert.match(client, /__island-theme\/config/);
  assert.match(client, /require\('react'\)/);
});

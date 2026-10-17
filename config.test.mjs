import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';

const { apply, normalizeIslandConfig, ISLAND_CONFIG_PATH } = await import('./index.mjs');

function fakeResponse() {
  return {
    status: undefined,
    headers: undefined,
    body: undefined,
    writeHead(status, headers) { this.status = status; this.headers = headers; },
    end(payload) { this.body = payload; },
    json() { return JSON.parse(this.body); },
  };
}

function postRequest(body) {
  const req = new EventEmitter();
  req.method = 'POST';
  queueMicrotask(() => {
    req.emit('data', Buffer.from(typeof body === 'string' ? body : JSON.stringify(body)));
    req.emit('end');
  });
  return req;
}

function fakeCtx({ config, entry } = {}) {
  const routes = new Map();
  const scope = {
    webServer: {
      register(route) {
        routes.set(route.path, route);
        return () => routes.delete(route.path);
      },
    },
    effect() {},
  };
  const ctx = {
    fiber: { entry },
    on() { return () => {}; },
    inject(deps, cb) { cb(scope); },
  };
  return { ctx, routes };
}

test('normalizes skin and introVisual with safe defaults', () => {
  assert.deepEqual(normalizeIslandConfig({}), { skin: 'day-island', introVisual: 'island' });
  assert.deepEqual(normalizeIslandConfig(undefined), { skin: 'day-island', introVisual: 'island' });
  assert.deepEqual(normalizeIslandConfig({ skin: 'night-island', introVisual: 'mascot' }), { skin: 'night-island', introVisual: 'mascot' });
  assert.deepEqual(normalizeIslandConfig({ skin: 'bogus', introVisual: 42 }), { skin: 'day-island', introVisual: 'island' });
  assert.deepEqual(normalizeIslandConfig({ skin: 'island-mascot', extra: 'x' }), { skin: 'island-mascot', introVisual: 'island' });
});

test('registers the config route and serves current preferences', async () => {
  const entry = { options: { config: { skin: 'night-island' } }, parent: { tree: { write() {} } } };
  const { ctx, routes } = fakeCtx({ entry });
  apply(ctx);
  const route = routes.get(ISLAND_CONFIG_PATH);
  assert.ok(route, 'config route is registered');
  assert.equal(route.kind, 'exact');
  const res = fakeResponse();
  await route.handler({ method: 'GET' }, res);
  assert.equal(res.status, 200);
  assert.deepEqual(res.json(), { skin: 'night-island', introVisual: 'island' });
});

test('falls back to plugin config and defaults when no entry row exists', async () => {
  const { ctx, routes } = fakeCtx();
  apply(ctx, { skin: 'island-mascot', introVisual: 'mascot' });
  const res = fakeResponse();
  await routes.get(ISLAND_CONFIG_PATH).handler({ method: 'GET' }, res);
  assert.deepEqual(res.json(), { skin: 'island-mascot', introVisual: 'mascot' });
});

test('POST normalizes, persists through the owning loader row, and answers accepted values', async () => {
  let written = 0;
  const entry = { options: { config: { skin: 'day-island' } }, parent: { tree: { async write() { written++; } } } };
  const { ctx, routes } = fakeCtx({ entry });
  apply(ctx);
  const res = fakeResponse();
  await routes.get(ISLAND_CONFIG_PATH).handler(postRequest({ skin: 'night-island', introVisual: 'mascot', bogus: true }), res);
  assert.equal(res.status, 200);
  assert.deepEqual(res.json(), { skin: 'night-island', introVisual: 'mascot' });
  assert.equal(written, 1);
  assert.deepEqual(entry.options.config, { skin: 'night-island', introVisual: 'mascot' });
});

test('POST rejects invalid JSON and unknown methods', async () => {
  const entry = { options: {}, parent: { tree: { write() {} } } };
  const { ctx, routes } = fakeCtx({ entry });
  apply(ctx);
  const route = routes.get(ISLAND_CONFIG_PATH);
  const bad = fakeResponse();
  await route.handler(postRequest('{nope'), bad);
  assert.equal(bad.status, 400);
  const other = fakeResponse();
  await route.handler({ method: 'PUT' }, other);
  assert.equal(other.status, 405);
});

test('POST reports failure when the loader row cannot persist', async () => {
  const { ctx, routes } = fakeCtx({ entry: undefined });
  apply(ctx);
  const res = fakeResponse();
  await routes.get(ISLAND_CONFIG_PATH).handler(postRequest({ skin: 'night-island' }), res);
  assert.equal(res.status, 500);
});

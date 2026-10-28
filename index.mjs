import { readFileSync } from 'node:fs';
import { HOST_CLASS_CURRENT, retargetCss } from './host-classes.mjs';

export const name = 'island-theme';
export const description = 'ISLAND 开发工作台：暖白与森林配色、更宽的对话、清晰代码及精简工具栏。';

export const ISLAND_SKINS = ['day-island', 'night-island', 'island-mascot'];
export const ISLAND_INTRO_VISUALS = ['island', 'mascot'];
export const ISLAND_DEFAULTS = { skin: 'day-island', introVisual: 'island' };

export const ISLAND_CONFIG_PATH = '/__island-theme/config';

export function normalizeIslandConfig(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  return {
    skin: ISLAND_SKINS.includes(source.skin) ? source.skin : ISLAND_DEFAULTS.skin,
    introVisual: ISLAND_INTRO_VISUALS.includes(source.introVisual) ? source.introVisual : ISLAND_DEFAULTS.introVisual,
  };
}

// Authored against the legacy host prefixes; retarget for the host build this
// release targets so the server-injected paint is already correct.
const css = retargetCss(
  ['theme.css', 'workbench.css', 'interactions.css', 'visuals.css']
    .map(file => readFileSync(new URL(file, import.meta.url), 'utf8'))
    .join('\n'),
  HOST_CLASS_CURRENT,
);

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  res.end(payload);
}

function readRequestBody(req, limit = 8192) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error('request body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

async function persistConfig(ctx, config) {
  const entry = ctx.fiber?.entry;
  if (!entry?.options || typeof entry.parent?.tree?.write !== 'function') {
    throw new Error('owning loader entry is unavailable');
  }
  entry.options.config = { ...(entry.options.config ?? {}), ...config };
  await entry.parent.tree.write();
}

async function handleConfigRequest(ctx, getConfig, setConfig, req, res) {
  try {
    if (req.method === 'GET') {
      sendJson(res, 200, getConfig());
      return;
    }
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'method not allowed' });
      return;
    }
    let body;
    try {
      body = JSON.parse(await readRequestBody(req));
    } catch {
      sendJson(res, 400, { error: 'invalid JSON body' });
      return;
    }
    const next = normalizeIslandConfig(body);
    await persistConfig(ctx, next);
    setConfig(next);
    sendJson(res, 200, next);
  } catch (error) {
    sendJson(res, 500, { error: error instanceof Error ? error.message : String(error) });
  }
}

export function apply(ctx, config) {
  let current = normalizeIslandConfig(ctx.fiber?.entry?.options?.config ?? config);
  const getConfig = () => normalizeIslandConfig(ctx.fiber?.entry?.options?.config ?? current);
  const setConfig = (next) => { current = next; };
  const disposers = [
    ctx.on('webserver/index-inject', (table) => {
      table.push({ kind: 'style', text: css });
    }),
  ];
  ctx.inject(['webServer'], (scope) => {
    const unregister = scope.webServer.register({
      kind: 'exact',
      path: ISLAND_CONFIG_PATH,
      handler: (req, res) => handleConfigRequest(ctx, getConfig, setConfig, req, res),
    });
    scope.effect(() => unregister);
  });
  return () => disposers.forEach(dispose => dispose());
}

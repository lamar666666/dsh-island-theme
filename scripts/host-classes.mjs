#!/usr/bin/env node
/**
 * Verify (or refresh) the host class prefixes in host-classes.mjs.
 *
 * The host ships CSS Modules, so every host build rehashes component prefixes.
 * This reads the installed app.asar, matches each group's legacy class names to
 * the component that carries them now, and reports drift.
 *
 *   node scripts/host-classes.mjs                 # check against the installed app
 *   node scripts/host-classes.mjs --write         # update host-classes.mjs
 *   node scripts/host-classes.mjs --asar <path>   # use another app.asar
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { HOST_CLASS_GROUPS } from '../host-classes.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CSS_FILES = ['theme.css', 'workbench.css', 'interactions.css', 'visuals.css'];
const JS_FILES = ['client-runtime.mjs', 'theme-runtime.mjs', 'settings-page.mjs', 'index.mjs'];
const CLASS_TOKEN = /\.([A-Za-z0-9_-]{4,12})_([A-Za-z][A-Za-z0-9]+)/g;
const HOST_TOKEN = /([A-Za-z0-9_-]{4,12})_([A-Za-z][A-Za-z0-9]+)/g;

function parseArgs(argv) {
  const options = { write: false, asar: process.env.DSH_ASAR };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--write') options.write = true;
    else if (argv[i] === '--asar') options.asar = argv[++i];
    else if (argv[i] === '--help') options.help = true;
  }
  return options;
}

function defaultAsar() {
  const candidates = [
    'D:/software/deepseek harness/resources/app.asar',
    join(process.env.LOCALAPPDATA || '', 'Programs/DeepSeek Harness/resources/app.asar'),
    '/Applications/DeepSeek Harness.app/Contents/Resources/app.asar',
  ];
  for (const candidate of candidates) {
    try { if (statSync(candidate).isFile()) return candidate; } catch { /* keep looking */ }
  }
  return null;
}

/** Read an Electron asar archive: [4 pickle][4 padded][4 json size][json][data]. */
function readAsar(path) {
  const buffer = readFileSync(path);
  let jsonStart = 8;
  if (buffer.subarray(8, 12).toString('latin1') !== '{"fi') jsonStart = 16;
  const jsonLength = buffer.readUInt32LE(jsonStart - 4);
  const header = JSON.parse(buffer.subarray(jsonStart, jsonStart + jsonLength).toString('utf8'));
  const dataStart = jsonStart + jsonLength;
  const files = [];
  (function walk(node, prefix) {
    for (const [name, entry] of Object.entries(node.files ?? {})) {
      const entryPath = prefix ? `${prefix}/${name}` : name;
      if (entry.files) walk(entry, entryPath);
      else files.push({ path: entryPath, offset: Number(entry.offset), size: entry.size });
    }
  })(header, '');
  return { buffer, dataStart, files };
}

/** Legacy authored classes, grouped by the prefix they were written with. */
function readAuthoredGroups() {
  const groups = new Map();
  for (const file of [...CSS_FILES, ...JS_FILES]) {
    const text = readFileSync(join(ROOT, file), 'utf8');
    for (const match of text.matchAll(CLASS_TOKEN)) {
      const prefix = match[1];
      if (!(prefix in HOST_CLASS_GROUPS)) continue;
      if (!groups.has(prefix)) groups.set(prefix, new Set());
      groups.get(prefix).add(match[2]);
    }
  }
  return groups;
}

/** prefix -> Set(local) for every class the installed host actually ships. */
function readHostGroups(asarPath) {
  const { buffer, dataStart, files } = readAsar(asarPath);
  const byPrefix = new Map();
  const bundles = files.filter(file => /@deepseek-ai\/[^/]+\/lib\/client\.js$/.test(file.path));
  for (const file of bundles) {
    const text = buffer.subarray(dataStart + file.offset, dataStart + file.offset + file.size).toString('utf8');
    for (const match of text.matchAll(HOST_TOKEN)) {
      if (!byPrefix.has(match[1])) byPrefix.set(match[1], new Set());
      byPrefix.get(match[1]).add(match[2]);
    }
  }
  return { byPrefix, bundles: bundles.length };
}

/**
 * Match an anchored group to the host prefix that carries the same anchor
 * class. Anchors are chosen to exist in exactly one host component, so this is
 * a semantic match: a rebuild that rehashes the component still resolves. Raw
 * local-name overlap only breaks ties when more than one component shares it.
 */
function matchGroup(locals, anchor, byPrefix) {
  if (!anchor) return { status: 'SKIP', detail: 'no anchor; kept inert by design' };
  const owners = [];
  for (const [prefix, hostLocals] of byPrefix) {
    if (hostLocals.has(anchor)) owners.push(prefix);
  }
  if (!owners.length) {
    return { status: 'UNRESOLVED', detail: `anchor "_${anchor}" not present in this host build` };
  }
  if (owners.length === 1) return { status: 'MATCH', next: owners[0] };
  const scored = owners.map(prefix => {
    const hostLocals = byPrefix.get(prefix);
    let overlap = 0;
    for (const local of locals) if (hostLocals.has(local)) overlap++;
    return { prefix, overlap };
  }).sort((a, b) => b.overlap - a.overlap);
  if (scored[0].overlap > (scored[1]?.overlap ?? 0)) return { status: 'MATCH', next: scored[0].prefix };
  return { status: 'AMBIGUOUS', detail: `anchor shared by ${owners.join(', ')}` };
}

const options = parseArgs(process.argv.slice(2));
if (options.help) {
  console.log('usage: node scripts/host-classes.mjs [--write] [--asar <app.asar>]');
  process.exit(0);
}

const asarPath = options.asar ? resolve(options.asar) : defaultAsar();
if (!asarPath) {
  console.error('No app.asar found. Pass --asar <path> or set DSH_ASAR.');
  process.exit(2);
}

const authored = readAuthoredGroups();
const { byPrefix, bundles } = readHostGroups(asarPath);
const results = [];
let drift = 0;

for (const [prefix, group] of Object.entries(HOST_CLASS_GROUPS)) {
  const locals = authored.get(prefix);
  if (!locals || !locals.size) {
    results.push({ prefix, status: 'UNUSED', detail: 'no authored classes' });
    continue;
  }
  const match = matchGroup(locals, group.anchor, byPrefix);
  if (match.status === 'SKIP') {
    results.push({ prefix, status: 'SKIP', detail: `${match.detail} (${locals.size} authored classes)` });
    continue;
  }
  if (match.status !== 'MATCH') {
    results.push({ prefix, status: match.status, detail: `${match.detail} (${locals.size} authored classes)`, group });
    drift++;
    continue;
  }
  const same = match.next === group.current;
  if (!same) drift++;
  results.push({
    prefix,
    status: same ? 'OK' : 'DRIFT',
    detail: `${group.current} -> ${match.next} (anchor _${group.anchor}, ${locals.size} authored classes)`,
    next: match.next,
    group,
  });
}

console.log(`app.asar: ${asarPath}`);
console.log(`host bundles scanned: ${bundles}, prefixes: ${byPrefix.size}\n`);
for (const result of results) {
  console.log(`${result.prefix.padEnd(9)} ${result.status.padEnd(11)} ${result.detail}`);
}

if (options.write) {
  const file = join(ROOT, 'host-classes.mjs');
  let source = readFileSync(file, 'utf8');
  let changed = 0;
  for (const result of results) {
    if (result.status !== 'DRIFT' && result.status !== 'UNRESOLVED') continue;
    if (!result.next) continue;
    const pattern = new RegExp(`(\\n\\s*'?${result.prefix.replace(/[-]/g, '\\-')}'?:\\s*\\{ current: ')[^']*(')`);
    if (pattern.test(source)) { source = source.replace(pattern, `$1${result.next}$2`); changed++; }
  }
  if (changed) {
    writeFileSync(file, source);
    console.log(`\nupdated ${changed} group(s) in host-classes.mjs — review the diff, then npm run build && npm test`);
  } else {
    console.log('\nnothing to update');
  }
  process.exit(0);
}

if (drift) {
  console.error(`\n${drift} group(s) drifted from the installed host. Re-run with --write, review, then rebuild.`);
  process.exit(1);
}
console.log('\nall groups match the installed host');

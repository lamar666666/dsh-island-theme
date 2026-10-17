import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createIslandSettingsCard } from './settings-page.mjs';

// Minimal React surface the card uses: createElement trees plus working
// useState/useEffect so clicks re-render and effects resolve.
function createReactShim() {
  let hooks;
  let hookIndex;
  let pendingEffects;
  let rerender;
  const React = {
    createElement: (type, props, ...children) => ({
      type,
      props: props ?? {},
      children: children.flat(Infinity).filter(child => child !== null && child !== undefined && child !== false),
    }),
    useState: (initial) => {
      const index = hookIndex++;
      const slot = (hooks[index] ??= {});
      if (!('value' in slot)) slot.value = typeof initial === 'function' ? initial() : initial;
      return [slot.value, (value) => {
        slot.value = typeof value === 'function' ? value(slot.value) : value;
        rerender();
      }];
    },
    useEffect: (fn, deps) => {
      const index = hookIndex++;
      const slot = (hooks[index] ??= {});
      const prev = slot.effect;
      if (prev && deps && prev.deps && deps.every((dep, i) => dep === prev.deps[i])) return;
      slot.effect = { deps };
      pendingEffects.push({ slot, fn });
    },
  };
  function resolve(node) {
    if (typeof node !== 'object' || node === null) return node;
    if (typeof node.type === 'function') {
      const rendered = node.type({ ...node.props, children: node.children });
      return resolve(rendered);
    }
    return { ...node, children: node.children.map(resolve) };
  }
  function runEffects() {
    const pending = pendingEffects;
    pendingEffects = [];
    for (const { slot, fn } of pending) {
      slot.effect.cleanup?.();
      const cleanup = fn();
      if (typeof cleanup === 'function') slot.effect.cleanup = cleanup;
    }
  }
  function render(component) {
    hooks = {};
    pendingEffects = [];
    rerender = () => {
      hookIndex = 0;
      current = resolve(React.createElement(component, {}));
      runEffects();
    };
    let current;
    rerender();
    return () => current;
  }
  return { React, render };
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function findAll(node, predicate, out = []) {
  if (typeof node !== 'object' || node === null) return out;
  if (predicate(node)) out.push(node);
  for (const child of node.children ?? []) findAll(child, predicate, out);
  return out;
}

function click(node) {
  node.props.onClick();
}

function makeHost({ skin = 'day-island', introVisual = 'island' } = {}) {
  const calls = [];
  return {
    calls,
    load: () => Promise.resolve({ skin, introVisual }),
    save: (config) => { calls.push(config); return Promise.resolve(config); },
    applied: (config) => { calls.push({ applied: config }); },
  };
}

test('card loads config and renders both choice groups', async () => {
  const { React, render } = createReactShim();
  const Card = createIslandSettingsCard(React, makeHost());
  const tree = render(Card);
  await sleep(0);
  const root = tree();
  assert.equal(root.type, 'div');
  const groups = findAll(root, n => n.props.className === 'island-field');
  assert.equal(groups.length, 2);
  assert.equal(findAll(root, n => n.props.className === 'island-seg-option').length, 5);
});

test('picking options marks the card dirty and save posts both fields', async () => {
  const { React, render } = createReactShim();
  const host = makeHost();
  const Card = createIslandSettingsCard(React, host);
  const tree = render(Card);
  await sleep(0);
  const options = findAll(tree(), n => n.props.className === 'island-seg-option');
  click(options[1]); // night-island
  click(options[4]); // mascot intro
  let root = tree();
  assert.ok(findAll(root, n => n.props.className === 'island-card-pending').length === 1);
  click(findAll(root, n => n.props.className === 'island-card-save')[0]);
  await sleep(0);
  assert.deepEqual(host.calls[0], { skin: 'night-island', introVisual: 'mascot' });
  assert.deepEqual(host.calls[1], { applied: { skin: 'night-island', introVisual: 'mascot' } });
  root = tree();
  assert.equal(findAll(root, n => n.props.className === 'island-card-pending').length, 0);
});

test('discard restores the persisted values', async () => {
  const { React, render } = createReactShim();
  const host = makeHost({ skin: 'night-island' });
  const Card = createIslandSettingsCard(React, host);
  const tree = render(Card);
  await sleep(0);
  click(findAll(tree(), n => n.props.className === 'island-seg-option')[0]);
  click(findAll(tree(), n => n.props.className === 'island-card-discard')[0]);
  const pressed = findAll(tree(), n => n.props['aria-pressed'] === 'true');
  assert.equal(pressed[0].children[0], 'night-island');
});

test('a rejected load shows defaults with an error hint', async () => {
  const { React, render } = createReactShim();
  const host = makeHost();
  host.load = () => Promise.reject(new Error('nope'));
  const Card = createIslandSettingsCard(React, host);
  const tree = render(Card);
  await sleep(0);
  const root = tree();
  assert.equal(findAll(root, n => n.props.className === 'island-seg-option').length, 5);
  assert.equal(findAll(root, n => n.props.className === 'island-card-error').length, 1);
  click(findAll(root, n => n.props.className === 'island-seg-option')[1]);
  click(findAll(tree(), n => n.props.className === 'island-card-save')[0]);
  await sleep(0);
  assert.deepEqual(host.calls[0], { skin: 'night-island', introVisual: 'island' });
});

test('a rejected save surfaces the error status', async () => {
  const { React, render } = createReactShim();
  const host = makeHost();
  host.save = () => Promise.reject(new Error('nope'));
  const Card = createIslandSettingsCard(React, host);
  const tree = render(Card);
  await sleep(0);
  click(findAll(tree(), n => n.props.className === 'island-seg-option')[1]);
  click(findAll(tree(), n => n.props.className === 'island-card-save')[0]);
  await sleep(0);
  assert.equal(findAll(tree(), n => n.props.className === 'island-card-error').length, 1);
});

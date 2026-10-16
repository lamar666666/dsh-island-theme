import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('wider default keeps the native user width override', () => {
  const css = readFileSync(new URL('./workbench.css', import.meta.url),'utf8');
  assert.match(css, /--dsh-chat-content-width:\s*var\(--dsh-chat-user-width,/);
  assert.match(css, /--dsh-composer-card-max-width:\s*var\(--dsh-chat-content-width\)/);
});

test('workbench uses native controls without replacing transcript data', async () => {
  const { apply } = await import('./index.mjs');
  let inject;
  apply({on(_, cb){inject=cb;return ()=>{};}});
  const rows=[];
  inject(rows);
  assert.equal(rows.length,1);
  assert.equal(rows[0].kind,'style');
  assert.match(rows[0].text,/ISLAND workbench/);
  assert.doesNotMatch(rows[0].text,/display:\s*none[^}]*iq1doa_label/);
});

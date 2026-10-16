import { readFileSync } from 'node:fs';

export const name = 'island-theme';
export const description = 'ISLAND 开发工作台：暖白与森林配色、更宽的对话、清晰代码及精简工具栏。';
const css = ['theme.css', 'workbench.css', 'interactions.css']
  .map(file => readFileSync(new URL(file, import.meta.url), 'utf8'))
  .join('\n');

export function apply(ctx) {
  return ctx.on('webserver/index-inject', (table) => {
    table.push({ kind: 'style', text: css });
  });
}

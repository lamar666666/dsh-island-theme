import { readFile, writeFile } from 'node:fs/promises';
import { installIslandInteractions } from '../client-runtime.mjs';
import { createEffortCommitter } from '../host-bridge.mjs';

const css=(await Promise.all(['theme.css','workbench.css','interactions.css'].map(file=>readFile(new URL('../'+file,import.meta.url),'utf8')))).join('\n');
const skins = Object.fromEntries(await Promise.all([
  ['day-island', 'island-day.webp'],
  ['night-island', 'island-night.webp'],
  ['island-mascot', 'island-mascot.webp'],
].map(async ([name, file]) => [name, `data:image/webp;base64,${(await readFile(new URL('../assets/' + file, import.meta.url))).toString('base64')}`])));
const source = `// Generated from runtime sources, CSS, and local artwork. Run npm run build after editing.\nconst islandSkins = ${JSON.stringify(skins)};\nwindow.__ModuleLoader__.load({\n  id: 'dsh-island-theme',\n  factory: () => ({\n    apply(ctx) {\n      let commitEffort;\n      ctx.inject(['modelDirectories','uiWorkspace','sessions'], scope => {\n        const select=(${createEffortCommitter.toString()})(scope,document);\n        commitEffort=select;scope.effect(()=>()=>{if(commitEffort===select)commitEffort=undefined;});\n      });\n      ctx.effect(() => {\n      const style=document.createElement('style');\n      style.dataset.plugin='dsh-island-theme';style.dataset.pluginCss='island-theme-live';\n      style.textContent=${JSON.stringify(css)};document.head.appendChild(style);\n      const dispose=(${installIslandInteractions.toString()})(document, window, {commitEffort:request=>commitEffort?commitEffort(request):Promise.resolve({handled:false})});\n      return () => {dispose();style.remove();};\n    }); }\n  })\n});\n`;
await writeFile(new URL('../client.js', import.meta.url), source);

import { readFile, writeFile } from 'node:fs/promises';
import { installIslandInteractions } from '../client-runtime.mjs';
import { createEffortCommitter } from '../host-bridge.mjs';
import { installIslandTheme } from '../theme-runtime.mjs';
import { createIslandSettingsCard } from '../settings-page.mjs';

const css=(await Promise.all(['theme.css','workbench.css','interactions.css','visuals.css'].map(file=>readFile(new URL('../'+file,import.meta.url),'utf8')))).join('\n');
const assets = Object.fromEntries(await Promise.all([
  'island-day', 'island-night', 'island-mascot',
].map(async (name) => [name, `data:image/webp;base64,${(await readFile(new URL(`../assets/${name}.webp`, import.meta.url))).toString('base64')}`])));

const dictionaries = {
  zh: {
    title: 'ISLAND 主题',
    description: '工作台皮肤与启动片头',
    skinLabel: '工作台皮肤',
    skinDay: '晨光浮岛',
    skinNight: '浮岛夜航',
    skinMascot: '岛灵同行',
    introLabel: '片头主视觉',
    introIsland: '浮岛',
    introMascot: '岛灵',
    unsaved: '未保存',
    save: '保存',
    saving: '保存中…',
    discard: '放弃',
    saveFailed: '保存失败',
    loadFailed: '读取配置失败，当前显示默认值',
  },
  en: {
    title: 'ISLAND theme',
    description: 'Workbench skin and startup intro',
    skinLabel: 'Workbench skin',
    skinDay: 'Morning Island',
    skinNight: 'Night Voyage',
    skinMascot: 'Island Spirit',
    introLabel: 'Intro visual',
    introIsland: 'Island',
    introMascot: 'Spirit',
    unsaved: 'Unsaved',
    save: 'Save',
    saving: 'Saving…',
    discard: 'Discard',
    saveFailed: 'Save failed',
    loadFailed: 'Could not load settings; showing defaults',
  },
};

const source = `// Generated from runtime sources, CSS, and local artwork. Run npm run build after editing.
const islandAssets = ${JSON.stringify(assets)};
const islandDictionaries = ${JSON.stringify(dictionaries)};
const ISLAND_CONFIG_PATH = '/__island-theme/config';
const islandHost = {
  load: () => fetch(ISLAND_CONFIG_PATH).then((response) => {
    if (!response.ok) throw new Error('island-theme config read failed');
    return response.json();
  }),
  save: (config) => fetch(ISLAND_CONFIG_PATH, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(config),
  }).then((response) => {
    if (!response.ok) throw new Error('island-theme config write failed');
    return response.json();
  }),
  applied: undefined,
};
window.__ModuleLoader__.load({
  id: 'dsh-island-theme',
  factory: (require) => {
    const React = require('react');
    const IslandThemeCard = (${createIslandSettingsCard.toString()})(React, islandHost);
    return {
      apply(ctx) {
        let commitEffort;
        ctx.inject(['modelDirectories','uiWorkspace','sessions'], scope => {
          const select=(${createEffortCommitter.toString()})(scope,document);
          commitEffort=select;scope.effect(()=>()=>{if(commitEffort===select)commitEffort=undefined;});
        });
        ctx.inject(['slots','locale'], scope => {
          scope.effect(() => scope.locale.register('settings.island-theme', islandDictionaries), 'island-theme: settings dictionaries');
          const t = scope.locale.bind('settings.island-theme');
          scope.slots.inject('settings.plugins.tab', () => scope.slots.register({
            name: 'settings.plugins.tab',
            id: 'island-theme',
            order: 40,
            label: () => t('title'),
            locale: 'settings.island-theme',
          }, IslandThemeCard));
        });
        ctx.effect(() => {
        const style=document.createElement('style');
        style.dataset.plugin='dsh-island-theme';style.dataset.pluginCss='island-theme-live';
        style.textContent=${JSON.stringify(css)};document.head.appendChild(style);
        const themeHandle=(${installIslandTheme.toString()})(document, window, {
          assets: islandAssets,
          ready: Promise.resolve().then(() => islandHost.load()).catch(() => undefined),
        });
        islandHost.applied=(config)=>themeHandle.update(config);
        const dispose=(${installIslandInteractions.toString()})(document, window, {commitEffort:request=>commitEffort?commitEffort(request):Promise.resolve({handled:false})});
        return () => {themeHandle.dispose();dispose();style.remove();};
      }); }
    };
  }
});
`;
await writeFile(new URL('../client.js', import.meta.url), source);

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { runInContext } from 'node:vm';
import { installIslandInteractions } from './client-runtime.mjs';
import { createEffortCommitter } from './host-bridge.mjs';

function environment(html,options={}) {
  const dom = new JSDOM('<!doctype html><html lang="zh-CN"><body>'+html+'</body></html>', {pretendToBeVisual:true,url:'https://example.test'});
  const dispose = installIslandInteractions(dom.window.document,dom.window,options);
  return { dom, document:dom.window.document, window:dom.window, close(){dispose();dom.window.close();} };
}
const pane = (role='menu') => `<div class="wq12jW_menu" role="${role}"><button role="menuitemradio" aria-checked="false">Basic</button><button role="menuitemradio" aria-checked="true">Deep</button><button role="menuitemradio" aria-checked="false">Maximum</button></div>`;

test('generated client owns its live stylesheet and removes it on disposal', () => {
  const dom=new JSDOM('<html><body></body></html>',{runScripts:'outside-only',pretendToBeVisual:true});
  let dispose;
  dom.window.__ModuleLoader__={load(module){module.factory().apply({inject(){},effect(fn){dispose=fn();}});}};
  try {
    runInContext(readFileSync(new URL('./client.js',import.meta.url),'utf8'),dom.getInternalVMContext());
    const style=dom.window.document.querySelector('[data-plugin-css="island-theme-live"]');
    assert(style);assert(style.textContent.includes('ISLAND interactions 1.3.2'));
    dispose();assert.equal(dom.window.document.querySelector('[data-plugin-css="island-theme-live"]'),null);
    assert.equal(dom.window.document.body.classList.contains('island-interactions-active'),false);
  } finally {dispose?.();dom.window.close();}
});

test('slider derives arbitrary native levels and commits only on change', async () => {
  const env=environment(pane());
  try {
    await delay(35);
    const native=Array.from(env.document.querySelectorAll('[role=menuitemradio]'));
    let clicks=0; native[2].addEventListener('click',()=>clicks++);
    const range=env.document.querySelector('.island-effort-range');
    assert(range,'slider is mounted');
    assert.equal(range.max,'2'); assert.equal(range.value,'1');
    range.value='2'; range.dispatchEvent(new env.window.Event('input',{bubbles:true}));
    await delay(35); // Observer refresh must not reset an uncommitted drag.
    assert.equal(range.value,'2');
    assert.equal(clicks,0); assert.equal(range.getAttribute('aria-valuetext'),'Maximum');
    range.dispatchEvent(new env.window.Event('change',{bubbles:true}));
    assert.equal(clicks,1);
    assert.equal(env.document.querySelectorAll('[role=menuitemradio]')[2],native[2],'native nodes were not replaced');
  } finally {env.close();}
});

test('model-list radio options are not enhanced as reasoning levels', async () => {
  const env=environment(pane('group'));
  try {await delay(35);assert.equal(env.document.querySelector('.island-effort-range'),null);} finally {env.close();}
});

test('attaching and leaving the effort pane asks the host to re-place the menu', async () => {
  const env=environment('');
  try {
    let resizes=0; env.window.addEventListener('resize',()=>resizes++);
    env.document.body.insertAdjacentHTML('beforeend',pane());
    await delay(35);
    assert(env.document.querySelector('.island-effort-range'),'slider is mounted');
    assert(resizes>=1,'attach asks the host to re-measure');
    const menu=env.document.querySelector('.wq12jW_menu');
    // The host swaps the effort rows for its root cells when leaving the pane.
    menu.innerHTML='<button role="menuitem">Model</button><button role="menuitem">Effort</button>';
    await delay(35);
    assert.equal(env.document.querySelector('.island-effort-range'),null);
    assert(resizes>=2,'restore asks the host to re-measure');
  } finally {env.close();}
});

test('back control restores native rows before Escape leaves the pane', async () => {
  const env=environment(pane());
  try {
    await delay(35);
    const menu=env.document.querySelector('.wq12jW_menu');
    let escaped=false;
    menu.addEventListener('keydown',event=>{if(event.key==='Escape'){
      escaped=true;
      // By the time Escape bubbles the pane must look fully native again.
      assert.equal(env.document.querySelector('.island-effort-range'),null);
      assert.equal(menu.classList.contains('island-effort-enhanced'),false);
      // Simulate the host swapping the effort rows for its root cells.
      menu.innerHTML='<button role="menuitem">Model</button><button role="menuitem">Effort</button>';
    }});
    env.document.querySelector('.island-effort-back').click();
    assert(escaped,'Escape reaches the host menu');
    await delay(35);
    assert.equal(env.document.querySelector('.island-effort-range'),null,'no re-attach on a leaving pane');
  } finally {env.close();}
});

test('host service saves the actual catalog effort without invoking a close callback', async () => {
  const dom=new JSDOM('<button class="wq12jW_trigger"></button>');
  const calls=[];
  const directory={store:{getSnapshot:()=>({current:{provider:'provider',model:'model'},groups:[{id:'provider',models:[{id:'model',reasoning:{defaultEffort:'deep',efforts:[{id:'basic',name:'Basic'},{id:'deep',name:'Deep'},{id:'max',name:'Maximum'}]}}]}]})},select:async selection=>{calls.push(selection);return {ok:true};}};
  const scope={uiWorkspace:{mainReference:{sessionId:'session'}},sessions:{subagentAddress:()=>undefined},modelDirectories:{directoryFor:()=>directory}};
  try {
    const save=createEffortCommitter(scope,dom.window.document);
    assert.deepEqual(await save({index:2,labels:['Basic','Deep','Maximum']}),{handled:true,ok:true});
    assert.deepEqual(calls,[{provider:'provider',model:'model',reasoningEffort:'max'}]);
    assert.deepEqual(await save({index:0,labels:['wrong']}),{handled:false});
    assert.equal(calls.length,1);
  } finally {dom.window.close();}
});

test('service-backed selection keeps the same pane open while saving', async () => {
  let env,resolveSave,request;
  env=environment(pane(),{commitEffort:args=>{request=args;return new Promise(resolve=>{resolveSave=()=>{
    const native=env.document.querySelectorAll('[role=menuitemradio]');
    native.forEach((button,i)=>button.setAttribute('aria-checked',String(i===2)));
    resolve({handled:true,ok:true});
  };});}});
  try {
    await delay(35);
    const range=env.document.querySelector('.island-effort-range'),menu=env.document.querySelector('.wq12jW_menu');
    let nativeClicks=0;env.document.querySelectorAll('[role=menuitemradio]').forEach(button=>button.addEventListener('click',()=>nativeClicks++));
    range.value='2';range.dispatchEvent(new env.window.Event('input',{bubbles:true}));range.dispatchEvent(new env.window.Event('change',{bubbles:true}));
    await delay(15);assert.equal(range.disabled,false);assert.equal(range.getAttribute('aria-disabled'),'true');
    assert.equal(request.index,2);resolveSave();await delay(35);
    assert.equal(nativeClicks,0);assert.equal(menu.isConnected,true);assert.equal(env.document.querySelector('.island-effort-range'),range);assert.equal(range.value,'2');
  } finally {env.close();}
});

test('pointer dragging previews geometry and commits on release; arrows commit', async () => {
  const env=environment(pane());
  try {
    await delay(35);
    const native=env.document.querySelectorAll('[role=menuitemradio]');
    let clicks=0;native[0].addEventListener('click',()=>clicks++);
    const range=env.document.querySelector('.island-effort-range');
    range.getBoundingClientRect=()=>({left:10,width:300});
    range.dispatchEvent(new env.window.MouseEvent('pointerdown',{bubbles:true,clientX:290,button:0}));
    range.dispatchEvent(new env.window.MouseEvent('pointermove',{bubbles:true,clientX:18,button:0}));
    await delay(35);
    assert.equal(range.value,'0');assert.equal(clicks,0);
    range.dispatchEvent(new env.window.MouseEvent('pointerup',{bubbles:true,clientX:18,button:0}));
    assert.equal(clicks,1);
    let maxClicks=0;native[2].addEventListener('click',()=>maxClicks++);
    range.dispatchEvent(new env.window.KeyboardEvent('keydown',{key:'End',bubbles:true,cancelable:true}));
    assert.equal(maxClicks,1);
  } finally {env.close();}
});

test('disabled option cannot be committed; disposal restores native controls', async () => {
  const dom=new JSDOM(pane(),{pretendToBeVisual:true}); const {document}=dom.window;
  const native=document.querySelectorAll('[role=menuitemradio]'); native[2].disabled=true;
  native[1].tabIndex=0;
  let clicks=0;native[2].addEventListener('click',()=>clicks++);
  const dispose=installIslandInteractions(document,dom.window);
  try {
  await delay(35);
  let disabledMutations=0;
  const watcher=new dom.window.MutationObserver(items=>{disabledMutations+=items.length;});
  watcher.observe(document.body,{subtree:true,attributes:true,attributeFilter:['disabled']});
  await delay(45);watcher.disconnect();
  assert.equal(disabledMutations,0,'disabled-state observer must settle');
  const range=document.querySelector('.island-effort-range');range.value='2';range.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
  assert.equal(clicks,0);
  dispose();
  assert.equal(document.querySelector('.island-effort-range'),null);
  assert.equal(native[1].getAttribute('tabindex'),'0');
  assert.equal(native[0].hasAttribute('tabindex'),false);
  assert.equal(document.body.classList.contains('island-interactions-active'),false);
  } finally { dispose();dom.window.close(); }
});

test('early title preview uses text and closes on Escape', async () => {
  const env=environment('<div class="_9lTDKa_groupSection"><div class="hIlkoa_projectRow"><span class="hIlkoa_title">Project</span></div><div class="hIlkoa_sessionRow"><span class="hIlkoa_title">&lt;img onerror=alert(1)&gt; long title</span><span class="hIlkoa_time">2 days</span></div></div>');
  try {
    const row=env.document.querySelector('.hIlkoa_sessionRow');
    row.dispatchEvent(new env.window.MouseEvent('pointerover',{bubbles:true}));
    // Native marquee scrolls the title; this must not cancel the earlier preview.
    row.querySelector('.hIlkoa_title').dispatchEvent(new env.window.Event('scroll',{bubbles:false}));
    await delay(260);
    const card=env.document.querySelector('.island-title-preview');
    assert(card);assert(card.textContent.includes('<img onerror=alert(1)>'));
    assert.equal(card.querySelector('img'),null);
    env.document.dispatchEvent(new env.window.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
    assert.equal(env.document.querySelector('.island-title-preview'),null);
  } finally {env.close();}
});

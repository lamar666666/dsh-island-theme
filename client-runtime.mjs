/** Lifecycle-owned DOM enhancements; no host API, model IDs or level names. */
export function installIslandInteractions(d, w, options = {}) {
  w.__islandInteractionsDispose?.();
  const records = new Map();
  let disposed = false, refreshTimer = null, hoverTimer = null, hoverRow = null, preview = null;
  const zh = () => (d.documentElement.lang || 'zh').startsWith('zh');
  const setText = (element, text) => { if (element.textContent !== text) element.textContent = text; };
  const node = (tag, className, text) => {
    const element = d.createElement(tag); element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  d.body.classList.add('island-interactions-active');

  function hidePreview() {
    w.clearTimeout(hoverTimer); hoverTimer = null;
    if (hoverRow) {
      const ids = (hoverRow.getAttribute('aria-describedby') || '').split(/\s+/).filter(id => id && id !== 'island-title-preview');
      if (ids.length) hoverRow.setAttribute('aria-describedby', ids.join(' '));
      else hoverRow.removeAttribute('aria-describedby');
    }
    preview?.remove(); preview = null;
  }
  function stopHover() { hidePreview(); hoverRow = null; }
  function showPreview(row) {
    if (disposed || !row.isConnected || row.classList.contains('hIlkoa_menuOpen')) return;
    // Let the host rich card take over, retaining task, approval and status details.
    if (d.querySelector('.hIlkoa_hoverContent')) return;
    const title = row.querySelector('.hIlkoa_title')?.textContent?.trim();
    if (!title) return;
    preview = node('div', 'island-title-preview');
    preview.id = 'island-title-preview'; preview.setAttribute('role', 'tooltip');
    preview.append(node('div', 'island-title-preview-heading', title));
    const meta = node('div', 'island-title-preview-meta');
    const workspace = row.closest('._9lTDKa_groupSection')?.querySelector('.hIlkoa_projectRow .hIlkoa_title')?.textContent?.trim();
    const time = row.querySelector('.hIlkoa_time')?.textContent?.trim();
    if (workspace) meta.append(node('span', '', workspace));
    if (time) meta.append(node('span', '', time));
    if (meta.childElementCount) preview.append(meta);
    d.body.append(preview);
    const r = row.getBoundingClientRect(), box = preview.getBoundingClientRect();
    const left = r.right + 10 + box.width <= w.innerWidth - 12 ? r.right + 10 : Math.max(12, r.left - box.width - 10);
    preview.style.left = `${left}px`;
    preview.style.top = `${Math.max(12, Math.min(r.top, w.innerHeight - box.height - 12))}px`;
    const ids = (row.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
    row.setAttribute('aria-describedby', [...new Set([...ids, preview.id])].join(' '));
  }
  function over(event) {
    if (!(event.target instanceof w.Element)) return;
    const row = event.target.closest('.hIlkoa_sessionRow');
    if (!row || row === hoverRow) return;
    stopHover(); hoverRow = row;
    hoverTimer = w.setTimeout(() => showPreview(row), 220);
  }
  function out(event) {
    if (!hoverRow || !(event.target instanceof w.Node) || !hoverRow.contains(event.target)) return;
    if (event.relatedTarget instanceof w.Node && hoverRow.contains(event.relatedTarget)) return;
    stopHover();
  }
  function key(event) { if (event.key === 'Escape') stopHover(); }
  function scrolled(event) {
    // The host marquee scrolls its own title. Only layout scrolling dismisses us.
    if (hoverRow && event.target === hoverRow.querySelector('.hIlkoa_title')) return;
    stopHover();
  }

  function restore(record) {
    record.root.remove(); record.menu.classList.remove('island-effort-enhanced');
    for (const [button, tabIndex] of record.originalTabs) {
      button.classList.remove('island-native-effort-choice');
      if (tabIndex === null) button.removeAttribute('tabindex'); else button.setAttribute('tabindex', tabIndex);
    }
    if (record.menu.isConnected && record.focusWasInside && d.activeElement === d.body) {
      record.buttons.find(button => button.getAttribute('aria-checked') === 'true')?.focus({preventScroll:true});
    }
    // The host places the open menu once per pane/state change. Our geometry
    // changes never reach it, so ask for a re-measure through its own listener.
    w.dispatchEvent(new w.Event('resize'));
  }
  function discover(menu) {
    if (menu.getAttribute('role') !== 'menu') return null;
    const buttons = Array.from(menu.querySelectorAll('button[role="menuitemradio"]'));
    if (buttons.length < 2 || buttons.length > 16) return null;
    const labels = buttons.map(button => button.textContent.trim());
    if (labels.some(label => !label) || new Set(labels).size !== labels.length) return null;
    if (buttons.filter(button => button.getAttribute('aria-checked') === 'true').length !== 1) return null;
    return { buttons, labels };
  }
  function attach(menu, data) {
    const root = node('div', 'island-effort-control');
    const header = node('div', 'island-effort-header');
    const center=node('div','island-effort-center');
    const value = node('output', 'island-effort-value');
    const model=node('button','island-effort-model',d.querySelector('.wq12jW_triggerLabel')?.textContent?.trim() || (zh()?'推理等级':'Reasoning effort'));
    model.type='button';model.setAttribute('aria-label',zh()?'返回模型菜单':'Back to model menu');
    const reset=node('button','island-effort-reset');reset.type='button';
    reset.setAttribute('aria-label',zh()?'重置为默认推理等级':'Reset to default reasoning effort');
    center.append(value,model);header.append(center,reset);
    const range = node('input', 'island-effort-range');
    range.type = 'range'; range.min = '0'; range.max = String(data.buttons.length - 1); range.step = '1';
    range.setAttribute('aria-label', zh() ? '推理等级' : 'Reasoning effort');
    const track=node('div','island-effort-track');
    const fill=node('span','island-effort-fill');fill.setAttribute('aria-hidden','true');
    const handle=node('span','island-effort-handle');handle.setAttribute('aria-hidden','true');
    const ticks = node('div', 'island-effort-ticks');
    ticks.style.setProperty('--island-level-count', String(data.buttons.length));
    const record = { menu, root, range, value, buttons:data.buttons, labels:data.labels, originalTabs:new Map(), focusWasInside:menu.contains(d.activeElement), previewing:false, awaitingCommit:false, sawBusy:false, lastSelected:-1, saving:false };
    const isBusy = () => record.saving || menu.getAttribute('aria-busy') === 'true';
    const selected = () => Math.max(0, record.buttons.findIndex(button => button.getAttribute('aria-checked') === 'true'));
    const displayLabel = label => zh()?({off:'关闭',low:'低',medium:'中',high:'高',max:'最高'}[label.toLowerCase()] || label):label;
    const paint = index => {
      range.value = String(index);
      const label=record.labels[index],display=displayLabel(label);
      range.setAttribute('aria-valuetext', display===label?label:`${display} (${label})`);
      const ratio=index / (record.buttons.length - 1);
      root.style.setProperty('--island-effort-position', String(ratio*100)+'%');
      root.style.setProperty('--island-handle-offset', `${14-28*ratio}px`);
      setText(value,display);
      Array.from(ticks.children).forEach((tick, i) => tick.classList.toggle('island-effort-tick-active', i === index));
    };
    const commit = index => {
      const current = discover(menu), target = record.buttons[index];
      // Menu may close or be recomposed during a drag. Never click stale options.
      if (disposed || !menu.isConnected || !root.isConnected || !current || isBusy() || !target?.isConnected || current.buttons[index] !== target || target.disabled || target.getAttribute('aria-disabled') === 'true') { record.previewing=false; paint(selected()); return; }
      if (target.getAttribute('aria-checked') !== 'true') {
        record.awaitingCommit=true; record.sawBusy=false;
        if (typeof options.commitEffort!=='function') { target.click();return; }
        record.saving=true;record.update();
        Promise.resolve().then(()=>options.commitEffort({index,labels:record.labels.slice()})).then(result=>{
          if (disposed || !menu.isConnected || !root.isConnected) return;
          record.saving=false;
          if (result?.handled===false && target.isConnected && !target.disabled) {target.click();return;}
          record.previewing=false;record.awaitingCommit=false;record.update();
          if (!result?.ok) { setText(value,zh()?'保存失败，请重试':'Could not save; retry');value.setAttribute('role','status'); }
        }).catch(()=>{
          record.saving=false;
          if (disposed || !root.isConnected) return;
          record.previewing=false;record.awaitingCommit=false;record.update();
          setText(value,zh()?'保存失败，请重试':'Could not save; retry');value.setAttribute('role','status');
        });
      } else { record.previewing=false; paint(selected()); }
    };
    data.labels.forEach((label, index) => {
      const tick = node('button', 'island-effort-tick', label); tick.type = 'button';
      tick.tabIndex=-1;tick.setAttribute('aria-hidden','true');
      tick.addEventListener('click', () => commit(index)); ticks.append(tick);
    });
    range.addEventListener('input', () => { record.previewing=true; paint(Number(range.value)); });
    range.addEventListener('change', () => commit(Number(range.value)));
    let dragging = false, dragPointer;
    const fromPointer = event => {
      const rect=range.getBoundingClientRect();
      return Math.round(Math.max(0,Math.min(1,(event.clientX-rect.left-14)/Math.max(1,rect.width-28)))*(record.buttons.length-1));
    };
    range.addEventListener('pointerdown', event => {
      if (event.button!==0 || range.disabled || isBusy()) return;
      event.preventDefault();event.stopPropagation();
      dragging=true;dragPointer=event.pointerId;record.previewing=true;
      root.classList.add('island-effort-dragging');
      range.focus({preventScroll:true});range.setPointerCapture?.(event.pointerId);
      paint(fromPointer(event));
    });
    range.addEventListener('pointermove', event => {
      if (!dragging || event.pointerId!==dragPointer) return;
      event.preventDefault();event.stopPropagation();paint(fromPointer(event));
    });
    range.addEventListener('pointerup', event => {
      if (!dragging || event.pointerId!==dragPointer) return;
      event.preventDefault();event.stopPropagation();dragging=false;
      root.classList.remove('island-effort-dragging');
      if (range.hasPointerCapture?.(event.pointerId)) range.releasePointerCapture(event.pointerId);
      commit(fromPointer(event));
    });
    const cancelDrag = () => { if (!dragging) return;dragging=false;record.previewing=false;root.classList.remove('island-effort-dragging');paint(selected()); };
    range.addEventListener('pointercancel', cancelDrag);
    range.addEventListener('lostpointercapture', cancelDrag);
    range.addEventListener('keydown', event => {
      if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
      event.preventDefault();event.stopPropagation();
      if (range.disabled || isBusy()) return;
      const delta=['ArrowLeft','ArrowDown'].includes(event.key)?-1:1;
      const index=event.key==='Home'?0:event.key==='End'?record.buttons.length-1:Math.max(0,Math.min(record.buttons.length-1,Number(range.value)+delta));
      record.previewing=true;paint(index);commit(index);
    });
    record.update = () => {
      const busy=isBusy(), current=selected();
      // Disabling a focused range blurs/closes the host menu. Expose busy via ARIA.
      const disabled=!busy && record.buttons.every(button => button.disabled);
      if (range.disabled!==disabled) range.disabled=disabled;
      const ariaDisabled=String(busy||disabled);
      if (range.getAttribute('aria-disabled')!==ariaDisabled) range.setAttribute('aria-disabled',ariaDisabled);
      if (reset.getAttribute('aria-disabled')!==ariaDisabled) reset.setAttribute('aria-disabled',ariaDisabled);
      Array.from(ticks.children).forEach((tick, i) => {
        const disabled=busy || record.buttons[i].disabled || record.buttons[i].getAttribute('aria-disabled') === 'true';
        if (tick.disabled!==disabled) tick.disabled=disabled;
      });
      if (record.awaitingCommit && busy) record.sawBusy=true;
      const finished=record.awaitingCommit && record.sawBusy && !busy;
      if (current!==record.lastSelected || finished || !record.previewing) {
        record.previewing=false; record.awaitingCommit=false; record.sawBusy=false;
        record.lastSelected=current; paint(current);
      }
    };
    const goBack = () => {
      cancelDrag();
      const native=record.buttons.find(button=>button.isConnected);
      // Detach before the host swaps panes, or its layout pass measures our card.
      restore(record);records.delete(menu);
      native?.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',code:'Escape',bubbles:true,cancelable:true}));
    };
    const resetToDefault = () => {
      cancelDrag();
      // Without the save service only an explicit first "Default" row can reset.
      const nativeReset=()=>{if(record.labels[0]==='Default')commit(0);else{record.previewing=false;paint(selected());}};
      if (disposed || !menu.isConnected || !root.isConnected || isBusy()) { record.previewing=false; paint(selected()); return; }
      if (typeof options.commitEffort!=='function') { nativeReset(); return; }
      record.saving=true;record.awaitingCommit=true;record.sawBusy=false;record.update();
      Promise.resolve().then(()=>options.commitEffort({index:-1,labels:record.labels.slice()})).then(result=>{
        if (disposed || !menu.isConnected || !root.isConnected) return;
        record.saving=false;
        if (result?.handled===false) {nativeReset();return;}
        record.previewing=false;record.awaitingCommit=false;record.update();
        if (!result?.ok) { setText(value,zh()?'保存失败，请重试':'Could not save; retry');value.setAttribute('role','status'); }
      }).catch(()=>{
        record.saving=false;
        if (disposed || !root.isConnected) return;
        record.previewing=false;record.awaitingCommit=false;record.update();
        setText(value,zh()?'保存失败，请重试':'Could not save; retry');value.setAttribute('role','status');
      });
    };
    reset.addEventListener('click',resetToDefault);model.addEventListener('click',goBack);
    track.append(fill,ticks,range,handle);root.append(header,track);menu.append(root);
    // Move focus within the same native menu before its old options are concealed.
    if (record.focusWasInside) range.focus({preventScroll:true});
    for (const button of data.buttons) {
      record.originalTabs.set(button, button.getAttribute('tabindex'));
      button.classList.add('island-native-effort-choice'); button.tabIndex = -1;
    }
    menu.classList.add('island-effort-enhanced'); record.update();
    w.dispatchEvent(new w.Event('resize'));
    return record;
  }
  function sync() {
    refreshTimer = null; if (disposed) return;
    if (hoverRow && (!hoverRow.isConnected || hoverRow.classList.contains('hIlkoa_menuOpen'))) stopHover();
    if (preview && d.querySelector('.hIlkoa_hoverContent')) hidePreview();
    for (const [menu, record] of records) {
      const data = menu.isConnected ? discover(menu) : null;
      if (!data || !record.root.isConnected || data.buttons.some((button, i) => button !== record.buttons[i]) || data.buttons.length !== record.buttons.length || data.labels.some((label,i)=>label!==record.labels[i])) {
        restore(record); records.delete(menu);
      } else record.update();
    }
    for (const menu of d.querySelectorAll('.wq12jW_menu')) {
      if (records.has(menu)) continue;
      const data = discover(menu); if (data) records.set(menu, attach(menu, data));
    }
  }
  const schedule = () => { if (!disposed && refreshTimer === null) refreshTimer = w.setTimeout(sync, 0); };
  const observer = new w.MutationObserver(schedule);
  observer.observe(d.body, {subtree:true, childList:true, attributes:true, attributeFilter:['aria-checked','disabled','aria-disabled','aria-busy']});
  d.addEventListener('pointerover', over);
  d.addEventListener('pointerout', out);
  d.addEventListener('keydown', key);
  w.addEventListener('scroll', scrolled, true);
  w.addEventListener('resize', stopHover);
  sync();
  function dispose() {
    if (disposed) return; disposed = true;
    observer.disconnect(); w.clearTimeout(refreshTimer); stopHover();
    for (const record of records.values()) restore(record); records.clear();
    d.removeEventListener('pointerover', over); d.removeEventListener('pointerout', out); d.removeEventListener('keydown', key);
    w.removeEventListener('scroll', scrolled, true); w.removeEventListener('resize', stopHover);
    d.body.classList.remove('island-interactions-active');
    if (w.__islandInteractionsDispose === dispose) delete w.__islandInteractionsDispose;
  }
  w.__islandInteractionsDispose = dispose;
  return dispose;
}

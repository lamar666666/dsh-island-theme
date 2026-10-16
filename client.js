// Generated from runtime sources and CSS. Run npm run build after editing.
window.__ModuleLoader__.load({
  id: 'dsh-island-theme',
  factory: () => ({
    apply(ctx) {
      let commitEffort;
      ctx.inject(['modelDirectories','uiWorkspace','sessions'], scope => {
        const select=(function createEffortCommitter(scope, d) {
  return async request => {
    const sessionId=scope.uiWorkspace.mainReference?.sessionId;
    if (!sessionId || scope.sessions.subagentAddress(sessionId)!==undefined || d.querySelectorAll('.wq12jW_trigger').length!==1) return {handled:false};
    const directory=scope.modelDirectories.directoryFor(sessionId);
    const snapshot=directory.store.getSnapshot(), current=snapshot.current;
    if (!current) return {handled:false};
    const model=snapshot.groups.find(group=>group.id===current.provider)?.models.find(model=>model.id===current.model);
    const reasoning=model?.reasoning;
    if (!reasoning || !Array.isArray(reasoning.efforts)) return {handled:false};
    const offset=reasoning.defaultEffort===undefined?1:0;
    if (request.labels.length!==reasoning.efforts.length+offset || reasoning.efforts.some((level,i)=>level.name!==request.labels[i+offset]) || !Number.isInteger(request.index) || request.index<0 || request.index>=request.labels.length) return {handled:false};
    const effort=request.index<offset?undefined:reasoning.efforts[request.index-offset].id;
    const selection={provider:current.provider,model:current.model,...effort===undefined?{}:{reasoningEffort:effort}};
    const result=await directory.select(selection);
    return {handled:true,ok:result.ok};
  };
})(scope,document);
        commitEffort=select;scope.effect(()=>()=>{if(commitEffort===select)commitEffort=undefined;});
      });
      ctx.effect(() => {
      const style=document.createElement('style');
      style.dataset.plugin='dsh-island-theme';style.dataset.pluginCss='island-theme-live';
      style.textContent="/* ISLAND 1.0.1. Palette: my-blog. Layout selectors: Harness 0.2.0-rc.2. */\nhtml body {\n  --island-paper: #fafbf6;\n  --island-surface: #ffffff;\n  --island-subtle: #f2f5ec;\n  --island-sidebar: #f1f4e9;\n  --island-ink: #242a22;\n  --island-muted: #616b58;\n  --island-caption: #616b58;\n  --island-line: #e0e6d6;\n  --island-moss: #586f24;\n  --island-lime: #cef76c;\n  --island-lime-ink: #253319;\n  --island-selected: #e4edcf;\n  --island-hover: #eaf0df;\n  --island-code: #f3f5ee;\n  --island-shadow: 0 8px 32px #465d150c;\n  --island-elevation: 0 0 0 1px #465d1515, 0 12px 40px #465d1510;\n  --island-serif: 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', 'SimSun', Georgia, serif;\n\n  --dsw-alias-bg-base: var(--island-paper) !important;\n  --dsw-alias-bg-layer-1: var(--island-surface) !important;\n  --dsw-alias-bg-layer-2: var(--island-surface) !important;\n  --dsw-alias-bg-layer-3: var(--island-surface) !important;\n  --dsw-alias-bg-module-platform: var(--island-subtle) !important;\n  --dsw-alias-bg-multi-select: var(--island-selected) !important;\n  --dsw-alias-bg-overlay: var(--island-subtle) !important;\n  --dsw-alias-bg-document-preview: var(--island-subtle) !important;\n  --dsw-alias-label-primary: var(--island-ink) !important;\n  --dsw-alias-label-primary-dimmed: var(--island-ink) !important;\n  --dsw-alias-label-secondary: var(--island-muted) !important;\n  --dsw-alias-label-tertiary: var(--island-caption) !important;\n  --dsw-alias-label-caption: var(--island-caption) !important;\n  --dsw-alias-label-document-preview: var(--island-muted) !important;\n  --dsw-alias-label-primary-bluish: var(--island-moss) !important;\n  --dsw-alias-brand-primary: var(--island-ink) !important;\n  --dsw-alias-brand-text: var(--island-ink) !important;\n  --dsw-alias-brand-primary-new-colorprimary-new-color: var(--island-moss) !important;\n  --dsw-alias-state-business-primary: var(--island-moss) !important;\n  --dsw-alias-state-business-tertiary: var(--island-selected) !important;\n  --dsw-alias-link: var(--island-moss) !important;\n  --dsw-focus-ring-color: var(--island-moss);\n  --dsw-alias-border-l1: var(--island-line) !important;\n  --dsw-alias-border-l2: var(--island-line) !important;\n  --dsw-alias-border-l2-darkmode-thin: var(--island-line) !important;\n  --dsw-alias-border-l3: var(--island-line) !important;\n  --dsw-alias-border-l4: var(--island-line) !important;\n  --dsw-alias-interactive-bg-hover: var(--island-hover) !important;\n  --dsw-alias-interactive-bg-hover-solid: var(--island-hover) !important;\n  --dsw-alias-interactive-bg-hover-accent: var(--island-selected) !important;\n  --dsw-alias-interactive-bg-active: var(--island-selected) !important;\n  --dsw-alias-button-info-fill: var(--island-moss) !important;\n  --dsw-alias-button-info-hover: var(--island-moss) !important;\n  --dsw-alias-button-elevated-fill: var(--island-surface) !important;\n  --dsw-alias-button-floating-fill: var(--island-surface) !important;\n  --dsw-alias-button-floating-hover: var(--island-hover) !important;\n  --dsw-alias-button-ghost-active-fill: var(--island-selected) !important;\n  --dsw-alias-button-ghost-active-border: var(--island-moss) !important;\n  --dsw-alias-button-ghost-active-hover: var(--island-hover) !important;\n  --dsw-alias-settings-card-fill: var(--island-surface) !important;\n  --dsw-alias-settings-card-stroke: var(--island-line) !important;\n  --dsw-alias-markdown-code-block: var(--island-code) !important;\n  --dsw-alias-markdown-code-block-banner: var(--island-subtle) !important;\n  --dsw-alias-markdown-inline-code: var(--island-code) !important;\n  --dsw-alias-markdown-tag: var(--island-subtle) !important;\n  --dsw-alias-markdown-citation: var(--island-selected) !important;\n  --dsw-alias-markdown-code-segment-selected: var(--island-surface) !important;\n  --dsw-alias-markdown-code-segment-unselected: var(--island-subtle) !important;\n  --dsw-alias-turn-trigger-bg: var(--island-subtle) !important;\n  --dsw-alias-turn-trigger-bg-hover: var(--island-hover) !important;\n  --dsw-alias-menu-icon: var(--island-muted) !important;\n  --dsw-alias-menu-group-header-fill: var(--island-surface) !important;\n  --dsw-specific-sidebar-fill: var(--island-sidebar) !important;\n  --dsw-specific-sidebar-nav-item-hover: var(--island-hover) !important;\n  --dsw-specific-sidebar-nav-item-active: var(--island-selected) !important;\n  --dsw-specific-sidebar-nav-item-active-accent: var(--island-selected) !important;\n  --dsw-specific-input-major: var(--island-surface) !important;\n  --dsw-specific-selector: var(--island-subtle) !important;\n  --dsw-specific-bubble: var(--island-subtle) !important;\n  --dsw-specific-bubble-highlight: var(--island-selected) !important;\n  --dsw-specific-menu: var(--island-surface) !important;\n  --dsw-menu-surface-fill: var(--island-surface) !important;\n  --dsw-elevation-stroke-color: var(--island-line) !important;\n  --dsw-elevation-panel: var(--island-elevation) !important;\n  --dsw-elevation-soft: var(--island-elevation) !important;\n  --dsw-elevation-prominent: var(--island-elevation) !important;\n  --dsw-shadow-lv2: var(--island-shadow) !important;\n  background-color: var(--island-paper);\n}\n\nhtml body[data-ds-dark-theme] {\n  --island-paper: #141814;\n  --island-surface: #1c211b;\n  --island-subtle: #252d22;\n  --island-sidebar: #181e16;\n  --island-ink: #f0f2e9;\n  --island-muted: #a4ae9d;\n  --island-caption: #9ba791;\n  --island-line: #343e2e;\n  --island-moss: #c1e775;\n  --island-selected: #344624;\n  --island-hover: #2a3523;\n  --island-code: #1a2017;\n  --island-shadow: 0 8px 32px #00000024;\n  --island-elevation: 0 0 0 1px #b3cc8220, 0 12px 40px #00000030;\n}\n\n/* Keep original layout/resizing, app drag regions and interaction semantics. */\nbody .BynINW_sidebarCol { border-right: 1px solid var(--island-line); }\nbody ._2H3hWW_root { background: var(--island-sidebar); }\nbody ._2H3hWW_logoRow { border-bottom: 1px solid var(--island-line); margin: 0 16px 12px; padding-inline: 0; }\nbody ._2H3hWW_brand { color: var(--island-moss); }\nbody ._2H3hWW_newSession {\n  background: var(--island-lime);\n  color: var(--island-lime-ink);\n  border: 1px solid #9fca3d55;\n  border-radius: 10px;\n  box-shadow: 0 3px 12px #87a7370b;\n}\nbody ._2H3hWW_newSession:hover { background: #c2eb60; }\nbody ._9lTDKa_list { padding-block: 6px; }\nbody .Dc7zOa_composerHero { max-width: min(880px, 100%); }\nbody .Dc7zOa_heroWorkspaceRow { margin-bottom: 16px; }\nbody .RlGAzG_card {\n  border: 1px solid var(--island-line);\n  border-radius: 18px;\n  box-shadow: var(--island-elevation);\n  background: var(--island-surface);\n}\nbody .RlGAzG_card:focus-within { border-color: var(--island-moss); }\nbody .RlGAzG_primary:not(:disabled) { background: var(--island-lime); color: var(--island-lime-ink); }\nbody .RlGAzG_primary:not(:disabled):hover { background: #c2eb60; }\nbody .RlGAzG_input { line-height: 1.85; }\nbody .Dc7zOa_composerHero h1,\nbody .Hqq-bq_titleGroup > span:first-child,\nbody .Dc7zOa_composerHero [class*=\"_welcomeTitle\"],\nbody .Dc7zOa_composerHero [class*=\"_heroTitle\"] {\n  font-family: var(--island-serif);\n  font-weight: 600;\n  letter-spacing: .03em;\n  color: var(--island-ink);\n}\nbody .Hqq-bq_titleGroup > span:first-child { font-size: 34px; line-height: 1.5; }\nbody .Hqq-bq_previewBadge { color: var(--island-moss); border-color: var(--island-line); background: var(--island-subtle); }\nbody pre, body code, body [class*=\"_terminal\"] { font-variant-ligatures: none; }\nbody .RlGAzG_card::selection, body #root ::selection { background: var(--island-selected); color: var(--island-ink); }\n@media (max-width: 1000px) {\n  body ._2H3hWW_logoRow { margin-inline: 10px; }\n  body .Dc7zOa_composerHero { max-width: 100%; }\n}\n@media (prefers-reduced-motion: reduce) {\n  body ._2H3hWW_newSession, body .RlGAzG_card { transition: none; }\n}\n\n/* ISLAND workbench 1.2.0. Selectors verified on Harness 0.2.0-rc.2. */\nbody .Dc7zOa_body:not(.Dc7zOa_embeddedBody) {\n  --dsh-chat-content-width: var(--dsh-chat-user-width, clamp(680px, calc(var(--dsh-conversation-column-width, 0px) * .86), 1440px));\n  --dsh-composer-card-max-width: var(--dsh-chat-content-width);\n  --dsh-composer-side-clearance: 32px;\n}\n/* Match the transcript's clearance to the composer, including narrow panes. */\nbody .xz4KEq_scroll { padding: 28px var(--dsh-composer-side-clearance, 32px) 24px; }\nbody .xz4KEq_column, body .xz4KEq_flowItem, body .v5IAXa_root,\nbody .v5IAXa_body, body .RlGAzG_root { min-width: 0; }\nbody .xz4KEq_column { gap: 2px; }\nbody .Dc7zOa_header { border-bottom: 1px solid var(--island-line); }\nbody .Dc7zOa_crumbCurrent { font-size: 16px; font-weight: 600; }\nbody .Dc7zOa_tab { font-size: 14px; }\nbody ._markdown_1ypvv_5 { font-size: calc(var(--dsh-content-font-size, 14px) + 1px); line-height: 1.9; }\nbody ._markdown_1ypvv_5 h1 { font-size: 1.8em; line-height: 1.45; }\nbody ._markdown_1ypvv_5 h2 { font-size: 1.55em; line-height: 1.5; margin-block: 26px 14px; }\nbody ._markdown_1ypvv_5 h3 { font-size: 1.3em; line-height: 1.55; margin-block: 22px 12px; }\nbody ._markdown_1ypvv_5 li { margin-block: 5px; }\nbody ._markdown_1ypvv_5 blockquote {\n  border-left: 3px solid var(--island-moss);\n  border-radius: 0 10px 10px 0;\n  background: var(--island-subtle);\n  color: var(--island-muted);\n  padding: 12px 16px;\n}\n\n/* Preserve syntax colors and diff semantics; long lines scroll within code. */\nbody .md-code-block pre, body .md-code-block pre code {\n  font-size: max(14px, var(--dsh-content-font-size, 14px));\n  line-height: 1.75;\n  font-variant-ligatures: none;\n}\nbody .md-code-block {\n  min-width: 0; max-width: 100%;\n  border: 1px solid var(--island-line);\n  border-radius: 14px;\n  background: var(--island-code);\n}\nbody .md-code-block pre { max-width: 100%; overflow-x: auto; white-space: pre; }\nbody ._markdown_1ypvv_5 :not(pre) > code {\n  font-size: .94em;\n  padding: .12em .35em;\n  border: 1px solid var(--island-line);\n  border-radius: 5px;\n}\n\n/* Natural-flow sidebar rows, with no fabricated subtitle content. */\nbody .hIlkoa_sessionRow {\n  box-sizing: border-box; height: auto; min-height: 54px;\n  padding-block: 9px; margin-block: 4px; gap: 5px;\n}\nbody .hIlkoa_sessionRow .hIlkoa_title, body .hIlkoa_projectRow .hIlkoa_title {\n  white-space: normal; overflow-wrap: anywhere;\n  display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2;\n  line-height: 20px; max-height: 40px; overflow: hidden; mask-image: none;\n}\nbody .hIlkoa_projectRow { height: auto; min-height: 42px; padding-block: 5px; }\nbody .hIlkoa_sessionRow.hIlkoa_selected {\n  box-shadow: inset 3px 0 var(--island-moss); background: var(--island-selected);\n}\nbody .hIlkoa_sessionRow.hIlkoa_selected .hIlkoa_title { font-weight: 600; }\n/* Empty native leading slots get a decorative bubble, never replacing run status. */\nbody .hIlkoa_sessionRow .hIlkoa_slot:has(> [data-slot=\"sidebar.session.row.leading\"]:empty)::before {\n  content: \"\"; width: 15px; height: 15px; flex-shrink: 0;\n  background: var(--island-muted);\n  mask: url(\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20d%3D%22M4%202.5h8a2%202%200%200%201%202%202v6a2%202%200%200%201-2%202H7l-4%202v-2a2%202%200%200%201-1-1.7V4.5a2%202%200%200%201%202-2Z%22%20fill%3D%22none%22%20stroke%3D%22black%22%20stroke-width%3D%221.2%22%2F%3E%3C%2Fsvg%3E\") center / contain no-repeat;\n}\nbody .hIlkoa_time { font-size: 10px; color: var(--island-caption); }\nbody .hIlkoa_rowActions { gap: 7px; }\n\n/* Clearer grouping of original attachment, permission, model and send actions. */\nbody .RlGAzG_card { gap: 10px; padding-top: 12px; }\nbody .RlGAzG_scroll { min-height: 54px; }\nbody .RlGAzG_row {\n  border-top: 1px solid var(--island-line); padding-top: 9px;\n  padding-bottom: 10px; gap: 12px;\n}\nbody .RlGAzG_tools, body .RlGAzG_trailing,\nbody .RlGAzG_standardControls { min-width: 0; gap: 9px; }\nbody .RlGAzG_trailing { flex: 0 1 auto; }\nbody .wq12jW_root { min-width: 0; }\nbody .wq12jW_trigger {\n  min-height: 34px; height: auto;\n  border: 1px solid var(--island-line); border-radius: 9px;\n  background: var(--island-surface); padding: 4px 8px; gap: 8px;\n}\nbody .wq12jW_triggerLabel { max-width: 260px; font-size: 12px; }\nbody .wq12jW_triggerEffort {\n  flex-shrink: 0; color: var(--island-moss); font-size: 12px;\n  line-height: 20px; padding: 1px 9px;\n  background: var(--island-selected); border-radius: 999px;\n}\nbody .RlGAzG_primary { width: 40px; height: 40px; flex-shrink: 0; transform: none; }\n\n/* Flatten noninteractive wrappers only: no React nodes are moved or replaced. */\nbody .RlGAzG_dock {\n  width: 100%; max-width: var(--dsh-composer-card-max-width);\n  justify-content: flex-start; gap: 12px; flex-wrap: wrap;\n  padding: 7px 8px 2px; box-sizing: border-box;\n}\nbody .RlGAzG_dock > div, body .RlGAzG_dock .iq1doa_root { display: contents; }\nbody .RlGAzG_dock .iq1doa_anchor:first-child { order: 1; }\nbody .RlGAzG_dock ._2WTFBq_root { order: 2; }\nbody .RlGAzG_dock .iq1doa_anchor:nth-child(2) { order: 3; margin-left: auto; }\n/* Original text remains in the native button's accessible name and popup. */\nbody .RlGAzG_dock .iq1doa_anchor:nth-child(2) .iq1doa_label { font-size: 0; }\nbody .RlGAzG_dock .iq1doa_anchor:nth-child(2) .iq1doa_label::after {\n  content: \"用量详情\"; font-size: 12px; color: var(--island-muted);\n}\nhtml[lang^=\"en\"] body .RlGAzG_dock .iq1doa_anchor:nth-child(2) .iq1doa_label::after { content: \"Usage details\"; }\nbody .RlGAzG_dock .iq1doa_pill { min-height: 25px; }\nbody .RlGAzG_dock .iq1doa_anchor:nth-child(2) .iq1doa_pill:hover { background: var(--island-hover); }\n\n@media (max-width: 1100px) {\n  body .RlGAzG_row { gap: 8px; }\n  body .RlGAzG_dock { gap: 7px; }\n}\n@media (max-width: 760px) {\n  body .RlGAzG_row { flex-wrap: wrap; }\n  body .RlGAzG_trailing { margin-left: auto; }\n  body .RlGAzG_dock .iq1doa_anchor { min-width: 0; }\n  body .RlGAzG_dock .iq1doa_pill { max-width: 100%; }\n}\n\n/* ISLAND interactions 1.3.1 */\nbody .hIlkoa_sessionRow {\n  position: relative;\n  min-height: 40px; height: 40px;\n  margin-block: 3px; padding-block: 6px;\n}\nbody .hIlkoa_sessionRow .hIlkoa_title {\n  display: block; white-space: nowrap; line-height: 22px;\n  -webkit-line-clamp: unset; max-height: 22px;\n  padding-right: 78px; box-sizing: border-box; text-overflow: ellipsis;\n}\nbody .hIlkoa_projectRow .hIlkoa_title {\n  display: block; white-space: nowrap; -webkit-line-clamp: unset; max-height: 22px; text-overflow: ellipsis;\n}\nbody .hIlkoa_sessionRow .hIlkoa_rowActions {\n  position: absolute; right: 8px; top: 50%; transform: translateY(-50%);\n  width: 70px; height: 28px; gap: 9px;\n  justify-content: flex-end; background: var(--island-hover);\n  border-radius: 6px;\n}\nbody .hIlkoa_sessionRow.hIlkoa_selected .hIlkoa_rowActions { background: var(--island-selected); }\nbody .hIlkoa_sessionRow .hIlkoa_time,\nbody .hIlkoa_sessionRow .hIlkoa_pinIndicator { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); }\nbody .hIlkoa_sessionRow:hover .hIlkoa_title,\nbody .hIlkoa_sessionRow.hIlkoa_menuOpen .hIlkoa_title { text-overflow: clip; }\nbody .hIlkoa_sessionRow .hIlkoa_title[data-scrolled] { mask-image: linear-gradient(90deg, transparent, black 10px); }\n\n/* Native rich previews retain task/approval/status content when they take over. */\nbody [class*=\"_card_\"]:has(.hIlkoa_hoverContent),\nbody .island-title-preview {\n  background: var(--island-surface); color: var(--island-ink);\n  border: 1px solid var(--island-line); border-radius: 12px;\n  box-shadow: var(--island-elevation);\n}\nbody [class*=\"_card_\"]:has(.hIlkoa_hoverContent) { width: min(340px, calc(100vw - 24px)); }\nbody .hIlkoa_hoverTitle { color: var(--island-ink); font-weight: 600; }\nbody .hIlkoa_hoverTime, body .hIlkoa_hoverPath, body .hIlkoa_hoverStatus { color: var(--island-muted); }\nbody .island-title-preview {\n  z-index: 110; position: fixed; pointer-events: none;\n  width: min(340px, calc(100vw - 24px)); padding: 13px 15px;\n  box-sizing: border-box; animation: island-preview-in 140ms ease-out;\n}\nbody .island-title-preview-heading { font-size: 14px; line-height: 1.65; font-weight: 600; overflow-wrap: anywhere; }\nbody .island-title-preview-meta { display: flex; gap: 18px; justify-content: space-between; margin-top: 9px; color: var(--island-muted); font-size: 12px; overflow-wrap: anywhere; }\n\nbody .island-effort-enhanced { width: min(288px, calc(100vw - 32px)); min-width: 0; box-sizing: border-box; padding: 13px 14px 15px; border-radius: 16px; }\nbody .island-native-effort-choice { display: none !important; }\nbody .island-effort-control { --island-effort-position: 0%; min-width: 0; }\nbody .island-effort-header { display: grid; grid-template-columns: 24px minmax(0,1fr) 24px; align-items: start; gap: 7px; }\nbody .island-effort-center { min-width: 0; text-align: center; }\nbody .island-effort-value { display: block; color: var(--island-moss); padding: 1px 0; font-size: 16px; line-height: 22px; font-weight: 600; }\nbody .island-effort-model { display: block; max-width: 100%; margin: 2px auto 0; padding: 0; border: 0; background: transparent; color: var(--island-muted); font: inherit; font-size: 12px; line-height: 18px; cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }\nbody .island-effort-model::after { content: \" ›\"; }\nbody .island-effort-lightning { width: 17px; height: 19px; margin-top: 2px; background: var(--island-caption); mask: url(\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20d%3D%22M9.5%201.5%203%209h4l-.5%205.5L13%207H9l.5-5.5Z%22%20fill%3D%22none%22%20stroke%3D%22black%22%20stroke-width%3D%221.2%22%2F%3E%3C%2Fsvg%3E\") center / contain no-repeat; }\nbody .island-effort-back { width: 24px; height: 24px; padding: 3px; border: 0; background: transparent; cursor: pointer; border-radius: 6px; }\nbody .island-effort-back::before { content: \"\"; display: block; width: 16px; height: 16px; background: var(--island-caption); mask: url(\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20d%3D%22M3%205a5%205%200%201%201-1%205M3%202v4h4%22%20fill%3D%22none%22%20stroke%3D%22black%22%20stroke-width%3D%221.2%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E\") center / contain no-repeat; }\nbody .island-effort-back:hover { background: var(--island-hover); }\nbody .island-effort-track { position: relative; height: 24px; margin-top: 15px; border-radius: 999px; corner-shape: round; background: color-mix(in srgb,var(--island-surface) 60%,var(--island-line)); box-shadow: inset 0 0 0 1px #50643308; }\nbody .island-effort-fill { pointer-events: none; position: absolute; inset: 0 auto 0 0; width: var(--island-effort-position); border-radius: 999px; corner-shape: round; background: linear-gradient(100deg,color-mix(in srgb,var(--island-lime) 70%,var(--island-moss)),color-mix(in srgb,var(--island-lime) 38%,var(--island-moss))); transition: width 180ms cubic-bezier(.22,.7,.2,1); }\nbody .island-effort-range {\n  appearance: none; -webkit-appearance: none; display: block;\n  position: absolute; top: -4px; left: 0; z-index: 3; box-sizing: border-box; width: 100%; margin: 0; padding: 0;\n  height: 32px; border: 0; border-radius: 999px; corner-shape: round; background: transparent;\n  cursor: pointer;\n  touch-action: none;\n}\nbody .island-effort-range::-webkit-slider-thumb {\n  appearance: none; -webkit-appearance: none;\n  width: 28px; height: 28px; border-radius: 50%; corner-shape: round; opacity: 0;\n  background: transparent; border: 0;\n}\nbody .island-effort-range::-moz-range-thumb { width: 28px; height: 28px; opacity: 0; border: 0; }\nbody .island-effort-range:focus-visible { outline: 2px solid var(--island-moss); outline-offset: 4px; }\nbody .island-effort-handle { pointer-events: none; position: absolute; z-index: 4; top: 50%; left: calc(var(--island-effort-position) + var(--island-handle-offset, 14px)); width: 28px; height: 28px; box-sizing: border-box; border-radius: 50%; corner-shape: round; border: 1px solid #3144190c; background: #fff; box-shadow: 0 1px 4px #31441924; transform: translate(-50%,-50%); transition: left 180ms cubic-bezier(.22,.7,.2,1), transform 140ms ease, box-shadow 140ms ease; }\nbody .island-effort-dragging .island-effort-handle { transform: translate(-50%,-50%) scale(1.04); box-shadow: 0 2px 7px #31441932; }\nbody .island-effort-ticks { pointer-events: none; position: absolute; z-index: 2; top: 50%; left: 14px; right: 14px; transform: translateY(-50%); display: flex; justify-content: space-between; }\nbody .island-effort-tick { pointer-events: none; width: 4px; height: 4px; min-width: 4px; border: 0; border-radius: 50%; corner-shape: round; background: var(--island-caption); font-size: 0; padding: 0; opacity: .28; }\nbody .island-effort-tick-active { background: #fff; opacity: .8; }\nbody .island-effort-range:disabled, body .island-effort-tick:disabled { opacity: .45; cursor: not-allowed; }\n@keyframes island-preview-in { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }\n@media (prefers-reduced-motion: reduce) {\n  body .island-title-preview { animation: none; }\n  body .island-effort-handle, body .island-effort-fill { transition: none; }\n}\n";document.head.appendChild(style);
      const dispose=(function installIslandInteractions(d, w, options = {}) {
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
    const icon=node('span','island-effort-lightning');icon.setAttribute('aria-hidden','true');
    const center=node('div','island-effort-center');
    const value = node('output', 'island-effort-value'); header.append(value);
    const model=node('button','island-effort-model',d.querySelector('.wq12jW_triggerLabel')?.textContent?.trim() || (zh()?'推理等级':'Reasoning effort'));
    model.type='button';model.setAttribute('aria-label',zh()?'返回模型菜单':'Back to model menu');
    const back=node('button','island-effort-back');back.type='button';
    back.setAttribute('aria-label',zh()?'返回模型菜单':'Back to model menu');
    center.append(value,model);header.append(icon,center,back);
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
      native?.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',code:'Escape',bubbles:true,cancelable:true}));
    };
    back.addEventListener('click',goBack);model.addEventListener('click',goBack);
    track.append(fill,ticks,range,handle);root.append(header,track);menu.append(root);
    // Move focus within the same native menu before its old options are concealed.
    if (record.focusWasInside) range.focus({preventScroll:true});
    for (const button of data.buttons) {
      record.originalTabs.set(button, button.getAttribute('tabindex'));
      button.classList.add('island-native-effort-choice'); button.tabIndex = -1;
    }
    menu.classList.add('island-effort-enhanced'); record.update();
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
})(document, window, {commitEffort:request=>commitEffort?commitEffort(request):Promise.resolve({handled:false})});
      return () => {dispose();style.remove();};
    }); }
  })
});

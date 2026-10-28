# Changelog

## 1.0.1

- Retarget the host's CSS-module class prefixes per build. Styles stay authored
  against the legacy prefixes and are rewritten from `host-classes.mjs`; the
  client also re-resolves each prefix from a mounted anchor class, so a host
  rebuild that keeps the component's class list heals without a repack.
- Restores the theme on DeepSeek Harness 0.2.1-rc.3, whose rebuild rehashed
  every component prefix; sidebar rows, composer geometry, the reasoning pane,
  usage pill and title previews had silently stopped matching.
- Fixes the reasoning pane never attaching on that host: the runtime located
  the effort menu through a hardcoded prefix, which no longer existed.
- Add `npm run check:host` to report prefix drift against the installed
  `app.asar` and `npm run retarget` to refresh the map after a host update.

## 1.0.0

First stable release.

- Warm paper, moss and lime palette with a matching forest dark mode; wider
  conversation/composer, readable code, one-line sidebar titles, early title
  previews, and an accessible reasoning-effort slider with a default-level
  reset.
- A ~3s bright sci-fi startup intro (floating island / island spirit
  visuals): arrival zoom, dual scan beams, orbital rings, energy pulses,
  rising particles and a closing HUD frame; Skip button, Escape dismissal
  and `prefers-reduced-motion` bypass.
- Three ambient workbench skins — 晨光浮岛 (default), 浮岛夜航 and
  岛灵同行 — with glows, orbit lines, an active-session marker and a
  composer edge animation; chat layout and interactions are unchanged.
- A plugin settings tab under 设置 → 内置插件 → ISLAND 主题 stages skin and
  intro-visual choices, saves through the plugin-owned
  `/__island-theme/config` route and persists via the profile patch tree.
- All artwork ships embedded as local WebP data URLs — no external image or
  font requests; pure-CSS gradients are the fallback when decoding fails.

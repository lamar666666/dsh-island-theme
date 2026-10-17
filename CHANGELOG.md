# Changelog

## 1.5.3

- Compress the intro hold to ~3s and retime every staged animation
  (arrival zoom, dual scans, energy ring, lock reticle, HUD frame, title
  charge, progress) so the full sequence still plays end-to-end.

## 1.5.2

- Redesign the startup intro as a continuous three-second bright sci-fi sequence: the island emerges through a light field, dual scan beams cross the scene, orbital rings and energy pulses stay in motion, particles rise, and the HUD frame closes as the workbench appears. Keep the island and mascot hero choices, Skip/Escape and reduced-motion behavior.

## 1.5.1

- Extend the startup intro to ~6s and stretch its zoom/progress animations
  so the scene stays alive for the full hold.

## 1.5.0

- Add a ~1.8s bright startup intro with two selectable visuals (floating
  island / island spirit), a skip button, Escape dismissal and
  reduced-motion bypass; the progress line is decorative only.
- Add three animated workbench skins — 晨光浮岛 (default), 浮岛夜航 and
  岛灵同行 — with ambient glows, orbit lines, an active-session marker and
  a composer edge animation; chat layout and interactions are unchanged.
- Add a plugin settings tab under 设置 → 内置插件 → ISLAND 主题 that stages
  skin/intro choices, saves through the plugin-owned
  `/__island-theme/config` route and persists via the profile patch tree.
- Embed the three approved artwork assets as WebP data URLs in `client.js`
  (reproducible via `scripts/prepare-artwork.py`); CSS gradients remain the
  fallback when decoding fails.

## 1.4.1

- Keep native effort rows hidden when the host rewrites their className:
  conceal them through the enhanced menu's stable class and role selector,
  and re-assert both classes on every refresh.

## 1.4.0

- Turn the corner button into a real reset: it saves the model's catalog
  default effort through the host service and keeps the pane open.
- Leave the pane through the model-name link or Escape as before.

## 1.3.2

- Remove the decorative lightning glyph from the reasoning pane header.
- Re-place the host menu after the slider card attaches or detaches, so the
  model list no longer lands at the coordinates measured while the card was
  still mounted. Back navigation restores native rows before Escape.

## 1.3.1

- Refine the reasoning rail into a soft capsule with a truly circular white handle, subtle markers and coordinated motion.
- Use a hand cursor and save through the host model-selection service without closing the effort pane.

## 1.3.0

- Restore single-line native title marquee and reserve hover-action space without resizing text.
- Show an earlier themed title preview; hand off to the themed native rich card.
- Add a lifecycle-owned accessible reasoning slider with pointer, keyboard and reduced-motion support.
- Preserve native option nodes, disabled states and host save behavior; ignore model-list panes.
- Add DOM interaction regressions, a prebuilt client module and reproducible client build.

## 1.2.0

- Strengthen conversation typography, code cards and sidebar hierarchy.
- Keep the native model-picker geometry and expose the selected effort as a readable chip.
- Match transcript and composer padding in narrow windows.
- Document recovery for historical sessions whose selected model is no longer in the live catalog.

## 1.1.1

- Align composer and transcript when a narrow conversation pane constrains the content width.

## 1.1.0

- Widen conversation and composer together, preserving native user-adjustable width.
- Improve long sidebar labels, code readability, input controls and native usage-details presentation.
- Preserve conversation content, model names, usage data, permissions and actions.
- Add portable installation docs, tests and an MIT license for later publication.

## 1.0.1

- Improve light-theme link and caption contrast on green surfaces.

## 1.0.0

- Initial warm paper, moss and lime palette with matching forest dark mode.

# ISLAND for DeepSeek Harness

[中文](README.md)

A small, offline theme plugin: warm paper, moss and lime in light mode, forest surfaces in dark mode, and a more readable conversation workbench.

## Features

- Wider conversation/composer defaults, preserving native width adjustment.
- Readable code and two-line workspace/session titles.
- Clearer composer controls and a compact native usage-details entry.
- Single-line hover-scrolling titles with stable action-button space and earlier themed previews.
- Accessible animated reasoning slider, derived from native choices and committed through the host.
- Built-in light/dark/system appearance switching.
- No external fonts, telemetry, model calls, fabricated transcript content or React DOM reparenting.

Independent community plugin; not an official DeepSeek product. Original branding belongs to its respective owners.

## Compatibility

Validated on official Windows x64 DeepSeek Harness Desktop **0.2.0-rc.2**. Other versions/platforms are unqualified. Palette tokens and layout selectors are version-specific; recheck after upgrading Harness. Native OS title bars are outside its scope.

## Install

Download a release tarball or run `npm pack` on this source. Fully quit Harness before package operations. Desktop must use its bundled CLI. For the default per-user Windows installation:

```powershell
$DshCli = Join-Path $env:LOCALAPPDATA 'Programs\DeepSeek Harness\resources\runtime\cli\bin\dsh.cmd'
& $DshCli plugin --profile desktop add 'C:\path\to\dsh-island-theme-1.3.1.tgz'
```

For a custom installation, point `$DshCli` to that installation's `resources\runtime\cli\bin\dsh.cmd`. Reopen Harness; select light/dark/system in Settings → Appearance.

To uninstall, fully quit Harness and run:

```powershell
& $DshCli plugin --profile desktop remove dsh-island-theme
```

Restart after enabling, disabling or uninstalling so every window loads the same stylesheet. Account and conversation data is preserved.

## Development

Node.js 22.19+. Runtime has no npm dependencies; DOM tests use jsdom:

```sh
npm ci
npm test
npm run build
npm run pack:check
npm pack
```

`index.mjs` combines `theme.css`, `workbench.css` and `interactions.css` through a lifecycle-owned stylesheet handler. The generated `client.js` is committed so source installations work without building. Its client effect runs `client-runtime.mjs` logic and removes listeners, observers, added UI and temporary attributes on disposal.

The slider reads current native effort choices and supports pointer drag and arrow/Home/End keys. On the qualified host it saves through the shared model-selection service, keeping the pane open until dismissed. If that service cannot be safely resolved, it falls back to the original option button. It does not change the model list or invent unsupported levels. The early title card appears after about 220ms and hands over to the host's rich hover card, preserving task/approval/status details. Native usage controls and data are retained.

Tests check injection/disposal, color contrast and native layout control preservation. Perform real-host visual and interaction checks when changing version-specific selectors.

### Missing reasoning options in an old session

The host model catalog determines available reasoning levels. A historical session can retain an unavailable model id and old effort text while having no reasoning menu. Select an available model from the current catalog, then choose one of its supported efforts. The theme does not fabricate or force reasoning levels.

## Publication

Repository: https://github.com/lamar666666/dsh-island-theme

Git ignores local screenshots, logs, environment files and generated tarballs. Review staged files before publishing. Release tarballs contain only the plugin's required runtime and documentation files.

MIT licensed; see [LICENSE](LICENSE).

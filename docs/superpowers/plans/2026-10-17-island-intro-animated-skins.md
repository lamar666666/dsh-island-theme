# ISLAND Startup Intro and Animated Skins Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a bright, skippable startup intro with floating-island and mascot variants, plus three live, profile-persisted animated workbench skins, to the existing `dsh-island-theme` plugin.

**Architecture:** The Host exports a volatile Config schema for `skin` and `introVisual`; the Plugins page edits both fields transactionally and persists them in the profile. The browser client observes accepted Config snapshots, applies a skin attribute and packaged image data URLs, and mounts one lifecycle-owned intro overlay per application window. CSS owns the bright visual treatments and reduced-motion behavior.

**Tech Stack:** Node.js ES modules, DeepSeek Harness Cordis client slots/config forms, React through the Harness client module loader, CSS, JSDOM tests, Pillow for one-time WebP asset preparation.

---

## File Map

- Modify `index.mjs`: export a Schemastery `Config` with volatile `skin` and `introVisual` fields; keep existing host CSS injection.
- Create `assets/island-day.webp`, `assets/island-night.webp`, and `assets/island-mascot.webp`: compressed copies of the approved blog floating-island and mascot artwork.
- Create `theme-runtime.mjs`: config normalization, live skin application, startup overlay lifecycle, skip/Escape/reduced-motion behavior, and cleanup.
- Create `settings-page.mjs`: plain React settings page factory for the `plugins.bundle.config` contribution.
- Modify `client-runtime.mjs`: keep existing sidebar and effort controls; compose the new theme runtime without changing their behavior.
- Modify `scripts/build-client.mjs`: embed image data URLs, load React through `factory(require)`, inject settings/plugin-manager dependencies, register the config page, subscribe to `configForms`.
- Modify `theme.css`, `workbench.css`, `interactions.css`, and create `visuals.css`: add the three skin backgrounds, two bright intro variants, animated glass/HUD details, responsive styles, and reduced-motion rules.
- Create `theme-runtime.test.mjs` and `settings-page.test.mjs`; update `test.mjs` only for build output/embedded asset coverage.
- Modify `package.json`, `package-lock.json`, `README.md`, `README.en.md`, and `CHANGELOG.md` for the new dependency, shipped feature, installation version, and release notes.

### Task 1: Prepare local artwork and verify packaging contract

**Files:**
- Create: `assets/island-day.webp`
- Create: `assets/island-night.webp`
- Create: `assets/island-mascot.webp`
- Test: `test.mjs`

- [ ] **Step 1: Add a failing build-output test**

Extend the existing generated-client test to assert that the built `client.js` contains the three `data:image/webp;base64,` sources, the skin names `day-island`, `night-island`, `island-mascot`, and no `D:/project/my-blog` path.

- [ ] **Step 2: Run the focused test and confirm it fails**

Run: `node --test test.mjs`

Expected: the new asset assertions fail because the build does not yet embed artwork.

- [ ] **Step 3: Prepare optimized assets**

Use Pillow to read exactly these approved sources: `D:/project/my-blog/frontend/public/images/island-hero.png`, `D:/project/my-blog/frontend/public/images/island-night.png`, and `D:/project/my-blog/frontend/public/images/lamar-pet.png`. Save `island-hero.png` as `assets/island-day.webp` and `island-night.png` as `assets/island-night.webp` at quality 88 and method 6. Save `lamar-pet.png` as `assets/island-mascot.webp` in lossless WebP at method 6 to preserve transparency and pixel edges. Do not reference the blog project path at runtime.

- [ ] **Step 4: Re-run the focused test after the builder wiring in Task 3**

Run: `node --test test.mjs`

Expected: the generated-client assertions pass and the embedded client contains only portable image data URLs.

### Task 2: Add persisted config schema and test defaults

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `index.mjs`
- Create: `config.test.mjs`
- Modify: `test.mjs`

- [ ] **Step 1: Write failing Config tests**

Add tests that call the exported schema with an empty object and verify defaults `skin === 'day-island'` and `introVisual === 'island'`. Verify the two fields are volatile references and invalid string values are handled by the client normalizer rather than becoming a new skin.

- [ ] **Step 2: Run the focused test and confirm it fails**

Run: `node --test config.test.mjs`

Expected: import or assertions fail because `Config` and its defaults do not exist yet.

- [ ] **Step 3: Add the schema dependency and Host Config**

Add exact dependency `@deepseek-ai/schemastery@3.18.5`. Export `Config` from `index.mjs` using two string fields with defaults and `.volatile()`. Do not add an intro-enable field: the intro runs whenever the plugin is enabled and can be skipped in place.

- [ ] **Step 4: Run the focused test**

Run: `node --test config.test.mjs`

Expected: PASS with both defaults and volatile values verified.

### Task 3: Implement the browser settings page and live config source

**Files:**
- Create: `settings-page.mjs`
- Modify: `scripts/build-client.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `settings-page.test.mjs`

- [ ] **Step 1: Write failing settings-page tests**

Use a small fake React `createElement` implementation and a fake config form to verify the page renders both choice groups and that Save calls `form.mutate` once with `skin` and `introVisual` set operations and the snapshot revision. Verify a rejected write is shown as an error status.

- [ ] **Step 2: Run the focused test and confirm it fails**

Run: `node --test settings-page.test.mjs`

Expected: FAIL because the settings page factory and slot registration do not exist.

- [ ] **Step 3: Implement the config page and slot contribution**

Add `@deepseek-ai/dsh-client-ui-plugin-manager` and `@deepseek-ai/dsh-client-ui-settings` to `dsh.client.inject`. In the lazy client factory, call `require('react')`, register `plugins.bundle.config` under key `dsh-island-theme`, render `view: 'page'`, and submit both changes through `form.mutate(operations, form.state.revision)`.

- [ ] **Step 4: Bind the active workbench to accepted settings**

Use `ctx.configForms.get('island-theme')`; read its accepted snapshot before creating the startup overlay, subscribe for later updates, and dispose the subscription with the plugin effect. The entry id is `island-theme`, as declared by `cordis.patch.yml`.

- [ ] **Step 5: Run focused tests**

Run: `node --test settings-page.test.mjs config.test.mjs`

Expected: PASS for both persisted fields, transactional save, and write-error presentation.

### Task 4: Implement the startup overlay and animated workbench skins

**Files:**
- Create: `theme-runtime.mjs`
- Modify: `client-runtime.mjs`
- Modify: `scripts/build-client.mjs`
- Create: `visuals.css`
- Modify: `index.mjs`
- Modify: `theme-runtime.test.mjs`

- [ ] **Step 1: Write failing DOM lifecycle tests**

Add JSDOM tests for: default skin/intro selection; all three skins in both Harness light/dark modes; mascot retention in dark mode; one overlay per document session; a selectable island or mascot hero; automatic close after 1.8 seconds; Skip and Escape closing immediately; `prefers-reduced-motion` bypassing the animation; live setting updates; disposal removing overlay, timers, handlers, and `data-island-*` attributes.

- [ ] **Step 2: Run the focused test and confirm it fails**

Run: `node --test theme-runtime.test.mjs`

Expected: FAIL because the runtime lifecycle and skin attributes do not exist.

- [ ] **Step 3: Embed assets in the generated client**

Update `scripts/build-client.mjs` to read each WebP from `assets/` and serialize it as a data URL passed to `theme-runtime.mjs`. Keep runtime requests self-contained; do not issue external image or font requests.

- [ ] **Step 4: Implement config normalization and the startup lifecycle**

Normalize only `day-island`, `night-island`, `island-mascot` and `island`, `mascot`; use defaults for unknown values. Mount a single accessible overlay, set a session guard, handle Skip and Escape, auto-remove at 1.8 seconds, bypass motion under reduced-motion preference, and restore all listeners and nodes on disposal.

- [ ] **Step 5: Apply the live skin to the workbench**

Set `body.dataset.islandSkin` and `body.dataset.islandIntro` from the accepted Config values. Update those attributes immediately when the config snapshot changes. In Harness light mode, use the day artwork for all skins; in native dark mode, switch every skin to the night artwork and forest surface tokens while retaining the mascot for `island-mascot`. Give `night-island` a stronger orbit treatment in both modes.

- [ ] **Step 6: Add CSS treatments**

Add the bright full-window intro variants, low-opacity floating-island wallpaper, animated orbital lines, scan accents, active-session marker, and composer edge animation. Keep chat and code surfaces readable. Preload the embedded artwork and only apply an image CSS variable after successful decode; on `error`, leave the layer unset so the pure CSS gradient remains visible. Add responsive rules and stop ambient motion under `prefers-reduced-motion`.

- [ ] **Step 7: Run focused tests**

Run: `node --test theme-runtime.test.mjs settings-page.test.mjs config.test.mjs`

Expected: PASS for intro lifecycle, settings, and live skin updates.

### Task 5: Build, document, package, install, and publish

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `README.md`
- Modify: `README.en.md`
- Modify: `CHANGELOG.md`
- Generated: `client.js`
- Generated: `dsh-island-theme-1.5.0.tgz`

- [ ] **Step 1: Run the full suite and build**

Run: `npm test`

Expected: all interaction, layout, config, settings-page, and theme-runtime tests pass; the pretest build regenerates `client.js`.

- [ ] **Step 2: Document configuration and behavior**

Update both READMEs with the Plugins → `dsh-island-theme` settings page, the three skin choices, the two intro variants, the 1.8-second default, Skip/Escape, reduced-motion behavior, and the fact that intro progress is decorative.

- [ ] **Step 3: Bump and package version 1.5.0**

Set the root package and lockfile to `1.5.0`, add the release notes, and verify with `npm run pack:check` followed by `npm pack`. Confirm the tarball contains `client.js`, runtime assets required by the client, docs, and license, with no screenshots or local paths.

- [ ] **Step 4: Verify in the Windows desktop app**

Install the tarball with the bundled DSH CLI after Harness is fully closed. Reopen Harness and verify the intro appears once, both intro variants switch, Skip/Escape work, all three skins apply, changes persist after reload, and the existing sidebar/model controls remain usable.

- [ ] **Step 5: Commit and publish the approved release**

The user has already authorized publishing this plugin to the existing public repository. Review the staged file list for private paths and screenshots; run `git diff --cached --check`; commit the implementation; push `main`; publish GitHub release `v1.5.0` with `dsh-island-theme-1.5.0.tgz`; compare the release asset hash to the locally packed tarball. Do not create an automatic publish workflow.

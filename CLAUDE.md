# CLAUDE.md — Europa Component Library for Liferay

Project context for AI assistants working on this Liferay site initializer.

## What this project is

A Liferay site initializer plus `themeCSS` client extension that
implements the Europa Component Library
([ec.europa.eu/component-library/eu](https://ec.europa.eu/component-library/eu/))
inside a Liferay DXP site. Targets `dxp-2024.q4.0`. The single source of
truth lives under `site-initializer/` — edit there; the build packages it
verbatim into an OSGi JAR.

Build / deploy / validation steps are documented in `README.md`.

## Source of truth and what the build does

- `site-initializer/` is copied 1:1 into the JAR (with `META-INF/` as a
  sibling so the thumbnail is served from the bundle context).
- `client-extensions/ecl-theme/` is packaged via the Liferay workspace
  plugin into a deploy-ready ZIP that includes the wrapper config
  Liferay reads at boot (`*.client-extension-config.json`,
  `WEB-INF/liferay-plugin-package.properties`). A bare `zip -r src/` is
  not enough — the wrapper files are mandatory for the CX to register.

## Pages / master page

- Master page is `Main` (auto-key `main`) — header + DropZone + footer.
- The master uses the **dynamic** header (`ecl-site-header-dynamic`)
  which embeds `<lfr-widget-nav>` so navigation reflects the actual
  Liferay page tree. The static `ecl-site-header` is kept as an
  alternative for pages that need a hardcoded nav.
- Page-definition `settings.masterPage.key` must match the auto-derived
  master key — `"Main"` → `"main"`.

## Tokens

Two-layer architecture (validated by `scripts/validate.sh`):

- **Primitives** (private to the theme): `--ecl-blue`, `--ecl-blue-125`,
  `--ecl-yellow`, `--ecl-grey-0..100`, plus feedback colours.
- **Semantics** (public to fragments): `--color-text`, `--color-link`,
  `--color-brand`, `--space-*`, `--ecl-max-width`, `--ecl-radius-button`.

Fragments **must not** reference primitive `--ecl-*` tokens directly.
The validator scans `site-initializer/fragments/**` and fails the build
on any direct primitive reference.

## EU emblem

Two contrast variants live under
`site-initializer/fragments/group/ecl/resources/`:

- `logo-eu-dark.svg` — dark text/symbol, for **white surfaces**
  (used in the header).
- `logo-eu-light.svg` — white text/symbol, for **dark surfaces**
  (used in the footer).
- `logo-eu.svg` — alias of the dark variant for backward compatibility.

The emblem is referenced from fragment HTML with
`[resources:logo-eu-dark.svg]` or `[resources:logo-eu-light.svg]` —
never inlined or imported from outside `resources/`.

## Style Book preview workaround — duplicated utility classes

Liferay's Style Book → fragment preview iframe loads only the fragment's
own `index.css`. The theme client-extension stylesheet is **not** injected
into that preview, so a fragment that relies on theme-level helpers
renders unstyled in the editor preview.

To keep the preview readable, the affected fragments duplicate the small
subset of utility classes they need at the top of their own `index.css`,
fenced by:

```
/* === preview-workaround: duplicated from theme === */
.ecl-l-center { … }
.clean-list { … }
.visuallyhidden { … }
/* === end preview-workaround === */
```

Affected fragments today:

- `ecl-site-header`, `ecl-site-header-dynamic`, `ecl-site-footer`
- `ecl-page-banner`, `ecl-breadcrumb`, `ecl-pagination`
- `ecl-link`, `ecl-card`, `ecl-content-block`
- `ecl-styles-showcase`, `ecl-components-showcase`

The `ecl-components-showcase` fragment additionally inlines minimal,
scoped replicas of every showcased component (button, message, card,
accordion, tabs, pagination, breadcrumb, forms) under `.ecl-showcase` so
the gallery renders even on pages where the individual component
fragments are not present.

**Remove the duplication once Liferay loads theme CSS into the Style Book
preview iframe.** Until then, every new fragment that relies on theme
utility classes should duplicate the minimum it needs at the top of its
`index.css` between the preview-workaround markers.

## Focus styling

ECL uses an **outline-based** focus indicator that preserves the visual
identity of the focused control (this differs from a W3C-style background
swap). Defined in `client-extensions/ecl-theme/src/index.css`:

- Interactive controls (button, link in chrome, tab, summary):
  `outline: 3px solid #FFD617; outline-offset: 2px`.
- Inline text links inside body content: yellow background + 2px black
  underline — same EU pattern as on ec.europa.eu.
- Form fields (input, select, textarea):
  `outline: 3px solid #FFD617; outline-offset: 0` (internal ring so it
  doesn't bleed into adjacent layout).

The search submit button in both headers overrides this with an **inset**
focus ring (`outline-offset: -3px`) because the search form is a
border-boxed container — an external offset would be clipped by the
container or visually clash with the input/border edge.

## Liferay 7.4.13 / 2024.Q4 gotchas

- Fragment FreeMarker uses **bracket** syntax: `[#if]…[/#if]`. AntiSamy
  filters `<#if>` silently. Avoid `[#elseif]` — use multiple `[#if]`
  blocks with `[#assign]` instead.
- Checkbox config fields: **no `dataType`**; `defaultValue` is the string
  `"true"`/`"false"`. Anything else and the field becomes inert.
- Style books always use `"themeId": "classic_WAR_classictheme"` — there
  is no themeId for a CX bundle symbolic name.
- The site initializer thumbnail must live at
  **both** `site-initializer/thumbnail.png` (for the initializer engine)
  and `META-INF/resources/thumbnail.png` (for the *Select Template* tile).
- `fragment.json` references `"configurationPath": "configuration.json"`
  (not `index.json`) by convention in this workspace.
- `Row` page-element `definition` must include the boolean `"gutters"` —
  otherwise `RowLayoutStructureItemImporter` throws a NullPointerException
  on `Map.get("gutters")` and the site creation transaction rolls back
  with a generic *"An unexpected error occurred"*.
- `page-definition.json` must **not** contain `"siteKey"` anywhere — the
  workspace plugin rejects it for 7.4.13.
- Locale keys use underscore form: `"en_US"`, not `"en-US"`.

## Common edits

### Add a new fragment

1. Create `site-initializer/fragments/group/ecl/fragments/ecl-<name>/`
   with `fragment.json`, `configuration.json`, `index.html`, `index.css`,
   `index.js`.
2. `fragment.json` shape:
   ```json
   {
     "configurationPath": "configuration.json",
     "cssPath": "index.css",
     "htmlPath": "index.html",
     "jsPath": "index.js",
     "name": "<Display name>",
     "type": "component"
   }
   ```
3. Use semantic tokens only (`var(--color-*)`, `var(--space-*)`).
4. If your fragment relies on theme utility classes, duplicate them at
   the top of `index.css` between the preview-workaround markers.
5. Use **inline `<svg>`** for icons (not `<img src="[resources:...svg]">`
   for stroke-based icons) — `currentColor` does not resolve inside an
   SVG loaded via `<img>` in most browsers, so the icon would render
   without colour. Inline SVG is the safe default.
6. Run the validator: `LIFERAY_VERSION=7.4.13 bash scripts/validate.sh .`.

### Add a new page

1. Create `site-initializer/layouts/<key>/` with `page.json` and
   `page-definition.json`.
2. `page.json` keys: `externalReferenceCode`, `friendlyURL`, `hidden`,
   `name_i18n`, `private`, `system: false`, `type: "Content"`.
3. `page-definition.json` must include
   `"settings": {"masterPage": {"key": "main"}}` to inherit the chrome.
4. Every `Row` element must declare `"gutters": true|false`.
5. Re-run the validator.

## Deploy lifecycle

- Site initializer changes apply to **newly created sites** only.
  Existing sites keep the fragments that were copied at creation time —
  delete and recreate to pick up structural fragment changes.
- Theme client-extension changes are live on bundle restart and reflect
  immediately on every site that has the **ECL Theme** CSS Client
  Extension selected under *Site Settings → Look and Feel*.

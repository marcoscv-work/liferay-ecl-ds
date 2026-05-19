# ECL — Europa Component Library for Liferay

A Liferay site initializer plus theme client extension that brings the
[Europa Component Library](https://ec.europa.eu/component-library/eu/) — the
European Commission's design system — to Liferay DXP. Use it as a starting
point for EU institutional sites, intranets and microsites.

## Contents

```
ecl-ds/
├── settings.gradle                ← Liferay workspace plugin (Gradle)
├── gradle.properties              ← liferay.workspace.product=dxp-2024.q4.0
├── build-scripts/
│   └── ecl-site-initializer/
│       ├── bnd.bnd                ← OSGi headers (Liferay-Site-Initializer-Name, Provide-Capability)
│       └── build.gradle
├── client-extensions/
│   └── ecl-theme/
│       ├── client-extension.yaml  ← type: themeCSS
│       ├── frontend-token-definition.json
│       └── src/index.css          ← primitives + semantic tokens (EU blue, EU yellow, Arial, square buttons)
├── META-INF/
│   └── resources/thumbnail.png    ← shown in "New Site → Select Template"
├── scripts/
│   └── validate.sh                ← strict pre-deploy validator (run before every build)
└── site-initializer/              ← single source of truth — EDIT HERE
    ├── thumbnail.png
    ├── fragments/group/ecl/
    │   ├── collection.json        ← "ECL"
    │   ├── resources/             ← logo-eu-dark.svg, logo-eu-light.svg, icon-*.svg, illustration-*.svg
    │   └── fragments/ecl-*/       ← 26 fragments
    ├── layout-page-templates/master-pages/main/
    ├── layouts/                   ← 1_home (default), styles, components
    ├── layout-set/public/metadata.json
    └── style-books/               ← ecl-default (default), ecl-dark
```

## What you get

- **OSGi site initializer** named **"ECL Design System"** that appears in
  *New Site → Select Template*.
- **themeCSS client extension** `ecl-theme` that publishes the ECL token
  palette (colours, typography, spacing) as CSS variables, plus a frontend
  token definition wired into the Style Book editor.
- **26 fragments** under the `ecl-*` namespace:
  - Navigation/chrome — `ecl-site-header`, `ecl-site-header-dynamic`
    (uses `lfr-widget-nav`), `ecl-site-footer`, `ecl-breadcrumb`,
    `ecl-pagination`, `ecl-tabs`.
  - Content — `ecl-page-banner` (hero), `ecl-page-header`, `ecl-card`,
    `ecl-content-block`, `ecl-section-heading`, `ecl-accordion`,
    `ecl-expandable`, `ecl-blockquote`.
  - Inline elements — `ecl-button` (5 variants), `ecl-link`, `ecl-tag`,
    `ecl-pill`, `ecl-message`.
  - Forms — `ecl-form-text-input`, `ecl-form-select`, `ecl-form-textarea`,
    `ecl-form-checkbox`, `ecl-form-radio`.
  - Documentation — `ecl-styles-showcase`, `ecl-components-showcase`.
- **3 pages**:
  - `/home` — default template (page banner, three policy cards, news list,
    yellow CTA banner).
  - `/styles` — colours, typography, spacing tokens.
  - `/components` — gallery of every fragment plus an exclusive accordion
    and pagination.
- **2 style books** — `ECL Default` (light) and `ECL Dark`.
- **Official EU emblem** in two contrast variants:
  `logo-eu-dark.svg` (dark text — for white surfaces) and
  `logo-eu-light.svg` (white text — for navy surfaces).

## Pre-deploy validation

```bash
LIFERAY_VERSION=7.4.13 bash scripts/validate.sh .
```

The strict validator catches the most common silent failures: bracket
FreeMarker syntax, checkbox `dataType` discipline, page-definition
`siteKey` leakage, locale key form, style-book shape, fragment token
discipline (no primitive `--ecl-*` references in fragments), thumbnail
presence in both locations, etc. It must exit `0` before deploy.

## Build

### 1) Site initializer (OSGi JAR)

The workspace's bundled JS transpiler does not work for a resources-only
bundle, so the JAR is built manually from the workspace root. Create the
manifest from the bnd headers and pack:

```bash
cat > /tmp/ecl-manifest.mf <<'EOF'
Manifest-Version: 1.0
Bundle-ManifestVersion: 2
Bundle-Name: ECL Site Initializer
Bundle-SymbolicName: com.ecl.site.initializer
Bundle-Version: 1.0.0
Liferay-Site-Initializer-Name: ECL Design System
Provide-Capability: liferay.site.initializer
Web-ContextPath: /site-initializer-ecl

EOF

mkdir -p build-scripts/ecl-site-initializer/build/libs
jar cfm build-scripts/ecl-site-initializer/build/libs/com.ecl.site.initializer-1.0.0.jar \
  /tmp/ecl-manifest.mf \
  -C . site-initializer -C . META-INF
```

The trailing blank line in the manifest is required.

### 2) Theme client extension (ZIP)

Liferay's workspace plugin generates wrapper files that the platform reads
at deploy time (`ecl-theme.client-extension-config.json`,
`WEB-INF/liferay-plugin-package.properties`). A plain `zip -r` of `src/`
will not register. Build with Gradle:

```bash
./gradlew :client-extensions:ecl-theme:assemble
# → client-extensions/ecl-theme/dist/ecl-theme.zip
```

## Deploy

Drop both artifacts into the Liferay `deploy/` directory of your target
instance:

- `build-scripts/ecl-site-initializer/build/libs/com.ecl.site.initializer-1.0.0.jar`
- `client-extensions/ecl-theme/dist/ecl-theme.zip`

Confirm in the Liferay logs:

```
STARTED com.ecl.site.initializer_1.0.0
STARTED ecltheme_7.4.13
```

## Create the site

1. Go to **Control Panel → Sites → Add Site** (or *Site Admin → New Site*).
2. Pick **ECL Design System** under *Select Template*.
3. Name it (e.g. `ECL DS`) and finish.

Liferay imports all fragments, layouts, the master page, and style books
into the new site.

## Activate the CSS theme (post-site creation)

The site is created with `themeName: "Classic"` because Liferay does not
resolve a `themeCSS` client extension through site initializer metadata.
Apply the ECL theme manually:

1. Go to **Site Administration → Site Builder → Pages**.
2. Click **Configuration** (gear icon) → **Look and Feel**.
3. Under **CSS Client Extension**, pick **ECL Theme**.
4. Save. The site picks up the ECL palette, Arial typography and square
   button styling.

## Token architecture

ECL ships **two layers** of CSS custom properties:

1. **Primitives** — `--ecl-blue`, `--ecl-yellow`, `--ecl-grey-50`, … These
   are private to the theme.
2. **Semantics** — `--color-text`, `--color-brand`, `--color-link`,
   `--space-m`, … These are what fragments consume.

Fragments use semantic tokens only; the validator flags any reference to
primitive `--ecl-*` variables inside `fragments/`.

## Fragment resources

All component-level images, icons, illustrations and the EU emblem live
under `site-initializer/fragments/group/ecl/resources/`. Inside fragment
HTML they are referenced with the `[resources:filename.svg]` token, which
Liferay rewrites to the actual URL at render time.

## Edit / iterate

- Edit fragments, layouts, master page and style books **under
  `site-initializer/`** — that directory is the single source of truth.
- Edit theme tokens under `client-extensions/ecl-theme/src/index.css`
  (primitives in `--ecl-*`; semantics in `--color-*`, `--space-*`).
- Rebuild and redeploy with the commands above. Existing sites do **not**
  pick up changes from the JAR — only newly created sites do. Theme client
  extension changes are live on redeploy.

## License

The ECL design tokens, typography rules and component specifications are
published by the European Commission under the
[European Union Public Licence v1.2](https://commission.europa.eu/legal-notice_en).
The EU emblem is protected; usage is subject to the Commission's
[visual identity rules](https://commission.europa.eu/visual-identity-european-union-institutions_en).

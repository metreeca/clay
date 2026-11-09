# @metreeca/clay-widgets

[![npm](https://img.shields.io/npm/v/@metreeca/clay-widgets)](https://www.npmjs.com/package/@metreeca/clay-widgets)

Preact interface components for [@metreeca/clay](https://github.com/metreeca/clay).

The components an interface is assembled from: buttons, links and icons, the app logo, text runs, labels and captioned
images, notices and placeholders, breadcrumb trails and incremental loading triggers, a shell for app screens,
stacks, strips and cards optionally set on surfaces of their own, tabs, property panels, transient notices and failure
boundaries. A custom widget built on the shared class and keyboard helpers, and marked with the same role-named glyphs,
behaves and looks like the stock ones without restating their keyboard handling or visual vocabulary.

Styling is structural only: what a widget needs to work, with colour, type and spacing left to
[@metreeca/skin](https://github.com/metreeca/skin) or to whoever styles the app.

# Installation

```shell
npm install @metreeca/clay-widgets  # this package
npm install preact                  # peer dependency
npm install lucide-preact           # peer dependency
```

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

# Usage

> [!NOTE]
>
> This section introduces essential concepts; for complete coverage, see the
> [API reference](https://metreeca.github.io/clay/modules/_metreeca_clay-widgets.html).

{TBD: usage overview and examples}

# Support

- open an [issue](https://github.com/metreeca/clay/issues) to report a problem or to suggest a new feature
- start a [discussion](https://github.com/metreeca/clay/discussions) to ask a how-to question or to share an idea

# License

This project is licensed under the Apache 2.0 License –
see [LICENSE](https://github.com/metreeca/clay?tab=Apache-2.0-1-ov-file) file for details.

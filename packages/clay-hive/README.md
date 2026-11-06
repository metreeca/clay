# @metreeca/clay-hive

[![npm](https://img.shields.io/npm/v/@metreeca/clay-hive)](https://www.npmjs.com/package/@metreeca/clay-hive)

Preact layouts and containers for [@metreeca/clay](https://github.com/metreeca/clay) interfaces.

Container components that arrange widgets into screens: a frame for the whole screen, stacks and strips, themed boxes
and cards, tabs, property panels, transient notices and failure boundaries. A token scope retunes the design system
over the area it encloses, so a part of a screen takes a look of its own without a stylesheet.

Styling is structural only: what an arrangement needs to work, with the values behind colour, type and spacing left to
[@metreeca/skin](https://github.com/metreeca/skin) or to whoever styles the app.

# Installation

```shell
npm install preact               # peer dependency
npm install @metreeca/clay-hive  # this package
```

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

# Usage

> [!NOTE]
>
> This section introduces essential concepts; for complete coverage, see the
> [API reference](https://metreeca.github.io/clay/modules/_metreeca_clay-hive.html).

{TBD: usage overview and examples}

# Support

- open an [issue](https://github.com/metreeca/clay/issues) to report a problem or to suggest a new feature
- start a [discussion](https://github.com/metreeca/clay/discussions) to ask a how-to question or to share an idea

# License

This project is licensed under the Apache 2.0 License –
see [LICENSE](https://github.com/metreeca/clay?tab=Apache-2.0-1-ov-file) file for details.

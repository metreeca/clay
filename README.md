# @metreeca/clay

Minimalist component toolkit for Preact interfaces.

Screens are composed in JSX from general-purpose widgets and layouts, with no commitment to a data model. The
[@metreeca/skin] design system is optional: components work without it and follow the platform colour scheme with it.

# Installation

```shell
npm install @metreeca/skin            # design system package, optional
npm install @metreeca/clay            # Preact contexts and hooks
npm install @metreeca/clay-<layer>    # Preact package, one per component layer
```

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

Add a binding package for each component layer an app assembles its screens from. Bindings render with Preact and take
it as a peer dependency: check the package README for what each one expects. The [@metreeca/skin] design system is
optional and styles whatever a binding renders. An app brands it by overriding its tokens, as its
[theming guide](https://github.com/metreeca/skin#theming) explains for colours, faces and every other family.

| Package               | Description                          |
|-----------------------|--------------------------------------|
| [@metreeca/clay]      | Contexts and hooks                   |
| [@metreeca/clay-cell] | Widgets and controls                 |
| [@metreeca/clay-hive] | Layouts and containers               |
| [@metreeca/clay-move] | Movable items and the move lifecycle |

[@metreeca/skin]: https://metreeca.github.io/skin/

[@metreeca/clay]: https://metreeca.github.io/clay/modules/_metreeca_clay.html

[@metreeca/clay-cell]: https://metreeca.github.io/clay/modules/_metreeca_clay-cell.html

[@metreeca/clay-hive]: https://metreeca.github.io/clay/modules/_metreeca_clay-hive.html

[@metreeca/clay-move]: https://metreeca.github.io/clay/modules/_metreeca_clay-move.html

# Usage

> [!NOTE]
>
> Each package documents its own API in its README and API reference; for complete coverage, see the
> [API reference](https://metreeca.github.io/clay/).

# Support

- open an [issue](https://github.com/metreeca/clay/issues) to report a problem or to suggest a new feature
- start a [discussion](https://github.com/metreeca/clay/discussions) to ask a how-to question or to share an idea

# License

This project is licensed under the Apache 2.0 License –
see [LICENSE](https://github.com/metreeca/clay?tab=Apache-2.0-1-ov-file) file for details.

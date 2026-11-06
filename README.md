# @metreeca/clay

Minimalist component toolkit for Preact interfaces.

Screens are composed in JSX from general-purpose widgets and layouts, with no commitment to a data model. The
[@metreeca/skin] design system is optional: components work without it and follow the platform colour scheme with it.

# Installation

```shell
npm install @metreeca/skin            # design system package, optional
npm install @metreeca/clay            # Preact contexts and hooks
```

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

| Package          | Description        |
|------------------|--------------------|
| [@metreeca/clay] | Contexts and hooks |

[@metreeca/skin]: https://metreeca.github.io/skin/

[@metreeca/clay]: https://metreeca.github.io/clay/modules/_metreeca_clay.html

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

# @metreeca/clay

[![npm](https://img.shields.io/npm/v/@metreeca/clay)](https://www.npmjs.com/package/@metreeca/clay)

Preact contexts and hooks for [@metreeca/clay](https://github.com/metreeca/clay) interfaces.

The contexts a Clay app provides and the hooks its components consume them with, along with the binding that turns a
framework-agnostic `@metreeca/core` state object into the state of a Preact component.

# Installation

```shell
npm install preact          # peer dependency
npm install @metreeca/clay  # this package
```

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

> [!WARNING]
>
> Importing what the app states about itself reads the document, so it belongs to a browser: a consumer without one, a
> test or a server render, has to supply a DOM before the import runs.

# Usage

> [!NOTE]
>
> This section introduces essential concepts; for complete coverage, see the
> [API reference](https://metreeca.github.io/clay/modules/_metreeca_clay.html).

{TBD: usage overview and examples}

# Support

- open an [issue](https://github.com/metreeca/clay/issues) to report a problem or to suggest a new feature
- start a [discussion](https://github.com/metreeca/clay/discussions) to ask a how-to question or to share an idea

# License

This project is licensed under the Apache 2.0 License –
see [LICENSE](https://github.com/metreeca/clay?tab=Apache-2.0-1-ov-file) file for details.

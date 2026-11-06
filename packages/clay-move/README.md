# @metreeca/clay-move

[![npm](https://img.shields.io/npm/v/@metreeca/clay-move)](https://www.npmjs.com/package/@metreeca/clay-move)

Preact movable items and the move lifecycle for [@metreeca/clay](https://github.com/metreeca/clay) interfaces.

Drag and drop for cards across board cells and items within and across sortable lists, by pointer, touch or keyboard.

A widget shows a pending move until the app settles it and puts back a move the app refuses, with no state to track.
Moves are announced to screen readers in English, using the names shown on screen.

Gestures run on [dnd-kit](https://dndkit.com/), which stays internal: consumers never import it.

# Installation

```shell
npm install @metreeca/clay-move  # this package
npm install preact               # peer dependency
npm install lucide-preact        # peer dependency
```

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

# Usage

> [!NOTE]
>
> This section introduces essential concepts; for complete coverage, see the
> [API reference](https://metreeca.github.io/clay/modules/_metreeca_clay-move.html).

{TBD: usage overview and examples}

# Support

- open an [issue](https://github.com/metreeca/clay/issues) to report a problem or to suggest a new feature
- start a [discussion](https://github.com/metreeca/clay/discussions) to ask a how-to question or to share an idea

# License

This project is licensed under the Apache 2.0 License –
see [LICENSE](https://github.com/metreeca/clay?tab=Apache-2.0-1-ov-file) file for details.

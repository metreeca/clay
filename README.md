# @metreeca/clay

Minimalist UI toolkit for Preact.

Interfaces are composed in JSX from general-purpose widgets, layouts and movable items, wired to app-wide services
such as routing and a shared fetch client. Components carry no commitment to a data model: an app feeds them whatever
data it handles, and keeps the behaviour it owns in framework-agnostic `@metreeca/core` state objects.

Components read their colours, faces and spacing from the [@metreeca/skin] token contract. Its stylesheet is optional:
components work without it, and follow the platform colour scheme and the app branding with it.

# Installation

```shell
npm install @metreeca/skin            # design system stylesheet, optional
npm install @metreeca/clay            # contexts and hooks
npm install @metreeca/clay-<package>  # one per package the app takes up
```

> [!WARNING]
>
> TypeScript consumers must use `"moduleResolution": "nodenext"/"node16"/"bundler"` in `tsconfig.json`.
> The legacy `"node"` resolver is not supported.

Add the widgets and layouts the app's screens need, each from its own package, with the peer dependencies it lists.

An app brands the [@metreeca/skin] stylesheet by overriding its tokens: its
[theming guide](https://github.com/metreeca/skin#theming) covers colours, faces, spacing and every other token family.

| Package                   | Description           |
|---------------------------|-----------------------|
| [@metreeca/clay]          | Contexts and hooks    |
| [@metreeca/clay-widgets]  | Widgets and layouts   |
| [@metreeca/clay-markdown] | Markdown documents    |
| [@metreeca/clay-dnd]      | Drag and drop widgets |

[@metreeca/skin]: https://metreeca.github.io/skin/

[@metreeca/clay]: https://metreeca.github.io/clay/modules/_metreeca_clay.html

[@metreeca/clay-widgets]: https://metreeca.github.io/clay/modules/_metreeca_clay-widgets.html

[@metreeca/clay-markdown]: https://metreeca.github.io/clay/modules/_metreeca_clay-markdown.html

[@metreeca/clay-dnd]: https://metreeca.github.io/clay/modules/_metreeca_clay-dnd.html

# Usage

> [!NOTE]
>
> Each package documents its API in the [API reference](https://metreeca.github.io/clay/).

# Support

- open an [issue](https://github.com/metreeca/clay/issues) to report a problem or to suggest a new feature
- start a [discussion](https://github.com/metreeca/clay/discussions) to ask a how-to question or to share an idea

# License

This project is licensed under the Apache 2.0 License –
see [LICENSE](https://github.com/metreeca/clay?tab=Apache-2.0-1-ov-file) file for details.

> [!CAUTION]
>
> - **ONLY** modify code when explicitly requested or clearly required.
> - **NEVER** make unsolicited changes or revert **unrelated** user edits.
> - **ALWAYS** monitor IDE diagnostics when working on a file

> [!CAUTION]
> Activating and following skill guidance is **MANDATORY** for every task. Before starting any work, identify and
> activate all relevant skills. Skill instructions are binding and override default behaviours. When in doubt about
> whether skill guidance is current, relevant skills MUST be reloaded.

# Overview

Metreeca Clay is the general-purpose component layer of the Metreeca stack: the app-wide services, widgets, layouts
and movable items an interface is assembled from, with no commitment to a data model. The monorepo collects the
rendering-layer packages, each sitting directly under `packages/` (for example `packages/clay/`).

Clay **NEVER** depends on `@metreeca/blue`, `@metreeca/qest` or `@metreeca/keep`: a component needing a shape or a
query is out of scope, and belongs to a linked data layer built outside this repository.

# References

- [Preact](https://preactjs.com/guide/v10/getting-started) - Fast 3kB alternative to React with the same API, the
  rendering layer every package renders with and takes as a peer dependency
- [@metreeca/core](https://github.com/metreeca/core) - Core utilities and shared types, providing the state primitives
  the headless components are built on
- [@metreeca/http](https://github.com/metreeca/http) - Composable middleware for the standard fetch API, providing the
  client the shared fetch context wraps
- [@metreeca/skin](https://github.com/metreeca/skin) - Essential design tokens and styles, providing the token contract
  and the stylesheet every component sheet reads from

# NPM Scripts

- **`npm run clean`** - Remove dependencies and build artefacts
- **`npm run prime`** - Install dependencies from the lockfile
- **`npm run setup`** - Configure for local development
- **`npm run build`** - Compile sources and generate docs
- **`npm run check`** - Run the test suite
- **`npm run proof`** - Build and serve docs
- **`npm run watch`** - Serve the specimen page with live reload

# Package Layout

The root `package.json` `workspaces` glob (`packages/*`) covers the packages, each in its own directory
immediately under `packages/` (for example `packages/clay`). The private `specimen` is a workspace too, so it
installs the packages from their working trees rather than from the registry, and shares the root lockfile.

A package compiles against its siblings through their `dist`, so each `tsconfig.build.json` is `composite` and names
those siblings under `references`, and the package `build` runs `tsc -b`: the compiler settles the order and brings a
stale sibling up to date first, whatever order the workspaces are visited in. A package added here declares a
reference for every `@metreeca/clay*` dependency it takes, or it compiles against whatever its sibling last left
behind. The build is incremental, its cache being the `tsconfig.build.tsbuildinfo` each package's `clean` removes
alongside `dist`: deleting `dist` by hand leaves that cache claiming the outputs are current, and the next build
emits nothing.

Every package is a Preact binding: `clay` for the app-wide services a component is wired to, `clay-cell` and
`clay-hive` for the leaf and container components it is assembled from, the movable items included. Headless
behaviour carries **NO** dependency on a rendering framework: it lives in `@metreeca/core` and in `*.core.ts` modules,
and any other rendering layer added later gets binding packages of its own. Drag and drop state and bindings live in
[@metreeca/move](https://github.com/metreeca/move), which the `clay-hive` widgets `Placeable` and `Sortable` render.
A binding package adds observation and rendering over state it never redefines: behaviour lives in
framework-agnostic `@metreeca/core` state objects, so a second binding reaches the same behaviour without restating
it.

Packages are named after what they contribute, not after the library they contribute it with: `move`, not `dnd`.

# Package Summaries

Every package states its summary in three places, which **MUST** be kept aligned:

- `packages/<package>/package.json` `description` - `<summary> for @metreeca/clay.`
- `packages/<package>/README.md`, first line after the badge - the same sentence, with `@metreeca/clay` linked to the
  project repository
- the root `README.md` package table - `<summary>` with the rendering layer left off, since the rows sit under prose
  that already states it (`Contexts and hooks`, not `Preact contexts and hooks`)

The suffix names the project repository as `@metreeca/clay`, for every package alike.

A package carrying a `src/index.ts` states it in a fourth place, that module's doc definition line, as `<summary>.`
without the family suffix. Revising one **ALWAYS** means revising the others.

A package `README.md` **Usage** section opens with a note pointing at the API reference, then carries what a consumer
has to know to put the package to work, stubbed as `{TBD: usage overview and examples}` until written. The note links
the root of the package reference, `https://metreeca.github.io/clay/modules/_metreeca_<package>.html`, and **NEVER**
the site root, a module page, or a table of them.

# Design Precedent

[Atlassian](https://atlassian.design/) is the design system Clay is closest to. Check it before settling a component
contract or a theming question:

- A **component question** goes to the [Forge UI Kit](https://developer.atlassian.com/platform/forge/ui-kit/components/)
  for how a component surface is cut, and to the design system for the behaviour a component owes
- A **theming question** goes to the [token layer](https://atlassian.design/foundations/tokens): where upstream solves a
  variant through tokens, a Clay component solving it through props is a tell worth questioning

Upstream precedent is an argument, never a mandate. Ideas travel freely, while prose, tables and figures stay upstream:
link them, never reproduce them, and write whatever is borrowed in the Metreeca register.

# Component State

A component holding state declares it as a `@metreeca/core` state object and adopts it with `useModel` from
`@metreeca/clay/model`, reading data and transitions straight off the model:

```tsx
const { labels, active, select } = useModel(() => createTabs({ labels: Object.keys(panels) }));
```

- A transition renders the component again on its own, so a handler just calls it; a transition changing nothing
  renders nothing, and a zero-argument one is passed straight as a handler.
- A transition starts from the state the render read and notifies asynchronously: two calls in one handler land where
  one does, and the data read alongside keeps the earlier value until the next render.
- The factory runs on the first render only, so the model keeps the props as they stood then: a prop changing later
  **NEVER** reaches it, unless it is listed as a dependency. A model created from props lists them, and is created
  again from the factory whenever one changes, losing the state it reached:

  ```tsx
  const { model: slice, focus } = useModel(() => createWindow({ model }), [model]); // a new query starts from the first items
  ```
- Behaviour outgrowing a single widget moves to a sibling `*.core.ts` module as a headless component of its own, leaving
  the widget only what it renders: `Tabs` in `tabs.tsx`, the state it adopts in `tabs.core.ts`.

A `*.core.ts` module carries what the module beside it is built on. Where that is behaviour, the module is a headless
component in its own right and **NEVER** an internal appendix of the widget: it carries **NO** dependency on Preact, is
tested without a DOM, and is documented and versioned like any other module.

A `*.core.ts` module is **NEVER** exported: every package `exports` blocks the `.core` subpaths with a `"./*.core": null`
entry, so a consumer meets its types only through the published signatures naming them. The generated reference still
carries it like any other module, a type declared there being public wherever a published signature names it: TypeDoc
drops a symbol whose module is excluded, re-exported or not, so excluding these would leave a public type undocumented.

A binding package whose widgets draw the same parts alike keeps them in an `index.tsx` module: it holds rendering,
never behaviour, offers consumers nothing, and so is left out of the reference by `typedoc.json` and blocked by a
`"./index": null` entry, the package declaring no root entry point. Its rules sit in the package `index.css`
stylesheet, which the module imports. `clay-hive` keeps there the item a reader moves by its grip or by its whole
surface and the status announcing a move refused, which `Placeable` and `Sortable` both draw.

A module handing out a third-party catalogue under names of its own keeps the bare re-exports in a sibling `*.core.ts`
module, left out of the reference by `typedoc.json`, which names each such module: the documented module beside it is
the only path a consumer imports, and carries the comment the catalogue is described by. `icon.ts` documents the
`Icon` namespace it hands out, `icon.core.ts` names the glyph each role stands for.

A widget renders a `<clay-*>` custom element through `createElement`, with its rules in a sibling stylesheet the module
imports. The prefix is carried by the element, which the DOM requires to be hyphenated, and **NEVER** by the exported
component, which the module path already places: `Tabs` in `tabs.tsx`, rendering `<clay-tabs>` styled by `tabs.css`.

# Shared Utilities

Reach for `@metreeca/core` before writing a helper: its `state`, `strings`, `arrays` and `structures` entry points
already cover the state primitives alongside the common collection and value operations. A hand-rolled equivalent
duplicates tested code and drifts from it, missing the edge cases the shared one handles.

Keep a local helper only where the shared one genuinely doesn't fit, and record in its doc comment what the difference
is, so the next reader doesn't take it for an oversight.

# Testing

The root `vitest.config.ts` resolves imports of symlinked `@metreeca/*` packages, both workspace packages and siblings
linked by `npm run setup`, to the TypeScript source their `@metreeca/source` export entries declare, so tests run
against `src/` without a prior build. Packages installed from the registry keep resolving to their published `dist`.

> [!CAUTION]
> **NEVER** enable `@metreeca/source` through vitest `resolve.conditions`. Published manifests carry the condition
> while their packages ship no `src/`, and Vite does not fall back to `default` on a missing target, so a global
> condition breaks every package installed from the registry that declares it, as happens under `npm ci` in CI.

Headless state is tested without a DOM: a widget test that needs one supplies its own environment.

# Version Management

All workspace packages share the root `package.json` version. Beyond the `version` fields the release flow already
cascades, update the internal `@metreeca/clay*` dependency ranges in every `packages/**/package.json` to match.

When adding, removing, or renaming packages, update the package table in the root `README.md` Installation section to
match.

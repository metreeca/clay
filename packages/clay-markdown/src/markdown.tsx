/*
 * Copyright © 2026 Metreeca srl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Markdown document.
 *
 * Offers a Markdown text as the document it describes, its outline as links into that document, or the values its
 * front matter declares, so a page built from Markdown sources needs no rendering pipeline of its own.
 *
 * @module
 */

import { TOC, type TOCEntry } from "@metreeca/clay-widgets/toc";
import type { Element, Root as Tree } from "hast";
import { headingRank } from "hast-util-heading-rank";
import { toJsxRuntime } from "hast-util-to-jsx-runtime";
import type { Root } from "mdast";
import { type ComponentChildren, createElement } from "preact";
import { useEffect, useMemo } from "preact/hooks";
import { Fragment, jsx, jsxs } from "preact/jsx-runtime";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import remarkFrontmatter from "remark-frontmatter";
import remarkGemoji from "remark-gemoji";
import remarkGfm from "remark-gfm";
import { remarkAlert } from "remark-github-blockquote-alert";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import "./markdown.css";


/*
 * !!! bundle size: the module adds ~390 kB minified (~125 kB gzipped) to a consumer bundle, mostly highlight.js
 * grammars, since rehype-highlight statically imports the 37 lowlight `common` ones as its default `languages`, so
 * they ship even when unused. Lazy-loading them takes a lowlight-based highlighter of our own over `createLowlight()`,
 * importing grammars on demand for the languages a text names and highlighting again once they are registered.
 */


/**
 * The protocols a link or a source may name; anything else could run script or load content from outside the page.
 */
const SafeProtocol = /^(https?|ircs?|mailto|xmpp)$/i;

/**
 * An image source ending with a percentage of the width of the block holding the image, from `#1` to `#100`.
 */
const WidthHint = /^(.*)#([1-9]\d?|100)$/;

/**
 * The levels of the outline the table of contents lists, deeper headings left out.
 */
const Depth = 3;


const front = unified()
	.use(remarkParse)
	.use(remarkFrontmatter);

const pipeline = unified()
	.use(remarkParse)
	.use(remarkFrontmatter)
	.use(remarkGfm)
	.use(remarkAlert)
	.use(remarkGemoji)
	.use(remarkCode)
	.use(remarkRehype)
	.use(rehypeSlug)
	.use(rehypeHighlight)
	.use(rehypeAlerts)
	.use(rehypeLinks)
	.use(rehypeImages)
	.use(rehypeAccess);


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Front matter values.
 *
 * Maps each key a Markdown text declares in its YAML front matter to the value it is given, read as a plain string.
 */
export interface Meta {

	readonly [key: string]: string;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a Markdown document.
 *
 * Renders a Markdown text in one of three ways, as `meta` selects:
 *
 * - **document**, the default: the text in full, with GitHub Flavored Markdown tables, task lists and footnotes,
 *   GitHub alerts (`> [!NOTE]`), emoji shortcodes, fenced code highlighted by language and stripped of surrounding
 *   blank lines, and headings carrying the ids GitHub would give them, so links into the document resolve
 * - **table of contents**: the headings of the first three levels of the outline, as a navigation landmark of nested
 *   lists linking each to the matching heading, set as the design system sets any outline, so it reads as quiet
 *   navigation beside the document; nothing at all for a text without headings. While the document is on the page,
 *   the entry of the heading at the top of the viewport is marked as the current location and followed as the reader
 *   scrolls, so the outline shows where they stand; no entry is marked while the first heading is below the view.
 *   Each entry keeps its heading to one line, cut short with an ellipsis where the heading outruns the column
 * - **front matter**: the values the YAML front matter declares, the text itself left unrendered
 *
 * Links to Markdown files are rewritten to the route serving them, `guide.md` to `guide` and `index.md` to the folder
 * holding it, fragments preserved, so a set of documents linking each other by file name reads as a set of pages.
 * Links and sources whose protocol is unsafe are dropped, and raw HTML in the text is never rendered.
 *
 * A document reads the same to every reader. An image the text gives no alt text is described by its title, or by its
 * file name where it has none, so it is never skipped as decoration; the checkbox of a task list item is labelled by
 * the text of its item; a code block takes the keyboard focus, so a reader scrolls code running past the measure
 * without a pointer; and the heading of the footnotes is left to assistive technologies, as GitHub leaves it.
 *
 * A document scrolls the heading named by the location fragment into view as it renders and whenever the fragment
 * changes, and moves the focus to it, so a link into the document lands on its target once the text is in place and
 * keyboard and screen reader users carry on reading from there, rather than from where they followed the link.
 *
 * @param options The widget configuration
 *
 * @returns The rendered document, outline or front matter value
 */
export function Markdown({

	meta,
	name,

	children

}: {

	/**
	 * What is rendered of the text: `"toc"` for the table of contents, the key of a front matter value for that value
	 * alone, nothing if the text does not declare it, or a function turning the front matter values into content; the
	 * document in full if omitted, the only mode following the location fragment to the heading it names.
	 */
	meta?: "toc" | string | ((meta: Meta) => ComponentChildren)

	/**
	 * The accessible name of the table of contents, such as `Contents`, telling it apart from other navigation
	 * landmarks on the page, such as the site navigation around a document; unnamed if omitted, ignored in other modes.
	 */
	name?: string


	/**
	 * The Markdown text, front matter included.
	 */
	children: string

}): ComponentChildren {

	/*
	 * The heading a link points to exists only once the text is rendered, so landing on it waits for the render,
	 * and a fragment changing later never reloads the page, so it is followed on the window.
	 */

	useEffect(() => {

		if ( meta === undefined ) { scroll(); }

	}, [meta, children]);

	useEffect(() => {

		if ( meta === undefined ) {

			window.addEventListener("hashchange", scroll);

			return () => window.removeEventListener("hashchange", scroll);

		} else {

			return undefined;

		}

	}, [meta]);

	return useMemo(() => meta === undefined ? createElement("clay-markdown", {}, render(transform(children)))
			: meta === "toc" ? outline(transform(children), name)
				: typeof meta === "function" ? meta(entries(children))
					: entries(children)[meta]
		, [meta, children, name]);

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * A section of the table of contents: its heading and the sections it introduces.
 */
interface Section {

	readonly heading: Element;
	readonly nested: readonly Section[];

}


function scroll(): void {

	const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));

	target?.scrollIntoView();
	target?.focus({ preventScroll: true });

}


function entries(text: string): Meta {

	const yaml = front.parse(text).children.find(node => node.type === "yaml");

	return Object.fromEntries(Array.from(
		yaml?.value.matchAll(/^\s*(\w+)\s*:\s*(.*?)\s*$/gm) ?? [],
		([, key, value]) => [key, value]
	));

}

function transform(text: string): Tree {
	return pipeline.runSync(pipeline.parse(text));
}

/**
 * Reduces a document to its table of contents, one entry for each heading, linking to that heading and listing the
 * entries of the headings it introduces, so the outline mirrors the nesting a reader sees in the document itself.
 *
 * The ids are left to the document, so an outline shown beside it adds no duplicate ids to the page.
 */
function outline(tree: Tree, name: string | undefined): ComponentChildren {

	const sections = nest(headings(tree));

	return sections.length > 0 ? <TOC name={name} entries={contents(sections)}/> : null;

}

function headings(tree: Tree): readonly Element[] {
	return tree.children.filter((node): node is Element => headingRank(node) !== undefined);
}

/**
 * Nests headings, each holding the headings that follow it up to the next one of the same or a higher level, down to
 * the deepest level the outline lists, so headings below it are left out of the outline rather than hidden.
 */
function nest(headings: readonly Element[], level: number = 1): readonly Section[] {

	const [heading, ...rest] = headings;

	return heading === undefined ? [] : [
		{ heading, nested: level < Depth ? nest(rest.slice(0, boundary(heading, rest)), level+1) : [] },
		...nest(rest.slice(boundary(heading, rest)), level)
	];

}

/**
 * Turns sections into the entries of a table of contents, each linking to its heading by the id the document gives it.
 */
function contents(sections: readonly Section[]): readonly TOCEntry[] {
	return sections.map(({ heading, nested }) => ({
		label: render({ type: "root", children: heading.children }),
		href: `#${String(heading.properties.id)}`,
		entries: contents(nested)
	}));
}

/**
 * Locates the first heading closing the section a heading opens, the length of the headings if none does.
 */
function boundary(heading: Element, rest: readonly Element[]): number {

	const index = rest.findIndex(next => rank(next) <= rank(heading));

	return index < 0 ? rest.length : index;

}

function rank(heading: Element): number {
	return headingRank(heading) ?? 0;
}

function render(tree: Tree): ComponentChildren {
	return toJsxRuntime(tree, { Fragment, jsx, jsxs, elementAttributeNameCase: "html", stylePropertyNameCase: "css" });
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Strips fenced code of surrounding blank lines and halves its indentation, so code pasted from a source file
 * reads at the width of the document rather than at the width of the editor it was copied from.
 */
function remarkCode() {
	return (tree: Root) => visit(tree, "code", node => {

		// ;(mutation) unified transformers edit the tree they are handed in place

		node.value = node.value
			.replace(/^\s+|\s+$/g, "")
			.replace(/^[ \t]+/mg, indent => indent.replace(/ {4}|\t/g, "  "));

	});
}

/**
 * Titles GitHub alerts in sentence case, `Caution` rather than `CAUTION`, as GitHub itself renders them.
 */
function rehypeAlerts() {
	return (tree: Tree) => visit(tree, "element", node => {

		// ;(mutation) unified transformers edit the tree they are handed in place

		if ( classes(node).includes("markdown-alert-title") ) {
			node.children = node.children.map(child => child.type === "text"
				? { ...child, value: child.value.replace(/\p{L}+/u, word => word[0]+word.slice(1).toLowerCase()) }
				: child
			);
		}

	});
}

/**
 * Lists the classes of an element, stated either as an array or, by plugins setting them directly, as a string.
 */
function classes(node: Element): readonly unknown[] {

	const className: unknown = node.properties.className;

	return Array.isArray(className) ? className
		: typeof className === "string" ? className.split(/\s+/)
			: [];

}

/**
 * Drops links and sources naming an unsafe protocol, and rewrites those naming a Markdown file to the route serving
 * it, `guide.md` to `guide` and `index.md` to its folder, fragments preserved, so linked documents read as pages.
 */
function rehypeLinks() {
	return (tree: Tree) => visit(tree, "element", node => {

		// ;(mutation) unified transformers edit the tree they are handed in place

		node.properties = Object.fromEntries(Object.entries(node.properties).map(([name, value]) =>
			[name, (name === "href" || name === "src") && typeof value === "string" ? route(value) : value]
		));

	});
}

function route(url: string): string {

	const protocol = /^([^:/?#]*):/.exec(url)?.[1];

	return protocol === undefined || SafeProtocol.test(protocol)
		? url.replace(/(?<=^|\/)([-\w]+)\.md(?=#|$)/, (_match, name: string) => name === "index" ? "" : name)
		: "";

}

/**
 * Sizes images whose source ends with a percentage hint, `chart.png#50` to half the width of the block holding it,
 * dropping the hint from the source, so a text sets the relative size of a picture without resorting to raw HTML.
 */
function rehypeImages() {
	return (tree: Tree) => visit(tree, "element", node => {

		const src = node.properties.src;
		const hint = node.tagName === "img" && typeof src === "string" ? WidthHint.exec(src) : null;

		// ;(mutation) unified transformers edit the tree they are handed in place

		if ( hint !== null ) {
			node.properties = {
				...node.properties,
				src: hint[1],
				style: `--clay-markdown-width: ${hint[2]}%`
			};
		}

		if ( node.tagName === "img" && !node.properties.alt ) {
			node.properties = {
				...node.properties,
				alt: typeof node.properties.title === "string" && node.properties.title.trim()
					? node.properties.title.trim()
					: typeof node.properties.src === "string" ? named(node.properties.src) : ""
			};
		}

	});
}

/**
 * Turns the file name an image source ends with into words, dropping its folders, extension, query and fragment.
 */
function named(src: string): string {

	const file = src.replace(/[?#].*$/, "").split("/").at(-1) ?? "";
	const stem = file.replace(/\.[^.]*$/, "");

	return decoded(stem).replace(/[-_\s]+/g, " ").trim();

}

/**
 * Decodes a URI component, keeping it as written where it is not well formed.
 */
function decoded(component: string): string {
	try {
		return decodeURIComponent(component);
	} catch {
		return component;
	}
}

/**
 * Supplies what the rendered markup owes assistive technologies and keyboard users beyond what Markdown states: a
 * label for the checkbox of a task list item, the keyboard focus for a code block scrolling past the measure, and a
 * focus target for a heading a fragment lands on, reachable by script but kept out of the tab order.
 */
function rehypeAccess() {
	return (tree: Tree) => visit(tree, "element", node => {

		// ;(mutation) unified transformers edit the tree they are handed in place

		if ( node.tagName === "li" && classes(node).includes("task-list-item") ) {

			const label = text(node.children.filter(child => !(child.type === "element" && /^(ul|ol)$/.test(child.tagName))));

			node.children = node.children.map(child => child.type === "element" && child.tagName === "input"
				? { ...child, properties: { ...child.properties, ariaLabel: label } }
				: child
			);

		} else if ( node.tagName === "pre" ) {

			node.properties = { ...node.properties, tabIndex: 0 };

		} else if ( headingRank(node) !== undefined ) {

			node.properties = { ...node.properties, tabIndex: -1 };

		}

	});
}

/**
 * Reads the text a run of nodes shows, its whitespace collapsed.
 */
function text(nodes: readonly Tree["children"][number][]): string {
	return nodes.map(node => node.type === "text" ? node.value
		: node.type === "element" ? text(node.children)
			: ""
	).join("").replace(/\s+/g, " ").trim();
}

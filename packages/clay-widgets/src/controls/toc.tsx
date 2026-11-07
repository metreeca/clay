/*
 * Copyright © 2023-2026 Metreeca srl
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
 * Table of contents.
 *
 * Presents the outline of a long page as quiet navigation beside it, marking the section the reader is in as the page
 * scrolls, so a reader sees where they stand and moves to any other section in one gesture.
 *
 * @module toc
 */

import { useModel } from "@metreeca/clay/model";
import { opt, type Optional } from "@metreeca/core";
import { type ComponentChildren, createElement } from "preact";
import { useEffect } from "preact/hooks";
import { createToc } from "./toc.core.js";
import "./toc.css";


/**
 * The share of the viewport height, from its top, where the reading line stands: a section becomes current once its
 * start is scrolled up to the line, and stays current until the start of the next one is.
 */
export const TocLine = 1 / 3;


/**
 * An entry of a table of contents.
 *
 * Either a link to a section, or a group label gathering the entries under it without leading anywhere itself.
 */
export interface TocEntry {

	/**
	 * What the entry reads as.
	 */
	readonly label: ComponentChildren

	/**
	 * The location the entry links to; a fragment naming an element on the page (`#colours`) makes the entry one the
	 * outline marks while the reader is in its section. A group label leading nowhere if omitted.
	 */
	readonly href?: string

	/**
	 * The entries nested under this one, in page order; none if omitted.
	 */
	readonly entries?: readonly TocEntry[]

}


/**
 * Creates a table of contents.
 *
 * Lists the entries given, in order, as a navigation landmark of nested lists, styled and highlighted by the outline
 * rules of the design system alone, so it reads as every other outline an app built on it shows. Nothing at all is
 * rendered for an empty outline, leaving no empty landmark behind for assistive technology.
 *
 * While the page scrolls, the link whose section the reader is in is marked as the current location, which the design
 * system sets in the strong accent and weight and assistive technology reads as such: the section is the last one, in
 * page order, whose start has been scrolled up to a
 * reading line standing a third of the way down the viewport, so no link is marked above the first section. Only
 * links naming an element on the page by fragment take part; any other link is listed and never marked.
 *
 * From the large viewport up, the outline stands as a column of entries; below it, the outline folds into a single
 * row of its links scrolled across, group labels left out, so it takes one line above the content rather than a column
 * beside it, and every link stays reachable by pointer and keyboard alike in either form.
 *
 * The outline follows the scroll position of the document, so it serves a page scrolling as a whole, such as one laid
 * out in a {@link @metreeca/clay-widgets!shell.Shell shell}, rather than a box scrolling within it.
 *
 * @param options The widget configuration
 *
 * @returns The table of contents, or nothing for an empty outline
 */
export function Toc({

	name,

	entries

}: {

	/**
	 * The accessible name of the outline, such as `Contents`, setting it apart from the other navigation landmarks on
	 * the page; unnamed if omitted, as befits a page holding no other navigation landmark.
	 */
	name?: string

	/**
	 * The entries of the outline, in page order.
	 */
	entries: readonly TocEntry[]

}) {

	const sections = targets(entries);

	const { current, follow } = useModel(() => createToc({ sections }), [sections.join(" ")]);

	/*
	 * The section in view follows the scroll position of the document, which no render owns, so the outline measures
	 * where each section stands as it mounts and whenever the page scrolls or the viewport is resized; the model
	 * renders again only once the current section changes, so scrolling within a section costs nothing.
	 */

	useEffect(() => {

		const update = () => {

			const line = window.innerHeight * TocLine;

			follow(Object.fromEntries(sections.flatMap(id => {

				const element = document.getElementById(id);

				return element ? [[id, element.getBoundingClientRect().top - line]] : [];

			})));

		};

		update();

		window.addEventListener("scroll", update, { passive: true });
		window.addEventListener("resize", update, { passive: true });

		return () => {
			window.removeEventListener("scroll", update);
			window.removeEventListener("resize", update);
		};

	}, [follow, sections.join(" ")]);


	return entries.length === 0 ? null : createElement("clay-toc", {}, <nav aria-label={name}>
		{list(entries, current)}
	</nav>);

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Collects the ids of the sections an outline links to by fragment, in page order.
 */
function targets(entries: readonly TocEntry[]): readonly string[] {
	return entries.flatMap(({ href, entries }) => [...opt(fragment(href), id => [id], []), ...targets(entries ?? [])]);
}

function fragment(href: Optional<string>): Optional<string> {
	return href?.startsWith("#") && href.length > 1 ? decodeURIComponent(href.slice(1)) : undefined;
}

function list(entries: readonly TocEntry[], current: Optional<string>): ComponentChildren {
	return <ul>{entries.map((entry, index) => item(entry, index, current))}</ul>;
}

function item({ label, href, entries }: TocEntry, index: number, current: Optional<string>): ComponentChildren {

	const id = fragment(href);

	return <li key={href ?? index}>

		{href === undefined
			? <span>{label}</span>
			: <a href={href} aria-current={id !== undefined && id === current ? "location" : undefined}>{label}</a>
		}

		{entries && entries.length > 0 && list(entries, current)}

	</li>;

}

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
 * Page heading.
 *
 * Opens a stretch of a long page with a title, so a page reads as a sequence of stretches a reader can scan and link
 * to, rather than as one unbroken run of text. A ranked title also places its stretch in the page outline for a reader
 * to follow, while an unranked one titles a minor stretch that takes no place in the outline.
 *
 * @module heading
 */

import { isContent } from "../index.js";
import { type ComponentChildren, createElement } from "preact";
import "./heading.css";


/**
 * Creates a page heading.
 *
 * Sets the title as a heading at its rank in the page outline, or in heading type outside the outline when given no
 * rank. The heading holds nothing else: the content it opens follows it on the page as its sibling, so the heading
 * never decides how that content is laid out. A ranked title is set as the design system sets any heading of its rank,
 * so a page of headings reads like the rest of the page markup; a heading with no title renders nothing at all.
 *
 * The heading adds no landmark: the rank of its title alone places it in the page outline. A heading given an `id` is
 * a target for links, such as the entries of a {@link @metreeca/clay-widgets!toc.TOC table of contents}, and comes to
 * rest clear of any bar standing over the page when a link is followed, rather than hidden underneath it.
 *
 * @param options The widget configuration
 *
 * @returns The page heading, or `null` if given no title
 */
export function Heading({

	id,

	level,

	children

}: {

	/**
	 * The id a link names the heading by, as the fragment of its location; none if omitted.
	 */
	id?: string

	/**
	 * The rank of the title in the outline of the page: `1` for a heading of the page itself, `2` for a heading nested
	 * under one of them, `3` for one nested a level deeper. If omitted, the title still reads as a heading, but takes no
	 * place in the outline and keeps the size of the running text, titling a minor stretch within a ranked one.
	 */
	level?: 1 | 2 | 3

	/**
	 * The title of the stretch opened by the heading, set as a heading at `level`, or in heading type when no `level`
	 * is given; none if omitted, in which case the heading renders nothing, not even an empty element on the page.
	 */
	children?: ComponentChildren

}) {

	return isContent(children)
		? createElement(level ? `h${level}` : "clay-heading", { id }, children)
		: null;

}

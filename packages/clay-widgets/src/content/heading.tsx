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
 * Opens a stretch of a long page with a title ranked in the page outline, so a page reads as a sequence of stretches
 * a reader can scan, follow in an outline and link to, rather than as one unbroken run of text.
 *
 * @module heading
 */

import { isContent } from "../index.js";
import { type ComponentChildren, createElement } from "preact";
import "./heading.css";


/**
 * Creates a page heading.
 *
 * Sets the title as a heading at its rank in the page outline. The heading holds nothing else: the content it opens
 * follows it on the page as its sibling, so the heading never decides how that content is laid out.
 *
 * A top-level heading following anything else on the page is set apart from it by a rule, so a page of them reads as
 * a sequence without a frame around each stretch. A nested heading opens a stretch of the one above it instead: its
 * title stands a step above the text, and it keeps no rule of its own, so its stretch reads as part of the one above.
 *
 * The heading adds no landmark: the rank of its title alone places it in the page outline. A heading given an `id` is
 * a target for links, such as the entries of a {@link @metreeca/clay-widgets!toc.TOC table of contents}, and comes to
 * rest clear of any bar standing over the page when a link is followed, rather than hidden underneath it.
 *
 * @param options The widget configuration
 *
 * @returns The page heading
 */
export function Heading({

	id,

	level = 1,

	children

}: {

	/**
	 * The id a link names the heading by, as the fragment of its location; none if omitted.
	 */
	id?: string

	/**
	 * The rank of the title in the outline of the page: `1` for a heading of the page itself, `2` for a heading nested
	 * under one of them, `3` for one nested a level deeper; `1` if omitted, so a page of headings needs no rank at all.
	 */
	level?: 1 | 2 | 3

	/**
	 * What the stretch the heading opens is called, set as a heading at `level`; none if omitted.
	 */
	children?: ComponentChildren

}) {

	return createElement("clay-heading", { id, level }, isContent(children) && createElement(`h${level}`, {}, children));

}

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
 * Page section.
 *
 * Opens a stretch of a long page under a heading group a reader takes in at a glance: the part of the page it belongs
 * to, what it is called and what it is about, so a page reads as a sequence of sections rather than as one run of text.
 *
 * @module
 */

import { type ComponentChildren, createElement } from "preact";
import "./section.css";


/**
 * Creates a page section.
 *
 * Sets the heading group over the content: the eyebrow in small capitals in the strong accent, the title as a display
 * heading, and the lead in the label colour at a comfortable reading measure. Every part is optional and one left out
 * takes no room; a section given no part of the heading group shows its content alone.
 *
 * Consecutive sections are set apart by a rule, so a page of them reads as a sequence without a frame around each.
 * A section given an `id` is a target a link lands on, such as an entry of a
 * {@link @metreeca/clay-widgets!toc.Toc table of contents}, coming to rest clear of any bar standing over the page.
 *
 * @param options The widget configuration
 *
 * @returns The page section
 */
export function Section({

	id,

	level = 2,

	eyebrow,
	title,
	lead,

	children

}: {

	/**
	 * The id a link names the section by, as the fragment of its location; none if omitted.
	 */
	id?: string

	/**
	 * The rank of the title in the outline of the page: `1` for the section opening the page, which sets the title a
	 * step larger, `2` for one of the sections following it, `3` for a section nested in one of them; `2` if omitted.
	 */
	level?: 1 | 2 | 3

	/**
	 * The part of the page the section belongs to, such as `Foundations`, standing over the title.
	 */
	eyebrow?: ComponentChildren

	/**
	 * What the section is called, set as a heading at `level`.
	 */
	title?: ComponentChildren

	/**
	 * What the section is about, in a sentence or two, standing under the title.
	 */
	lead?: ComponentChildren

	/**
	 * The content of the section.
	 */
	children?: ComponentChildren

}) {

	const heading = given(eyebrow) || given(title) || given(lead);

	return createElement("clay-section", { id, level }, <>

		{heading && <hgroup>
			{given(eyebrow) && <p>{eyebrow}</p>}
			{given(title) && createElement(`h${level}`, {}, title)}
			{given(lead) && <p>{lead}</p>}
		</hgroup>}

		{children}

	</>);

}


/**
 * Tells content that shows something from content a slot was left empty with, as JSX renders nothing for `undefined`,
 * `null`, booleans and the empty string, so a slot holding any of them takes no room in the heading group.
 */
function given(content: ComponentChildren): boolean {
	return content !== undefined && content !== null && typeof content !== "boolean" && content !== "";
}

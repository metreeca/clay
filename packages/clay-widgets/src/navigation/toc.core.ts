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
 * Headless table of contents.
 *
 * Offers what an outline beside a long page does without drawing one: the sections it lists, in the order the page
 * holds them, and which of them the reader is currently in, followed as the page scrolls. A rendering layer adopts it
 * and supplies the markup, the styling and the measure of where each section stands.
 *
 * @module toc.core
 */

import { type Optional } from "@metreeca/core";
import { unique } from "@metreeca/core/arrays";
import { createState } from "@metreeca/core/state";


/**
 * The share of the viewport height, from its top, where the reading line stands: a section becomes current once its
 * start is scrolled up to the line, and stays current until the start of the next one is.
 */
const Line = 1/3;


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Headless table of contents.
 *
 * Holds the sections an outline lists and the one the reader is in, followed as the page scrolls: the last section, in
 * page order, whose start has been scrolled up to the reading line, so a section counts as current from the moment its
 * heading reaches the line until the heading of the next one does. Once the page is scrolled to its end, the sections
 * left below the line could never reach it, so the last section whose start is in view counts as current instead.
 * Above the first section, no section is current, whatever the position of the reading line or the end of the page.
 *
 * A section the reader asks for, by following a link to it, is current as soon as it is chosen, and stays current
 * while the page scrolls to bring it into view, which might never carry it to the line: the choice is pinned until it
 * is released, as the reader scrolls on their own, and following the page resumes from there.
 *
 * A transition yields a new outline and leaves this one as it stands. One that changes nothing yields this outline
 * itself, which a rendering layer takes as nothing to redraw, so scrolling within a section costs no render.
 */
export interface TOC {

	/**
	 * The ids of the elements opening the sections, in page order, unique.
	 */
	readonly sections: readonly string[];

	/**
	 * The id of the section the reader is in, or `undefined` above the first section.
	 */
	readonly current: Optional<string>;

	/**
	 * Whether the current section was chosen by the reader and is held against the scroll position of the page.
	 */
	readonly pinned: boolean;


	/**
	 * Follows the page to where the reader has scrolled it.
	 *
	 * @param metrics Where the page stands in the viewport
	 *
	 * @returns An outline whose current section is the one `metrics` puts the reader in, or this outline itself if
	 * that section is already current or if the current section is pinned, which no position of the page overrides
	 */
	scroll(metrics: TOCMetrics): this;

	/**
	 * Chooses a section, as the reader does by following a link to it.
	 *
	 * @param id The id of the section to make current
	 *
	 * @returns An outline whose current section is `id`, pinned against the scroll position, or this outline itself if
	 * `id` is not one of its sections, leaving the current section and any pin it carries as they stand
	 */
	select(id: string): this;

	/**
	 * Releases a chosen section, as the reader does by scrolling on their own.
	 *
	 * @returns An outline following the page again from the next {@link TOC.scroll scroll}, or this outline itself if
	 * no section is pinned; the section released stays current until the page is scrolled again
	 */
	release(): this;

}

/**
 * Where the page stands in the viewport, as an outline follows it.
 */
export interface TOCMetrics {

	/**
	 * The distance of each section start below the top of the viewport, keyed by section id, negative for a start
	 * scrolled above it; a section missing from the record is taken as not on the page, and never becomes current.
	 */
	readonly tops: Readonly<Record<string, number>>;

	/**
	 * The height of the viewport; the reading line stands a third of the way down from its top.
	 */
	readonly height: number;

	/**
	 * Whether the page has been scrolled to its end, leaving the sections below the reading line no way to reach it.
	 */
	readonly end: boolean;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a headless table of contents.
 *
 * @param options The outline configuration
 *
 * @returns An immutable {@link TOC} listing `sections`, with no section current or pinned
 */
export function createTOC({

	sections = []

}: {

	/**
	 * The ids of the elements opening the sections, in page order, taken as given with duplicates removed, keeping the
	 * first occurrence of each, so a section listed twice is followed once; empty if omitted.
	 */
	sections?: readonly string[]

} = {}): TOC {

	return createState<TOC>({

		sections: unique(sections),
		current: undefined,
		pinned: false,


		scroll({ tops, height, end }: TOCMetrics) {

			// at the end of the page the sections below the line can't reach it, so the edge of the viewport stands in

			const limit = end ? height : height*Line;

			return this.pinned ? {} : { current: this.sections.filter(id => (tops[id] ?? Infinity) <= limit).at(-1) };

		},

		select(id: string) {

			return this.sections.includes(id) ? { current: id, pinned: true } : {};

		},

		release() {

			return { pinned: false };

		}

	});

}

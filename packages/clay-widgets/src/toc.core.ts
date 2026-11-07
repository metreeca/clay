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
 * Headless table of contents.
 *
 * Offers what an outline beside a long page does without drawing one: the sections it lists, in the order the page
 * holds them, and which of them the reader is currently in, followed as the page scrolls. A rendering layer adopts it
 * and supplies the markup, the styling and the measure of where each section stands.
 *
 * @module
 */

import { type Optional } from "@metreeca/core";
import { unique } from "@metreeca/core/arrays";
import { createState } from "@metreeca/core/state";


/**
 * Headless table of contents.
 *
 * Holds the sections an outline lists and the one the reader is in: the last section, in page order, whose start has
 * been scrolled up to the reading line, so a section counts as current from the moment its heading reaches the line
 * until the heading of the next one does. Above the first section, no section is current.
 *
 * Following a scroll yields a new outline and leaves this one as it stands. One that changes nothing yields this
 * outline itself, which a rendering layer takes as nothing to redraw, so scrolling within a section costs no render.
 */
export interface Toc {

	/**
	 * The ids of the elements opening the sections, in page order, unique.
	 */
	readonly sections: readonly string[];

	/**
	 * The id of the section the reader is in, or `undefined` above the first section.
	 */
	readonly current: Optional<string>;


	/**
	 * Follows the page to where it now stands.
	 *
	 * @param offsets The distance of each section start below the reading line, keyed by section id: zero or less for a
	 * start scrolled up to the line or past it; a section missing from the record is taken as not on the page and so
	 * never becomes current, whatever the offsets of the sections standing around it on the page
	 *
	 * @returns An outline whose current section is the last one, in page order, whose start is at or above the line,
	 * or this outline itself if that section is already current, which a rendering layer redraws nothing for
	 */
	follow(offsets: Readonly<Record<string, number>>): this;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a headless table of contents.
 *
 * @param options The outline configuration
 *
 * @returns An immutable {@link Toc} listing `sections`, with no section current
 */
export function createToc({

	sections

}: {

	/**
	 * The ids of the elements opening the sections, in page order, taken as given with duplicates removed, keeping the
	 * first occurrence of each, so a section listed twice is followed once; empty if omitted.
	 */
	sections?: readonly string[]

} = {}): Toc {

	const ids: readonly string[] = sections === undefined ? [] : unique(sections);

	return createState<Toc>({

		sections: ids,
		current: undefined,


		follow(offsets: Readonly<Record<string, number>>) {

			// a section missing from the record has no offset, which leaves it out of the sections passed

			return { current: ids.filter(id => (offsets[id] ?? Infinity) <= 0).at(-1) };

		}

	});

}

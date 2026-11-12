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
 * The share of the view height, from its top, where a section start counts as standing at the top of the view.
 */
const Top = 1/3;

/**
 * The distance, in pixels, within which a section start counts as standing on the top edge of the view, absorbing the
 * fractional offsets layout leaves a start brought to the edge by a followed link.
 */
const Edge = 1;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Headless table of contents.
 *
 * Holds the sections an outline lists and the one the reader is in, followed as the page scrolls.
 *
 * A reader takes in a page from the top of the view down, so the current section is the one at the top of the view.
 * That is the first section starting in the top third of the view, or failing that the last one scrolled up past the
 * top edge. Before any has been, it is the first section in view. No section is current while the first one still
 * starts below the view, as it does beneath a long introduction or a cover image.
 *
 * The current section changes only as a section start crosses the top edge of the view or the bottom of its top third,
 * or as the page reaches its end or leaves it. Sections starting too low in the last screenful of the page to ever be
 * scrolled into the top third are left to the end of the page, where the last section in view is current instead.
 *
 * A section the reader asks for, by following a link to it, is current as soon as it is chosen. It stays current while
 * the page scrolls to bring it into view, smoothly or at once. The choice is pinned until it is released, as the reader
 * scrolls on their own. After that, the section chosen keeps precedence over the scroll position while its start is
 * in view, so it stays current while the reader reads on around it. Once its start leaves the view, the choice lapses
 * for good and the current section follows the page under the rules above, however often the section comes back.
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
	 * The id of the section the reader is in, or `undefined` while the first section starts below the view.
	 */
	readonly current: Optional<string>;

	/**
	 * Whether the current section was chosen by the reader and is held against the scroll position of the page.
	 */
	readonly pinned: boolean;

	/**
	 * The id of the section the reader chose, held as current while its start is in view, or `undefined` if no choice
	 * holds, either because none was made or because the section chosen has since left the view.
	 */
	readonly chosen: Optional<string>;


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
	 * no section is pinned; the section released stays current for as long as its start is in view
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
	 * The height of the viewport, the distance below its top within which a section start stands in view.
	 */
	readonly height: number;

	/**
	 * Whether the page has been scrolled to its end, leaving the sections starting low in its last screenful no way to
	 * reach the top third; `false` for a page with nothing to scroll, which is followed from the top of the view alone.
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
		chosen: undefined,


		scroll({ tops, height, end }: TOCMetrics) {

			const top = (id: string) => tops[id] ?? Infinity;

			const visible = this.sections.filter(id => top(id) >= -Edge && top(id) < height);
			const leading = visible.find(id => top(id) <= height*Top+Edge);
			const reached = this.sections.filter(id => top(id) < -Edge).at(-1);

			const chosen = this.chosen !== undefined && visible.includes(this.chosen) ? this.chosen : undefined;

			return this.pinned ? {} : {
				chosen,
				current: chosen ?? (end ? visible.at(-1) ?? reached : leading ?? reached ?? visible[0])
			};

		},

		select(id: string) {

			return this.sections.includes(id) ? { current: id, pinned: true, chosen: id } : {};

		},

		release() {

			return { pinned: false };

		}

	});

}

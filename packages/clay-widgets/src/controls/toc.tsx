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
import { useEffect, useId } from "preact/hooks";
import { createTOC, type TOC as Outline, type TOCMetrics } from "./toc.core.js";
import "./toc.css";


/**
 * An entry of a table of contents.
 *
 * Either a link to a section, or a group label gathering the entries under it without leading anywhere itself.
 */
export interface TOCEntry {

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
	 * The browsing context the entry opens its location in, such as `_blank` for a screen of its own in a new tab,
	 * which leaves the page holding the outline in place; the current one if omitted.
	 */
	readonly target?: string

	/**
	 * The entries nested under this one, in page order; none if omitted.
	 */
	readonly entries?: readonly TOCEntry[]

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a table of contents.
 *
 * Lists the entries given, in order, as a navigation landmark of nested lists, styled and highlighted by the outline
 * rules of the design system alone, so it reads as every other outline an app built on it shows. Nothing at all is
 * rendered for an empty outline, leaving no empty landmark behind for assistive technology.
 *
 * While the page scrolls, the link whose section the reader is in is marked as the current location, which the design
 * system sets in the strong accent and weight and assistive technology reads as such: the section is the last one, in
 * page order, whose start has been scrolled up to a reading line standing a third of the way down the view, and
 * once the page is scrolled to its end, the last one whose start is in view, so a short closing section is still
 * reached. No link is marked above the first section. Only links naming an element on the page by fragment take part;
 * any other link is listed and never marked, as it names no section the scroll position could put the reader in.
 *
 * A section the reader asks for, by following one of its links or by arriving with a fragment naming it, is marked at
 * once and stays marked while the page scrolls to it, until the reader scrolls on their own with the wheel, by touch,
 * with the pointer or from the keyboard. The location fragment follows the section marked in turn, replaced rather
 * than pushed so that scrolling adds no entries to the history, and cleared above the first section, so a reload or a
 * shared address lands on the section where the reader stood when the address was taken.
 *
 * From the large viewport up, the outline stands as a column of entries; below it, the outline folds behind a single
 * line naming the section the reader is in, or the outline itself above the first section, and unfolds into the same
 * column on demand, folding again as soon as one of its links is followed, so it takes one line above the content.
 *
 * The outline follows the box its sections scroll in, whatever lays the page out: the nearest scrolling ancestor of
 * the first section on the page, such as the main column of a {@link @metreeca/clay-widgets!tool.Tool tool}, or
 * the document where no ancestor scrolls. The reading line and the end of the page are measured on the part of that
 * box left in view, short of its scroll padding, so a header standing over the box is not counted as room to read in.
 *
 * @param options The widget configuration
 *
 * @returns The table of contents, or nothing for an empty outline
 */
export function TOC({

	compact = false,

	name,

	entries

}: {

	/**
	 * Whether top-level groups fold like an accordion, keeping a long outline down to the group the reader is in.
	 *
	 * Each top-level group without a link of its own folds behind its label, and only one group is open at a time. The
	 * group holding the section the reader is in opens as they reach it, and any other opens on demand. A group with a
	 * link stays listed in full, since its label already leads somewhere. Every group is listed in full if omitted.
	 */
	compact?: boolean

	/**
	 * The accessible name of the outline, such as `Contents`, telling it apart from other navigation landmarks and
	 * naming the folded outline above the first section; unnamed if omitted, for a page with no other such landmark.
	 */
	name?: string

	/**
	 * The entries of the outline, in page order.
	 */
	entries: readonly TOCEntry[]

}) {

	const sections = targets(entries);

	const key = sections.join(" ");

	const outline = useModel(() => createTOC({ sections }), [key]);

	const group = useId(); // the name gathering the folded groups of this outline alone into one accordion

	/*
	 * The section in view follows the scroll position and the location of the document, which no render owns, so the
	 * outline measures where each section stands as it mounts and whenever the page scrolls or the viewport is
	 * resized, takes the section the fragment names on arrival and whenever it changes, and lets a chosen section go as
	 * soon as the reader scrolls on their own; the model renders again only once the current section changes, so
	 * scrolling within a section costs nothing beyond measuring where the section starts stand.
	 */

	useEffect(() => {

		/*
		 * Events arrive between renders, and a transition starts from the state the render it was read from saw, so a
		 * scroll landing before the render a choice brought would follow the page from before the choice and undo it.
		 * Each event takes its transition on the outline the previous event left instead, which is the state the next
		 * render will show, so a choice and the scroll it sets off land in the order they happened.
		 */

		let latest = outline; // ;(let) the outline as the events of this subscription have left it

		const take = (next: Outline) => {
			latest = next;
			sync(next);
		};

		// a fragment naming no section is left alone, as it may lead anywhere else on the page

		const select = () => opt(fragment(location.hash), id => latest.sections.includes(id) ? take(latest.select(id)) : undefined);
		const scroll = () => take(latest.scroll(metrics(latest.sections)));
		const release = () => take(latest.release());

		// a section the fragment names on arrival is pinned, and following the page leaves a pinned section alone

		select();
		scroll();

		/*
		 * A box scrolling sends its event to itself alone, which the capture phase on the document hears on the way
		 * down; the document scrolling sends its own on to the window, where it is heard as well. Following twice lands
		 * where following once does, so the page scrolling heard on both costs nothing.
		 *
		 * Sections moving without a scroll, as the page settles its styles, fonts and images after mounting or grows
		 * under the reader, move the reading line across them all the same, so the outline follows their sizes too.
		 *
		 * The reader scrolling on their own, with the wheel, by touch, with the pointer or from the keyboard, as opposed
		 * to the scroll a followed link sets off, releases the section chosen.
		 */

		const stops = [

			listen(document, "scroll", scroll, { passive: true, capture: true }),
			listen(window, "scroll", scroll, { passive: true }),
			listen(window, "resize", scroll, { passive: true }),

			observe(latest.sections, scroll),

			listen(window, "hashchange", select),

			...["wheel", "touchmove", "pointerdown", "keydown"].map(gesture =>
				listen(window, gesture, release, { passive: true, capture: true })
			)

		];

		return () => stops.forEach(stop => stop());

	}, [key]); // the outline the subscription starts from is the one created for these sections


	return entries.length === 0 ? null : createElement("clay-toc", {}, <details>
		<summary>{opt(outline.current, id => caption(entries, id)) ?? name}</summary>
		<nav aria-label={name}>{list(entries, outline.current, compact ? group : undefined)}</nav>
	</details>);

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Measures where the sections stand in the part of their scrolling box left in view, and whether the box has been
 * scrolled to its end, leaving no section below the reading line a way to reach it.
 *
 * The box is the nearest scrolling ancestor of the first section on the page, or the document where none scrolls; the
 * part left in view stops short of its scroll padding, which is where whatever stands over the box is accounted for.
 */
function metrics(sections: readonly string[]): TOCMetrics {

	const elements = sections.flatMap(id => opt(document.getElementById(id) ?? undefined, element => [{ id, element }], []));
	const box = opt(elements[0]?.element, scroller);

	const root = document.documentElement;
	const style = getComputedStyle(box ?? root);

	const paddingTop = parseFloat(style.scrollPaddingTop) || 0; // ;(NaN) `auto` pads nothing
	const paddingBottom = parseFloat(style.scrollPaddingBottom) || 0;

	const { offset, client, scrolled, total } = box
		? { offset: box.getBoundingClientRect().top, client: box.clientHeight, scrolled: box.scrollTop, total: box.scrollHeight }
		: { offset: 0, client: window.innerHeight, scrolled: window.scrollY, total: root.scrollHeight };

	const origin = offset + paddingTop;
	const height = client - paddingTop - paddingBottom;

	return {

		tops: Object.fromEntries(elements.map(({ id, element }) => [id, element.getBoundingClientRect().top - origin])),

		height,

		// a box with nothing to scroll is at its start as much as at its end, and is read by the reading line

		end: scrolled > 0 && scrolled + client >= total - 1

	};

}

/**
 * Locates the box an element scrolls in.
 *
 * A box letting its content scroll across computes as scrolling down as well, whether or not its content runs past its
 * height, so a box counts only once it has more content than height: a body scrolling a wide table across while the
 * column around it scrolls down is passed over for the column, which is what the reader actually scrolls.
 *
 * @returns The nearest ancestor of `element` scrolling its content vertically, or `undefined` if the document does
 */
function scroller(element: Element): Optional<HTMLElement> {

	const parent = element.parentElement;

	return parent === null || parent === document.body || parent === document.documentElement ? undefined
		: /^(auto|scroll|overlay)$/.test(getComputedStyle(parent).overflowY) && parent.scrollHeight > parent.clientHeight ? parent
			: scroller(parent);

}

/**
 * Subscribes a listener to an event target.
 *
 * @returns A function unsubscribing `listener`
 */
function listen(target: EventTarget, type: string, listener: () => void, options?: AddEventListenerOptions): () => void {

	target.addEventListener(type, listener, options);

	return () => target.removeEventListener(type, listener, options);

}

/**
 * Subscribes a listener to the resizing of the sections on the page, where the platform reports it.
 *
 * @returns A function unsubscribing `listener`
 */
function observe(sections: readonly string[], listener: () => void): () => void {

	const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(listener);

	sections.forEach(id => opt(document.getElementById(id) ?? undefined, element => observer?.observe(element)));

	return () => observer?.disconnect();

}

/**
 * Brings the location fragment in step with the section the page puts the reader in, replacing the entry on show so
 * that scrolling leaves the history alone, and handing the router the state it keeps there unchanged.
 */
function sync({ current, pinned }: Outline): void {

	const hash = current === undefined ? "" : `#${encodeURIComponent(current)}`;

	if ( !pinned && location.hash !== hash ) {
		history.replaceState(history.state, "", `${location.pathname}${location.search}${hash}`);
	}

}

/**
 * Collects the ids of the sections an outline links to by fragment, in page order.
 */
function targets(entries: readonly TOCEntry[]): readonly string[] {
	return entries.flatMap(({ href, entries = [] }) => [fragment(href), ...targets(entries)]).filter(id => id !== undefined);
}

/**
 * Extracts the id a link names by fragment, or `undefined` for a link leading elsewhere or nowhere.
 */
function fragment(href: Optional<string>): Optional<string> {
	return href?.startsWith("#") && href.length > 1 ? decodeURIComponent(href.slice(1)) : undefined;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Renders entries as a nested list of links, and an entry with no link as plain text. The link to the section the
 * reader is in is marked as the current location. Following a link folds the outline on smaller viewports, so the
 * reader lands on the section it leads to with the outline already out of the way.
 *
 * Given an accordion name, each entry with nested entries and no link of its own folds behind its label instead. The
 * folds share that name, so only one is open at a time, and a fold opens while it holds the section the reader is in.
 */
function list(entries: readonly TOCEntry[], current: Optional<string>, accordion?: string): ComponentChildren {
	return <ul>{entries.map(({ label, href, target, entries = [] }, index) => <li key={href ?? index}>

		{accordion !== undefined && href === undefined && entries.length > 0

			? <details name={accordion} open={current !== undefined && holds(entries, current)}>
				<summary>{label}</summary>
				{list(entries, current)}
			</details>

			: <>

				{href === undefined
					? <span>{label}</span>
					: <a href={href} target={target} aria-current={current !== undefined && fragment(href) === current ? "location" : undefined}
						onClick={({ currentTarget }) => currentTarget.closest("clay-toc > details")?.removeAttribute("open")}
					>{label}</a>
				}

				{entries.length > 0 && list(entries, current)}

			</>
		}

	</li>)}</ul>;
}

/**
 * Checks whether entries link to a section, at any depth.
 */
function holds(entries: readonly TOCEntry[], id: string): boolean {
	return entries.some(entry => fragment(entry.href) === id || holds(entry.entries ?? [], id));
}

/**
 * Finds the label of the entry linking to a section, searching the entries in page order.
 */
function caption(entries: readonly TOCEntry[], id: string): ComponentChildren {
	return entries.reduce<ComponentChildren>((found, entry) =>
		found ?? (fragment(entry.href) === id ? entry.label : caption(entry.entries ?? [], id)), undefined
	);
}

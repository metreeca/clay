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
import { createToc, type Toc as Outline, type View } from "./toc.core.js";
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
 * From the large viewport up, the outline stands as a column of entries; below it, the outline folds into a single
 * row of its links scrolled across, group labels left out, so it takes one line above the content rather than a column
 * beside it, and every link stays reachable by pointer and keyboard alike in either form.
 *
 * The outline follows the box its sections scroll in, whatever lays the page out: the nearest scrolling ancestor of
 * the first section on the page, such as the content column of a {@link @metreeca/clay-widgets!shell.Shell shell}, or
 * the document where no ancestor scrolls. The reading line and the end of the page are measured on the part of that
 * box left in view, short of its scroll padding, so a header standing over the box is not counted as room to read in.
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

	const key = sections.join(" ");

	const outline = useModel(() => createToc({ sections }), [key]);

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

		const chosen = () => opt(fragment(location.hash), id => latest.sections.includes(id) ? id : undefined);

		const choose = () => opt(chosen(), id => take(latest.select(id)));
		const update = () => take(latest.follow(view(latest.sections)));
		const release = () => take(latest.release());

		if ( chosen() === undefined ) {
			update();
		} else {
			choose();
		}

		/*
		 * A box scrolling sends its event to itself alone, which the capture phase on the document hears on the way
		 * down; the document scrolling sends its own on to the window, where it is heard as well. Following twice lands
		 * where following once does, so the page scrolling heard on both costs nothing.
		 */

		document.addEventListener("scroll", update, { passive: true, capture: true });
		window.addEventListener("scroll", update, { passive: true });
		window.addEventListener("resize", update, { passive: true });

		/*
		 * Sections moving without a scroll, as the page settles its styles, fonts and images after mounting or grows
		 * under the reader, move the reading line across them all the same, so the outline follows their sizes too.
		 */

		const settle = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(() => {
			if ( !latest.pinned ) { update(); }
		});

		latest.sections.forEach(id => opt(document.getElementById(id) ?? undefined, element => settle?.observe(element)));
		window.addEventListener("hashchange", choose);

		Gestures.forEach(gesture => window.addEventListener(gesture, release, { passive: true, capture: true }));

		return () => {

			settle?.disconnect();

			document.removeEventListener("scroll", update, { capture: true });
			window.removeEventListener("scroll", update);
			window.removeEventListener("resize", update);
			window.removeEventListener("hashchange", choose);

			Gestures.forEach(gesture => window.removeEventListener(gesture, release, { capture: true }));

		};

	}, [key]); // the outline the subscription starts from is the one created for these sections


	return entries.length === 0 ? null : createElement("clay-toc", {}, <nav aria-label={name}>
		{list(entries, outline.current)}
	</nav>);

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * The gestures a reader scrolls the page with, as opposed to the scroll a followed link sets off on its own.
 */
const Gestures: readonly (keyof WindowEventMap)[] = ["wheel", "touchmove", "pointerdown", "keydown"];


/**
 * Measures where the sections stand in the part of their scrolling box left in view, and whether the box has been
 * scrolled to its end, leaving no section below the reading line a way to reach it.
 *
 * The box is the nearest scrolling ancestor of the first section on the page, or the document where none scrolls; the
 * part left in view stops short of its scroll padding, which is where whatever stands over the box is accounted for.
 */
function view(sections: readonly string[]): View {

	const elements = sections.flatMap((id): readonly (readonly [string, HTMLElement])[] => {

		const element = document.getElementById(id);

		return element ? [[id, element]] : [];

	});
	const box = opt(elements[0]?.[1], scroller);

	const root = document.documentElement;
	const style = getComputedStyle(box ?? root);

	const start = parseFloat(style.scrollPaddingTop) || 0; // ;(NaN) `auto` pads nothing
	const end = parseFloat(style.scrollPaddingBottom) || 0;

	const top = (box ? box.getBoundingClientRect().top : 0) + start;
	const client = box ? box.clientHeight : window.innerHeight;
	const scrolled = box ? box.scrollTop : window.scrollY;
	const total = box ? box.scrollHeight : root.scrollHeight;

	const height = client - start - end;

	return {

		tops: Object.fromEntries(elements.map(([id, element]) => [id, element.getBoundingClientRect().top - top])),

		line: height * TocLine,
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

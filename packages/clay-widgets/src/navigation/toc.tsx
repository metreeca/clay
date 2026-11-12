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
 * Table of contents.
 *
 * Presents the outline of a long page as quiet navigation beside it, marking the section the reader is in as the page
 * scrolls, so a reader sees where they stand and moves to any other section in one gesture.
 *
 * @module toc
 */

import { useModel } from "@metreeca/clay/model";
import { isArray, isString, opt, type Optional } from "@metreeca/core";
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
	 * What the entry reads as. A plain string label offers its full wording as a tooltip, for a reader of an outline
	 * whose labels are clipped, while a label given as markup has to carry a tooltip of its own where one is needed.
	 */
	readonly label: ComponentChildren;

	/**
	 * The location the entry links to; a fragment naming an element on the page (`#colours`) makes the entry one the
	 * outline marks while the reader is in its section. A group label leading nowhere if omitted.
	 */
	readonly href?: string;

	/**
	 * The browsing context the entry opens its location in, such as `_blank` for a screen of its own in a new tab,
	 * which leaves the page holding the outline in place; the current one if omitted.
	 */
	readonly target?: string;

	/**
	 * The entries nested under this one, in page order, as an array of entries or keyed by labels; none if omitted.
	 */
	readonly entries?: readonly TOCEntry[] | TOCEntries;

}

/**
 * Table of contents entries keyed by labels.
 *
 * Maps each plain string label to the location it links to, or to the entries gathered under it for a group label
 * leading nowhere, so an outline is written as a single object literal. Entries are listed in the order their labels
 * appear in the object, but labels reading as non-negative integers, such as `2026`, always come first in ascending
 * order. An outline needing them elsewhere, labels that are not plain strings, or links opening in another browsing
 * context take {@link TOCEntry} values instead, which mix freely with keyed entries at any depth.
 */
export type TOCEntries = {

	readonly [label: string]: string | TOCEntries

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a table of contents.
 *
 * Lists the entries given, in order, as a navigation landmark of nested lists, styled and highlighted by the outline
 * rules of the design system alone, so it reads as every other outline an app built on it shows. Nothing at all is
 * rendered for an empty outline, leaving no empty landmark behind for assistive technology.
 *
 * Unless told to wrap, every label, folded groups included, stays on a single line, so a long identifier never breaks
 * midway or widens the column: a label running past the column is cut short with an ellipsis. Its full wording is
 * still read out by assistive technology, and a plain string label shows it as a tooltip too.
 *
 * While the page scrolls, the link whose section the reader is in is marked as the current location, which the design
 * system sets in the strong accent and weight and assistive technology reads as such. The section marked is the one
 * at the top of the view: the first starting in its top third, or failing that the last scrolled past the top edge.
 * Once the page is scrolled to its end, it is the last one in view, so a short closing section is still reached. No
 * link is marked while the first section starts below the view, and short of the end of the page the mark moves only
 * as a section start crosses the top edge of the view or the bottom of its top third, so reading on holds it steady.
 * Only links naming an element on the page by fragment take part. Any other link is listed but never marked, as it
 * leads away from the page, to no section the reader could ever scroll into from where they are.
 *
 * A section the reader asks for, by following a link to it or by arriving with a fragment naming it, is marked at once
 * and stays marked while the page scrolls to it, smoothly or at once, until the reader scrolls on their own with the
 * wheel, by touch, with the pointer or from the keyboard; after that, it stays marked for as long as its start is in
 * view, and once its start has left the view, the scroll position alone decides the mark, even when the section comes
 * back into view later on. Any link to a section counts, in the outline or elsewhere on the page, shadow trees
 * included. A link opening a new browsing context or a download, a click with a modifier key, and a click cancelled by
 * a handler on the page all leave the page where it stands, so they leave the mark alone as well. A section named on
 * arrival is scrolled into view by the outline, even where the page renders its sections after loading or scrolls them
 * in a box of its own. The outline never changes the location: the fragment stays whatever the reader followed or
 * arrived with, however far the page is scrolled, so a shared or bookmarked address names the section the reader chose.
 *
 * The outline follows the box its sections scroll in, whatever lays the page out: the nearest scrolling ancestor of
 * the first section on the page, such as the main column of a {@link @metreeca/clay-widgets!tool.Tool tool}, or
 * the document where no ancestor scrolls. The view is measured on the part of that box left in view, short of its
 * scroll padding, so a header standing over the box is not counted as room to read in.
 *
 * @param options The widget configuration
 *
 * @returns The table of contents, or nothing for an empty outline
 */
export function TOC({

	compact = false,
	wrap = false,

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
	 * Whether long labels wrap across lines, so each is shown in full, as fits an outline of prose headings. A word too
	 * long for the column breaks wherever needed. By default each label is clipped to a single line with an ellipsis,
	 * so a long identifier never breaks midway or widens the column, as fits a narrow sidebar of reference links.
	 */
	wrap?: boolean

	/**
	 * The accessible name of the outline, such as `Contents`, telling it apart from other navigation landmarks on the
	 * page, as in a sidebar holding several outlines; unnamed if omitted, for a page with no other such landmark.
	 */
	name?: string

	/**
	 * The entries of the outline, in page order, either as an array of entries or as entries keyed by their labels.
	 */
	entries: readonly TOCEntry[] | TOCEntries

}) {

	const $entries = normalise(entries);

	const sections = targets($entries);

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

		// a fragment naming no section is left alone, as it may lead anywhere else on the page

		const select = () => opt(fragment(location.hash), id => {
			latest = latest.select(id);
		});

		const follow = (event: Event) => opt(followed(event), id => setTimeout(() => {
			latest = event.defaultPrevented ? latest : latest.select(id);
		}));

		const scroll = () => {
			latest = latest.scroll(metrics(latest.sections));
		};

		const release = () => {
			latest = latest.release();
		};

		/*
		 * A section the fragment names on arrival is pinned, and following the page leaves a pinned section alone. The
		 * browser looks for it before the page is rendered, and never in a box scrolling of its own, so it is brought
		 * into view here; a link followed later is left to the browser, which finds its section already on the page.
		 */

		select();
		reveal(latest);
		scroll();

		/*
		 * A box scrolling sends its event to itself alone, which the capture phase on the document hears on the way
		 * down; the document scrolling sends its own on to the window, where it is heard as well. Following twice lands
		 * where following once does, so the page scrolling heard on both costs nothing.
		 *
		 * Sections moving without a scroll, as the page settles its styles, fonts and images after mounting or grows
		 * under the reader, move them across the top edge all the same, so the outline follows their sizes too.
		 *
		 * The reader scrolling on their own, with the wheel, by touch, with the pointer or from the keyboard, as opposed
		 * to the scroll a followed link sets off, releases the section chosen.
		 *
		 * A link to the fragment the location already names changes nothing the window could hear, while the browser
		 * still scrolls to its section. Links are therefore heard as they are clicked, before anything on the page can
		 * hide the click, but settled only once every handler has had its say: a click a handler cancels is left to it.
		 */

		const stops = [

			listen(document, "scroll", scroll, { passive: true, capture: true }),
			listen(window, "scroll", scroll, { passive: true }),
			listen(window, "resize", scroll, { passive: true }),

			observe(latest.sections, scroll),

			listen(window, "hashchange", select),
			listen(document, "click", follow, { capture: true }),

			...["wheel", "touchmove", "pointerdown", "keydown"].map(gesture =>
				listen(window, gesture, release, { passive: true, capture: true })
			)

		];

		return () => stops.forEach(stop => stop());

	}, [key]); // the outline the subscription starts from is the one created for these sections


	return $entries.length === 0 ? null : createElement("clay-toc", { wrap },
		<nav aria-label={name}>{list($entries, outline.current, compact ? group : undefined)}</nav>
	);

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Measures where the sections stand in the part of their scrolling box left in view, and whether the box has been
 * scrolled to its end, leaving the sections starting low in its last screenful no way to reach the top third.
 *
 * The box is the nearest scrolling ancestor of the first section on the page, or the document where none scrolls; the
 * part left in view stops short of its scroll padding, which is where whatever stands over the box is accounted for.
 */
function metrics(sections: readonly string[]): TOCMetrics {

	const elements = sections.flatMap(id => opt(document.getElementById(id) ?? undefined, element => [{
		id,
		element
	}], []));
	const box = opt(elements[0]?.element, scroller);

	const root = document.documentElement;
	const style = getComputedStyle(box ?? root);

	const paddingTop = parseFloat(style.scrollPaddingTop) || 0; // ;(NaN) `auto` pads nothing
	const paddingBottom = parseFloat(style.scrollPaddingBottom) || 0;

	const { offset, client, scrolled, total } = box
		? {
			offset: box.getBoundingClientRect().top,
			client: box.clientHeight,
			scrolled: box.scrollTop,
			total: box.scrollHeight
		}
		: { offset: 0, client: window.innerHeight, scrolled: window.scrollY, total: root.scrollHeight };

	const origin = offset+paddingTop;
	const height = client-paddingTop-paddingBottom;

	return {

		tops: Object.fromEntries(elements.map(({ id, element }) => [id, element.getBoundingClientRect().top-origin])),

		height,

		// a box with nothing to scroll is at its start as much as at its end, and is read from its top

		end: scrolled > 0 && scrolled+client >= total-1

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
function listen(
	target: EventTarget, type: string, listener: (event: Event) => void, options?: AddEventListenerOptions
): () => void {

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
 * Brings the section chosen into view, leaving the page where it stands if no section is chosen.
 */
function reveal({ current, pinned }: Outline): void {
	opt(pinned ? current : undefined, id => document.getElementById(id)?.scrollIntoView());
}

/**
 * An entry of a table of contents with its nested entries settled as an array, whichever form they were given in.
 */
type Entry = Omit<TOCEntry, "entries"> & {

	readonly entries: readonly Entry[]

}

/**
 * Settles entries given either as an array of entries or keyed by their labels into an array of entries, at any depth.
 */
function normalise(entries: readonly TOCEntry[] | TOCEntries): readonly Entry[] {
	return isArray<TOCEntry>(entries)
		? entries.map(({ entries = [], ...entry }) => ({ ...entry, entries: normalise(entries) }))
		: Object.entries(entries).map(([label, value]) => isString(value)
			? { label, href: value, entries: [] }
			: { label, entries: normalise(value) }
		);
}

/**
 * Collects the ids of the sections an outline links to by fragment, in page order.
 */
function targets(entries: readonly Entry[]): readonly string[] {
	return entries.flatMap(({ href, entries }) => [fragment(href), ...targets(entries)]).filter(id => id !== undefined);
}

/**
 * Identifies the element a click follows a link to on this page, as a plain click with the main button does, wherever
 * the link stands, shadow trees included. A click with a modifier, or on a link opening a new browsing context or a
 * download, is left to the browser, which opens the link elsewhere and leaves this page where it stands.
 *
 * @returns The id the clicked link names by fragment, or `undefined` for a click following no link on this page
 */
function followed(event: Event): Optional<string> {

	const link = event.composedPath().find(node => node instanceof HTMLAnchorElement && node.hasAttribute("href"));

	return event instanceof MouseEvent && event.button === 0
	&& !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
	&& link instanceof HTMLAnchorElement && /^(_self)?$/i.test(link.target) && !link.hasAttribute("download")
	&& link.pathname === location.pathname && link.search === location.search
		? fragment(link.hash)
		: undefined;

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
 * reader is in is marked as the current location.
 *
 * Given an accordion name, each entry with nested entries and no link of its own folds behind its label instead. The
 * folds share that name, so only one is open at a time, and a fold opens while it holds the section the reader is in.
 */
function list(entries: readonly Entry[], current: Optional<string>, accordion?: string): ComponentChildren {
	return <ul>{entries.map(({ label, href, target, entries }, index) => <li key={href ?? index}>

		{accordion !== undefined && href === undefined && entries.length > 0

			? <details name={accordion} open={current !== undefined && holds(entries, current)}>
				<summary>{wording(label)}</summary>
				{list(entries, current)}
			</details>

			: <>

				{href === undefined
					? wording(label)
					:
					<a href={href} target={target} aria-current={current !== undefined && fragment(href) === current ? "location" : undefined}
					>{wording(label)}</a>
				}

				{entries.length > 0 && list(entries, current)}

			</>
		}

	</li>)}</ul>;
}

/**
 * Renders the wording of a label as the line the outline clips, offering a plain string as a tooltip. The tooltip sits
 * on the line rather than on the link around it, where it would be announced again as a description of the link.
 */
function wording(label: ComponentChildren): ComponentChildren {
	return <span title={isString(label) ? label : undefined}>{label}</span>;
}

/**
 * Checks whether entries link to a section, at any depth.
 */
function holds(entries: readonly Entry[], id: string): boolean {
	return entries.some(entry => fragment(entry.href) === id || holds(entry.entries, id));
}

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
 * Screen frame.
 *
 * Offers the frame a whole app screen is laid out in: a tray of standing controls beside the content of the moment,
 * each with a header and a footer of its own, so an app states what goes in each slot and leaves arranging and
 * scrolling them, and keeping the bars of the two columns level, to the frame itself.
 *
 * @module shell
 */

import { useFetching } from "@metreeca/clay/fetch";
import { opt } from "@metreeca/core";
import { type ComponentChildren, createElement } from "preact";
import { useEffect, useId } from "preact/hooks";
import { Icon } from "../glyphs/icon.js";
import "./shell.css";


/**
 * Creates a shell.
 *
 * Lays a screen out as two columns filling the window, the tray beside the content, each a header over a body over a
 * footer. Each column scrolls on its own, the whole height of the window: its header and its footer stay in view at
 * its top and bottom while the body passes beneath them, so the scrollbar of either column runs from the top of the
 * window to its bottom. A screen with no use for the tray is laid out on the content column alone.
 *
 * The headers of the two columns stand at the same height, whichever holds more, and so do the footers, so what stands
 * in one header stands level with what stands in the other however much either was given; neither states a height of
 * its own. A header or a footer given nothing to show takes no room, unless its opposite number stands, in which case
 * it stands as an empty bar of the same height, so the bodies of the two columns start and end level. Every other slot
 * is optional as well, and one left out takes no room in the column it belongs to.
 *
 * The shell fills the window and scrolls within its columns rather than with the document, so a host page holds the
 * document still, as an app does; a target a link lands on in either column comes to rest clear of its header.
 *
 * Waiting is stated by the shell itself: while the {@link @metreeca/clay!fetch.Fetch shared client} has exchanges
 * in flight, the frame fades, marks itself busy for assistive technology, and shows a turning mark at the end of the
 * content header, in place of whatever navigation sits there, and `done` is taken off show along with it, so no way
 * out is offered while the exchange it would abandon is running. Nothing else moves while it stands: a screen with no
 * content header is not given one for the duration, and a header that stands keeps the height it had. No call site
 * takes part, so a screen states waiting by performing its exchanges through that client and nothing else. Nothing is
 * taken out of reach meanwhile: the content is on its way out rather than unavailable, and a gesture that must not be
 * repeated while an exchange runs is held back by the control offering it.
 *
 * The content is named by the heading it is already showing, whether that is `head` or the `done` standing in for it,
 * so a reader arriving at it hears which screen they are on. The tray carries no name of its own: what a reader wants
 * named there is the sections or the filters it holds, which say what they are far better than a word for the whole
 * region would, so a screen names those as it puts them in, as a table of contents does with its `name`.
 *
 * `lock` takes the tray out of reach for every gesture at once, pointer and keyboard alike, so a reader is never
 * left tabbing into something the screen is showing as unavailable; whoever sets it owes the reader somewhere to
 * land if the focus was in the tray at the time. `main` goes further and leaves the tray out of the frame altogether,
 * for a screen a reader is meant to see through rather than move around in.
 *
 * The content is capped at a comfortable reading measure and centred in whatever room the column leaves, while the
 * column itself, and its scrollbar, reach the edge of the window, so widening the window leaves the lines as long as
 * they were; `wide` takes the content widescreen, lifting the cap for content a window never has too much room for.
 *
 * @param options The widget configuration
 *
 * @returns The shell
 */
export function Shell({

	wide = false,
	lock = false,
	main = false,

	logo,
	meta,
	tray,
	info,

	head,
	menu,
	done,
	back,
	copy,
	foot,

	children

}: {

	/**
	 * Whether the content goes widescreen, taking the whole width of its column rather than the reading measure it is
	 * otherwise capped at: set it where the content is a table, a chart or a map, and leave it where the content is
	 * prose, which a long line only makes harder to follow. Capped at the reading measure if omitted.
	 */
	wide?: boolean

	/**
	 * Whether the tray is out of reach, as it is while the content has the reader's full attention: what it holds
	 * fades away while the surface it stands on keeps its place, it drops out of the tab order and the accessibility
	 * tree, and it answers no gesture until it is let back in; reachable if omitted.
	 */
	lock?: boolean

	/**
	 * Whether the content stands on its own, the tray being left out of the frame rather than merely put out of reach
	 * as `lock` leaves it: the column closes up, the content takes the room it held, and nothing handed to the tray
	 * slots is shown or left in the accessibility tree. Set it where a screen is meant to be seen through rather than
	 * moved around in, such as a sign-in or a splash; the tray stands if omitted.
	 */
	main?: boolean


	/**
	 * The mark the app is recognised by, standing at the start of the tray header, in view however the tray scrolls.
	 */
	logo?: ComponentChildren

	/**
	 * What stands opposite the mark at the end of the tray header, in view however the tray scrolls, such as a release
	 * badge or a control acting on the tray as a whole, such as one collapsing it.
	 */
	meta?: ComponentChildren

	/**
	 * The standing controls the tray holds, such as the sections of the app and the filters in force. The tray
	 * carries no name of its own, so a group a reader would want to reach directly, a navigation block above all,
	 * names itself as it is put in.
	 */
	tray?: ComponentChildren

	/**
	 * What stands in the tray footer, in view however the tray scrolls, such as the reader signed in and the way out.
	 */
	info?: ComponentChildren


	/**
	 * What the content of the moment is called. It stands at the start of the content header, in view however the
	 * content scrolls, unless `done` stands there instead, and names the content landmark either way, so a reader
	 * arriving at it hears at once which screen they are on and what the screen is for.
	 */
	head?: ComponentChildren

	/**
	 * The control opening whatever the screen holds back, standing at the end of the content header where `back` is
	 * left out. It gives way to the turning mark while an exchange is in flight, and comes back once it settles.
	 */
	menu?: ComponentChildren

	/**
	 * The way out of the content of the moment, standing at the start of the content header in place of `head` and
	 * naming the content landmark while it does: a screen offering it is one the reader finishes rather than one
	 * they simply arrived at. It is taken off show while an exchange is in flight, and comes back once it settles.
	 */
	done?: ComponentChildren

	/**
	 * The control returning to the step before, standing at the end of the content header and taking the place `menu`
	 * would have had. It gives way to the turning mark while an exchange is in flight, and comes back once it settles.
	 */
	back?: ComponentChildren

	/**
	 * What closes the content itself, such as a copyright notice, scrolling with it rather than standing in a footer:
	 * where the content is short it rests at the bottom of the body, just above the content footer if one stands.
	 */
	copy?: ComponentChildren

	/**
	 * What stands in the content footer, in view however the content scrolls, such as the terms.
	 */
	foot?: ComponentChildren


	/**
	 * The content of the moment, filling the body of the content column.
	 */
	children?: ComponentChildren

}) {

	const id = useId();
	const frame = `${id}-frame`;

	const fetching = useFetching();

	const lead = done ?? head;
	const tail = back ?? menu;

	// the landmark is named by the heading on show, so the reference stands or falls with its target and never dangles

	const title = lead ? `${id}-title` : undefined;

	// a bar stands in both columns as soon as either has something for it, so the bodies start and end level

	const heads = Boolean(lead || tail || (!main && (logo || meta)));
	const feet = Boolean(foot || (!main && info));

	/*
	 * The bars of the two columns stand in two scrolling boxes, which no layout lines up with each other, so each pair
	 * is kept level by measure: the natural height of the taller bar is written on the frame, which both bars and both
	 * bodies read, and measured again whenever what a bar holds changes size. The observer is set up again after every
	 * render, which is when a bar may have been given something new to hold and measure.
	 */

	useEffect(() => opt(document.getElementById(frame) ?? undefined, element => {

		const level = () => {
			element.style.setProperty("--clay-shell-head-size", `${natural(element, "header")}px`);
			element.style.setProperty("--clay-shell-foot-size", `${natural(element, "footer")}px`);
		};

		const observer = new ResizeObserver(level);

		element.querySelectorAll(":scope > * > :is(header, footer) > :not(.busy)").forEach(child => observer.observe(child));

		level();

		return () => observer.disconnect();

	}));

	/*
	 * Waiting and reach are stated on the element rather than in a class list: a stylesheet has no way to tell a busy
	 * frame from an idle one, and `aria-busy` says it to assistive technology in the same breath, leaving the
	 * stylesheet to read the attribute the markup already owes.
	 */

	/*
	 * The mark is a bare glyph rather than a control: it offers nothing to press, so it carries no role, no name and
	 * none of the air a button draws around its glyph, and it hangs over the end of the content header, in place of the
	 * navigation taken off show meanwhile, without adding to the height of the bar. With no headers at all, waiting
	 * brings none back, and the mark hangs at the top of the content body instead. The whole of it is made inert:
	 * waiting is already stated by `aria-busy` on the frame, so a reader meets nothing here and nothing answers.
	 */

	const busy = fetching && <span class="busy" inert><Icon.RefreshCw/></span>;

	return createElement("clay-shell", {

		"aria-busy": fetching,

		id: frame,

		wide,
		locked: lock,
		main

	}, <>

		{/* locking takes the tray out of reach for every gesture at once, rather than for the pointer alone */}

		{!main && <aside inert={lock}>

			{heads && <header>
				{logo && <span>{logo}</span>}
				{meta && <span>{meta}</span>}
			</header>}

			<section>{tray}</section>

			{feet && <footer>{info}</footer>}

		</aside>}

		<main aria-labelledby={title}>

			{heads && <header>
				{lead && <span id={title} inert={fetching && lead === done}>{lead}</span>}
				{tail && <span inert={fetching}>{tail}</span>}
				{busy}
			</header>}

			{!heads && busy}

			<section>
				<div>{children}</div>
				{copy && <footer>{copy}</footer>}
			</section>

			{feet && <footer>{foot}</footer>}

		</main>

	</>);

}


/**
 * Measures the natural height of the taller of the two bars of a kind, as what each holds asks for it, leaving out the
 * height the bars were last levelled to, so a bar emptied of a taller control lets both bars shrink again.
 *
 * @param frame The frame holding the bars
 * @param part The kind of bar to measure
 *
 * @returns The height, in pixels, the taller bar would take on its own, or zero if no bar of the kind holds anything
 */
function natural(frame: Element, part: "header" | "footer"): number {

	return Math.max(0, ...Array.from(frame.querySelectorAll(`:scope > * > ${part}`), bar => {

		const style = getComputedStyle(bar);
		const content = Array.from(bar.querySelectorAll(":scope > :not(.busy)"), child => child.getBoundingClientRect().height);

		// the bars size their border box, so the rule closing a bar off counts towards its height as its padding does

		const edges = [style.paddingTop, style.paddingBottom, style.borderTopWidth, style.borderBottomWidth]
			.reduce((sum, edge) => sum + (parseFloat(edge) || 0), 0);

		return content.length === 0 ? 0 : Math.max(...content) + edges;

	}));

}

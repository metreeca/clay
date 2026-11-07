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
 * Offers the frame a whole screen is laid out in: a bar across the top carrying the mark of the app, a tray of
 * standing controls beside the content of the moment, and a foot closing the page, so an app states what goes in each
 * slot and leaves arranging them, at every width of the window, to the frame itself.
 *
 * @module
 */

import { useFetching } from "@metreeca/clay/fetch";
import { type ComponentChildren, createElement } from "preact";
import { useId } from "preact/hooks";
import { Icon } from "./icon.js";
import "./shell.css";


/**
 * Creates a shell.
 *
 * Lays a screen out as a page scrolling as a whole, held to one measure centred in the window: a bar across the top,
 * staying in view however far the page scrolls, with the mark of the app at its start and `meta` at its end; under it,
 * the tray beside the content; and the foot closing the page. From the large viewport up the tray stands as a rail
 * beside the content, staying in view under the bar as the page scrolls; below it, the tray stands over the content as
 * a band of its own, scrolling away with the page. A screen with no use for the tray is laid out on the content alone.
 * Every slot is optional and one left out takes no room, so a screen with no tray footer or no foot closes up rather
 * than holding a gap where the missing part would have stood had the screen supplied it.
 *
 * The shell scrolls with the document rather than within a box of its own, so a host page leaves the document free to
 * scroll: a page clipping its root or body overflow leaves whatever runs past the window out of reach.
 *
 * The bar, the tray, the content and the foot are landmarks a reader moves between directly, the bar standing as the
 * banner of the screen and the foot as its content information, wherever the page is scrolled.
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
 * The frame is capped at a comfortable measure and centred in whatever room is left, the bar and the foot spanning the
 * window while what they hold keeps to the edges of the frame, so widening the window leaves the lines as long as
 * they were; `wide` takes the frame widescreen, lifting the cap for content a window never has too much room for.
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
	 * Whether the frame goes widescreen, taking the whole width of the window rather than the measure it is otherwise
	 * capped at: set it where the content is a table, a chart or a map, which a window has no more room for than it
	 * has, and leave it where the content is prose, which a long line only makes harder to follow. Capped if omitted.
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
	 * The mark the app is recognised by, standing at the start of the bar, in view however far the page scrolls.
	 */
	logo?: ComponentChildren

	/**
	 * What stands opposite the mark at the end of the bar, in view however far the page scrolls, such as the sections
	 * of the app, the settings of the page, a control taking the frame widescreen or the release on show.
	 */
	meta?: ComponentChildren

	/**
	 * The standing controls the tray holds, such as the sections of the app and the filters in force. The tray
	 * carries no name of its own, so a group a reader would want to reach directly, a navigation block above all,
	 * names itself as it is put in.
	 */
	tray?: ComponentChildren

	/**
	 * What stands under the standing controls of the tray, such as the reader signed in and the way out.
	 */
	info?: ComponentChildren


	/**
	 * What the content of the moment is called. It stands at the top of the content, unless `done` stands there
	 * instead, and names the content landmark either way, so a reader arriving at it hears which screen they are on.
	 */
	head?: ComponentChildren

	/**
	 * The control opening whatever the screen holds back, standing at the end of the content header where `back` is
	 * left out. It gives way to the turning mark while an exchange is in flight, and comes back once it settles.
	 */
	menu?: ComponentChildren

	/**
	 * The way out of the content of the moment, standing at the top of the content in place of `head` and
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
	 * What closes the content itself, such as a copyright notice, following on after it: where the content is short
	 * it rests at the bottom of the window, just above `foot` if one stands, rather than right under the content.
	 */
	copy?: ComponentChildren

	/**
	 * What closes the page across the whole frame, after the tray and the content, such as the terms.
	 */
	foot?: ComponentChildren


	/**
	 * The content of the moment, filling the body of the content column.
	 */
	children?: ComponentChildren

}) {

	const id = useId();

	const fetching = useFetching();

	const lead = done ?? head;
	const tail = back ?? menu;

	// the landmark is named by the heading on show, so the reference stands or falls with its target and never dangles

	const title = lead ? `${id}-title` : undefined;

	/*
	 * Waiting and reach are stated on the element rather than in a class list: a stylesheet has no way to tell a busy
	 * frame from an idle one, and `aria-busy` says it to assistive technology in the same breath, leaving the
	 * stylesheet to read the attribute the markup already owes.
	 */

	return createElement("clay-shell", {

		"aria-busy": fetching,

		wide,
		locked: lock,
		main

	}, <>

		{(logo || meta) && <header>
			{logo && <span>{logo}</span>}
			{meta && <span>{meta}</span>}
		</header>}

		{/* locking takes the tray out of reach for every gesture at once, rather than for the pointer alone */}

		{!main && <aside inert={lock}>

			<section>{tray}</section>

			{info && <footer>{info}</footer>}

		</aside>}

		<main aria-labelledby={title}>

			<header>
				{lead && <span id={title} inert={fetching && lead === done}>{lead}</span>}
				{tail && <span inert={fetching}>{tail}</span>}
			</header>

			{/*
			 * The mark stands in the row the header is laid in without standing in the header itself: a bar the
			 * screen gave nothing to show is left out, and waiting has no business bringing one back. It takes the
			 * navigation's place for as long as an exchange runs, the end of the bar being taken off show meanwhile,
			 * and the bar keeps the height its own content asks for either way.
			 *
			 * It is a bare glyph rather than a control: it offers nothing to press, so it carries no role, no name
			 * and none of the air a button draws around its glyph, and comes to rest centred over the control closing
			 * the navigation, whatever that control is drawn as. The whole of it is made inert: waiting is already
			 * stated by `aria-busy` on the frame, so a reader meets nothing here and nothing answers a gesture.
			 */}

			{fetching && <span class="busy" inert>
				<Icon.RefreshCw/>
			</span>}

			<section>
				<div>{children}</div>
				{copy && <footer>{copy}</footer>}
			</section>

		</main>

		{foot && <footer>{foot}</footer>}

	</>);

}

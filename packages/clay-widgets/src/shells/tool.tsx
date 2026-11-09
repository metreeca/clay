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
 * Tool shell.
 *
 * Lays out the screens of an app or a tool in the familiar app shell arrangement: a side column of standing controls
 * beside a main column holding the content of the moment. A screen fills the slots, and the shell arranges them.
 *
 * @module tool
 */

import { useFetching } from "@metreeca/clay/fetch";
import { useModel } from "@metreeca/clay/model";
import { createState } from "@metreeca/core/state";
import { skin } from "@metreeca/skin";
import { type ComponentChildren, createElement, type TargetedEvent, type TargetedMouseEvent } from "preact";
import { useEffect, useId } from "preact/hooks";
import { Icon } from "../glyphs/icon.js";
import "./tool.css";


/**
 * Creates a tool shell.
 *
 * Lays a screen out as two columns, the side column beside the main one, each with a head, a body and a foot. The
 * heads of the two columns share one row, so they always match in height, and the feet do the same. The body of each
 * column scrolls on its own, while its head and foot stay in view, so what they hold is always within reach. Heads
 * and feet keep the height of a single line: text too wide for them is clipped and ends with an ellipsis.
 *
 * The shell fills the height its host gives it and sets none of its own. Without a definite height, the bodies grow
 * with their content instead of scrolling, and the heads and feet scroll out of view with the page.
 *
 * The main column grows up to a width limit, past which both columns stand centred in the frame. The limit, the width
 * of the side column, the gutters, and the font sizes of heads and feet are tuned through custom properties named
 * after what they tune, such as `--clay-tool-side-width` or `--clay-tool-head-gutter`. Each retunes the shell it is
 * set on, or every shell inside the element it is set on, leaving the other properties of the shell to their defaults.
 *
 * Waiting is stated by the shell itself: while the {@link @metreeca/clay!fetch.Fetch shared client} has exchanges in
 * flight, the frame is veiled, shows a turning mark at the end of the main head in place of the menu, and marks itself
 * busy for assistive technology. Both columns stay out of reach for pointer and keyboard alike until the exchanges
 * settle, so a screen states waiting by running its exchanges through that client, with no flag or call of its own.
 *
 * The main column is named after `head` and takes the focus as the {@link @metreeca/clay!router.Router router} lands a
 * screen, without adding a tab stop, so a reader hears which screen they are on rather than a control of the last one.
 *
 * On a viewport too narrow for two columns, the main column takes the whole frame and the side column becomes a drawer
 * opened from a menu button leading the main head. The drawer covers the main column, across the whole width of a
 * phone and as wide as the side column on a tablet, while the main column stays in place underneath and keeps its
 * state. A close button ends the head of the drawer, and focus moves to it as the drawer opens. Escape, a click
 * outside the drawer, or a link followed inside it closes the drawer and returns focus to the menu button.
 *
 * On such a viewport the heading of the screen also moves from the main head to the top of the main body, and scrolls
 * away with the content it names. The main head keeps only the menu button and the menu, leaving the room to content.
 *
 * @param options The widget configuration
 *
 * @returns The tool shell
 */
export function Tool({

	wide = false,
	lock = false,
	main = false,

	meta,
	tray,
	more,

	head,
	menu,
	copy,
	foot,

	children

}: {

	/**
	 * Whether the main column takes the whole width of the frame rather than stopping at its width limit. Set it for
	 * content that never has too much room, such as a table, a chart or a map, and leave it off for prose, which long
	 * lines make harder to read. Capped at the width limit if omitted.
	 */
	wide?: boolean

	/**
	 * Whether the side column is out of reach, as while the main column needs the full attention of the reader. What
	 * it holds fades while the column keeps its place, and drops out of the tab order and the accessibility tree until
	 * the lock is lifted. On a narrow viewport the lock closes the drawer and keeps it shut. Reachable if omitted.
	 */
	lock?: boolean

	/**
	 * Whether the main column stands alone, with the side column left out of the frame rather than merely locked. The
	 * main column takes the room the side column held, and nothing passed to `meta`, `tray` or `more` is shown. Set it
	 * for screens meant to be seen through rather than moved around in, such as a sign-in or a splash. The side column
	 * stands if omitted.
	 */
	main?: boolean


	/**
	 * The identity of the app, such as its mark and release, in the head of the side column.
	 */
	meta?: ComponentChildren

	/**
	 * The standing controls of the app, such as its sections and the filters in force, in the body of the side column.
	 */
	tray?: ComponentChildren

	/**
	 * The secondary controls of the app, such as settings, help and signing out, in the foot of the side column.
	 */
	more?: ComponentChildren


	/**
	 * The heading of the screen, such as its title, in the head of the main column. On a viewport too narrow for two
	 * columns it opens the body of the main column instead, scrolling away with the content rather than standing over it.
	 */
	head?: ComponentChildren

	/**
	 * The menu of the screen, such as its actions, at the end of the head of the main column. While the shell is
	 * waiting, a turning mark stands in its place, and the head keeps its height and layout.
	 */
	menu?: ComponentChildren

	/**
	 * The closing notice of the content, such as a copyright, in the body of the main column. It scrolls with the
	 * content rather than standing in a foot, and rests at the bottom of a body the content is too short to fill.
	 */
	copy?: ComponentChildren

	/**
	 * The standing notes of the screen, such as a status line or the terms, in the foot of the main column.
	 */
	foot?: ComponentChildren


	/**
	 * The content of the moment, scrolling in the body of the main column.
	 */
	children?: ComponentChildren

}) {

	const id = useId();
	const side = `${id}-side`;

	// the landmark is named by the head on show, so the reference stands or falls with its target and never dangles

	const title = head ? `${id}-title` : undefined;

	// a foot stands in both columns as soon as either has something for it, so the bodies end level

	const feet = Boolean(foot || (!main && more));

	const fetching = useFetching();

	const { open, toggle } = useModel(() => createState<Drawer>({

		open: false,

		toggle(open: boolean) {
			return { open };
		}

	}));

	const { split, sync } = useModel(() => createState<Viewport>({

		split: medium(),

		sync() {
			return { split: medium() };
		}

	}));

	/*
	 * The switch lives in the cascade, which notifies no change, so the shell reads it again as the window is resized.
	 * A transition starts from the state the render read, so the observer is renewed with every crossing it reports.
	 */

	useEffect(() => {

		const observer = new ResizeObserver(() => sync());

		observer.observe(document.documentElement);

		return () => observer.disconnect();

	}, [sync]);

	return createElement("clay-tool", {

		"aria-busy": fetching,

		wide,
		locked: lock,
		main

	}, <>

		{/*
		 * The side column is a popover, shown as a column wherever two fit and as a drawer elsewhere: the platform then
		 * dismisses it on Escape and on a click outside, exposes the expanded state of the button opening it, and
		 * returns focus to that button as it closes. Locking takes it out of reach for every gesture at once. While the
		 * drawer is open the main column it covers is out of reach as well, so focus never lands out of sight under it.
		 * Each body takes the focus, so a keyboard scrolls it in every browser, holding focusable content or not.
		 *
		 * The drawer is named after the button opening it, so a reader hears what has opened. A locked side column is
		 * taken out of light dismiss: the switch closes a drawer left open, and the disabled menu button keeps it shut.
		 */}

		{!main && <aside
			id={side}
			aria-label="Menu"
			popover={lock ? "manual" : "auto"}
			inert={lock || fetching}
			onClick={follow}
			onToggle={event => toggle(opened(event))}
		>

			<header>
				{meta}
				<button type="button" popovertarget={side} popovertargetaction="hide" autofocus aria-label="Close menu">
					<Icon.Close/>
				</button>
			</header>

			<div tabIndex={0}>{tray}</div>
			{feet && <footer>{more}</footer>}

		</aside>}

		{/*
		 * The main column takes the focus from code alone, so a navigation can land the focus on it and a reader hears
		 * its name, taken from the head, without a tab stop being added. The head is held in a box of its own only to
		 * be referenced as that name, standing aside from the layout so the head lays out what it holds directly. Where
		 * two columns do not fit, the head opens the body instead, as the copy closes it.
		 */}

		<main aria-labelledby={title} tabIndex={-1} inert={open || fetching}>

			<header>
				{!main && <button type="button" popovertarget={side} disabled={lock} aria-label="Open menu">
					<Icon.Menu/>
				</button>}
				{split && head && <div id={title}>{head}</div>}

				{/*
				 * The turning mark stands over the menu, which keeps its place hidden beneath, so the head holds its
				 * height. It is a bare glyph rather than a control: it offers nothing to press, and waiting is told by
				 * `aria-busy` on the frame, so the mark is inert and a reader meets nothing where it stands.
				 */}

				{menu && <div class="menu">{menu}</div>}
				{fetching && <span class="busy" inert><Icon.Reload/></span>}

			</header>

			<div tabIndex={0}>
				{!split && head && <header id={title}>{head}</header>}
				<div>{children}</div>
				{copy && <footer>{copy}</footer>}
			</div>
			{feet && <footer>{foot}</footer>}

		</main>

	</>);

}


/**
 * Whether the drawer is open, as the side column shows it.
 */
interface Drawer {

	/**
	 * Whether the side column is on show as a drawer over the main column.
	 */
	readonly open: boolean;

	/**
	 * Records the drawer as opened or closed.
	 *
	 * @param open Whether the drawer is now open
	 *
	 * @returns The drawer as it now stands
	 */
	toggle(open: boolean): Drawer;

}

/**
 * Whether the viewport fits two columns, as the design system states it.
 */
interface Viewport {

	/**
	 * Whether the side column stands beside the main one rather than as a drawer over it.
	 */
	readonly split: boolean;

	/**
	 * Reads the viewport again, once the window is resized.
	 *
	 * @returns The viewport as it now stands
	 */
	sync(): Viewport;

}


/**
 * Tells whether the viewport fits two columns, reading the switch the design system turns on from the medium width up,
 * so the shell follows the threshold wherever the design system sets it and whatever an app forces it to.
 *
 * @returns `true` if the medium viewport switch is on
 */
function medium(): boolean {
	return getComputedStyle(document.documentElement).getPropertyValue(skin.viewportMedium).trim() === "on";
}


/**
 * Tells whether a toggle of the side column left it open.
 *
 * @param event The toggle the side column went through
 *
 * @returns `true` if the side column is now open as a drawer
 */
function opened(event: TargetedEvent<HTMLElement>): boolean {
	return "newState" in event && event.newState === "open";
}


/**
 * Closes the drawer once a link inside it is followed, so the reader lands on the destination rather than on the
 * drawer still covering it; a click landing anywhere else in the drawer leaves it open.
 *
 * @param event The click inside the side column
 */
function follow(event: TargetedMouseEvent<HTMLElement>): void {
	if ( event.target instanceof Element && event.target.closest("a[href]") ) {
		event.currentTarget.togglePopover(false);
	}
}

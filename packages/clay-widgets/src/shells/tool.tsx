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

import { useModel } from "@metreeca/clay/model";
import { createState } from "@metreeca/core/state";
import { type ComponentChildren, createElement, type TargetedEvent, type TargetedMouseEvent } from "preact";
import { useId } from "preact/hooks";
import { Icon } from "../glyphs/icon.js";
import "./tool.css";


/**
 * Creates a tool shell.
 *
 * Lays a screen out as two columns, the side column beside the main one, each with a head, a body and a foot. The
 * heads of the two columns share one row, so they always match in height, and the feet do the same. The body of each
 * column scrolls on its own, while its head and foot stay in view, so what they hold is always within reach.
 *
 * The shell fills the height its host gives it and sets none of its own. Without a definite height, the bodies grow
 * with their content instead of scrolling, and the heads and feet scroll out of view with the page.
 *
 * The main column grows up to a width limit, past which both columns stand centred in the frame. The limit, the width
 * of the side column, the gutters, and the font sizes of heads and feet are tuned through custom properties named
 * after what they tune, such as `--clay-tool-side-width` or `--clay-tool-head-gutter`. Each retunes the shell it is
 * set on, or every shell inside the element it is set on, leaving the other properties of the shell to their defaults.
 *
 * On a viewport too narrow for two columns, the main column takes the whole frame and the side column becomes a drawer
 * opened from a menu button leading the main head. The drawer covers the main column, across the whole width of a
 * phone and as wide as the side column on a tablet, while the main column stays in place underneath and keeps its
 * state. A close button ends the head of the drawer, and focus moves to it as the drawer opens. Escape, a click
 * outside the drawer, or a link followed inside it closes the drawer and returns focus to the menu button.
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
	 * the lock is lifted. Reachable if omitted.
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
	 * What stands in the head of the side column, such as the mark of the app and its release.
	 */
	meta?: ComponentChildren

	/**
	 * The standing controls of the side column, such as the sections of the app and the filters in force.
	 */
	tray?: ComponentChildren

	/**
	 * What stands in the foot of the side column, such as settings, help and signing out.
	 */
	more?: ComponentChildren


	/**
	 * What stands in the head of the main column, such as the title of the screen and its actions.
	 */
	head?: ComponentChildren

	/**
	 * What stands in the foot of the main column, such as a status line or the terms.
	 */
	foot?: ComponentChildren


	/**
	 * The content of the moment, scrolling in the body of the main column.
	 */
	children?: ComponentChildren

}) {

	const side = `${useId()}-side`;

	const { open, toggle } = useModel(() => createState<Drawer>({

		open: false,

		toggle(open: boolean) {
			return { open };
		}

	}));

	return createElement("clay-tool", {

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
			inert={lock}
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
			<footer>{more}</footer>

		</aside>}

		<main inert={open}>

			<header>
				{!main && <button type="button" popovertarget={side} disabled={lock} aria-label="Open menu">
					<Icon.Menu/>
				</button>}
				{head}
			</header>

			<div tabIndex={0}>{children}</div>
			<footer>{foot}</footer>

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

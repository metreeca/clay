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

import { type ComponentChildren, createElement } from "preact";
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
 * of the side column, the gutters, and the font sizes of heads and feet are tuned through the `--clay-tool-*` custom
 * properties, set on a single shell, or on any element containing shells to retune all of them at once.
 *
 * @param options The widget configuration
 *
 * @returns The tool shell
 */
export function Tool({

	meta,
	tray,
	more,

	head,
	foot,

	children

}: {

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

	return createElement("clay-tool", {}, <>

		<aside>
			<header>{meta}</header>
			<div>{tray}</div>
			<footer>{more}</footer>
		</aside>

		<main>
			<header>{head}</header>
			<div>{children}</div>
			<footer>{foot}</footer>
		</main>

	</>);

}

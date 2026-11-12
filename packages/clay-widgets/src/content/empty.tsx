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
 * Missing content placeholder.
 *
 * Offers the placeholder an area shows while it has no content of its own, whether still loading, left empty or
 * unable to fetch what it was to show, filling the space the content would take.
 *
 * @module empty
 */

import { type ComponentChildren, createElement } from "preact";
import "./empty.css";


/**
 * Creates an empty state.
 *
 * Fills the space it is handed and centres what it carries there, so a table, a list or a media frame with nothing to
 * show holds its place instead of collapsing. A glyph leading the content marks the area above the wording, drawn at
 * twice its size whatever the size of the area, unless the `--clay-empty-icon-size` property sets a size of its own.
 *
 * @param options The widget configuration
 *
 * @returns The empty state
 */
export function Empty({

	look, // deliberately left undefaulted, so an unstated look falls through to the one the area assigns

	children

}: {

	/**
	 * How loud the area appears: `subtle` stays flush with the surface around it, `normal` is outlined as room left
	 * for the missing content, and `strong` is outlined and recessed as well, standing apart from what surrounds it.
	 *
	 * An area stating nothing takes the look the {@link style!Style styled area} around it assigns as `emptyLook`,
	 * which is `normal` where nothing assigns it. Stating a look here answers to that alone, whatever the area says.
	 */
	look?: "subtle" | "normal" | "strong"


	/**
	 * The content centred in the area: a leading glyph marking it, and the wording saying why the content is missing.
	 */
	children?: ComponentChildren

}) {

	return createElement("clay-empty", { look }, children);

}

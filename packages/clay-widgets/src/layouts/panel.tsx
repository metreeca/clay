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
 * Raised surface.
 *
 * Lifts what it holds off the page on a padded, rounded surface of its own, so a screen sets a bar, a sidebar or a
 * tile apart from the page without a rule of its own, and each one follows the design system as it is themed.
 *
 * @module panel
 */

import { type ComponentChildren, createElement } from "preact";
import "./panel.css";


/**
 * Creates a raised panel.
 *
 * Sets what it holds on the raised surface of the design system, lifted by the raised shadow, rounded and padded on
 * the steps the design system sets for surfaces, and paints everything inside it as standing on that surface. The look
 * is the design system's alone: an area retuning it wraps the panel in a {@link style!Style styled area}.
 *
 * The panel stands as wide as whatever holds it and as tall as what it holds, unless a stack or a strip holding it
 * stretches it further, and stretches what it holds to fill it both ways: a stack or a strip inside a stretched panel
 * takes its full height, and places its items in it. As an item of a stack or a strip, the panel shrinks no further
 * than what it holds allows. The panel holds a single element, a layout or a block: several elements lie over one
 * another, and text is wrapped in an element of its own rather than handed to the panel loose.
 *
 * The panel carries no semantics: a role for assistive technology goes on an element inside it or around it.
 *
 * @param options The widget configuration
 *
 * @returns The raised panel
 */
export function Panel({

	children

}: {

	/**
	 * What the panel holds, set inside its padding.
	 */
	children?: ComponentChildren

}) {

	return createElement("clay-panel", {}, children);

}

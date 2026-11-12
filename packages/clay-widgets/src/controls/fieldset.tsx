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
 * Field group.
 *
 * Gathers related fields under a caption naming them as a whole, such as the parts of an address or the buttons of a
 * radio group, and turns them all off at once where they do not apply to the case at hand.
 *
 * @module fieldset
 */

import { type ComponentChildren, createElement } from "preact";
import { isContent } from "../index.js";
import "./fieldset.css";


/**
 * Creates a field group.
 *
 * Gathers its fields in a native field set, so assistive technology announces the caption on entering the group,
 * before the label of the field reached, and a `disabled` group turns off every field it holds without each having to
 * be told. The group frames its fields in a box with the caption set into its top edge, and leaves the fields
 * inside it where the children place them, so the screen keeps the layout of the group in its own hands.
 *
 * A group is named by its visible `label` or, where none is shown, by `name`; a radio group always takes one, its
 * buttons being otherwise named one by one with nothing saying what is being picked.
 *
 * @param options The widget configuration
 *
 * @returns The field group
 *
 * @see [HTML: The fieldset element][fieldset]
 *
 * [fieldset]: https://html.spec.whatwg.org/multipage/form-elements.html#the-fieldset-element
 */
export function Fieldset({

	name,

	disabled,

	label,

	children

}: {

	/**
	 * The accessible name of a group showing no `label`.
	 */
	name?: string

	/**
	 * Whether every field in the group takes no input, greyed and out of the tab order; live if omitted.
	 */
	disabled?: boolean

	/**
	 * The caption naming the group, set into the top edge of the frame around the fields; no caption if omitted.
	 */
	label?: ComponentChildren

	/**
	 * The fields of the group.
	 */
	children?: ComponentChildren

}) {

	return createElement("clay-fieldset", {}, <fieldset

		disabled={disabled}

		aria-label={name}

	>

		{isContent(label) && <legend>{label}</legend>}

		{children}

	</fieldset>);

}

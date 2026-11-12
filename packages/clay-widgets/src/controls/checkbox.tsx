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
 * Checkbox.
 *
 * Takes a yes or no answer submitted with the form around it, such as agreeing to terms or opting into a mailing,
 * or one pick among several boxes ticked independently of one another, each answering for itself.
 *
 * @module checkbox
 */

import { createElement } from "preact";
import "./checkbox.css";


/**
 * Creates a checkbox.
 *
 * Takes its answer on a native checkbox, so the tick by `Space` or by a press, the tab stop, and the checked state
 * assistive technology announces come from the platform. A box standing for a group of boxes ticked in part shows the
 * mixed state while `indeterminate`, which the next tick clears, leaving the box ticked or clear as the reader sets it.
 *
 * The answer is either held by the caller, which shows `checked` and is handed each tick through `onChange`, or left
 * to the box where `checked` is omitted, the box then keeping whatever the reader ticks.
 *
 * A setting taking effect as soon as it is flipped, rather than when the form around it is submitted, is better served
 * by a {@link switch!Switch Switch}, whose look tells the reader that the change applies at once.
 *
 * @param options The widget configuration
 *
 * @returns The checkbox
 *
 * @see {@link https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/ ARIA Authoring Practices: Checkbox Pattern}
 */
export function Checkbox({

	name,
	id,

	disabled,
	indeterminate,
	required,

	checked,

	onChange

}: {

	/**
	 * The accessible name, required where no {@link label!Label Label} names the box.
	 */
	name?: string

	/**
	 * The id a split {@link label!Label Label} names the box by; no id if omitted.
	 */
	id?: string

	/**
	 * Whether the box takes no tick, greyed and out of the tab order; live if omitted.
	 */
	disabled?: boolean

	/**
	 * Whether the box shows the mixed state, neither ticked nor clear, as a box standing for a group ticked in part
	 * does; ticked or clear as `checked` says if omitted, and cleared by the next tick the reader makes.
	 */
	indeterminate?: boolean

	/**
	 * Whether the box fails its constraints while clear, as one accepting terms does; optional if omitted.
	 */
	required?: boolean

	/**
	 * Whether the box is shown ticked, held by the caller; left to the box if omitted.
	 */
	checked?: boolean

	/**
	 * Receives the state of the box on every tick.
	 *
	 * @param checked Whether the box is now ticked
	 */
	onChange?: (checked: boolean) => void

}) {

	return createElement("clay-checkbox", {}, <input

		id={id}

		disabled={disabled}
		indeterminate={indeterminate}
		required={required}

		aria-label={name}
		type="checkbox"

		checked={checked}

		onChange={event => onChange?.(event.currentTarget.checked)}

	/>);

}

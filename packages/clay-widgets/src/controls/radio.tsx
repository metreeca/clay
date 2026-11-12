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
 * Radio button.
 *
 * Offers one option of a group from which a single one is picked, such as a delivery method, with every option in
 * view and laid out wherever the screen places it, in a row, a column or a grid of its own.
 *
 * @module radio
 */

import { createElement } from "preact";
import "./radio.css";


/**
 * Creates a radio button.
 *
 * Takes its pick on a native radio button, joined to the others carrying the same `group` within the same
 * {@link form!Form Form}, so the platform supplies the keys and the focus a group owes: `Tab` reaches the group as
 * one stop, landing on the picked option, and the arrow keys move the pick to either neighbour. Picking one option
 * clears the one picked before, and a picked option is never cleared by a press of its own.
 *
 * The buttons of a group take no place of their own: the screen lays them out, and names the group as a whole by a
 * {@link fieldset!Fieldset Fieldset} around them, whose caption says what is being picked.
 *
 * The pick is either held by the caller, which shows `checked` and is handed each pick through `onChange`, or left
 * to the group where `checked` is omitted, the group then keeping whatever the reader picks.
 *
 * @param options The widget configuration
 *
 * @returns The radio button
 *
 * @see {@link https://www.w3.org/WAI/ARIA/apg/patterns/radio/ ARIA Authoring Practices: Radio Group Pattern}
 */
export function Radio<V extends string>({

	name,
	id,
	group,

	disabled,
	required,

	value,
	checked,

	onChange

}: {

	/**
	 * The accessible name, required where no {@link label!Label Label} names the button.
	 */
	name?: string

	/**
	 * The id a split {@link label!Label Label} names the button by; no id if omitted.
	 */
	id?: string

	/**
	 * The name of the group the button belongs to, shared by every button of the group and by no other, so that a form
	 * holding two groups gives each a name of its own and a pick in one never clears the other.
	 */
	group: string

	/**
	 * Whether the button takes no pick, greyed and skipped by the arrow keys; live if omitted.
	 */
	disabled?: boolean

	/**
	 * Whether the group fails its constraints while no button in it is picked; stated on any button of the group, and
	 * optional if omitted on all of them, the platform checking the group as a whole rather than button by button.
	 */
	required?: boolean

	/**
	 * The value the button stands for, handed to `onChange` when it is picked.
	 */
	value: V

	/**
	 * Whether the button is shown picked, held by the caller; left to the group if omitted.
	 */
	checked?: boolean

	/**
	 * Receives the value of the button when the reader picks it, so the buttons of a group share one handler.
	 *
	 * @param value The value of the picked button
	 */
	onChange?: (value: V) => void

}) {

	return createElement("clay-radio", {}, <input

		id={id}
		name={group}

		disabled={disabled}
		required={required}

		aria-label={name}
		type="radio"

		value={value}
		checked={checked}

		onChange={() => onChange?.(value)}

	/>);

}

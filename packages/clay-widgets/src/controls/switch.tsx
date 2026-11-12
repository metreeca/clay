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
 * On/off switch.
 *
 * Turns a setting on or off with immediate effect, such as notifications or a preview, drawn as a thumb sliding along
 * a track so that it reads as a setting in force rather than as an answer waiting to be submitted.
 *
 * @module switch
 */

import { createElement } from "preact";
import "./switch.css";


/**
 * Creates a switch.
 *
 * Takes its state on a native checkbox announced as a switch, so the flip by `Space` or by a press, the tab stop, and
 * the on or off state assistive technology reads come from the platform. The thumb stands at the end of the track
 * and the track is filled while the switch is on, so the state reads by position as well as by colour.
 *
 * The state is either held by the caller, which shows `checked` and is handed each flip through `onChange`, or left
 * to the switch where `checked` is omitted, the switch then keeping whatever the reader flips it to.
 *
 * An answer taking effect only when the form is submitted takes a {@link checkbox!Checkbox Checkbox} instead.
 *
 * @param options The widget configuration
 *
 * @returns The switch
 *
 * @see {@link https://www.w3.org/WAI/ARIA/apg/patterns/switch/ ARIA Authoring Practices: Switch Pattern}
 */
export function Switch({

	name,
	id,

	disabled,

	checked,

	onChange

}: {

	/**
	 * The accessible name, required where no {@link label!Label Label} names the switch.
	 */
	name?: string

	/**
	 * The id a split {@link label!Label Label} names the switch by; no id if omitted.
	 */
	id?: string

	/**
	 * Whether the switch takes no flip, greyed and out of the tab order; live if omitted.
	 */
	disabled?: boolean

	/**
	 * Whether the switch is shown on, held by the caller; left to the switch if omitted.
	 */
	checked?: boolean

	/**
	 * Receives the state of the switch on every flip.
	 *
	 * @param checked Whether the switch is now on
	 */
	onChange?: (checked: boolean) => void

}) {

	return createElement("clay-switch", {}, <input

		id={id}

		disabled={disabled}

		aria-label={name}
		role="switch"
		type="checkbox"

		checked={checked}

		onChange={event => onChange?.(event.currentTarget.checked)}

	/>);

}

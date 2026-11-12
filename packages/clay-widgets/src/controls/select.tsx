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
 * Drop-down menu.
 *
 * Takes one value picked from a list of options too long to keep in view, showing the picked one alone until the
 * reader opens the list to pick another, so a long list costs the screen a single line.
 *
 * @module select
 */

import { createElement } from "preact";
import "./select.css";


/**
 * Creates a drop-down menu.
 *
 * Offers the options in the order given on a native select, so the list, the keys moving through it, the typing ahead
 * to an option and the picker suited to the device come from the platform itself.
 *
 * A menu given a `placeholder` opens on it while no option is picked, as a first entry that cannot be picked back; a
 * `required` menu still showing it fails its constraints, and keeps the {@link form!Form Form} around it from being
 * submitted until the reader picks one of the options, since the placeholder never counts as an answer.
 *
 * The value is either held by the caller, which shows `value` and is handed each pick through `onChange`, or left to
 * the menu where `value` is omitted, the menu then keeping whatever the reader picks.
 *
 * @param options The widget configuration
 *
 * @returns The menu
 *
 * @see [HTML: The select element][select]
 *
 * [select]: https://html.spec.whatwg.org/multipage/form-elements.html#the-select-element
 */
export function Select<V extends string>({

	name,
	id,

	disabled,
	required,

	options,

	placeholder,
	value,

	onChange

}: {

	/**
	 * The accessible name, required where no {@link label!Label Label} names the menu.
	 */
	name?: string

	/**
	 * The id a split {@link label!Label Label} names the menu by; no id if omitted.
	 */
	id?: string

	/**
	 * Whether the menu takes no pick, greyed and out of the tab order; live if omitted.
	 */
	disabled?: boolean

	/**
	 * Whether the menu fails its constraints while showing the `placeholder`; optional if omitted.
	 */
	required?: boolean

	/**
	 * The label of each option, keyed by its value, in display order.
	 */
	options: Readonly<Record<V, string>>

	/**
	 * The text shown while no option is picked, such as `Pick a country`; the first option shown picked if omitted.
	 */
	placeholder?: string

	/**
	 * The value of the option shown as picked, held by the caller; left to the menu if omitted.
	 */
	value?: V

	/**
	 * Receives the value of the option a reader picks.
	 *
	 * @param value The value of the picked option
	 */
	onChange?: (value: V) => void

}) {

	/*
	 * The placeholder is the empty first option the platform reads as a placeholder label option, which a required
	 * menu fails on; a menu holding no value of its own opens on it, the platform picking the first option otherwise.
	 */

	return createElement("clay-select", {}, <select

		id={id}

		disabled={disabled}
		required={required}

		aria-label={name}

		value={value ?? (placeholder === undefined ? undefined : "")}

		onChange={event => onChange?.(event.currentTarget.value as V)} // ;(cast) the menu offers no value beyond V

	>

		{placeholder !== undefined && <option value="" disabled>{placeholder}</option>}

		{(Object.keys(options) as V[]).map(option => // ;(cast) options is assumed to carry no keys beyond V
			<option key={option} value={option}>{options[option]}</option>
		)}

	</select>);

}

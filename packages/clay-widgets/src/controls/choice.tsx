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
 * Segmented choice.
 *
 * Offers a choice among a few options as one row of segments, every option in view and the chosen one marked, so a
 * setting such as the colour scheme is read and changed in a single glance and gesture.
 *
 * @module choice
 */

import { type ComponentChildren, createElement } from "preact";
import { useId } from "preact/hooks";
import "./choice.css";


// noinspection JSCommentMatchesSignature

/**
 * Creates a segmented choice.
 *
 * Lays the options out in the order given as a group of radio buttons, so the platform supplies the keys and the focus
 * a choice owes: `Tab` reaches the group as one stop, landing on the chosen option, and the arrow keys move the choice
 * to either neighbour, wrapping at both ends. The chosen option is marked as `look` sets out, and carries the checked
 * state assistive technology reads, so the choice reaches a reader who cannot see the mark.
 *
 * The choice is held by the caller: the widget shows `value` as chosen and hands each new choice to `onChange`, so a
 * caller keeping the choice somewhere of its own, such as the storage of the page, passes it back as `value`.
 *
 * @param options The widget configuration
 *
 * @returns The segmented choice
 *
 * @see {@link https://www.w3.org/WAI/ARIA/apg/patterns/radio/ ARIA Authoring Practices: Radio Group Pattern}
 */
export function Choice<V extends string>({

	name,

	look, // deliberately left undefaulted, so an unstated look falls through to the one the area assigns

	options,
	value,

	onChange

}: {

	/**
	 * The accessible name of the group, such as `Colour scheme`, saying what is being chosen.
	 */
	name: string

	/**
	 * How loud the choice appears: `subtle` drops the box so the options read as part of the text around them, the
	 * chosen one inked in the selection accent; `normal` boxes the options as a select is boxed, the chosen one sunk
	 * into the page; `strong` also sets the options in the strong weight and inks the chosen one in the accent.
	 *
	 * A choice stating nothing takes the look the {@link style!Style styled area} around it assigns as `choiceLook`,
	 * which is `normal` where nothing assigns it. Stating a look here answers to that alone, whatever the area says.
	 */
	look?: "subtle" | "normal" | "strong"

	/**
	 * The label of each option, keyed by its value, in display order.
	 */
	options: Readonly<Record<V, ComponentChildren>>

	/**
	 * The value of the option shown as chosen; none if omitted or if it names no option.
	 */
	value?: V

	/**
	 * Receives the value of the option a reader chooses.
	 *
	 * @param value The value of the chosen option
	 */
	onChange?: (value: V) => void

}) {

	const group = useId();

	return createElement("clay-choice", { look }, <fieldset aria-label={name}>{entries(options).map(([option, label]) =>

		<label key={option}>

			<input
				type="radio"
				name={group}
				value={option}
				checked={option === value}
				onChange={() => onChange?.(option)}
			/>

			<span>{label}</span>

		</label>
	)}</fieldset>);

}


/**
 * Lists the options of a record with their keys typed as the values they stand for, which `Object.entries` would widen
 * to plain strings, leaving `onChange` unable to receive them as the values it is declared over.
 */
function entries<V extends string>(options: Readonly<Record<V, ComponentChildren>>): readonly (readonly [V, ComponentChildren])[] {
	return (Object.keys(options) as V[]).map(option => [option, options[option]]); // ;(cast) the keys of a Record<V, …> are V
}

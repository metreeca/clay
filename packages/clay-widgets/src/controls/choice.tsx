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
	 * How loud the choice appears. `subtle` drops the box and keeps the options one line tall, so they fit inside a
	 * line of text and read as part of it; the chosen one is inked and underlined in the selection accent. `normal`
	 * sinks the options into a track boxed and sized as a {@link select!Select Select} is, each as wide as the widest,
	 * and raises the chosen one out of the track as a card. `strong` also sets the options in the strong weight and
	 * inks the chosen one in the accent, so the choice stands out from the fields and menus around it while matching
	 * their height, borders and corners, and a row mixing them still lines up as one.
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

	return createElement("clay-choice", { look }, <fieldset aria-label={name}>{

		(Object.keys(options) as V[]).map(option => // ;(cast) options is assumed to carry no keys beyond V

			<label key={option}>

				<input
					type="radio"
					name={group}
					value={option}
					checked={option === value}
					onChange={() => onChange?.(option)}
				/>

				<span>{options[option]}</span>

			</label>
		)

	}</fieldset>);

}

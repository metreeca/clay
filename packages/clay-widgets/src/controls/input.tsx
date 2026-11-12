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
 * Single-line field.
 *
 * Takes a value typed on one line, such as a title, an address, a number or a date, checked against the constraints
 * the field states as the reader types it, so a mistake is caught before the form is submitted.
 *
 * @module input
 */

import { createElement } from "preact";
import { useState } from "preact/hooks";
import "./input.css";


/**
 * Creates a single-line field.
 *
 * Takes its value on a native input, so the editing keys, the on-screen keyboard suited to `type`, the date and time
 * pickers, and the checking of every constraint come from the platform. A field failing a constraint is marked once
 * the reader has had a say on it, and stops the {@link form!Form Form} around it from being submitted.
 *
 * The value is either held by the caller, which shows `value` and is handed each edit through `onChange`, or left to
 * the field where `value` is omitted, the field then keeping whatever the reader types.
 *
 * @param options The widget configuration
 *
 * @returns The field
 *
 * @see [HTML: The input element][input]
 *
 * [input]: https://html.spec.whatwg.org/multipage/input.html#the-input-element
 */
export function Input({

	name,
	id,

	disabled,
	readonly,
	required,

	type = "text",

	min,
	max,
	step,
	minLength,
	maxLength,
	pattern,

	placeholder,
	value,

	onChange

}: {

	/**
	 * The accessible name, required where no {@link label!Label Label} names the field.
	 */
	name?: string

	/**
	 * The id a split {@link label!Label Label} names the field by; no id if omitted.
	 */
	id?: string

	/**
	 * Whether the field takes no input, greyed and out of the tab order; editable if omitted.
	 */
	disabled?: boolean

	/**
	 * Whether the field shows its value without taking edits, while staying in the tab order; editable if omitted.
	 */
	readonly?: boolean

	/**
	 * Whether the field fails its constraints while empty; optional if omitted.
	 */
	required?: boolean

	/**
	 * The kind of value the field takes, deciding the constraints checked on it and the keyboard or picker offered to
	 * type it with; `text` if omitted. Whatever the kind, the value is handed over as the text the field holds, a
	 * date as `YYYY-MM-DD` and a time as `hh:mm`, as the platform writes them in every locale.
	 */
	type?: "text" | "email" | "url" | "tel" | "password" | "number" | "date" | "time"

	/**
	 * The least value a `number`, `date` or `time` field accepts, written as its values are; none if omitted.
	 */
	min?: string

	/**
	 * The greatest value a `number`, `date` or `time` field accepts, written as its values are; none if omitted.
	 */
	max?: string

	/**
	 * The granularity of the values a `number`, `date` or `time` field accepts, such as `0.01` for a price or `60`
	 * seconds for a time stated to the minute; the platform default for the type if omitted.
	 */
	step?: string

	/**
	 * The least number of characters a non-empty value holds; no floor if omitted.
	 */
	minLength?: number

	/**
	 * The greatest number of characters the field takes, typing past it being refused; no ceiling if omitted.
	 */
	maxLength?: number

	/**
	 * The regular expression the whole value has to match, read as the platform reads it; any value if omitted.
	 */
	pattern?: string

	/**
	 * The hint shown in the field while it is empty, such as an example of the value expected. It disappears as soon
	 * as the reader types, so it never stands in for a {@link label!Label Label}; no hint if omitted.
	 *
	 * A `date` or `time` field shows no hint: the platform fills it with the pattern of the value instead, such as
	 * `dd/mm/yyyy`, in the order and with the separators of the locale of the reader.
	 */
	placeholder?: string

	/**
	 * The value shown in the field, held by the caller; left to the field if omitted.
	 */
	value?: string

	/**
	 * Receives the value of the field on every edit, as the reader types it.
	 *
	 * @param value The value the field now holds
	 */
	onChange?: (value: string) => void

}) {

	/*
	 * The element tells a stylesheet whether the field holds a value, which a date or time field offers no selector
	 * for, having no placeholder. A value held by the caller settles it; otherwise the last edit of the reader does.
	 */

	const [typed, setTyped] = useState("");

	const empty = (value ?? typed) === "";

	return createElement("clay-input", { empty }, <input

		id={id}

		disabled={disabled}
		readOnly={readonly}
		required={required}

		aria-label={name}
		type={type}

		min={min}
		max={max}
		step={step}
		minLength={minLength}
		maxLength={maxLength}
		pattern={pattern}

		placeholder={placeholder}
		value={value}

		onInput={event => {
			setTyped(event.currentTarget.value);
			onChange?.(event.currentTarget.value);
		}}

	/>);

}

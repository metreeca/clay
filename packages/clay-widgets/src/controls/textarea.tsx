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
 * Multi-line field.
 *
 * Takes a value running over several lines, such as a description or a note, growing with the text so that what was
 * typed stays in view without a scroll bar of its own wherever the browser supports it.
 *
 * @module textarea
 */

import { createElement } from "preact";
import "./textarea.css";


/**
 * Creates a multi-line field.
 *
 * Takes its value on a native text area, so the editing keys and the checking of every constraint come from the
 * platform; `Enter` starts a new line rather than submitting the {@link form!Form Form} around it. The field
 * stands a few lines tall when empty and grows with the text typed into it, where the browser supports it.
 *
 * The value is either held by the caller, which shows `value` and is handed each edit through `onChange`, or left to
 * the field where `value` is omitted, the field then keeping whatever the reader types.
 *
 * @param options The widget configuration
 *
 * @returns The field
 *
 * @see [HTML: The textarea element][textarea]
 *
 * [textarea]: https://html.spec.whatwg.org/multipage/form-elements.html#the-textarea-element
 */
export function Textarea({

	name,
	id,

	disabled,
	readonly,
	required,

	minLength,
	maxLength,

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
	 * The least number of characters a non-empty value holds; no floor if omitted.
	 */
	minLength?: number

	/**
	 * The greatest number of characters the field takes, typing past it being refused; no ceiling if omitted.
	 */
	maxLength?: number

	/**
	 * The hint shown in the field while it is empty, such as an example of the value expected. It disappears as soon
	 * as the reader types, so it never stands in for a {@link label!Label Label}; no hint if omitted.
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

	return createElement("clay-textarea", {}, <textarea

		id={id}

		disabled={disabled}
		readOnly={readonly}
		required={required}

		aria-label={name}

		minLength={minLength}
		maxLength={maxLength}

		placeholder={placeholder}
		value={value}

		onInput={event => onChange?.(event.currentTarget.value)}

	/>);

}

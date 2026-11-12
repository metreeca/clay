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
 * Editing form.
 *
 * Gathers the fields a resource is read and edited through, telling the screen whether what was entered is valid as
 * the reader types, and handing over the submission the `Enter` key asks for without letting the page navigate away.
 *
 * @module form
 */

import { type ComponentChildren, createElement } from "preact";
import "./form.css";


/**
 * Creates a form.
 *
 * Wraps its fields in a native form, so the constraints each field states (`required`, `pattern`, `min`, `max` and the
 * like) are checked by the platform, and pressing `Enter` in a field submits the form even where it shows no submit
 * button. The browser never navigates on submission: whatever the submission means is left to `onSubmit`.
 *
 * A submit button placed inside the form does not reach `onSubmit`: the action it stands for belongs to its own
 * `onClick`, leaving `onSubmit` with the submissions asked for from the keyboard alone.
 *
 * @param options The widget configuration
 *
 * @returns The form
 *
 * @see [MDN: Client-side form validation][validation]
 *
 * [validation]: https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation
 */
export function Form({

	onSubmit,
	onValidate,

	children

}: {

	/**
	 * What a submission asked for by pressing `Enter` in a field is handed to; submissions are ignored if omitted.
	 * Not called where a field fails its constraints, the platform reporting the failure to the reader instead.
	 */
	onSubmit?: () => void

	/**
	 * What the validity of the form is handed to whenever the reader changes a field, as true where every field
	 * meets its constraints and false otherwise; validity goes untracked if omitted.
	 *
	 * A value set by a script signals nothing on its own, so a composite field setting values that way dispatches a
	 * bubbling `input` event from its own element to have the form checked against the new value.
	 *
	 * @param valid Whether every field in the form meets its constraints
	 */
	onValidate?: (valid: boolean) => void


	/**
	 * The fields of the form.
	 */
	children?: ComponentChildren

}) {

	/*
	 * The hidden submit input gives the form a default button, which pressing `Enter` in a field submits through even
	 * where the form holds several fields and shows the reader no submit button of its own.
	 */

	return createElement("clay-form", {}, <form

		onInput={event => onValidate?.(event.currentTarget.checkValidity())}

		onSubmit={event => {

			event.preventDefault();

			if ( !(event.submitter instanceof HTMLButtonElement) ) {
				onSubmit?.();
			}

		}}

	>

		<input type="submit" hidden/>

		{children}

	</form>);

}

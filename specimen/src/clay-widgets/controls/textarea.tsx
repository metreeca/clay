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
 * Textarea samples.
 *
 * @module
 */

import { Textarea } from "@metreeca/clay-widgets/textarea";
import "../index.css";


/**
 * Creates the textarea section.
 *
 * Offers a multi-line field growing with its text, and fields stating constraints and options.
 *
 * @returns The textarea section
 */
export function Textareas() {

	return <>

		<p>A multi-line field takes a value running over several lines. It stands a few lines tall when empty and
			grows with the text, where the browser supports it, and <kbd>Enter</kbd> starts a new line rather than
			submitting the form around it.</p>

		<div class="controls">
			<Textarea name="Notes" placeholder="Anything else?"/>
			<Textarea name="Required" required minLength={10} placeholder="at least 10 characters"/>
			<Textarea name="Disabled" disabled value="disabled"/>
		</div>

	</>;

}

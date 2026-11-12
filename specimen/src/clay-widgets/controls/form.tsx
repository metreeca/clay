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
 * Form samples.
 *
 * @module
 */

import { Button } from "@metreeca/clay-widgets/button";
import { Form } from "@metreeca/clay-widgets/form";
import { Input } from "@metreeca/clay-widgets/input";
import { Label } from "@metreeca/clay-widgets/label";
import { useState } from "preact/hooks";
import "../index.css";


/**
 * Creates the form section.
 *
 * Offers a form with constrained fields, tracking its validity as the reader types and telling a submission asked for
 * from the keyboard apart from one made by the submit button the form holds among its fields.
 *
 * @returns The form section
 */
export function Forms() {

	const [valid, setValid] = useState(false);
	const [action, setAction] = useState("nothing yet");

	return <>

		<p>A form gathers the fields a resource is edited through. Each field states its own constraints, which the
			platform checks: the form hands the screen whether every field meets them as the reader types, and
			<kbd>Enter</kbd> in a field submits it without the page navigating away. A submit button inside the form
			keeps its action to itself, so the save below runs from its own handler rather than from the form.</p>

		<Form

			onSubmit={() => setAction("submitted from the keyboard")}
			onValidate={setValid}

		>

			<div class="controls">

				<Label><span>Title</span><Input required/></Label>
				<Label><span>Email</span><Input type="email" required/></Label>

				<Button type="submit" mode="commit" label="Save" disabled={!valid}
					onClick={() => setAction("saved by the button")}
				/>

			</div>

		</Form>

		<p>The form is <strong>{valid ? "valid" : "invalid"}</strong>, last action: <output>{action}</output>.</p>

	</>;

}

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
 * Radio samples.
 *
 * @module
 */

import { Fieldset } from "@metreeca/clay-widgets/fieldset";
import { Label } from "@metreeca/clay-widgets/label";
import { Radio } from "@metreeca/clay-widgets/radio";
import { useState } from "preact/hooks";
import "../index.css";


const methods = { post: "Post", courier: "Courier", pickup: "Pick Up in Store" };

type Method = keyof typeof methods


/**
 * Creates the radio section.
 *
 * Offers a radio group named by a field group, laid out as a row and as a column, with a pick held by the caller.
 *
 * @returns The radio section
 */
export function Radios() {

	const [method, setMethod] = useState<Method>("post");

	const keys = Object.keys(methods) as Method[]; // ;(cast) methods carries no keys beyond Method

	return <>

		<p>A radio button offers one option of a group from which a single one is picked. The buttons sharing a
			<code>group</code> make one stop for <kbd>Tab</kbd>, and the arrow keys move the pick. The group is named as
			a whole by a field group around it, and laid out wherever the screen places it: the same group is shown
			below as a row and as a column, sharing one pick.</p>

		<Fieldset label="Delivery">
			<div class="controls">{keys.map(key =>
				<Label key={key} orientation="horizontal"><Radio
					group="delivery-row"
					value={key}
					checked={key === method}
					onChange={setMethod}
				/><span>{methods[key]}</span></Label>
			)}</div>
		</Fieldset>

		<Fieldset label="Delivery">
			<div class="column">{keys.map(key =>
				<Label key={key} orientation="horizontal"><Radio
					group="delivery-column"
					value={key}
					checked={key === method}
					onChange={setMethod}
				/><span>{methods[key]}</span></Label>
			)}</div>
		</Fieldset>

	</>;

}

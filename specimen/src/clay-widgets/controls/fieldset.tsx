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
 * Fieldset samples.
 *
 * @module
 */

import { Fieldset } from "@metreeca/clay-widgets/fieldset";
import { Input } from "@metreeca/clay-widgets/input";
import { Label } from "@metreeca/clay-widgets/label";
import { Switch } from "@metreeca/clay-widgets/switch";
import { useState } from "preact/hooks";
import "../index.css";


/**
 * Creates the fieldset section.
 *
 * Gathers address fields under a caption, and turns them all off at once while they do not apply.
 *
 * @returns The fieldset section
 */
export function Fieldsets() {

	const [same, setSame] = useState(false);

	return <>

		<p>A field group gathers related fields under a caption naming them as a whole, announced on entering the
			group, and framed by a box with the caption set into its top edge. A disabled group turns off every field
			it holds: the delivery address below is off while it matches the billing one.</p>

		<div class="controls">
			<Label orientation="horizontal"><Switch checked={same} onChange={setSame}/><span>Deliver to the Billing Address</span></Label>
		</div>

		<Fieldset label="Delivery Address" disabled={same}>
			<div class="fields">
				<Label control="fieldset-street">Street</Label>
				<Input id="fieldset-street" required/>
				<Label control="fieldset-city">City</Label>
				<Input id="fieldset-city" required/>
			</div>
		</Fieldset>

	</>;

}

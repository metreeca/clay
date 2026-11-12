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
 * Label samples.
 *
 * @module
 */

import { Checkbox } from "@metreeca/clay-widgets/checkbox";
import { Input } from "@metreeca/clay-widgets/input";
import { Label } from "@metreeca/clay-widgets/label";
import { Select } from "@metreeca/clay-widgets/select";
import { Switch } from "@metreeca/clay-widgets/switch";
import "../index.css";


const countries = { it: "Italy", fr: "France", de: "Germany" };


/**
 * Creates the label section.
 *
 * Names controls with labels wrapping them, stacked or side by side, and with labels standing apart from them.
 *
 * @returns The label section
 */
export function Labels() {

	return <>

		<p>A label names a control, so assistive technology announces the control by the text the reader sees, and a
			press on the text reaches the control. Wrapped around its control, it needs no id, and stacks the text over
			the control by default, both aligned to the start, as a field stands under the text naming it.</p>

		<div class="controls">
			<Label><span>Title</span><Input/></Label>
			<Label><span>Country</span><Select options={countries}/></Label>
		</div>

		<p>A <code>horizontal</code> label sets the text and the control side by side on one line, centred on each
			other,
			as a box or a switch stands beside the text naming it. The text goes before or after the control as the
			children place it.</p>

		<div class="controls">
			<Label orientation="horizontal"><Checkbox/><span>Remember Me</span></Label>
			<Label orientation="horizontal"><Switch/><span>Notifications</span></Label>
			<Label orientation="horizontal"><span>Title</span><Input/></Label>
		</div>

		<p>A split label stands apart from its control and names it by <code>control</code>, the id the control
			carries, so labels and fields take columns of their own wherever the layout lines them up.</p>

		<div class="fields">
			<Label control="label-name">Name</Label>
			<Input id="label-name"/>
			<Label control="label-email">Email</Label>
			<Input id="label-email" type="email"/>
		</div>

	</>;

}

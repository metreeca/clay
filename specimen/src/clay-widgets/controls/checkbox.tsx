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
 * Checkbox samples.
 *
 * @module
 */

import { Checkbox } from "@metreeca/clay-widgets/checkbox";
import { Label } from "@metreeca/clay-widgets/label";
import { useState } from "preact/hooks";
import "../index.css";


const toppings = { cheese: "Cheese", olives: "Olives", basil: "Basil" };

type Topping = keyof typeof toppings


/**
 * Creates the checkbox section.
 *
 * Offers boxes ticked independently, a box standing for them showing the mixed state, and boxes stating options.
 *
 * @returns The checkbox section
 */
export function Checkboxes() {

	const [picked, setPicked] = useState<ReadonlySet<Topping>>(new Set(["cheese"]));

	const keys = Object.keys(toppings) as Topping[]; // ;(cast) toppings carries no keys beyond Topping

	const all = keys.every(key => picked.has(key));
	const some = keys.some(key => picked.has(key));

	function toggle(key: Topping, checked: boolean): void {
		setPicked(new Set(keys.filter(k => k === key ? checked : picked.has(k))));
	}

	return <>

		<p>A checkbox takes a yes or no answer submitted with the form around it. Boxes picking several options are
			ticked independently of one another; the box above them stands for the group, showing the mixed state
			while only some are ticked, and ticks or clears them all.</p>

		<div class="controls">
			<Label orientation="horizontal"><Checkbox
				indeterminate={some && !all}
				checked={all}
				onChange={checked => setPicked(new Set(checked ? keys : []))}
			/><span>All Toppings</span></Label>
		</div>

		<div class="controls">{keys.map(key =>
			<Label key={key} orientation="horizontal"><Checkbox
				checked={picked.has(key)}
				onChange={checked => toggle(key, checked)}
			/><span>{toppings[key]}</span></Label>
		)}</div>

		<p>A required box fails its constraints while clear, as one accepting terms does.</p>

		<div class="controls">
			<Label orientation="horizontal"><Checkbox required/><span>I Accept the Terms</span></Label>
			<Label orientation="horizontal"><Checkbox disabled/><span>Disabled</span></Label>
			<Label orientation="horizontal"><Checkbox disabled checked/><span>Disabled and Ticked</span></Label>
		</div>

	</>;

}

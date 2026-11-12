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
 * Select samples.
 *
 * @module
 */

import { Select } from "@metreeca/clay-widgets/select";
import { useState } from "preact/hooks";
import "../index.css";


const countries = { it: "Italy", fr: "France", de: "Germany", es: "Spain" };

type Country = keyof typeof countries


/**
 * Creates the select section.
 *
 * Offers a menu with and without a placeholder, a value held by the caller, and a required menu.
 *
 * @returns The select section
 */
export function Selects() {

	const [country, setCountry] = useState<Country>("it");

	return <>

		<p>A drop-down menu takes one value picked from a list too long to keep in view, showing the picked option
			alone until the reader opens the list. Without a placeholder it opens on the first option; with one, it
			opens on the placeholder, which a required menu fails on.</p>

		<div class="controls">
			<Select name="Country" options={countries} value={country} onChange={setCountry}/>
			<output>{country}</output>
			<Select name="Destination" required options={countries} placeholder="Pick a Country"/>
			<Select name="Disabled" disabled options={countries}/>
		</div>

	</>;

}

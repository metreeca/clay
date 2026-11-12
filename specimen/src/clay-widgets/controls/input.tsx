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
 * Input samples.
 *
 * @module
 */

import { Input } from "@metreeca/clay-widgets/input";
import { useState } from "preact/hooks";
import "../index.css";


type Type = NonNullable<Parameters<typeof Input>[0]["type"]>


const types: ReadonlyArray<Type> = ["text", "email", "url", "tel", "password", "number", "date", "time"];


/**
 * Creates the input section.
 *
 * Offers a field of each type, a value held by the caller, and fields stating constraints and options, in grids.
 *
 * @returns The input section
 */
export function Inputs() {

	const [city, setCity] = useState("Rome");

	return <>

		<p>A single-line field takes a value typed on one line, and <code>type</code> decides the keyboard or picker
			offered and the constraints checked on it. Whatever the type, the value is handed over as text.</p>

		<div class="grid">{types.map(type =>
			<Input key={type} name={type} type={type} placeholder={type}/>
		)}</div>

		<p>The value is held by the caller where <code>value</code> is given: the field below echoes each edit it
			hands over through <code>onChange</code>.</p>

		<div class="grid">
			<Input name="City" value={city} onChange={setCity}/>
			<output>{city}</output>
		</div>

		<p>Constraints are stated on the field and checked by the platform, and a field failing one is marked only once
			the reader has had a say on it, never on arrival.</p>

		<div class="grid">
			<Input name="Required" required placeholder="required"/>
			<Input name="Code" pattern="[0-9]{2,4}" placeholder="2 to 4 digits"/>
			<Input name="Number" type="number" min="1" max="9" placeholder="1 to 9"/>
			<Input name="Read-only" readonly value="read-only"/>
			<Input name="Disabled" disabled value="disabled"/>
		</div>

	</>;

}

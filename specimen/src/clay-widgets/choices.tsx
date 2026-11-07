/*
 * Copyright © 2023-2026 Metreeca srl
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
 * Choice samples.
 *
 * @module
 */

import { Choice } from "@metreeca/clay-widgets/choice";
import { useState } from "preact/hooks";
import "./index.css";


const densities = { tight: "Tight", normal: "Normal", loose: "Loose" };

type Density = keyof typeof densities


/**
 * Creates the choice section.
 *
 * Offers a setting as a segmented choice whose value the caller holds.
 *
 * @returns The choice section
 */
export function Choices() {

	const [density, setDensity] = useState<Density>("normal");

	return <>

		<p>A choice among a few options stands as one boxed row of segments, every option in view and the chosen one
			filled. It is a group of radio buttons underneath, so <kbd>Tab</kbd> reaches it as one stop and the arrow keys
			move the choice. The caller holds the value: the colour scheme switch in the bar keeps it in storage, this one
			in component state.</p>

		<div class="controls">
			<Choice name="Density" options={densities} value={density} onChange={setDensity}/>
			<span>Density: <strong>{densities[density]}</strong></span>
		</div>

	</>;

}

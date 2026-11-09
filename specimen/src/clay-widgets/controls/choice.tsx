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
import { Icon } from "@metreeca/clay-widgets/icon";
import { Style } from "@metreeca/clay-widgets/style";
import { skin } from "@metreeca/skin";
import { useState } from "preact/hooks";
import "../index.css";


type Look = NonNullable<Parameters<typeof Choice>[0]["look"]>


const looks: ReadonlyArray<Look> = ["subtle", "normal", "strong"];

const densities = { tight: "Tight", normal: "Normal", loose: "Loose" };

const glyphs = {
	tight: <Icon.Rows4 aria-label="Tight"/>,
	normal: <Icon.Rows3 aria-label="Normal"/>,
	loose: <Icon.Rows2 aria-label="Loose"/>
};

type Density = keyof typeof densities


/**
 * Creates the choice section.
 *
 * Offers a setting as a segmented choice whose value the caller holds, in every look and with labels or glyphs.
 *
 * @returns The choice section
 */
export function Choices() {

	const [density, setDensity] = useState<Density>("normal");

	return <>

		<p>A choice among a few options stands as one row of segments, every option in view and the chosen one
			marked. It is a group of radio buttons underneath, so <kbd>Tab</kbd> reaches it as one stop and the arrow
			keys move the choice. The caller holds the value: the colour scheme switch in the bar keeps it in storage,
			the ones below share one in component state.</p>

		<p>How loud a choice appears is set by <code>look</code>: <code>subtle</code> drops the box and inks the
			chosen option in the selection accent, <code>normal</code> boxes the options as a select is boxed, the
			chosen one tinted inside the box, and <code>strong</code> sets the options bold and inks the chosen one in
			the accent on top, whether they carry labels or glyphs.</p>

		{looks.map(look => <div key={look} class="controls">
			<Choice name="Density" look={look} options={densities} value={density} onChange={setDensity}/>
			<Choice name="Density" look={look} options={glyphs} value={density} onChange={setDensity}/>
			<code>look="{look}"</code>
		</div>)}

		<p>A choice stating no look takes the one the area around it is written in, from <code>{skin.look}</code>.
			The row below wraps its choices in a <code>Style</code> area assigning the quiet one, and holds a choice
			that asks for nothing, plus one that asks to be loud and stays loud.</p>

		<div class="controls">
			<Style css={{ look: "subtle" }}>
				<Choice name="Density" options={densities} value={density} onChange={setDensity}/>
				<Choice name="Density" look="strong" options={densities} value={density} onChange={setDensity}/>
			</Style>
		</div>

	</>;

}

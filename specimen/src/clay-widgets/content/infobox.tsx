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
 * Infobox samples.
 *
 * @module
 */

import { Infobox } from "@metreeca/clay-widgets/infobox";
import { Frame } from "@metreeca/specimen/clay-widgets/sample.js";
import { type ComponentChildren } from "preact";
import "../index.css";


/**
 * Creates the infobox section.
 *
 * Shows the same properties with labels at the start and at the end of their column, so the two alignments compare side
 * by side, with the rule setting sections apart on shared columns and the entries left out for want of a value.
 *
 * @returns The infobox section
 */
export function Infoboxes() {
	return <>

		<p>An infobox lists the properties of an item, each value beside the label naming it. Labels keep to the
			leading edge of their column as values do, or sit flush against the values they introduce. A property with
			no value is left out, and sections are set apart by a rule, sharing the label and value columns.</p>

		<div class="columns">

			<Frame label="start">
				<Panels align="start"/>
			</Frame>

			<Frame label="end">
				<Panels align="end"/>
			</Frame>

		</div>

	</>;
}


function Panels({ align }: {

	align: "start" | "end"

}) {
	return <Infobox align={align}>{[

		{
			title: "Annual report",
			author: "Jane Doe",
			editor: undefined,
			published: "2026-03-15"
		},

		[
			{
				label: "Keywords", value: <Items labels={align === "end"
					? ["Finance", "Governance", "Sustainability"]
					: ["finance", "governance", "sustainability"]
				}/>
			},
			{ label: "Status", value: "Published" }
		]

	]}</Infobox>;
}

function Items({ labels }: {

	labels: ReadonlyArray<ComponentChildren>

}) {
	return <ul>{labels.map((label, index) => <li key={index}>{label}</li>)}</ul>;
}

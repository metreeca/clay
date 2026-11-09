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
 * Shows the same properties laid out for the body of a page and for a sidebar, with the rule that sets consecutive
 * infoboxes apart and the entries an infobox leaves out for want of a value, so the layouts compare side by side.
 *
 * @returns The infobox section
 */
export function Infoboxes() {
	return <>

		<p>An infobox lists the properties of an item, each value beside the label naming it. In the body of a page the
			labels and the values both keep left or meet in the middle; in a sidebar they spread from edge to edge. A
			property with no value is left out, and consecutive infoboxes are set apart by a rule.</p>

		<div class="columns">

			<div>

				<Frame label="start">
					<Panels place="start"/>
				</Frame>

				<Frame label="center">
					<Panels place="center"/>
				</Frame>

			</div>

			<Frame label="spread">
				<Panels place="spread"/>
			</Frame>

		</div>

	</>;
}


function Panels({ place }: {

	place: "start" | "center" | "spread"

}) {
	return <>

		<Infobox place={place}>{{
			title: "Annual report",
			author: "Jane Doe",
			editor: undefined,
			published: "2026-03-15"
		}}</Infobox>

		<Infobox place={place}>{[
			{
				label: "Keywords", value: <Items labels={place === "center"
					? ["Finance", "Governance", "Sustainability"]
					: ["finance", "governance", "sustainability"]
				}/>
			},
			{ label: "Status", value: "Published" }
		]}</Infobox>

	</>;
}

function Items({ labels }: {

	labels: ReadonlyArray<ComponentChildren>

}) {
	return <ul>{labels.map((label, index) => <li key={index}>{label}</li>)}</ul>;
}

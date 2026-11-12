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
 * Table of contents samples.
 *
 * @module
 */

import { TOC, type TOCEntries } from "@metreeca/clay-widgets/toc";
import { Frame } from "@metreeca/specimen/clay-widgets/sample.js";
import "../index.css";


/**
 * Creates the table of contents section.
 *
 * Points at the outline standing in the tray of this very page, rather than nesting a second one beside it, then sets
 * a reference sidebar of long identifiers in two narrow columns, clipping its labels in one and wrapping them in the
 * other, so the two ways an outline fits a label too long for its column compare side by side.
 *
 * @returns The table of contents section
 */
export function Contents() {
	return <>

		<p>The outline in the tray is a table of contents: entries grouped under labels leading nowhere, set by the
			outline rules of the design system alone. It marks the section the reader is in as the page scrolls, the
			last
			one whose heading has passed a line a third of the way down the window, or the last one in view once the
			page reaches its end.</p>

		<p>Following one of its links marks that section at once and holds it while the page scrolls there, until the
			reader scrolls on their own. The location fragment follows the section marked, replaced rather than pushed,
			so a reload or a shared address lands where the reader stood. Below the large viewport the outline folds
			behind
			a single line naming the section the reader is in, and unfolds on demand.</p>

		<p>The outline here is <code>compact</code>, so each group folds behind its label and only one is open at a
			time. The group holding the section the reader is in opens as they reach it, and any other opens on demand.
		</p>

		<p>An outline also serves as a sidebar of reference links, such as the shapes a data model relates to one
			another. Labels are kept to one line by default, clipped with an ellipsis where they outrun the column and
			shown in full as a tooltip, so a long identifier never breaks midway. A <code>wrap</code> outline shows each
			label in full instead, breaking a word too long for the column wherever needed.</p>

		<div class="frames across outlines">

			<Frame label="clip">
				<TOC name="Credential" entries={reference}/>
			</Frame>

			<Frame label="wrap">
				<TOC name="Credential" wrap entries={reference}/>
			</Frame>

		</div>

		<p>The Markdown page renders the outline of a document through the same widget.</p>

	</>;
}


const reference: TOCEntries = {

	"Class": {
		"schema:EducationalOccupationalCredential": "https://schema.org/EducationalOccupationalCredential"
	},

	"Parents": {
		"schema:CreativeWork": "https://schema.org/CreativeWork"
	},

	"Referrers": {
		"schema:EducationalOccupationalProgram": "https://schema.org/EducationalOccupationalProgram",
		"schema:OccupationalExperienceRequirements": "https://schema.org/OccupationalExperienceRequirements"
	}

};

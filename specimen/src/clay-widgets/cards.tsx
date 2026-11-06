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
 * Summary card samples.
 *
 * @module
 */

import { Card } from "@metreeca/clay-widgets/card";
import { Frame } from "@metreeca/specimen/clay-widgets/sample.js";
import "./index.css";


/**
 * Creates the summary card section.
 *
 * Shows a run of entries, including one with no image whose description runs on under the tags.
 *
 * @returns The summary card section
 */
export function Cards() {
	return <>

		<p>A card sums up an item: its title over a description, beside its tags over an image standing for it at the end
			of the card; a description with no image beneath the side column runs on under the tags.</p>

		<div class="frames">
			<Frame label="as it stands">

				<Card title="Annual report" tags="Report" image={<>AR</>}>
					Financial statements and governance review for the fiscal year ending in March.
				</Card>

				<Card title="Sustainability plan" tags="Plan">
					Targets and milestones for reducing emissions across the operations of the group.
				</Card>

			</Frame>
		</div>

	</>;
}

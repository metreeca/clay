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
 * Hint samples.
 *
 * @module
 */

import { Hint } from "@metreeca/clay-widgets/hint";
import { Icon } from "@metreeca/clay-widgets/icon";
import "./index.css";


/**
 * Creates the hint section.
 *
 * Shows the placeholder an area holds while it has no content of its own, flush and outlined.
 *
 * @returns The hint section
 */
export function Hints() {
	return <>

		<p>A hint holds the place of content an area has not got, while it loads, when it turns out empty or when it
			could not be fetched, so a table or a list keeps its place rather than collapsing. A leading glyph is drawn
			large as the mark of the area, with the wording beneath it; an outlined hint reads as room left for the
			content.</p>

		<div class="columns">
			<Hint><Icon.Search/>No items match the filter</Hint>
			<Hint border><Icon.Upload/>Drop files here</Hint>
		</div>

	</>;
}

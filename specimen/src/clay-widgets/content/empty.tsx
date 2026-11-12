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
 * Empty state samples.
 *
 * @module
 */

import { Empty } from "@metreeca/clay-widgets/empty";
import { Icon } from "@metreeca/clay-widgets/icon";
import "../index.css";


/**
 * Creates the empty state section.
 *
 * Shows the placeholder an area holds while it has no content of its own, in each of the looks it takes.
 *
 * @returns The empty state section
 */
export function Empties() {
	return <>

		<p>An empty state holds the place of content an area has not got, while it loads, when it turns out empty or
			when it could not be fetched, so a table or a list keeps its place rather than collapsing. A leading glyph
			is
			drawn large as the mark of the area, with the wording beneath it; the look sets how far the area stands
			apart, from flush through outlined to outlined and recessed.</p>

		<div class="looks">
			<Empty look="subtle"><Icon.Search/>No items match the filter</Empty>
			<Empty look="normal"><Icon.Info/>Nothing here yet</Empty>
			<Empty look="strong"><Icon.Upload/>Drop files here</Empty>
		</div>

	</>;
}

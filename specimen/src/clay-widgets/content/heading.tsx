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
 * Heading samples.
 *
 * @module
 */

import { Heading } from "@metreeca/clay-widgets/heading";


/**
 * Creates the heading section.
 *
 * Nests two headings under the title of the sample, to show a heading opening a stretch of the one above it.
 *
 * @returns The heading section
 */
export function Headings() {
	return <>

		<p>A heading opens a stretch of a page with a title ranked in the page outline, the content it opens following
			it as a sibling. The title is set as any heading of its rank, and a heading carrying an id is a target an
			outline links to.</p>

		<Heading level={3}>A Nested Heading</Heading>
		<p>A nested heading opens a stretch of the one above it, its title set at the lower rank it is given.</p>

		<Heading level={3}>Another Nested Heading</Heading>
		<p>Consecutive nested headings follow one another, each opening a stretch of its own.</p>

		<Heading>An Unranked Heading</Heading>
		<p>A heading given no rank is set in heading type at the size of the text, titling what follows it while holding
			no place in the page outline.</p>

	</>;
}

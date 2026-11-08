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
 * Section samples.
 *
 * @module
 */

import { Section } from "@metreeca/clay-widgets/section";


/**
 * Creates the section section.
 *
 * Points at the sections this page is made of, and nests two of them to show a section opening a stretch of another.
 *
 * @returns The section section
 */
export function Sections() {
	return <>

		<p>Every stretch of this page is a section: an eyebrow naming the part of the page it belongs to, a title, and a
			lead saying what it is about, all optional, set by the heading group rules of the design system. Consecutive
			sections are set apart by a rule, and one carrying an id is a target an outline links to. The opening of the
			page is a section too, ranked above the ones following it.</p>

		<Section level={3} eyebrow="Nested" title="A Section within a Section" lead="Titled a step above the text.">
			<p>A nested section opens a stretch of its parent, keeping no rule or air of its own.</p>
		</Section>

		<Section level={3} title="Another Nested Section">
			<p>A section given a title alone shows the title over its content.</p>
		</Section>

	</>;
}

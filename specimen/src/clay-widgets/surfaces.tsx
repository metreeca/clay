/*
 * Copyright © 2025-2026 Metreeca srl
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
 * Surface samples.
 *
 * @module
 */

import { Panel } from "@metreeca/clay-widgets/panel";
import { Stack } from "@metreeca/clay-widgets/stack";
import { Style } from "@metreeca/clay-widgets/style";
import { Well } from "@metreeca/clay-widgets/well";
import "./index.css";


/**
 * Creates the surface section.
 *
 * Shows the surfaces a screen sets things apart on, a raised panel and a sunken well, how they nest, and how an area
 * retunes them through the design system tokens rather than through options of their own.
 *
 * @returns The surface section
 */
export function Surfaces() {
	return <>

		<p>A surface sets what it holds apart from the page, padded, rounded and painted as the design system says. A
			panel is raised, with the lift that goes with it:</p>

		<Panel>
			<p>A panel stays in the flow, lifted just enough to read apart from the page.</p>
		</Panel>

		<p>A well goes the other way, sunk below the page and carrying no shadow:</p>

		<Well>
			<p>A well is where a thing is dropped into.</p>
		</Well>

		<p>Surfaces nest, each painting what it holds as standing on it, so a well gathers a group of panels:</p>

		<Well>
			<Stack space="spacing050">
				<Panel><p>The first panel in the well.</p></Panel>
				<Panel><p>The second panel in the well.</p></Panel>
			</Stack>
		</Well>

		<p>A surface takes no options for its look: an area retunes it through the tokens it reads, as it would any
			other widget.</p>

		<Style css={{ color: "colorStrong", spacing100: "spacing200" }}>
			<Panel>
				<p>This panel is padded a step wider, and its text set in the accent.</p>
			</Panel>
		</Style>

	</>;
}

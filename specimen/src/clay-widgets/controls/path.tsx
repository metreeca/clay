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
 * Path samples.
 *
 * @module
 */

import { Link } from "@metreeca/clay-widgets/link";
import { Path } from "@metreeca/clay-widgets/path";
import { Style } from "@metreeca/clay-widgets/style";
import "../index.css";


/**
 * Creates the paths section.
 *
 * Shows the breadcrumb trail stating where a screen sits in the hierarchy, how the trail fits a narrow row, and how it
 * stacks its steps one per line on a phone held upright, wrapping a step too long for the line rather than clipping it.
 *
 * @returns The paths section
 */
export function Paths() {
	return <>

		<p>A path lays the levels above the current page in a row, outermost first, each a link leading back to it,
			and ends on the page itself, announced as the current one. The separators are drawn rather than written,
			so they are never read out as steps.</p>

		<div class="paths">
			<Path name="Breadcrumb">
				<Link href="/">Specimen</Link>
				<Link href="/clay-widgets/">Widgets</Link>
				Paths
			</Path>
			<Style css={{ fontSize: "fontSizeLarge" }}>
				<Path name="Breadcrumb">
					<Link href="/">Specimen</Link>
					<Link href="/clay-widgets/">Widgets</Link>
					Paths
				</Path>
			</Style>
		</div>

		<p>A trail too long for its row keeps the levels above the page whole and clips the page name instead, which
			the heading of the screen states in full anyway. On a phone held upright the steps stack one per line
			instead, and a page name too long for its line wraps onto the next rather than being clipped.</p>

		<div class="paths narrow">
			<Path name="Breadcrumb">
				<Link href="/">Specimen</Link>
				<Link href="/clay-widgets/">Widgets</Link>
				A page name far too long to fit the row it is set in
			</Path>
		</div>

	</>;
}

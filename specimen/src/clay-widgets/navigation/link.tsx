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
 * Link samples.
 *
 * @module
 */

import { Icon } from "@metreeca/clay-widgets/icon";
import { Link } from "@metreeca/clay-widgets/link";
import { Style } from "@metreeca/clay-widgets/style";
import "../index.css";


/**
 * How loud a link appears.
 */
type Look = NonNullable<Parameters<typeof Link>[0]["look"]>


const looks: ReadonlyArray<Look> = ["subtle", "normal", "strong"];

const here = "/clay-widgets/"; // the route of this page, marking a link pointing at it as current


/**
 * Creates the links section.
 *
 * Shows how loud a link appears, in running text and standing alone, and how it is marked while its route is current.
 *
 * @returns The links section
 */
export function Links() {
	return <>

		<p>A link is the native anchor, so the role, the activation by <kbd>Enter</kbd>, the tab stop and the focus ring
			come from the platform. A plain click on a route of the same site is followed by the router without
			reloading the page.</p>

		<p>How loud a link appears is set by <code>look</code>: <code>subtle</code> reads as the text around it,
			<code>normal</code> adds the link colour and an underline, and <code>strong</code> is heavier in the link
			colour. Each column below sets one look in running text, standing alone with a glyph, and marked as the
			current page with <code>active</code>, which underlines it in the accent colour whatever the look.</p>

		<div class="looks">{looks.map(look => <div key={look}>

			<p><code>look="{look}"</code></p>

			<p>Read the <Link look={look} href="/">specimen index</Link> for every package.</p>

			<div class="controls">
				<Link look={look} href="/"><Icon.Home/>Home</Link>
				<Link look={look} active href={here}>Widgets</Link>
			</div>

		</div>)}</div>

		<p>A link stating no look takes the one the area around it assigns as <code>linkLook</code>. The row below
			wraps its links in a <code>Style</code> area assigning it once, and holds two links that ask for nothing,
			plus one that asks to be loud and stays loud.</p>

		<div class="controls">
			<Style css={{ linkLook: "subtle" }}>
				<Link href="/">Specimen</Link>
				<Link active href={here}>Widgets</Link>
				<Link look="strong" href="/">Home</Link>
			</Style>
		</div>

	</>;
}

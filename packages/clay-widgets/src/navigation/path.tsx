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
 * Breadcrumb trail.
 *
 * Offers the trail that tells a reader where the current page sits in the hierarchy and leads them back up through it.
 *
 * @module path
 */

import { type ComponentChildren, createElement, toChildArray } from "preact";
import "./path.css";


/**
 * Creates a breadcrumb path.
 *
 * Shows its steps in a row, from the outermost level to the current page. The separators closing every step but a
 * plain one at the end are supplied by the widget and never announced: a step carries only its link or its text.
 *
 * The trail is a navigation landmark holding an ordered list, and its last step is announced as the current page. A
 * reader thus learns where they stand whether or not they see the trail. A trail too long for its row clips its last
 * step with an ellipsis and keeps the levels above it whole, so the page name is best stated in full elsewhere.
 *
 * On a phone held upright the steps stack one per line instead, outermost on top, each closing on its separator, and
 * a step too long for the line wraps rather than being clipped, so the whole trail stays legible.
 *
 * @param options The widget configuration
 *
 * @returns The breadcrumb path
 *
 * @see {@link https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/ ARIA Authoring Practices: Breadcrumb Pattern}
 */
export function Path({

	name,

	children

}: {

	/**
	 * The accessible name of the trail, such as `Breadcrumb`, setting it apart from other navigation landmarks on the
	 * page; unnamed if omitted, as befits a page holding no other navigation landmark.
	 */
	name?: string


	/**
	 * The steps of the trail, outermost first, one child each: a {@link link.Link Link} for a level the reader may
	 * return to, coloured as a strong link unless it states a look of its own, plain content for one they may not;
	 * empty children such as `null`, `undefined` or `false` are dropped rather than shown as empty steps.
	 */
	children?: ComponentChildren

}) {

	const steps = toChildArray(children);

	return createElement("clay-path", {}, <nav aria-label={name}>
		<ol role="list">{steps.map((step, index) =>
			<li key={index} aria-current={index === steps.length-1 ? "page" : undefined}>{step}</li>
		)}</ol>
	</nav>);

}

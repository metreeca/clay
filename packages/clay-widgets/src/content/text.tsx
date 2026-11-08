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
 * Styled text run.
 *
 * Sets a run of text in one of the looks the design system offers, leaving it in the line around it.
 *
 * @module text
 */

import { type ComponentChildren, createElement } from "preact";
import "./text.css";


/**
 * Creates a text run.
 *
 * Sets a run of text in one of the looks the design system offers. The run adds no box of its own, so it sits in the
 * line, the row or the column around it exactly as the bare text would, and its look changes only how loud it reads.
 *
 * @param options The widget configuration
 *
 * @returns The styled text
 */
export function Text({

	look,

	children

}: {

	/**
	 * How loud the text appears: `subtle` recedes in the label colour, `normal` reads as the text around it, and
	 * `strong` carries emphasis in a heavier weight. Face and size always follow the text around it, whatever the look.
	 *
	 * A run stating nothing takes the look the area around it is written in, from the `--skin--look` token the
	 * design system carries, which is `normal` where nothing assigns it. Stating a look here answers to that alone.
	 */
	look?: "subtle" | "normal" | "strong"

	/**
	 * The text to be styled.
	 */
	children: ComponentChildren

}) {

	return createElement("clay-text", { look }, children);

}

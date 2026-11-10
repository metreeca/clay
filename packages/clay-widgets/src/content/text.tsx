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
 * Sets a run of text in the look of the area it sits in, without breaking the line it belongs to.
 *
 * @module text
 */

import { type ComponentChildren, createElement } from "preact";
import "./text.css";


/**
 * Creates a text run.
 *
 * Sets a run of text in the look of the area it sits in, as assigned by the `--skin--look` token of the design system.
 * A `subtle` run recedes in the label colour, a `normal` one reads as the text around it, and a `strong` one carries
 * emphasis in a heavier weight. Runs read as `normal` where nothing assigns a look.
 *
 * The run adds no box of its own, so it sits in the line, the row or the column around it exactly as the bare text
 * would. Its face and size always follow the text around it, whatever the look.
 *
 * @param options The widget configuration
 *
 * @returns The styled text
 */
export function Text({

	children

}: {

	/**
	 * The text to be styled.
	 */
	children: ComponentChildren

}) {

	return createElement("clay-text", {}, children);

}

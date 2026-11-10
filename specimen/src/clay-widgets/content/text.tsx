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
 * Text samples.
 *
 * @module
 */

import { Style } from "@metreeca/clay-widgets/style";
import { Text } from "@metreeca/clay-widgets/text";
import "../index.css";


/**
 * Creates the text section.
 *
 * Shows a run of text inline in each look the design system offers, taking the look from the area it sits in.
 *
 * @returns The text section
 */
export function Texts() {
	return <>

		<p>A styled text sets a run of wording in the look of the area it sits in, without a box of its own, so it
			reads in the line around it as the bare text would.</p>

		<Style css={{ look: "subtle" }}>
			<p>In a subtle area, <Text>a styled run</Text> recedes as secondary wording.</p>
		</Style>

		<p>In a normal area, <Text>a styled run</Text> reads as the text around it.</p>

		<Style css={{ look: "strong" }}>
			<p>In a strong area, <Text>a styled run</Text> carries emphasis.</p>
		</Style>

	</>;
}

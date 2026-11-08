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
import "./index.css";


/**
 * Creates the text section.
 *
 * Shows a run of text at each look the design system offers, inline in the paragraph around it, stated on its own
 * or taken from the area the run sits in.
 *
 * @returns The text section
 */
export function Texts() {
	return <>

		<p>A styled text sets a run of wording at one of the looks the design system offers, without a box of its own,
			so it reads in the line around it as the bare text would.</p>

		<p>A passage may carry <Text look="subtle">a subtle run</Text> receding as secondary wording, <Text
			look="normal">a normal run</Text> reading as the text around it, or <Text look="strong">a strong
			run</Text> carrying emphasis.</p>

		<p>A run stating no look takes the one of the area it sits in, while a run stating its own keeps it:</p>

		<Style css={{ look: "subtle" }}>
			<p><Text>This run recedes with the area</Text>, while <Text look="strong">this one stands out</Text>.</p>
		</Style>

	</>;
}

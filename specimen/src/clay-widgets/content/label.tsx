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
 * Label samples.
 *
 * @module
 */

import { Label } from "@metreeca/clay-widgets/label";
import "../index.css";


/**
 * Creates the label section.
 *
 * Shows the guidance introducing the content it precedes, set apart from that content by colour and size.
 *
 * @returns The label section
 */
export function Labels() {
	return <>

		<p>A label introduces the content it precedes, set apart from it by a muted colour at a smaller size, without a
			box of its own, so it sits in the column around it as the bare text would.</p>

		<div>
			<Label>Introducing label</Label>
			<p>The content the label stands over, set at body size in the ordinary colour.</p>
		</div>

	</>;
}

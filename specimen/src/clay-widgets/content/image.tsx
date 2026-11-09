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
 * Captioned image samples.
 *
 * @module
 */

import { Image } from "@metreeca/clay-widgets/image";
import { landscape } from "@metreeca/specimen/clay-widgets/sample.js";
import "../index.css";


/**
 * Creates the image section.
 *
 * Shows the same captioned picture in each of the looks it takes, side by side.
 *
 * @returns The image section
 */
export function Images() {

	const src = landscape("#bcd7ea", "#3f6b4c", "#f2c14e");

	return <>

		<p>An image sets a picture together with its caption, held to the width of the picture. The look sets how far
			it stands apart: bare, outlined by a quiet border, or held with its caption in a rounded box.</p>

		<div class="toolbar">
			<Image look="subtle" src={src} caption="subtle"/>
			<Image look="normal" src={src} caption="normal"/>
			<Image look="strong" src={src} caption="strong"/>
		</div>

	</>;

}

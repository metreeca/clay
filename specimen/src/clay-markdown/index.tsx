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
 * Markdown samples.
 *
 * @module
 */

import { Page, type Sample } from "@metreeca/specimen/index.core.js";
import { Marks } from "@metreeca/specimen/clay-markdown/markdown.js";


const samples: readonly Sample[] = [

	{ id: "markdown", group: "Documents", title: "Markdown", view: <Marks/> }

];


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function ClayMarkdown() {

	return <Page

		eyebrow="@metreeca/clay-markdown"
		title="Markdown Documents"
		lead={<>
			Markdown rendered as a page of its own, with a table of contents following the reader and front matter read
			as values.
		</>}

		samples={samples}

	/>;

}

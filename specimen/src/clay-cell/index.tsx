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

import { Link } from "@metreeca/clay-cell/link";
import { Routes } from "@metreeca/clay/router";
import { Page } from "@metreeca/specimen/index.core.js";
import { Buttons } from "@metreeca/specimen/clay-cell/buttons.js";
import { Icons } from "@metreeca/specimen/clay-cell/icons.js";
import { Logos } from "@metreeca/specimen/clay-cell/logos.js";
import { Marks } from "@metreeca/specimen/clay-cell/markdown.js";
import { Notes } from "@metreeca/specimen/clay-cell/notes.js";
import { Paths } from "@metreeca/specimen/clay-cell/paths.js";
import { Triggers } from "@metreeca/specimen/clay-cell/triggers.js";


export const ClayCellPath = "/clay-cell/";


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function ClayCell() {

	const sections = {

		Icons: <Icons/>,
		Logos: <Logos/>,
		Buttons: <Buttons/>,
		Notes: <Notes/>,
		Marks: <Marks/>,
		Paths: <Paths/>,
		Triggers: <Triggers/>

	};

	const path = (label: string) => label.toLowerCase();

	return <Page

		tray={<>

			{Object.keys(sections).map(label =>
				<Link key={label} active look="subtle" href={`${ClayCellPath}${path(label)}`}>{label}</Link>
			)}

		</>}
	>

		<Routes>{{

			"/": `/${path("Icons")}`,

			...Object.fromEntries(Object.entries(sections).map(([label, view]) => [`/${path(label)}`, view]))

		}}</Routes>

	</Page>;

}

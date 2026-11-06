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

import { Link } from "@metreeca/clay-widgets/link";
import { Routes } from "@metreeca/clay/router";
import { Page } from "@metreeca/specimen/index.core.js";
import { Boxes } from "@metreeca/specimen/clay-widgets/boxes.js";
import { Buttons } from "@metreeca/specimen/clay-widgets/buttons.js";
import { Cards } from "@metreeca/specimen/clay-widgets/cards.js";
import { Icons } from "@metreeca/specimen/clay-widgets/icons.js";
import { Infos } from "@metreeca/specimen/clay-widgets/infos.js";
import { Layouts } from "@metreeca/specimen/clay-widgets/layouts.js";
import { Logos } from "@metreeca/specimen/clay-widgets/logos.js";
import { Notes } from "@metreeca/specimen/clay-widgets/notes.js";
import { Paths } from "@metreeca/specimen/clay-widgets/paths.js";
import { Shells } from "@metreeca/specimen/clay-widgets/shells.js";
import { Stacks } from "@metreeca/specimen/clay-widgets/stacks.js";
import { Strips } from "@metreeca/specimen/clay-widgets/strips.js";
import { Styles } from "@metreeca/specimen/clay-widgets/styles.js";
import { Tabbed } from "@metreeca/specimen/clay-widgets/tabbed.js";
import { Toasts } from "@metreeca/specimen/clay-widgets/toasts.js";
import { Triggers } from "@metreeca/specimen/clay-widgets/triggers.js";


export const ClayWidgetsPath = "/clay-widgets/";


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function ClayWidgets() {

	const sections = {

		Icons: <Icons/>,
		Logos: <Logos/>,
		Buttons: <Buttons/>,
		Notes: <Notes/>,
		Paths: <Paths/>,
		Triggers: <Triggers/>,
		Shell: <Shells/>,
		Tabs: <Tabbed/>,
		Stack: <Stacks/>,
		Strip: <Strips/>,
		Box: <Boxes/>,
		Layout: <Layouts/>,
		Info: <Infos/>,
		Card: <Cards/>,
		Style: <Styles/>,
		Toast: <Toasts/>,
		Empty: <></>

	};

	const path = (label: string) => label.toLowerCase();

	return <Page

		tray={<>

			{Object.keys(sections).map(label =>
				<Link key={label} active look="subtle" href={`${ClayWidgetsPath}${path(label)}`}>{label}</Link>
			)}

		</>}
	>

		<Routes>{{

			"/": `/${path("Icons")}`,

			...Object.fromEntries(Object.entries(sections).map(([label, view]) => [`/${path(label)}`, view]))

		}}</Routes>

	</Page>;

}

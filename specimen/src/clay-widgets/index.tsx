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
 * Widget samples.
 *
 * @module
 */

import { Page, type Sample } from "@metreeca/specimen/index.core.js";
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


const samples: readonly Sample[] = [

	{ id: "icons", group: "Glyphs", title: "Icons", view: <Icons/> },
	{ id: "logos", group: "Glyphs", title: "Logos", view: <Logos/> },

	{ id: "buttons", group: "Controls", title: "Buttons", view: <Buttons/> },
	{ id: "triggers", group: "Controls", title: "Triggers", view: <Triggers/> },
	{ id: "paths", group: "Controls", title: "Paths", view: <Paths/> },
	{ id: "notes", group: "Controls", title: "Notes", view: <Notes/> },

	{ id: "shell", group: "Layouts", title: "Shell", view: <Shells/> },
	{ id: "tabs", group: "Layouts", title: "Tabs", view: <Tabbed/> },
	{ id: "stack", group: "Layouts", title: "Stack", view: <Stacks/> },
	{ id: "strip", group: "Layouts", title: "Strip", view: <Strips/> },
	{ id: "box", group: "Layouts", title: "Box", view: <Boxes/> },
	{ id: "layout", group: "Layouts", title: "Layout", view: <Layouts/> },

	{ id: "info", group: "Content", title: "Info", view: <Infos/> },
	{ id: "card", group: "Content", title: "Card", view: <Cards/> },
	{ id: "style", group: "Content", title: "Style", view: <Styles/> },
	{ id: "toast", group: "Content", title: "Toast", view: <Toasts/> }

];


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function ClayWidgets() {

	return <Page

		eyebrow="@metreeca/clay-widgets"
		title="Widgets, layouts and glyphs"
		lead={<>
			The pieces an interface is assembled from, each drawn from the design system tokens alone. Every sample on
			this page is a live widget, laid out in the very shell it documents.
		</>}

		facts={[
			[samples.length, "sections"],
			[new Set(samples.map(({ group }) => group)).size, "groups"],
			[2, "colour schemes"]
		]}

		samples={samples}

	/>;

}

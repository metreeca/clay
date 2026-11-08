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
import { Buttons } from "@metreeca/specimen/clay-widgets/buttons.js";
import { Cards } from "@metreeca/specimen/clay-widgets/cards.js";
import { Choices } from "@metreeca/specimen/clay-widgets/choices.js";
import { Contents } from "@metreeca/specimen/clay-widgets/contents.js";
import { Empties } from "@metreeca/specimen/clay-widgets/empties.js";
import { Guards } from "@metreeca/specimen/clay-widgets/guards.js";
import { Sections } from "@metreeca/specimen/clay-widgets/sections.js";
import { Icons } from "@metreeca/specimen/clay-widgets/icons.js";
import { Images } from "@metreeca/specimen/clay-widgets/images.js";
import { Infoboxes } from "@metreeca/specimen/clay-widgets/infoboxes.js";
import { Labels } from "@metreeca/specimen/clay-widgets/labels.js";
import { Layouts } from "@metreeca/specimen/clay-widgets/layouts.js";
import { Logos } from "@metreeca/specimen/clay-widgets/logos.js";
import { Notes } from "@metreeca/specimen/clay-widgets/notes.js";
import { Paths } from "@metreeca/specimen/clay-widgets/paths.js";
import { Shells } from "@metreeca/specimen/clay-widgets/shells.js";
import { Stacks } from "@metreeca/specimen/clay-widgets/stacks.js";
import { Strips } from "@metreeca/specimen/clay-widgets/strips.js";
import { Styles } from "@metreeca/specimen/clay-widgets/styles.js";
import { Surfaces } from "@metreeca/specimen/clay-widgets/surfaces.js";
import { Tabbed } from "@metreeca/specimen/clay-widgets/tabbed.js";
import { Texts } from "@metreeca/specimen/clay-widgets/texts.js";
import { Toasted } from "@metreeca/specimen/clay-widgets/toasted.js";
import { Triggers } from "@metreeca/specimen/clay-widgets/triggers.js";


const samples: readonly Sample[] = [

	{ id: "stack", group: "Layouts", title: "Stack", view: <Stacks/> },
	{ id: "strip", group: "Layouts", title: "Strip", view: <Strips/> },
	{ id: "surfaces", group: "Layouts", title: "Surfaces", view: <Surfaces/> },
	{ id: "section", group: "Layouts", title: "Section", view: <Sections/> },
	{ id: "card", group: "Layouts", title: "Card", view: <Cards/> },
	{ id: "tabs", group: "Layouts", title: "Tabs", view: <Tabbed/> },
	{ id: "layout", group: "Layouts", title: "Layout", view: <Layouts/> },
	{ id: "shell", group: "Layouts", title: "Shell", view: <Shells/> },

	{ id: "buttons", group: "Controls", title: "Buttons", view: <Buttons/> },
	{ id: "choice", group: "Controls", title: "Choice", view: <Choices/> },
	{ id: "paths", group: "Controls", title: "Paths", view: <Paths/> },
	{ id: "triggers", group: "Controls", title: "Triggers", view: <Triggers/> },
	{ id: "contents", group: "Controls", title: "Table of Contents", label: "ToC", view: <Contents/> },

	{ id: "notes", group: "Alerts", title: "Notes", view: <Notes/> },
	{ id: "toasts", group: "Alerts", title: "Toasts", view: <Toasted/> },

	{ id: "text", group: "Content", title: "Text", view: <Texts/> },
	{ id: "label", group: "Content", title: "Label", view: <Labels/> },
	{ id: "empty", group: "Content", title: "Empty", view: <Empties/> },
	{ id: "image", group: "Content", title: "Image", view: <Images/> },
	{ id: "infobox", group: "Content", title: "Infobox", view: <Infoboxes/> },

	{ id: "icons", group: "Glyphs", title: "Icons", view: <Icons/> },
	{ id: "logos", group: "Glyphs", title: "Logos", view: <Logos/> },

	{ id: "style", group: "Scopes", title: "Style", view: <Styles/> },
	{ id: "guard", group: "Scopes", title: "Guard", view: <Guards/> }

];


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function ClayWidgets() {

	return <Page

		eyebrow="@metreeca/clay-widgets"
		title="Widgets, Layouts and Glyphs"
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

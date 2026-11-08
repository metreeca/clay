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

import { Page, type Sample, ToolPath } from "@metreeca/specimen/index.core.js";
import { Buttons } from "@metreeca/specimen/clay-widgets/button.js";
import { Cards } from "@metreeca/specimen/clay-widgets/card.js";
import { Choices } from "@metreeca/specimen/clay-widgets/choice.js";
import { Empties } from "@metreeca/specimen/clay-widgets/empty.js";
import { Guards } from "@metreeca/specimen/clay-widgets/guard.js";
import { Headings } from "@metreeca/specimen/clay-widgets/heading.js";
import { Icons } from "@metreeca/specimen/clay-widgets/icon.js";
import { Images } from "@metreeca/specimen/clay-widgets/image.js";
import { Infoboxes } from "@metreeca/specimen/clay-widgets/infobox.js";
import { Labels } from "@metreeca/specimen/clay-widgets/label.js";
import { Links } from "@metreeca/specimen/clay-widgets/link.js";
import { Logos } from "@metreeca/specimen/clay-widgets/logo.js";
import { Triggers } from "@metreeca/specimen/clay-widgets/more.js";
import { Notes } from "@metreeca/specimen/clay-widgets/note.js";
import { Paths } from "@metreeca/specimen/clay-widgets/path.js";
import { Stacks } from "@metreeca/specimen/clay-widgets/stack.js";
import { Strips } from "@metreeca/specimen/clay-widgets/strip.js";
import { Styles } from "@metreeca/specimen/clay-widgets/style.js";
import { Tabbed } from "@metreeca/specimen/clay-widgets/tabs.js";
import { Texts } from "@metreeca/specimen/clay-widgets/text.js";
import { Toasted } from "@metreeca/specimen/clay-widgets/toasts.js";
import { Contents } from "@metreeca/specimen/clay-widgets/toc.js";


const samples: readonly Sample[] = [

	{ id: "tool", group: "Shells", title: "Tool", href: ToolPath },

	{ id: "stack", group: "Layouts", title: "Stack", view: <Stacks/> },
	{ id: "strip", group: "Layouts", title: "Strip", view: <Strips/> },
	{ id: "card", group: "Layouts", title: "Card", view: <Cards/> },
	{ id: "tabs", group: "Layouts", title: "Tabs", view: <Tabbed/> },

	{ id: "heading", group: "Content", title: "Heading", view: <Headings/> },
	{ id: "text", group: "Content", title: "Text", view: <Texts/> },
	{ id: "label", group: "Content", title: "Label", view: <Labels/> },
	{ id: "image", group: "Content", title: "Image", view: <Images/> },
	{ id: "infobox", group: "Content", title: "Infobox", view: <Infoboxes/> },
	{ id: "empty", group: "Content", title: "Empty", view: <Empties/> },

	{ id: "link", group: "Controls", title: "Link", view: <Links/> },
	{ id: "path", group: "Controls", title: "Path", view: <Paths/> },
	{ id: "contents", group: "Controls", title: "Table of Contents", label: "ToC", view: <Contents/> },
	{ id: "button", group: "Controls", title: "Button", view: <Buttons/> },
	{ id: "choice", group: "Controls", title: "Choice", view: <Choices/> },
	{ id: "more", group: "Controls", title: "More", view: <Triggers/> },

	{ id: "note", group: "Alerts", title: "Note", view: <Notes/> },
	{ id: "toasts", group: "Alerts", title: "Toasts", view: <Toasted/> },

	{ id: "icon", group: "Glyphs", title: "Icon", view: <Icons/> },
	{ id: "logo", group: "Glyphs", title: "Logo", view: <Logos/> },

	{ id: "style", group: "Scopes", title: "Style", view: <Styles/> },
	{ id: "guard", group: "Scopes", title: "Guard", view: <Guards/> }

];


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function ClayWidgets() {

	return <Page

		eyebrow="@metreeca/clay-widgets"
		title="Interface Components"
		lead={<>
			The pieces an interface is assembled from, each drawn from the design system tokens alone. Every sample on
			this page is a live widget, laid out in a tool shell; the shells listed first in the outline open on screens of their own.
		</>}

		samples={samples}

	/>;

}

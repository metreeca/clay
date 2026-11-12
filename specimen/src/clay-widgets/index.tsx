/*
 * Copyright © 2026 Metreeca srl
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

import { Empties } from "@metreeca/specimen/clay-widgets/content/empty.js";
import { Headings } from "@metreeca/specimen/clay-widgets/content/heading.js";
import { Images } from "@metreeca/specimen/clay-widgets/content/image.js";
import { Infoboxes } from "@metreeca/specimen/clay-widgets/content/infobox.js";
import { Texts } from "@metreeca/specimen/clay-widgets/content/text.js";
import { Buttons } from "@metreeca/specimen/clay-widgets/controls/button.js";
import { Checkboxes } from "@metreeca/specimen/clay-widgets/controls/checkbox.js";
import { Choices } from "@metreeca/specimen/clay-widgets/controls/choice.js";
import { Fieldsets } from "@metreeca/specimen/clay-widgets/controls/fieldset.js";
import { Forms } from "@metreeca/specimen/clay-widgets/controls/form.js";
import { Inputs } from "@metreeca/specimen/clay-widgets/controls/input.js";
import { Labels } from "@metreeca/specimen/clay-widgets/controls/label.js";
import { Radios } from "@metreeca/specimen/clay-widgets/controls/radio.js";
import { Selects } from "@metreeca/specimen/clay-widgets/controls/select.js";
import { Switches } from "@metreeca/specimen/clay-widgets/controls/switch.js";
import { Textareas } from "@metreeca/specimen/clay-widgets/controls/textarea.js";
import { Icons } from "@metreeca/specimen/clay-widgets/glyphs/icon.js";
import { Logos } from "@metreeca/specimen/clay-widgets/glyphs/logo.js";
import { Cards } from "@metreeca/specimen/clay-widgets/layouts/card.js";
import { Stacks } from "@metreeca/specimen/clay-widgets/layouts/stack.js";
import { Strips } from "@metreeca/specimen/clay-widgets/layouts/strip.js";
import { Tabbed } from "@metreeca/specimen/clay-widgets/layouts/tabs.js";
import { Links } from "@metreeca/specimen/clay-widgets/navigation/link.js";
import { Paths } from "@metreeca/specimen/clay-widgets/navigation/path.js";
import { Contents } from "@metreeca/specimen/clay-widgets/navigation/toc.js";
import { Guards } from "@metreeca/specimen/clay-widgets/scopes/guard.js";
import { Styles } from "@metreeca/specimen/clay-widgets/scopes/style.js";
import { Triggers } from "@metreeca/specimen/clay-widgets/signals/more.js";
import { Notes } from "@metreeca/specimen/clay-widgets/signals/note.js";
import { Toasted } from "@metreeca/specimen/clay-widgets/signals/toasts.js";
import { Page, type Sample, ToolPath } from "@metreeca/specimen/index.core.js";


const samples: readonly Sample[] = [

	{ id: "tool", group: "Shells", title: "Tool", href: ToolPath },

	{ id: "stack", group: "Layouts", title: "Stack", view: <Stacks/> },
	{ id: "strip", group: "Layouts", title: "Strip", view: <Strips/> },
	{ id: "card", group: "Layouts", title: "Card", view: <Cards/> },
	{ id: "tabs", group: "Layouts", title: "Tabs", view: <Tabbed/> },

	{ id: "heading", group: "Content", title: "Heading", view: <Headings/> },
	{ id: "text", group: "Content", title: "Text", view: <Texts/> },
	{ id: "image", group: "Content", title: "Image", view: <Images/> },
	{ id: "infobox", group: "Content", title: "Infobox", view: <Infoboxes/> },
	{ id: "empty", group: "Content", title: "Empty", view: <Empties/> },

	{ id: "link", group: "Navigation", title: "Link", view: <Links/> },
	{ id: "path", group: "Navigation", title: "Path", view: <Paths/> },
	{ id: "contents", group: "Navigation", title: "Table of Contents", label: "ToC", view: <Contents/> },

	{ id: "form", group: "Controls", title: "Form", view: <Forms/> },
	{ id: "fieldset", group: "Controls", title: "Fieldset", view: <Fieldsets/> },
	{ id: "label", group: "Controls", title: "Label", view: <Labels/> },
	{ id: "input", group: "Controls", title: "Input", view: <Inputs/> },
	{ id: "textarea", group: "Controls", title: "Textarea", view: <Textareas/> },
	{ id: "select", group: "Controls", title: "Select", view: <Selects/> },
	{ id: "radio", group: "Controls", title: "Radio", view: <Radios/> },
	{ id: "checkbox", group: "Controls", title: "Checkbox", view: <Checkboxes/> },
	{ id: "switch", group: "Controls", title: "Switch", view: <Switches/> },
	{ id: "button", group: "Controls", title: "Button", view: <Buttons/> },
	{ id: "choice", group: "Controls", title: "Choice", view: <Choices/> },

	{ id: "toasts", group: "Signals", title: "Toasts", view: <Toasted/> },
	{ id: "note", group: "Signals", title: "Note", view: <Notes/> },
	{ id: "more", group: "Signals", title: "More", view: <Triggers/> },

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
			this page is a live widget, laid out in a tool shell; the shells listed first in the outline open on screens
			of their own.
		</>}

		samples={samples}

	/>;

}

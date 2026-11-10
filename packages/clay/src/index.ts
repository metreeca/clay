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
 * Preact contexts and hooks.
 *
 * Provides what the app states about itself, so a component carries the app identity wherever it is assembled without
 * being handed it. Also provides the element the app renders into, already fitted to the page, so a screen that fills
 * the window needs no root of its own. Tells which keys and presses belong to a field, so a widget handling them over
 * its surface leaves the fields it holds working as usual. The package contexts and hooks come from their own modules,
 * so a component imports only the ones it is wired to, and an app pulls in no service it never provides.
 *
 * Importing this module needs no DOM. The app identity is read from the document on first access, so a test or a
 * server render reading it has to supply a DOM first, already carrying the title and tags the app states itself by.
 *
 * @module index
 */

import { type Optional } from "@metreeca/core";
import { resolve } from "@metreeca/core/resource";
import { immutable } from "@metreeca/core/values";


/**
 * Matches the fields that keep their keys and presses for moving a caret or changing a value: enabled text and value
 * controls, native or carrying a matching ARIA role, and editable regions such as rich text editors.
 */
const Fields = `
	input:not(
		[disabled],
		[type=button],
		[type=checkbox],
		[type=color],
		[type=file],
		[type=image],
		[type=radio],
		[type=reset],
		[type=submit]
	),
	select:not([disabled]),
	textarea:not([disabled]),
	[contenteditable]:not([contenteditable=false]),
	[role~=combobox],
	[role~=scrollbar],
	[role~=searchbox],
	[role~=slider],
	[role~=spinbutton],
	[role~=textbox]
`.replace(
	/\s+/g, " "
);


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Holds each entry of {@link app}, once first read.
 */
const cache: {

	root?: string
	base?: string

	name?: string
	icon?: string
	info?: string
	copy?: string

} = {};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * What the app says about itself, as its document states it.
 *
 * Read on first access and immutable thereafter, so a later edit to the document is never picked up.
 */
export const app = immutable({

	/**
	 * The absolute root URL of the site, with a trailing slash.
	 */
	get root(): string {
		return cache.root ??= resolve(location.href, "/");
	},

	/**
	 * The absolute base URL the app is published at, with a trailing slash, as `<base>` states it, or the site root.
	 */
	get base(): string {
		return cache.base ??= resolve(app.root, (document.querySelector("base")?.href || "/").replace(/\/*$/, "/"));
	},


	/**
	 * The app name, as the `<title>` tag states it, or `undefined` if the tag is missing or empty.
	 */
	get name(): Optional<string> {
		return "name" in cache ? cache.name : cache.name = document.title || undefined;
	},

	/**
	 * The URL of the app icon, as the `<link rel="icon">` tag states it, or `undefined` if the tag is missing.
	 */
	get icon(): Optional<string> {
		return "icon" in cache ? cache.icon
			: cache.icon = document.querySelector<HTMLLinkElement>("link[rel=icon]")?.href || undefined;
	},

	/**
	 * The app description, as the `<meta name="description">` tag states it, or `undefined` if missing or empty.
	 */
	get info(): Optional<string> {
		return "info" in cache ? cache.info
			: cache.info = document.querySelector<HTMLMetaElement>("meta[name=description]")?.content || undefined;
	},

	/**
	 * The app copyright, as the `<meta name="copyright">` tag states it, or `undefined` if missing or empty.
	 */
	get copy(): Optional<string> {
		return "copy" in cache ? cache.copy
			: cache.copy = document.querySelector<HTMLMetaElement>("meta[name=copyright]")?.content || undefined;
	}

});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Checks whether an event is reserved for the field it lands in.
 *
 * A widget handling keys or presses on its own, for example moving the focus with arrow keys or dragging an item by
 * its surface, leaves reserved events alone. A field inside the widget then keeps the keys and presses that move its
 * caret or change its value, and works there as it does anywhere else on the page.
 *
 * Fields are enabled text and value controls, native or carrying a matching ARIA role, and editable regions. Buttons,
 * checkboxes, radio buttons and the other controls acting on a single press are not fields.
 *
 * @param event The key or pointer event to check
 *
 * @returns true if `event` targets a field or an element inside one; false otherwise
 */
export function isReserved(event: Event): boolean {

	return event.target instanceof Element && event.target.closest(Fields) !== null;

}

/**
 * Settles the custom element a page is rendered into.
 *
 * Hands out a stable root for a rendering call: the same element answers every call naming it, so that repeated
 * calls, as issued on hot reload, replace the page rather than adding another copy of it.
 *
 * An element created here takes the height of whatever holds it and stretches the frame rendered into it across its
 * whole box, so the frame fills the page rather than standing as tall as its content: an app states once, in its own
 * document, that the body is as tall as the window, and gets a root already fitted to it. An element the document
 * already carries is handed back as it stands, leaving its layout to the app that placed it.
 *
 * @param name The name of the hosting custom element, hyphenated as the DOM requires
 *
 * @returns The element named `name`, appended to the body and fitted to it unless the document already carries one
 */
export function host(name: string): Element {

	return document.querySelector(name) ?? fitted(document.body.appendChild(document.createElement(name)));


	// the root is styled here rather than in a stylesheet, its name being the caller's and so unknown to any rule

	function fitted(element: Element): Element {

		element.setAttribute("style", "display: grid; grid-template: minmax(0, 1fr) / minmax(0, 1fr); height: 100%");

		return element;

	}

}

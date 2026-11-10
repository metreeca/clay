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

import { describe, expect, it } from "vitest";

import { app, host, isReserved } from "./index.js";


describe("app", () => {

	it("reads the document on first access rather than on import", async () => {

		document.title = "Clay Late";

		expect(app.name).toBe("Clay Late");

	});

	it("keeps the first reading", async () => {

		document.title = "Clay Later";

		expect(app.name).toBe("Clay Late");

	});

	it("keeps a missing entry missing", async () => {

		expect(app.icon).toBeUndefined();

		document.head.appendChild(Object.assign(document.createElement("link"), { rel: "icon", href: "/icon.svg" }));

		expect(app.icon).toBeUndefined();

	});

});

describe("isReserved", () => {

	function dispatched(target: EventTarget): Event {

		const event = new Event("keydown");

		target.dispatchEvent(event);

		return event;

	}

	function target(html: string): Element {

		const host = document.createElement("div");

		host.innerHTML = html;

		return host.querySelector("[data-target]")!; // test harness: markup carries the target
	}


	it.each([
		"<input data-target>",
		"<input type='search' data-target>",
		"<select data-target></select>",
		"<textarea data-target></textarea>",
		"<div contenteditable data-target></div>",
		"<div contenteditable><span data-target></span></div>",
		"<div role='textbox' data-target></div>",
		"<div role='combobox' data-target></div>"
	])("reserves an event landing in a field: %s", html => {
		expect(isReserved(dispatched(target(html)))).toBeTruthy();
	});

	it.each([
		"<button data-target></button>",
		"<input disabled data-target>",
		"<input type='checkbox' data-target>",
		"<input type='button' data-target>",
		"<div contenteditable='false' data-target></div>",
		"<div role='button' data-target></div>"
	])("leaves an event landing outside fields: %s", html => {
		expect(isReserved(dispatched(target(html)))).toBeFalsy();
	});

	it("leaves an event with no element target", () => {
		expect(isReserved(new Event("keydown"))).toBeFalsy();
		expect(isReserved(dispatched(new EventTarget()))).toBeFalsy();
	});

});

describe("host", () => {

	it("creates the hosting element", () => {

		const element = host("clay-created");

		expect(element.tagName.toLowerCase()).toBe("clay-created");
		expect(element.parentElement).toBe(document.body);

	});

	it("hands out an existing hosting element", () => {

		const element = host("clay-existing");

		expect(host("clay-existing")).toBe(element);
		expect(document.querySelectorAll("clay-existing")).toHaveLength(1);

	});

	it("hands the element it creates the height to fill and stretches what it holds in both axes", () => {

		expect(host("clay-filled").getAttribute("style")).toBe(
			"display: grid; grid-template: minmax(0, 1fr) / minmax(0, 1fr); height: 100%"
		);

	});

	it("leaves an element the document already carries as it stands", () => {

		document.body.appendChild(document.createElement("clay-standing"));

		expect(host("clay-standing").getAttribute("style")).toBeNull();

	});

});

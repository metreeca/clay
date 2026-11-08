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

import { type JSX, render } from "preact";
import { describe, expect, it } from "vitest";
import { Shell } from "./shell.js";


describe("Shell", () => {

	const rendered = (element: JSX.Element): null | HTMLElement => {

		const container = document.createElement("div");

		render(element, container);

		return container.querySelector<HTMLElement>(":scope > clay-shell");

	};

	const parts = (element: JSX.Element): readonly string[] =>
		Array.from(rendered(element)?.children ?? [], ({ localName }) => localName);

	const text = (shell: null | HTMLElement, selector: string): undefined | string =>
		shell?.querySelector(selector)?.textContent ?? undefined;


	const column = (shell: null | HTMLElement, name: "aside" | "main"): readonly string[] =>
		Array.from(shell?.querySelectorAll(`:scope > ${name} > *`) ?? [], ({ localName }) => localName);


	describe("frame", () => {

		it("sets the tray beside the content", async () => {

			expect(parts(<Shell tray="Tray">Content</Shell>)).toEqual(["aside", "main"]);

		});

		it("leaves out the tray for content standing on its own", async () => {

			expect(parts(<Shell main logo="Logo" tray="Tray" info="Info">Content</Shell>)).toEqual(["main"]);

		});

		it("lays each column out as a header over a body over a footer", async () => {

			const shell = rendered(<Shell logo="Logo" tray="Tray" info="Info" head="Head" foot="Foot">Content</Shell>);

			expect(column(shell, "aside")).toEqual(["header", "section", "footer"]);
			expect(column(shell, "main")).toEqual(["header", "section", "footer"]);

		});

		it("keeps the header and footer of a column standing while its opposite number holds something", async () => {

			const shell = rendered(<Shell logo="Logo" tray="Tray" foot="Foot">Content</Shell>);

			expect(column(shell, "aside")).toEqual(["header", "section", "footer"]);
			expect(column(shell, "main")).toEqual(["header", "section", "footer"]);

		});

		it("leaves out the headers and the footers when neither column has anything for them", async () => {

			const shell = rendered(<Shell tray="Tray">Content</Shell>);

			expect(column(shell, "aside")).toEqual(["section"]);
			expect(column(shell, "main")).toEqual(["section"]);

		});

	});

	describe("tray header", () => {

		it("sets the mark at its start and the meta at its end", async () => {

			const shell = rendered(<Shell logo="Logo" meta="Meta">Content</Shell>);

			expect(Array.from(shell?.querySelectorAll(":scope > aside > header > *") ?? [], node => node.textContent))
				.toEqual(["Logo", "Meta"]);

		});

		it("holds the meta at its end with no mark before it", async () => {

			const shell = rendered(<Shell meta="Meta">Content</Shell>);

			expect(Array.from(shell?.querySelectorAll(":scope > aside > header > *") ?? [], node => node.textContent))
				.toEqual(["Meta"]);

		});

	});

	describe("tray", () => {

		it("holds the standing controls over the info", async () => {

			const shell = rendered(<Shell tray="Tray" info="Info">Content</Shell>);

			expect(text(shell, ":scope > aside > section")).toBe("Tray");
			expect(text(shell, ":scope > aside > footer")).toBe("Info");

		});

		it("takes the tray out of reach while locked", async () => {

			expect(rendered(<Shell lock tray="Tray">Content</Shell>)?.querySelector("aside")?.inert).toBe(true);
			expect(rendered(<Shell tray="Tray">Content</Shell>)?.querySelector("aside")?.inert).toBe(false);

		});

	});

	describe("content", () => {

		it("holds the content and the notice closing it", async () => {

			const shell = rendered(<Shell copy="Copy">Content</Shell>);

			expect(text(shell, ":scope > main > section > div")).toBe("Content");
			expect(text(shell, ":scope > main > section > footer")).toBe("Copy");

		});

		it("is named by the heading on show", async () => {

			const shell = rendered(<Shell head="Widgets">Content</Shell>);
			const main = shell?.querySelector(":scope > main");
			const title = main?.getAttribute("aria-labelledby");

			expect(title).toBeTruthy();
			expect(shell?.querySelector(`[id="${title}"]`)?.textContent).toBe("Widgets");

		});

		it("is named by the way out where one stands in place of the heading", async () => {

			const shell = rendered(<Shell head="Widgets" done="Done">Content</Shell>);
			const title = shell?.querySelector(":scope > main")?.getAttribute("aria-labelledby");

			expect(shell?.querySelector(`[id="${title}"]`)?.textContent).toBe("Done");

		});

		it("is left unnamed with no heading on show", async () => {

			expect(rendered(<Shell>Content</Shell>)?.querySelector("main")?.hasAttribute("aria-labelledby")).toBe(false);

		});

		it("takes the focus a navigation lands on without standing in the tab order", async () => {

			expect(rendered(<Shell>Content</Shell>)?.querySelector("main")?.getAttribute("tabindex")).toBe("-1");

		});

	});

	describe("content header and footer", () => {

		it("sets the heading at the start of the header and the menu at its end", async () => {

			const shell = rendered(<Shell head="Head" menu="Menu">Content</Shell>);

			expect(Array.from(shell?.querySelectorAll(":scope > main > header > *") ?? [], node => node.textContent))
				.toEqual(["Head", "Menu"]);

		});

		it("sets the foot in the footer", async () => {

			expect(text(rendered(<Shell foot="Foot">Content</Shell>), ":scope > main > footer")).toBe("Foot");

		});

	});

	describe("switches", () => {

		it("states the switches on the frame", async () => {

			const shell = rendered(<Shell lock main wide>Content</Shell>);

			expect(["locked", "main", "wide"].map(name => shell?.hasAttribute(name))).toEqual([true, true, true]);

		});

		it("leaves the switches off the frame when not set", async () => {

			const shell = rendered(<Shell>Content</Shell>);

			expect(["locked", "main", "wide"].map(name => shell?.hasAttribute(name))).toEqual([false, false, false]);

		});

	});

});

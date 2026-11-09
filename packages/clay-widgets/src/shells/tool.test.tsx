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
import { act } from "preact/test-utils";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { Tool } from "./tool.js";


describe("Tool", () => {

	/*
	 * Browsers give every element an `ontoggle` handler, popovers firing `toggle` too, and Preact listens for the
	 * lowercase event only where the element has one: happy-dom gives it to `details` alone, so it is supplied here.
	 */

	beforeAll(() => {
		if ( !("ontoggle" in HTMLElement.prototype) ) {
			Object.defineProperty(HTMLElement.prototype, "ontoggle", { value: null, writable: true });
		}
	});

	const rendered = (element: JSX.Element): HTMLElement => {

		const container = document.createElement("div");

		document.body.append(container);

		render(element, container);

		return container.querySelector<HTMLElement>(":scope > clay-tool")!;

	};

	const menu = (tool: HTMLElement) => tool.querySelector<HTMLButtonElement>(":scope > main > header > button");
	const close = (tool: HTMLElement) => tool.querySelector<HTMLButtonElement>(":scope > aside > header > button");
	const side = (tool: HTMLElement) => tool.querySelector<HTMLElement>(":scope > aside");


	describe("bodies", () => {

		it("lets the keyboard reach and scroll each body", async () => {

			const tool = rendered(<Tool tray={<p>tray</p>}>content</Tool>);

			expect(tool.querySelector<HTMLElement>(":scope > aside > div")?.tabIndex).toBe(0);
			expect(tool.querySelector<HTMLElement>(":scope > main > div")?.tabIndex).toBe(0);

		});

	});


	describe("drawer", () => {

		it("offers the side column as a popover on narrow viewports", async () => {

			const tool = rendered(<Tool tray={<p>tray</p>}>content</Tool>);

			expect(side(tool)?.getAttribute("popover")).toBe("auto");
			expect(side(tool)?.id).not.toBe("");

		});

		it("opens the side column from a menu button leading the main head", async () => {

			const tool = rendered(<Tool head={<span>title</span>}>content</Tool>);
			const button = menu(tool);

			expect(button).not.toBeNull();
			expect(button?.getAttribute("popovertarget")).toBe(side(tool)?.id);
			expect(button?.getAttribute("aria-label")).toBe("Open menu");
			expect(button?.nextElementSibling?.textContent).toBe("title");

		});

		it("closes the side column from a button closing the side head", async () => {

			const tool = rendered(<Tool meta={<span>meta</span>}>content</Tool>);
			const button = close(tool);

			expect(button).not.toBeNull();
			expect(button?.getAttribute("popovertarget")).toBe(side(tool)?.id);
			expect(button?.getAttribute("popovertargetaction")).toBe("hide");
			expect(button?.getAttribute("aria-label")).toBe("Close menu");
			expect(button?.hasAttribute("autofocus")).toBe(true);
			expect(button?.previousElementSibling?.textContent).toBe("meta");
			expect(button?.nextElementSibling).toBeNull();

		});

		it("closes the side column once a link in it is followed", async () => {

			const tool = rendered(<Tool tray={<a href="#somewhere">link</a>}>content</Tool>);
			const aside = side(tool)!;
			const toggle = vi.fn();

			Object.defineProperty(aside, "togglePopover", { value: toggle });

			act(() => { aside.querySelector("a")!.dispatchEvent(new MouseEvent("click", { bubbles: true })); });

			expect(toggle).toHaveBeenCalledWith(false);

		});

		it("leaves the side column open on a click landing elsewhere in it", async () => {

			const tool = rendered(<Tool tray={<p>text</p>}>content</Tool>);
			const aside = side(tool)!;
			const toggle = vi.fn();

			Object.defineProperty(aside, "togglePopover", { value: toggle });

			act(() => { aside.querySelector("p")!.dispatchEvent(new MouseEvent("click", { bubbles: true })); });

			expect(toggle).not.toHaveBeenCalled();

		});

		it("names the side column for assistive technology", async () => {

			expect(side(rendered(<Tool>content</Tool>))?.getAttribute("aria-label")).toBe("Menu");

		});

		it("leaves the side column out of light dismiss while it is locked", async () => {

			expect(side(rendered(<Tool lock>content</Tool>))?.getAttribute("popover")).toBe("manual");

		});

		it("disables the menu button while the side column is locked", async () => {

			expect(menu(rendered(<Tool lock>content</Tool>))?.disabled).toBe(true);
			expect(menu(rendered(<Tool>content</Tool>))?.disabled).toBe(false);

		});

		it("takes the main column out of reach while the drawer is open", async () => {

			const tool = rendered(<Tool>content</Tool>);
			const aside = side(tool)!;
			const main = tool.querySelector<HTMLElement>(":scope > main")!;

			const toggle = (state: "open" | "closed") => act(async () => {
				aside.dispatchEvent(Object.assign(new Event("toggle"), { newState: state }));
			});

			expect(main.inert).toBe(false);

			await toggle("open");

			expect(main.inert).toBe(true);

			await toggle("closed");

			expect(main.inert).toBe(false);

		});

		it("offers no menu button when the main column stands alone", async () => {

			const tool = rendered(<Tool main>content</Tool>);

			expect(menu(tool)).toBeNull();
			expect(side(tool)).toBeNull();

		});

	});

});

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
import { describe, expect, it, vi } from "vitest";
import { Tool } from "./tool.js";


describe("Tool", () => {

	const rendered = (element: JSX.Element): HTMLElement => {

		const container = document.createElement("div");

		document.body.append(container);

		render(element, container);

		return container.querySelector<HTMLElement>(":scope > clay-tool")!;

	};

	const menu = (tool: HTMLElement) => tool.querySelector<HTMLButtonElement>(":scope > main > header > button");
	const close = (tool: HTMLElement) => tool.querySelector<HTMLButtonElement>(":scope > aside > header > button");
	const side = (tool: HTMLElement) => tool.querySelector<HTMLElement>(":scope > aside");


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

		it("disables the menu button while the side column is locked", async () => {

			expect(menu(rendered(<Tool lock>content</Tool>))?.disabled).toBe(true);
			expect(menu(rendered(<Tool>content</Tool>))?.disabled).toBe(false);

		});

		it("offers no menu button when the main column stands alone", async () => {

			const tool = rendered(<Tool main>content</Tool>);

			expect(menu(tool)).toBeNull();
			expect(side(tool)).toBeNull();

		});

	});

});

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

import { Fetch, useFetch } from "@metreeca/clay/fetch";
import { type JSX, render } from "preact";
import { useEffect } from "preact/hooks";
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


	describe("main column", () => {

		it("takes the focus from code without standing in the tab order", async () => {

			expect(rendered(<Tool>content</Tool>).querySelector(":scope > main")?.getAttribute("tabindex")).toBe("-1");

		});

		it("is named by its head", async () => {

			const tool = rendered(<Tool head={<span>Projects</span>}>content</Tool>);
			const main = tool.querySelector(":scope > main")!;
			const label = main.getAttribute("aria-labelledby");

			expect(label).not.toBeNull();
			expect(document.getElementById(label!)?.textContent).toBe("Projects");

		});

		it("carries no name without a head", async () => {

			expect(rendered(<Tool>content</Tool>).querySelector(":scope > main")?.hasAttribute("aria-labelledby")).toBe(false);

		});

		it("ends its head with the menu, beside the head rather than inside it", async () => {

			const tool = rendered(<Tool head={<span>Projects</span>} menu={<button>Edit</button>}>content</Tool>);
			const header = tool.querySelector(":scope > main > header")!;
			const label = tool.querySelector(":scope > main")!.getAttribute("aria-labelledby");

			expect(header.lastElementChild?.textContent).toBe("Edit");
			expect(document.getElementById(label!)?.textContent).toBe("Projects");

		});

		it("ends its head with the menu without a head", async () => {

			const tool = rendered(<Tool menu={<button>Edit</button>}>content</Tool>);

			expect(tool.querySelector(":scope > main > header")?.lastElementChild?.textContent).toBe("Edit");

		});

	});


	describe("waiting", () => {

		function Request() {

			const fetch = useFetch();

			useEffect(() => { void fetch("https://example.org/"); }, []);

			return null;

		}

		it("marks itself busy while an exchange is in flight", async () => {

			const pending = () => new Promise<Response>(() => {});

			const container = document.createElement("div");

			await act(async () => {
				render(<Fetch fetch={pending}><Tool><Request/></Tool></Fetch>, container);
			});

			expect(container.querySelector("clay-tool")?.getAttribute("aria-busy")).toBe("true");

		});

		it("takes both columns out of reach while an exchange is in flight", async () => {

			const pending = () => new Promise<Response>(() => {});

			const container = document.createElement("div");

			await act(async () => {
				render(<Fetch fetch={pending}><Tool><Request/></Tool></Fetch>, container);
			});

			expect(container.querySelector<HTMLElement>("clay-tool > aside")?.inert).toBe(true);
			expect(container.querySelector<HTMLElement>("clay-tool > main")?.inert).toBe(true);

		});

		it("shows a turning mark only while an exchange is in flight", async () => {

			const pending = () => new Promise<Response>(() => {});

			const container = document.createElement("div");

			await act(async () => {
				render(<Fetch fetch={pending}><Tool><Request/></Tool></Fetch>, container);
			});

			expect(container.querySelector("clay-tool > main > header > .busy svg")).not.toBeNull();
			expect(rendered(<Tool>content</Tool>).querySelector(".busy")).toBeNull();

		});

		it("keeps the menu in place beside the turning mark while an exchange is in flight", async () => {

			const pending = () => new Promise<Response>(() => {});

			const container = document.createElement("div");

			await act(async () => {
				render(<Fetch fetch={pending}><Tool menu={<button>Edit</button>}><Request/></Tool></Fetch>, container);
			});

			expect(container.querySelector("clay-tool > main > header > .menu")?.textContent).toBe("Edit");
			expect(container.querySelector("clay-tool > main > header > .busy")).not.toBeNull();

		});

		it("is not busy while no exchange is in flight", async () => {

			expect(rendered(<Tool>content</Tool>).getAttribute("aria-busy")).not.toBe("true");

		});

	});


	describe("bars", () => {

		it("renders no feet when neither column has anything for them", async () => {

			expect(rendered(<Tool>content</Tool>).querySelector(":scope > * > footer")).toBeNull();

		});

		it("renders both feet when either column has something for them", async () => {

			expect(rendered(<Tool foot={<span>foot</span>}>content</Tool>).querySelectorAll(":scope > * > footer").length).toBe(2);

		});

	});


	describe("copy", () => {

		it("closes the main body with the copy, after the content", async () => {

			const body = rendered(<Tool copy={<span>© Metreeca</span>}><p>content</p></Tool>)
				.querySelector(":scope > main > div")!;

			expect(body.lastElementChild?.tagName).toBe("FOOTER");
			expect(body.lastElementChild?.textContent).toBe("© Metreeca");
			expect(body.firstElementChild?.textContent).toBe("content");

		});

		it("adds nothing to the main body without a copy", async () => {

			expect(rendered(<Tool>content</Tool>).querySelector(":scope > main > div > footer")).toBeNull();

		});

	});


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

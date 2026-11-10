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
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
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

	/*
	 * The viewport switch Skin turns on from the medium width up, stated on the root element as the design system does,
	 * and left unset by default, so each test starts from the narrow layout the switch falls back to below that width.
	 */

	const viewport = (medium: boolean) => medium
		? document.documentElement.style.setProperty("--skin--viewport-medium", "on")
		: document.documentElement.style.removeProperty("--skin--viewport-medium");

	// every rendered root numbers its ids alike, so a shell left over from an earlier test would answer id lookups

	afterEach(() => {
		viewport(false);
		vi.unstubAllGlobals();
		document.body.replaceChildren();
	});


	describe("heading", () => {

		// looked up within the shell, as every rendered root numbers its ids alike

		const heading = (tool: HTMLElement) => tool.querySelector(
			`[id="${tool.querySelector(":scope > main")?.getAttribute("aria-labelledby")}"]`
		);

		it("stands in the main head where two columns fit", async () => {

			viewport(true);

			const tool = rendered(<Tool head={<span>Projects</span>} menu={<button>Edit</button>}>content</Tool>);

			expect(heading(tool)?.parentElement).toBe(tool.querySelector(":scope > main > header"));

		});

		it("opens the main body ahead of the content where two columns do not fit", async () => {

			viewport(false);

			const tool = rendered(<Tool head={<span>Projects</span>} menu={<button>Edit</button>}>content</Tool>);
			const body = tool.querySelector(":scope > main > div")!;

			expect(heading(tool)?.textContent).toBe("Projects");
			expect(body.firstElementChild).toBe(heading(tool));
			expect(body.firstElementChild?.nextElementSibling?.textContent).toBe("content");

		});

		it("leaves the menu button and the menu in the main head where two columns do not fit", async () => {

			viewport(false);

			const tool = rendered(<Tool head={<span>Projects</span>} menu={<button>Edit</button>}>content</Tool>);
			const header = tool.querySelector(":scope > main > header")!;

			expect(header.textContent).not.toContain("Projects");
			expect(menu(tool)?.parentElement).toBe(header);
			expect(header.lastElementChild?.textContent).toBe("Edit");

		});

		it("follows the viewport across the threshold", async () => {

			const resized: Array<() => void> = []; // test harness: collects the observer callbacks the shell registers

			vi.stubGlobal("ResizeObserver", class {
				constructor(callback: () => void) { resized.push(callback); }
				observe() {}
				disconnect() {}
			});

			viewport(false);

			const container = document.createElement("div");

			document.body.append(container);

			await act(async () => { render(<Tool head={<span>Projects</span>}>content</Tool>, container); });

			const tool = container.querySelector<HTMLElement>(":scope > clay-tool")!;

			const resize = (medium: boolean) => act(async () => {
				viewport(medium);
				resized.forEach(callback => callback());
			});

			await resize(true);

			expect(heading(tool)?.parentElement).toBe(tool.querySelector(":scope > main > header"));

			await resize(false);

			expect(heading(tool)?.parentElement).toBe(tool.querySelector(":scope > main > div"));

		});

	});


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

		beforeEach(() => { vi.useFakeTimers(); });
		afterEach(() => { vi.useRealTimers(); });

		const container = () => {

			const container = document.createElement("div");

			document.body.append(container);

			return container;

		};

		const shell = (busy: boolean) => <Tool busy={busy} menu={<button>Edit</button>}><input/></Tool>;

		const show = (container: HTMLElement, busy: boolean) => act(async () => { render(shell(busy), container); });
		const elapse = () => act(async () => { vi.runOnlyPendingTimers(); });

		const waiting = async (busy: boolean) => {

			const root = container();

			await show(root, busy);
			await elapse();

			return root.querySelector<HTMLElement>("clay-tool")!;

		};

		it("marks itself busy while the app is busy", async () => {

			expect((await waiting(true)).getAttribute("aria-busy")).toBe("true");

		});

		it("takes both columns out of reach while the app is busy", async () => {

			const tool = await waiting(true);

			expect(tool.querySelector<HTMLElement>(":scope > aside")?.inert).toBe(true);
			expect(tool.querySelector<HTMLElement>(":scope > main")?.inert).toBe(true);

		});

		it("shows a turning mark only while the app is busy", async () => {

			expect((await waiting(true)).querySelector(":scope > main > header > .busy svg")).not.toBeNull();
			expect((await waiting(false)).querySelector(".busy")).toBeNull();

		});

		it("keeps the menu in place beside the turning mark while the app is busy", async () => {

			const tool = await waiting(true);

			expect(tool.querySelector(":scope > main > header > .menu")?.textContent).toBe("Edit");
			expect(tool.querySelector(":scope > main > header > .busy")).not.toBeNull();

		});

		it("is not busy while the app is idle", async () => {

			expect((await waiting(false)).getAttribute("aria-busy")).not.toBe("true");

		});

		it("ignores the exchanges of the shared client", async () => {

			function Request() {

				const fetch = useFetch();

				useEffect(() => { void fetch("https://example.org/"); }, []);

				return null;

			}

			const root = container();

			await act(async () => {
				render(<Fetch fetch={() => new Promise<Response>(() => {})}><Tool><Request/></Tool></Fetch>, root);
			});

			await elapse();

			expect(root.querySelector("clay-tool")?.getAttribute("aria-busy")).not.toBe("true");

		});


		describe("delay", () => {

			it("states waiting only once the delay has elapsed", async () => {

				const root = container();

				await show(root, true);

				expect(root.querySelector("clay-tool")?.getAttribute("aria-busy")).not.toBe("true");

				await elapse();

				expect(root.querySelector("clay-tool")?.getAttribute("aria-busy")).toBe("true");

			});

			it("ends waiting only once the delay has elapsed", async () => {

				const root = container();

				await show(root, true);
				await elapse();
				await show(root, false);

				expect(root.querySelector("clay-tool")?.getAttribute("aria-busy")).toBe("true");

				await elapse();

				expect(root.querySelector("clay-tool")?.getAttribute("aria-busy")).not.toBe("true");

			});

			it("takes both columns out of reach at once, ahead of the delay", async () => {

				const root = container();

				await show(root, true);

				expect(root.querySelector<HTMLElement>("clay-tool > aside")?.inert).toBe(true);
				expect(root.querySelector<HTMLElement>("clay-tool > main")?.inert).toBe(true);

			});

			it("brings both columns back within reach at once, ahead of the delay", async () => {

				const root = container();

				await show(root, true);
				await elapse();
				await show(root, false);

				expect(root.querySelector<HTMLElement>("clay-tool > aside")?.inert).toBe(false);
				expect(root.querySelector<HTMLElement>("clay-tool > main")?.inert).toBe(false);

			});

			it("shows nothing for a stretch shorter than the delay", async () => {

				const root = container();

				await show(root, true);
				await show(root, false);
				await elapse();

				expect(root.querySelector("clay-tool")?.getAttribute("aria-busy")).not.toBe("true");

			});

		});


		describe("focus", () => {

			/*
			 * A browser moves the focus out of a column turned inert, which happy-dom leaves where it stands, so the move
			 * is stated by blurring the control once the columns are out of reach, as a browser leaves it on the page.
			 */

			const started = async () => {

				const root = container();

				await show(root, false);

				const field = root.querySelector("input")!;

				field.focus();

				await show(root, true);

				field.blur();

				return { root, field };

			};

			const ended = async (root: HTMLElement) => {
				await show(root, false);
			};

			it("gives the focus back to the control holding it as waiting started", async () => {

				const { root, field } = await started();

				await ended(root);

				expect(document.activeElement).toBe(field);

			});

			it("moves the focus to the main column once the control holding it is gone", async () => {

				const { root, field } = await started();

				field.remove();

				await ended(root);

				expect(document.activeElement).toBe(root.querySelector("clay-tool > main"));

			});

			it("leaves the focus where it was moved while waiting", async () => {

				const outside = document.createElement("button");

				document.body.append(outside);

				const { root } = await started();

				outside.focus();

				await ended(root);

				expect(document.activeElement).toBe(outside);

			});

		});

	});


	describe("bars", () => {

		it("renders no feet when neither column has anything for them", async () => {

			expect(rendered(<Tool>content</Tool>).querySelector(":scope > * > footer")).toBeNull();

		});

		it("renders the main foot alone when only the main column has something for it", async () => {

			const frame = rendered(<Tool foot={<span>foot</span>}>content</Tool>);

			expect(frame.querySelector(":scope > main > footer")).not.toBeNull();
			expect(frame.querySelector(":scope > aside > footer")).toBeNull();

		});

		it("renders the side foot alone when only the side column has something for it", async () => {

			const frame = rendered(<Tool more={<span>more</span>}>content</Tool>);

			expect(frame.querySelector(":scope > aside > footer")).not.toBeNull();
			expect(frame.querySelector(":scope > main > footer")).toBeNull();

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

			viewport(true);

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
			expect(button?.previousElementSibling?.textContent).toBe("meta");
			expect(button?.nextElementSibling).toBeNull();

		});

		it("moves the focus to the close button as the drawer opens", async () => {

			const tool = rendered(<Tool>content</Tool>);
			const aside = side(tool)!;
			const main = tool.querySelector<HTMLElement>(":scope > main")!;

			const toggle = (state: "open" | "closed") => act(async () => {
				aside.dispatchEvent(Object.assign(new Event("toggle"), { newState: state }));
			});

			main.focus();

			await toggle("closed");

			expect(document.activeElement).toBe(main);

			await toggle("open");

			expect(document.activeElement).toBe(close(tool));

		});

		it("leaves autofocus off the close button, which browsers flag on addresses with a fragment", async () => {

			expect(close(rendered(<Tool>content</Tool>))?.hasAttribute("autofocus")).toBe(false);

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

			expect(side(rendered(<Tool locked>content</Tool>))?.getAttribute("popover")).toBe("manual");

		});

		it("takes the focus off a control in the side column as it is locked", async () => {

			const container = document.createElement("div");

			document.body.append(container);

			const shell = (locked: boolean) => <Tool locked={locked} tray={<button>Section</button>}>content</Tool>;

			await act(async () => { render(shell(false), container); });

			const control = container.querySelector<HTMLElement>("clay-tool > aside button:not([aria-label])")!;

			control.focus();

			await act(async () => { render(shell(true), container); });

			expect(document.activeElement).not.toBe(control);

		});

		it("leaves the focus on the main column as the side column is locked", async () => {

			const container = document.createElement("div");

			document.body.append(container);

			const shell = (locked: boolean) => <Tool locked={locked}><input/></Tool>;

			await act(async () => { render(shell(false), container); });

			const field = container.querySelector("input")!;

			field.focus();

			await act(async () => { render(shell(true), container); });

			expect(document.activeElement).toBe(field);

		});

		it("disables the menu button while the side column is locked", async () => {

			expect(menu(rendered(<Tool locked>content</Tool>))?.disabled).toBe(true);
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

		it("offers no menu button while the side column is tucked away", async () => {

			const tool = rendered(<Tool tucked>content</Tool>);

			expect(menu(tool)).toBeNull();
			expect(side(tool)).toBeNull();

		});

	});

});

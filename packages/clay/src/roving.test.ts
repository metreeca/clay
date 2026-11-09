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

import { createElement, render } from "preact";
import { useState } from "preact/hooks";
import { act } from "preact/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fielded, useRoving } from "./roving.js";


describe("useRoving()", () => {

	function Group({ items, controls = items, active: initial, orientation, wrap, onMove }: {
		items: readonly string[]
		controls?: readonly string[]
		active?: string
		orientation?: "horizontal" | "vertical" | "both"
		wrap?: boolean
		onMove?: (item: string) => void
	}) {

		const [active, setActive] = useState(initial);

		const { tabIndex, onKeyDown } = useRoving({
			items, active, id: item => `item-${item}`, orientation, wrap, onMove: item => {
				onMove?.(item);
				setActive(item);
			}
		});

		return createElement("div", { id: "group", onKeyDown }, ...controls.map(item =>
			createElement("button", { key: item, id: `item-${item}`, tabIndex: tabIndex(item) }, item)
		));

	}

	function mount(props: Parameters<typeof Group>[0]): void {
		act(() => render(createElement(Group, props), document.body));
	}

	function focus(item: string): void {
		document.getElementById(`item-${item}`)!.focus(); // test harness: control rendered
	}

	function press(key: string, init: KeyboardEventInit = {}): KeyboardEvent {

		const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...init });

		act(() => { (document.activeElement ?? document.body).dispatchEvent(event); });

		return event;

	}

	function stops(): readonly string[] {
		return [...document.querySelectorAll<HTMLElement>("#group > button")]
			.filter(button => button.tabIndex === 0)
			.map(button => button.textContent ?? "");
	}

	function focused(): string {
		return document.activeElement?.textContent ?? "";
	}


	afterEach(() => {
		act(() => render(null, document.body));
	});


	describe("tabIndex", () => {

		it("holds a single stop, on the first item by default", () => {

			mount({ items: ["a", "b", "c"] });

			expect(stops()).toEqual(["a"]);

		});

		it("holds the stop on the active item", () => {

			mount({ items: ["a", "b", "c"], active: "b" });

			expect(stops()).toEqual(["b"]);

		});

		it("falls back on the first item where the active item is gone", () => {

			mount({ items: ["a", "b", "c"], active: "x" });

			expect(stops()).toEqual(["a"]);

		});

		it("holds no stop where no item is roved", () => {

			mount({ items: [], controls: ["a", "b"] });

			expect(stops()).toEqual([]);

		});

	});

	describe("onKeyDown", () => {

		it("moves the focus and the stop with the arrow keys", () => {

			mount({ items: ["a", "b", "c"] });

			focus("a");

			const event = press("ArrowRight");

			expect(event.defaultPrevented).toBeTruthy();
			expect(focused()).toBe("b");
			expect(stops()).toEqual(["b"]);

			press("ArrowUp");

			expect(focused()).toBe("a");

		});

		it("notifies the move before focusing the item", () => {

			const onMove = vi.fn(() => focused());

			mount({ items: ["a", "b", "c"], onMove });

			focus("a");
			press("ArrowRight");

			expect(onMove).toHaveBeenCalledWith("b");
			expect(onMove.mock.results[0]?.value).toBe("a");

		});

		it("reaches the ends with Home and End", () => {

			mount({ items: ["a", "b", "c"] });

			focus("a");

			press("End");
			expect(focused()).toBe("c");

			press("Home");
			expect(focused()).toBe("a");

		});

		it("stops at the ends unless wrapping", () => {

			mount({ items: ["a", "b"] });

			focus("b");

			press("ArrowRight");
			press("ArrowRight");

			expect(focused()).toBe("b");

		});

		it("comes round when wrapping", () => {

			mount({ items: ["a", "b"], wrap: true });

			focus("a");

			press("ArrowRight");
			press("ArrowRight");

			expect(focused()).toBe("a");

		});

		it("reaches the ends with Home and End even when wrapping", () => {

			mount({ items: ["a", "b", "c"], wrap: true });

			focus("b");

			press("End");
			expect(focused()).toBe("c");

			press("Home");
			expect(focused()).toBe("a");

		});

		it("steps from the first item where the active item is gone", () => {

			mount({ items: ["a", "b", "c"], active: "x" });

			focus("a");
			press("ArrowRight");

			expect(focused()).toBe("b");

		});

		it("passes over the controls left out of the items", () => {

			mount({ items: ["a", "c"], controls: ["a", "b", "c"] });

			focus("a");
			press("ArrowRight");

			expect(focused()).toBe("c");

		});

		it("moves nowhere where no item is roved", () => {

			mount({ items: [], controls: ["a", "b"] });

			focus("a");

			const event = press("ArrowRight");

			expect(event.defaultPrevented).toBeFalsy();
			expect(focused()).toBe("a");

		});

		it("leaves the keys pressed on a field to the field", () => {

			mount({ items: ["a", "b"] });

			const field = document.createElement("input");

			document.getElementById("group")!.append(field); // test harness: group rendered
			field.focus();

			const event = press("ArrowRight");

			expect(event.defaultPrevented).toBeFalsy();
			expect(document.activeElement).toBe(field);

		});

		it.each([
			"altKey",
			"ctrlKey",
			"metaKey"
		] as const)("leaves the keys pressed with %s to the browser", modifier => {

			mount({ items: ["a", "b"] });

			focus("a");

			const event = press("ArrowRight", { [modifier]: true });

			expect(event.defaultPrevented).toBeFalsy();
			expect(focused()).toBe("a");

		});

		it.each([
			["horizontal", "ArrowDown"],
			["vertical", "ArrowRight"]
		] as const)("leaves the keys of the other axis to the browser when %s", (orientation, key) => {

			mount({ items: ["a", "b"], orientation });

			focus("a");

			const event = press(key);

			expect(event.defaultPrevented).toBeFalsy();
			expect(focused()).toBe("a");

		});

	});

});

describe("fielded()", () => {

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
	])("tells a field: %s", html => {
		expect(fielded(target(html))).toBeTruthy();
	});

	it.each([
		"<button data-target></button>",
		"<input disabled data-target>",
		"<input type='checkbox' data-target>",
		"<input type='button' data-target>",
		"<div contenteditable='false' data-target></div>",
		"<div role='button' data-target></div>"
	])("tells no field: %s", html => {
		expect(fielded(target(html))).toBeFalsy();
	});

	it("tells no field for a target that is no element", () => {
		expect(fielded(null)).toBeFalsy();
		expect(fielded(new EventTarget())).toBeFalsy();
	});

});

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

import { createElement, render } from "preact";
import { useState } from "preact/hooks";
import { act } from "preact/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useFocus } from "./focus.js";


describe("useFocus()", () => {

	function Group({ wrap, orientation, items, controls = items, active: initial, onMove }: {
		wrap?: boolean
		orientation?: "horizontal" | "vertical"
		items: readonly string[]
		controls?: readonly string[]
		active?: string
		onMove?: (item: string) => void
	}) {

		const [active, setActive] = useState(initial);

		const { tabIndex, onKeyDown, onFocus } = useFocus({
			wrap, orientation, items, active, identify: item => `item-${item}`, onMove: item => {
				onMove?.(item);
				setActive(item);
			}
		});

		return createElement("div", { id: "group", onKeyDown }, ...controls.map(item =>
			createElement("button", {
				key: item, id: `item-${item}`, tabIndex: tabIndex(item), onFocus: () => onFocus(item)
			}, item)
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


	it("returns an immutable object", () => {

		expect(Object.isFrozen(useFocus({ items: ["a"], identify: item => item, onMove: () => {} }))).toBe(true);

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

	describe("onFocus", () => {

		it("moves the stop to the item focused by other means", () => {

			const onMove = vi.fn();

			mount({ items: ["a", "b", "c"], onMove });

			act(() => focus("c"));

			expect(onMove).toHaveBeenCalledExactlyOnceWith("c");
			expect(stops()).toEqual(["c"]);

		});

		it("leaves the stop as it stands where its item is focused", () => {

			const onMove = vi.fn();

			mount({ items: ["a", "b", "c"], active: "b", onMove });

			act(() => focus("b"));

			expect(onMove).not.toHaveBeenCalled();
			expect(stops()).toEqual(["b"]);

		});

	});

	describe("onKeyDown", () => {

		it("moves the focus and the stop with the arrow keys of either axis where no orientation is set", () => {

			mount({ items: ["a", "b", "c"] });

			focus("a");

			const event = press("ArrowRight");

			expect(event.defaultPrevented).toBeTruthy();
			expect(focused()).toBe("b");
			expect(stops()).toEqual(["b"]);

			press("ArrowDown");

			expect(focused()).toBe("c");

			press("ArrowLeft");

			expect(focused()).toBe("b");

			press("ArrowUp");

			expect(focused()).toBe("a");

		});

		it("notifies the move before focusing the item", () => {

			const onMove = vi.fn(() => focused());

			mount({ items: ["a", "b", "c"], onMove });

			focus("a");
			press("ArrowRight");

			expect(onMove).toHaveBeenNthCalledWith(1, "b");
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

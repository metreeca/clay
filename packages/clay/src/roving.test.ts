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
import { afterEach, describe, expect, it } from "vitest";
import { step, stop } from "./roving.core.js";
import { useRoving } from "./roving.js";


function Group({ items, orientation, wrap }: {
	items: readonly string[],
	orientation?: "horizontal" | "vertical" | "both",
	wrap?: boolean
}) {

	const [active, setActive] = useState<string>();
	const { tabIndex, onKeyDown } = useRoving({ items, active, id: item => `item-${item}`, orientation, wrap, onMove: setActive });

	return createElement("div", { id: "group", onKeyDown }, ...items.map(item =>
		createElement("button", { key: item, id: `item-${item}`, tabIndex: tabIndex(item) }, item)
	));

}

function mount(props: Parameters<typeof Group>[0]): void {
	act(() => render(createElement(Group, props), document.body));
}

function press(key: string): KeyboardEvent {

	const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });

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


describe("useRoving()", () => {

	it("holds a single stop, on the first item by default", () => {

		mount({ items: ["a", "b", "c"] });

		expect(stops()).toEqual(["a"]);

	});

	it("moves the focus and the stop with the arrow keys", () => {

		mount({ items: ["a", "b", "c"] });

		document.getElementById("item-a")!.focus(); // test harness: item rendered

		const event = press("ArrowRight");

		expect(event.defaultPrevented).toBe(true);
		expect(focused()).toBe("b");
		expect(stops()).toEqual(["b"]);

		press("ArrowUp");

		expect(focused()).toBe("a");

	});

	it("reaches the ends with Home and End", () => {

		mount({ items: ["a", "b", "c"] });

		document.getElementById("item-a")!.focus(); // test harness: item rendered

		press("End");
		expect(focused()).toBe("c");

		press("Home");
		expect(focused()).toBe("a");

	});

	it("stops at the ends unless wrapping", () => {

		mount({ items: ["a", "b"] });

		document.getElementById("item-b")!.focus(); // test harness: item rendered

		press("ArrowRight");
		press("ArrowRight");

		expect(focused()).toBe("b");

	});

	it("comes round when wrapping", () => {

		mount({ items: ["a", "b"], wrap: true });

		document.getElementById("item-a")!.focus(); // test harness: item rendered

		press("ArrowRight");
		press("ArrowRight");

		expect(focused()).toBe("a");

	});

	it("leaves the keys pressed on a field to the field", () => {

		mount({ items: ["a", "b"] });

		const field = document.createElement("input");

		document.getElementById("group")!.append(field); // test harness: group rendered
		field.focus();

		const event = press("ArrowRight");

		expect(event.defaultPrevented).toBe(false);
		expect(document.activeElement).toBe(field);

	});

	it("leaves the keys of the other axis to the browser", () => {

		mount({ items: ["a", "b"], orientation: "horizontal" });

		document.getElementById("item-a")!.focus(); // test harness: item rendered

		const event = press("ArrowDown");

		expect(event.defaultPrevented).toBe(false);
		expect(focused()).toBe("a");

	});

});


const items = ["a", "b", "c"];


describe("stop()", () => {

	it("keeps the active item", () => {
		expect(stop(items, "b")).toBe("b");
	});

	it("falls back on the first item", () => {
		expect(stop(items, undefined)).toBe("a");
		expect(stop(items, "x")).toBe("a");
	});

	it("holds no stop in an empty group", () => {
		expect(stop([], "a")).toBeUndefined();
	});

});

describe("step()", () => {

	it("steps forwards and backwards", () => {
		expect(step(items, "a", +1, false)).toBe("b");
		expect(step(items, "c", -1, false)).toBe("b");
	});

	it("stops at the ends unless wrapping", () => {
		expect(step(items, "c", +1, false)).toBe("c");
		expect(step(items, "a", -1, false)).toBe("a");
	});

	it("comes round when wrapping", () => {
		expect(step(items, "c", +1, true)).toBe("a");
		expect(step(items, "a", -1, true)).toBe("c");
	});

	it("reaches the ends", () => {
		expect(step(items, "b", +Infinity, true)).toBe("c");
		expect(step(items, "b", -Infinity, true)).toBe("a");
	});

	it("steps from the stop where the active item is gone", () => {
		expect(step(items, "x", +1, false)).toBe("b");
	});

	it("steps nowhere in an empty group", () => {
		expect(step([], "a", +1, true)).toBeUndefined();
	});

});

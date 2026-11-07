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

import { type ComponentChildren, createElement, render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { accepts, announcement, edge, milliseconds, settle } from "./transfer.core.js";
import { type Drop, type Outcome, Transfer, useSource, useTarget } from "./transfer.js";


const Card = "application/x-card";

type SourceState = ReturnType<typeof useSource>;
type TargetState = ReturnType<typeof useTarget>;

const sources = new Map<string, SourceState>();
const targets = new Map<string, TargetState>();


function Item({ id, type = Card }: { id: string, type?: string }) {

	sources.set(id, useSource({ id, name: `Item ${id}`, element: `item-${id}`, type, data: { id } }));

	return createElement("div", { id: `item-${id}` }, `Item ${id}`);

}

function Zone({ id, accept = [Card], edges, onDrop }: {
	id: string,
	accept?: readonly string[],
	edges?: boolean,
	onDrop?: (drop: Drop) => Outcome
}) {

	targets.set(id, useTarget({ id, name: `Zone ${id}`, element: `zone-${id}`, data: { zone: id }, accept, edges, onDrop }));

	return createElement("div", { id: `zone-${id}` });

}

function mount(...children: ComponentChildren[]): void {
	act(() => render(createElement(Transfer, {}, ...children), document.body));
}

function source(id: string): SourceState {
	return sources.get(id)!; // test harness: Item has rendered
}

function target(id: string): TargetState {
	return targets.get(id)!; // test harness: Zone has rendered
}

function status(): string {
	return document.querySelector("[role='status']")?.textContent ?? "";
}

function drag(type: string, element: string, transfer: DataTransfer): Event {

	const event = new Event(type, { bubbles: true, cancelable: true });

	Object.defineProperties(event, {
		dataTransfer: { value: transfer },
		clientX: { value: 0 },
		clientY: { value: 0 },
		relatedTarget: { value: null }
	});

	act(() => { document.getElementById(element)!.dispatchEvent(event); }); // test harness: element rendered

	return event;

}

/**
 * Waits past the frame an announcement lands in.
 */
async function flush(): Promise<void> {
	await act(async () => { await new Promise(resolve => setTimeout(resolve, 50)); });
}


/*
 * The test environment draws no drag image, and reports setDragImage as not implemented.
 */

beforeEach(() => {
	vi.spyOn(DataTransfer.prototype, "setDragImage").mockImplementation(() => {});
});

afterEach(() => {
	vi.restoreAllMocks();
	act(() => render(null, document.body));
	sources.clear();
	targets.clear();
});


describe("useSource()", () => {

	it("stays inert outside a Transfer context", async () => {

		act(() => render(createElement(Item, { id: "a" }), document.body));

		expect(source("a").targets).toEqual([]);
		await expect(source("a").move("x")).resolves.toBe(false);

	});

	it("lists the targets taking its type, itself excluded", () => {

		mount(
			createElement(Item, { id: "a" }),
			createElement(Zone, { id: "x" }),
			createElement(Zone, { id: "y", accept: ["text/plain"] }),
			createElement(Zone, { id: "z", accept: ["APPLICATION/X-CARD"] })
		);

		expect(source("a").targets).toEqual([{ id: "x", name: "Zone x" }, { id: "z", name: "Zone z" }]);

	});

	it("moves to a target from a menu", async () => {

		const onDrop = vi.fn<(drop: Drop) => Outcome>();

		mount(createElement(Item, { id: "a" }), createElement(Zone, { id: "x", onDrop }));

		let taken: boolean | undefined;

		await act(async () => { taken = await source("a").move("x", "before"); });

		expect(taken).toBe(true);
		expect(onDrop).toHaveBeenCalledWith({
			source: { id: "a", type: Card, data: { id: "a" } },
			target: { id: "x", data: { zone: "x" } }
		});
		await flush();
		expect(status()).toBe("Item a moved to Zone x.");

	});

	it("moves next to a target taking edges from a menu", async () => {

		const onDrop = vi.fn<(drop: Drop) => Outcome>();

		mount(createElement(Item, { id: "a" }), createElement(Zone, { id: "x", edges: true, onDrop }));

		await act(async () => { await source("a").move("x", "before"); });

		expect(onDrop).toHaveBeenCalledWith({
			source: { id: "a", type: Card, data: { id: "a" } },
			target: { id: "x", data: { zone: "x" } },
			edge: "before"
		});
		await flush();
		expect(status()).toBe("Item a moved before Zone x.");

	});

	it("refuses moves to targets not taking its type", async () => {

		const onDrop = vi.fn<(drop: Drop) => Outcome>();

		mount(createElement(Item, { id: "a" }), createElement(Zone, { id: "x", accept: ["text/plain"], onDrop }));

		await expect(source("a").move("x")).resolves.toBe(false);
		expect(onDrop).not.toHaveBeenCalled();

	});

	it("announces refusals", async () => {

		mount(createElement(Item, { id: "a" }), createElement(Zone, { id: "x", onDrop: () => false }));

		let taken: boolean | undefined;

		await act(async () => { taken = await source("a").move("x"); });

		expect(taken).toBe(false);
		await flush();
		expect(status()).toBe("Moving Item a to Zone x was refused.");

	});

	it("waits for pending moves on both ends", async () => {

		let release: (value: boolean) => void = () => {};

		mount(createElement(Item, { id: "a" }), createElement(Zone, {
			id: "x", onDrop: () => new Promise<boolean>(resolve => { release = resolve; })
		}));

		let moving: Promise<boolean> = Promise.resolve(false);

		act(() => { moving = source("a").move("x"); });

		expect(source("a").pending).toBe(true);
		expect(target("x").pending).toBe(true);

		await act(async () => {
			release(false);
			await moving;
		});

		expect(source("a").pending).toBe(false);
		expect(target("x").pending).toBe(false);
		await flush();
		expect(status()).toBe("Moving Item a to Zone x was refused.");

	});

});

describe("useTarget()", () => {

	it("meets items it takes while dragged over", () => {

		const onDrop = vi.fn<(drop: Drop) => Outcome>();

		mount(createElement(Item, { id: "a" }), createElement(Zone, { id: "x", onDrop }));

		const transfer = new DataTransfer();

		drag("dragstart", "item-a", transfer);

		expect(source("a").dragging).toBe(true);
		expect(transfer.getData(Card)).toBe("a");

		const over = drag("dragover", "zone-x", transfer);

		expect(over.defaultPrevented).toBe(true);
		expect(target("x").target).toBe(true);
		expect(target("x").edge).toBeUndefined();

		drag("drop", "zone-x", transfer);
		drag("dragend", "item-a", transfer);

		expect(target("x").target).toBe(false);
		expect(source("a").dragging).toBe(false);
		expect(onDrop).toHaveBeenCalledWith({
			source: { id: "a", type: Card, data: { id: "a" } },
			target: { id: "x", data: { zone: "x" } }
		});

	});

	it("tells the edge an item is dragged nearest, if taking edges", () => {

		const onDrop = vi.fn<(drop: Drop) => Outcome>();

		mount(createElement(Item, { id: "a" }), createElement(Zone, { id: "x", edges: true, onDrop }));

		const transfer = new DataTransfer();

		drag("dragstart", "item-a", transfer);
		drag("dragover", "zone-x", transfer);

		expect(target("x").edge).toBe("after"); // the test environment lays out no box, so every point falls after

		drag("drop", "zone-x", transfer);

		expect(onDrop).toHaveBeenCalledWith(expect.objectContaining({ edge: "after" }));

	});

	it("ignores types it does not take", () => {

		mount(createElement(Zone, { id: "x" }));

		const transfer = new DataTransfer();

		transfer.setData("text/plain", "text");

		const over = drag("dragover", "zone-x", transfer);

		expect(over.defaultPrevented).toBe(false);
		expect(target("x").target).toBe(false);

	});

	it("takes outside content of the types it accepts", () => {

		const onDrop = vi.fn<(drop: Drop) => Outcome>();

		mount(createElement(Zone, { id: "x", accept: ["text/uri-list"], onDrop }));

		const transfer = new DataTransfer();

		transfer.setData("text/uri-list", "https://example.com/");
		transfer.setData("text/plain", "ignored");

		drag("drop", "zone-x", transfer);

		expect(onDrop).toHaveBeenCalledWith({
			files: [],
			strings: { "text/uri-list": "https://example.com/" },
			target: { id: "x", data: { zone: "x" } }
		});

	});

});


describe("accepts()", () => {

	it("takes a shared type", () => {
		expect(accepts(["application/x-card", "Files"], ["Files"])).toBe(true);
	});

	it("compares types regardless of case", () => {
		expect(accepts(["application/x-Card"], ["application/x-card"])).toBe(true);
		expect(accepts(["Files"], ["files"])).toBe(true);
	});

	it("refuses disjoint types", () => {
		expect(accepts(["application/x-card"], ["text/plain"])).toBe(false);
		expect(accepts([], ["text/plain"])).toBe(false);
	});

});

describe("edge()", () => {

	const box = { top: 100, height: 40 };

	it("locates the upper half before", () => {
		expect(edge(box, 100)).toBe("before");
		expect(edge(box, 119)).toBe("before");
	});

	it("locates the lower half after", () => {
		expect(edge(box, 120)).toBe("after");
		expect(edge(box, 140)).toBe("after");
	});

});

describe("settle()", () => {

	it("takes nothing as taken", async () => {
		await expect(settle(undefined)).resolves.toBe(true);
		await expect(settle(true)).resolves.toBe(true);
	});

	it("takes false as refused", async () => {
		await expect(settle(false)).resolves.toBe(false);
	});

	it("follows promises", async () => {
		await expect(settle(Promise.resolve())).resolves.toBe(true);
		await expect(settle(Promise.resolve(false))).resolves.toBe(false);
	});

	it("takes rejections, passing them on unhandled", async () => {

		const error = new Error("failed");
		const rejected = Promise.reject(error);

		/*
		 * The rejection passed on is intercepted, or the test runner would take it as a failure of the suite.
		 */

		const reject = vi.spyOn(Promise, "reject").mockImplementation(() => new Promise(() => {}));

		try {

			await expect(settle(rejected)).resolves.toBe(true);

			expect(reject).toHaveBeenCalledWith(error);

		} finally {

			reject.mockRestore();

		}

	});

});

describe("announcement()", () => {

	it("tells a move taken", () => {
		expect(announcement("Fix login", "Done", true)).toBe("Fix login moved to Done.");
	});

	it("tells a move refused", () => {
		expect(announcement("Fix login", "Done", false)).toBe("Moving Fix login to Done was refused.");
	});

	it("tells the side a move landed on", () => {
		expect(announcement("Ship it", "Test", true, "before")).toBe("Ship it moved before Test.");
		expect(announcement("Ship it", "Test", false, "after")).toBe("Moving Ship it after Test was refused.");
	});

});

describe("milliseconds()", () => {

	it("reads milliseconds", () => {
		expect(milliseconds("200ms")).toBe(200);
	});

	it("reads seconds", () => {
		expect(milliseconds("0.2s")).toBe(200);
		expect(milliseconds(" 1S ")).toBe(1000);
	});

	it("reads anything else as no time", () => {
		expect(milliseconds("")).toBe(0);
		expect(milliseconds("200")).toBe(0);
		expect(milliseconds("fast")).toBe(0);
	});

});

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
import { type Drop, type Outcome, Transfer, useSource, useTarget } from "./transfer.js";


const Card = "application/x-card";

type SourceState = ReturnType<typeof useSource>;
type TargetState = ReturnType<typeof useTarget>;

const sources = new Map<string, SourceState>();
const targets = new Map<string, TargetState>();


/**
 * An item bound as a source and rendered as `item-<id>`, holding, where asked for, a grip rendered as `grip-<id>`, a
 * focus button rendered as `focus-<id>` and a text field rendered as `field-<id>`, which presses are reserved for.
 */
function Item({ id, type = Card, handle = false, focus = false, field = false, payload, at }: {
	id: string
	type?: string
	handle?: boolean
	focus?: boolean
	field?: boolean
	payload?: Readonly<Record<string, string>>
	at?: number
}) {

	const element = `item-${id}`;

	sources.set(id, useSource({
		id, name: `Item ${id}`, element,
		handle: handle ? `grip-${id}` : undefined,
		focus: focus ? `focus-${id}` : undefined,
		type, data: { id }, payload
	}));

	return createElement("div", { id: element, "data-at": at, style: { "--skin--duration-normal": "0.2s" } },
		`Item ${id}`,
		handle ? createElement("span", { id: `grip-${id}` }) : null,
		focus ? createElement("button", { id: `focus-${id}` }) : null,
		field ? createElement("input", { id: `field-${id}` }) : null
	);

}

/**
 * A zone bound as a target, rendered as `zone-<id>`.
 */
function Zone({ id, accept = [Card], edges, onDrop, at, children }: {
	id: string
	accept?: readonly string[]
	edges?: boolean
	onDrop?: (drop: Drop) => Outcome
	at?: number
	children?: ComponentChildren
}) {

	targets.set(id, useTarget({ id, name: `Zone ${id}`, element: `zone-${id}`, data: { zone: id }, accept, edges, onDrop }));

	return createElement("div", { id: `zone-${id}`, "data-at": at }, children);

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

/**
 * Dispatches a pointer or drag event on an element, at a vertical position in the viewport.
 */
function dispatch(type: string, element: string, transfer?: DataTransfer, y: number = 0): Event {

	const event = new Event(type, { bubbles: true, cancelable: true });

	Object.defineProperties(event, {
		dataTransfer: { value: transfer ?? null },
		clientX: { value: 0 },
		clientY: { value: y },
		relatedTarget: { value: null }
	});

	act(() => { document.getElementById(element)!.dispatchEvent(event); }); // test harness: element rendered

	return event;

}

/**
 * Lays elements out as boxes 40 pixels high, each standing at the vertical offset its `data-at` attribute states, since
 * the test environment lays out no box of its own and every point would otherwise fall after every element.
 */
function layout(): void {
	vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
		return new DOMRect(0, Number(this.getAttribute("data-at") ?? 0), 100, 40);
	});
}

/**
 * Waits past the frames an announcement and a glide land in.
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


	describe("dragging", () => {

		it("drags by its whole surface", async () => {

			mount(createElement(Item, { id: "a" }));

			const transfer = new DataTransfer();

			dispatch("dragstart", "item-a", transfer);

			expect(source("a").dragging).toBe(true);
			expect(transfer.getData(Card)).toBe("a");

			dispatch("dragend", "item-a", transfer);

			expect(source("a").dragging).toBe(false);

		});

		it("drags by its handle alone, where it has one", async () => {

			mount(createElement(Item, { id: "a", handle: true }));

			dispatch("dragstart", "item-a", new DataTransfer());

			expect(source("a").dragging).toBe(false);

			dispatch("dragstart", "grip-a", new DataTransfer());

			expect(source("a").dragging).toBe(true);

		});

		it("leaves presses on a field inside it to the field", async () => {

			mount(createElement(Item, { id: "a", field: true }));

			dispatch("pointerdown", "field-a");

			expect(document.getElementById("item-a")?.draggable).toBe(false);

			dispatch("pointerdown", "item-a");

			expect(document.getElementById("item-a")?.draggable).toBe(true);

		});

		it("offers its payload to other apps", async () => {

			mount(createElement(Item, { id: "a", payload: { "text/plain": "Item a" } }));

			const transfer = new DataTransfer();

			dispatch("dragstart", "item-a", transfer);

			expect(transfer.getData("text/plain")).toBe("Item a");

		});

	});


	describe("targets", () => {

		it("lists the targets taking its type regardless of case, itself excluded", async () => {

			mount(
				createElement(Item, { id: "a" }),
				createElement(Zone, { id: "x" }),
				createElement(Zone, { id: "y", accept: ["text/plain"] }),
				createElement(Zone, { id: "z", accept: ["APPLICATION/X-CARD"] })
			);

			expect(source("a").targets).toEqual([{ id: "x", name: "Zone x" }, { id: "z", name: "Zone z" }]);

		});

	});


	describe("move()", () => {

		it("moves to a target", async () => {

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

		it("moves next to a target taking edges", async () => {

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

		it("refuses moves to targets not taking its type, or to no target", async () => {

			const onDrop = vi.fn<(drop: Drop) => Outcome>();

			mount(createElement(Item, { id: "a" }), createElement(Zone, { id: "x", accept: ["text/plain"], onDrop }));

			await expect(source("a").move("x")).resolves.toBe(false);
			await expect(source("a").move("y")).resolves.toBe(false);
			expect(onDrop).not.toHaveBeenCalled();

		});

		it.each([
			["nothing", () => undefined, true],
			["true", () => true, true],
			["false", () => false, false],
			["a promise of nothing", () => Promise.resolve(), true],
			["a promise of false", () => Promise.resolve(false), false]
		])("takes a target answering %s as %s", async (_, onDrop, taken) => {

			mount(createElement(Item, { id: "a" }), createElement(Zone, { id: "x", onDrop }));

			let outcome: boolean | undefined;

			await act(async () => { outcome = await source("a").move("x"); });

			expect(outcome).toBe(taken);

		});

		it("takes a target rejecting its promise, passing the rejection on unhandled", async () => {

			const error = new Error("failed");
			const rejected = Promise.reject(error);

			mount(createElement(Item, { id: "a" }), createElement(Zone, { id: "x", onDrop: () => rejected }));

			/*
			 * The rejection passed on is intercepted, or the test runner would take it as a failure of the suite.
			 */

			const reject = vi.spyOn(Promise, "reject").mockImplementation(() => new Promise(() => {}));

			let taken: boolean | undefined;

			await act(async () => { taken = await source("a").move("x"); });

			expect(taken).toBe(true);
			expect(reject).toHaveBeenCalledWith(error);

		});

		it.each([
			[undefined, "Moving Item a to Zone x was refused."],
			["after", "Moving Item a after Zone x was refused."]
		] as const)("announces refusals, naming the side %s", async (edge, message) => {

			mount(createElement(Item, { id: "a" }), createElement(Zone, { id: "x", edges: true, onDrop: () => false }));

			await act(async () => { await source("a").move("x", edge); });
			await flush();

			expect(status()).toBe(message);

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

		});

	});


	describe("dropping", () => {

		let finish: () => void = () => {};

		/*
		 * The test environment runs no animation, so the glide is stood in for by a mock the test finishes by hand.
		 */

		beforeEach(() => {
			layout();
			vi.spyOn(Element.prototype, "animate").mockImplementation(() => ({
				finished: new Promise<void>(resolve => { finish = resolve; })
			} as unknown as Animation)); // ;(mock) only the finished promise of the animation is read
		});

		it("glides from where it was moved to where it is drawn afresh", async () => {

			mount(createElement(Item, { id: "a", at: 0 }), createElement(Zone, { id: "x" }));

			await act(async () => { await source("a").move("x"); });

			mount(createElement(Item, { id: "a", at: 100 }), createElement(Zone, { id: "x" }));

			await flush();

			expect(Element.prototype.animate).toHaveBeenCalledWith(
				[{ translate: "0px -100px" }, { translate: "0 0" }],
				{ duration: 200, easing: "ease" }
			);
			expect(source("a").dropping).toBe(true);

			finish();
			await flush();

			expect(source("a").dropping).toBe(false);

		});

		it("takes its new place at once where it was not moved", async () => {

			mount(createElement(Item, { id: "a", at: 0 }), createElement(Zone, { id: "x" }));

			await act(async () => { await source("a").move("x"); });

			mount(createElement(Item, { id: "a", at: 0 }), createElement(Zone, { id: "x" }));

			await flush();

			expect(Element.prototype.animate).not.toHaveBeenCalled();
			expect(source("a").dropping).toBe(false);

		});

		it("takes its new place at once where the reader prefers reduced motion", async () => {

			vi.spyOn(window, "matchMedia").mockImplementation(() => ({ matches: true } as MediaQueryList)); // ;(mock) only matches is read

			mount(createElement(Item, { id: "a", at: 0 }), createElement(Zone, { id: "x" }));

			await act(async () => { await source("a").move("x"); });

			mount(createElement(Item, { id: "a", at: 100 }), createElement(Zone, { id: "x" }));

			await flush();

			expect(Element.prototype.animate).not.toHaveBeenCalled();
			expect(source("a").dropping).toBe(false);

		});

	});


	describe("focus", () => {

		it("takes back the focus a move left on the page", async () => {

			mount(createElement(Item, { id: "a", focus: true }), createElement(Zone, { id: "x" }));

			await act(async () => { await source("a").move("x"); });
			await flush();

			expect(document.activeElement?.id).toBe("focus-a");

		});

		it("leaves the focus the reader placed elsewhere", async () => {

			mount(
				createElement(Item, { id: "a", focus: true }),
				createElement(Zone, { id: "x" }),
				createElement("button", { id: "elsewhere" })
			);

			document.getElementById("elsewhere")!.focus(); // test harness: button rendered

			await act(async () => { await source("a").move("x"); });
			await flush();

			expect(document.activeElement?.id).toBe("elsewhere");

		});

	});

});


describe("useTarget()", () => {

	it("stays inert outside a Transfer context", async () => {

		act(() => render(createElement(Zone, { id: "x" }), document.body));

		const transfer = new DataTransfer();

		transfer.setData(Card, "a");

		const over = dispatch("dragover", "zone-x", transfer);

		expect(over.defaultPrevented).toBe(false);
		expect(target("x").target).toBe(false);
		expect(target("x").pending).toBe(false);

	});


	describe("target", () => {

		it("meets items it takes while dragged over", async () => {

			const onDrop = vi.fn<(drop: Drop) => Outcome>();

			mount(createElement(Item, { id: "a" }), createElement(Zone, { id: "x", onDrop }));

			const transfer = new DataTransfer();

			dispatch("dragstart", "item-a", transfer);

			const over = dispatch("dragover", "zone-x", transfer);

			expect(over.defaultPrevented).toBe(true);
			expect(target("x").target).toBe(true);
			expect(target("x").edge).toBeUndefined();

			dispatch("drop", "zone-x", transfer);
			dispatch("dragend", "item-a", transfer);

			expect(target("x").target).toBe(false);
			expect(onDrop).toHaveBeenCalledWith({
				source: { id: "a", type: Card, data: { id: "a" } },
				target: { id: "x", data: { zone: "x" } }
			});

		});

		it("meets types it takes regardless of case", async () => {

			mount(createElement(Item, { id: "a" }), createElement(Zone, { id: "x", accept: ["APPLICATION/X-CARD"] }));

			const transfer = new DataTransfer();

			dispatch("dragstart", "item-a", transfer);
			dispatch("dragover", "zone-x", transfer);

			expect(target("x").target).toBe(true);

		});

		it("ignores types it does not take", async () => {

			mount(createElement(Zone, { id: "x" }));

			const transfer = new DataTransfer();

			transfer.setData("text/plain", "text");

			const over = dispatch("dragover", "zone-x", transfer);

			expect(over.defaultPrevented).toBe(false);
			expect(target("x").target).toBe(false);

		});

		it("stops being met as the drag leaves", async () => {

			mount(createElement(Item, { id: "a" }), createElement(Zone, { id: "x" }));

			const transfer = new DataTransfer();

			dispatch("dragstart", "item-a", transfer);
			dispatch("dragover", "zone-x", transfer);
			dispatch("dragleave", "zone-x", transfer);

			expect(target("x").target).toBe(false);

		});

		it("is met as the innermost target under the pointer alone", async () => {

			const onOuter = vi.fn<(drop: Drop) => Outcome>();
			const onInner = vi.fn<(drop: Drop) => Outcome>();

			mount(
				createElement(Item, { id: "a" }),
				createElement(Zone, { id: "x", onDrop: onOuter }, createElement(Zone, { id: "y", onDrop: onInner }))
			);

			const transfer = new DataTransfer();

			dispatch("dragstart", "item-a", transfer);
			dispatch("dragover", "zone-y", transfer);

			expect(target("y").target).toBe(true);
			expect(target("x").target).toBe(false);

			dispatch("drop", "zone-y", transfer);

			expect(onInner).toHaveBeenCalled();
			expect(onOuter).not.toHaveBeenCalled();

		});

	});


	describe("edge", () => {

		beforeEach(layout);

		it.each([
			[100, "before"],
			[119, "before"],
			[120, "after"],
			[140, "after"]
		] as const)("locates the pointer at %i on the side %s, if taking edges", async (y, edge) => {

			const onDrop = vi.fn<(drop: Drop) => Outcome>();

			mount(createElement(Item, { id: "a" }), createElement(Zone, { id: "x", edges: true, at: 100, onDrop }));

			const transfer = new DataTransfer();

			dispatch("dragstart", "item-a", transfer);
			dispatch("dragover", "zone-x", transfer, y);

			expect(target("x").edge).toBe(edge);

			dispatch("drop", "zone-x", transfer, y);

			expect(onDrop).toHaveBeenCalledWith(expect.objectContaining({ edge }));

		});

	});


	describe("onDrop", () => {

		it("takes outside content of the types it accepts", async () => {

			const onDrop = vi.fn<(drop: Drop) => Outcome>();

			mount(createElement(Zone, { id: "x", accept: ["text/uri-list"], onDrop }));

			const transfer = new DataTransfer();

			transfer.setData("text/uri-list", "https://example.com/");
			transfer.setData("text/plain", "ignored");

			dispatch("drop", "zone-x", transfer);

			expect(onDrop).toHaveBeenCalledWith({
				files: [],
				strings: { "text/uri-list": "https://example.com/" },
				target: { id: "x", data: { zone: "x" } }
			});
			await flush();
			expect(status()).toBe("Content moved to Zone x.");

		});

		it.each([
			[["report.pdf"], "report.pdf moved to Zone x."],
			[["report.pdf", "notes.txt"], "2 files moved to Zone x."]
		])("takes files dropped from outside, announcing %j", async (names, message) => {

			const onDrop = vi.fn<(drop: Drop) => Outcome>();

			mount(createElement(Zone, { id: "x", accept: ["text/plain"], onDrop }));

			const transfer = new DataTransfer();

			transfer.setData("text/plain", "");
			names.forEach(name => transfer.items.add(new File([name], name)));

			dispatch("drop", "zone-x", transfer);

			expect(onDrop).toHaveBeenCalledWith(expect.objectContaining({
				files: names.map(name => expect.objectContaining({ name }))
			}));
			await flush();
			expect(status()).toBe(message);

		});

	});

});

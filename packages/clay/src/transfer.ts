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

/**
 * Item transfers.
 *
 * Lets the components of an interface move items between sources and targets, wherever they sit in the page: a card
 * into another column, a row to a new place in its list, files from the desktop into an upload zone. Drag and drop is
 * one way of moving an item; a menu listing the targets that take it is the other, so every move a pointer makes is
 * open to the keyboard and to a single tap as well.
 *
 * The module carries state and behaviour only. Each component draws its own items, grips, menus and drop indicators,
 * reading the state the hooks return, so a board, a list and a tree look the way each needs:
 *
 * ```tsx
 * function Card({ card }: { card: Card }) {
 *
 *   const element = useId();
 *   const { dragging, targets, move } = useSource({
 *     id: card.id, name: card.title, element, type: "application/x-card"
 *   });
 *
 *   return <article id={element} data-dragging={dragging || undefined}>
 *     {card.title}
 *     <Menu items={targets.map(target => ({ label: target.name, action: () => move(target.id) }))}/>
 *   </article>;
 *
 * }
 *
 * function Column({ column }: { column: Column }) {
 *
 *   const element = useId();
 *   const { target } = useTarget({
 *     id: column.id, name: column.title, element, accept: ["application/x-card"],
 *     onDrop: drop => "source" in drop ? store.move(drop.source.id, column.id) : false
 *   });
 *
 *   return <section id={element} data-target={target || undefined}>…</section>;
 *
 * }
 * ```
 *
 * Sources and targets meet by MIME type: a source states the type of what it carries, and a target the types it
 * takes, its own items and outside content such as `Files` or `text/uri-list` alike. Types are compared regardless of
 * case.
 *
 * Elements are reached by their DOM id rather than by a ref, so a component states the id it renders its element
 * under and hands the same id to the hook binding it.
 *
 * Every move ends with an announcement to screen readers, in English, telling where the item went or that the move was
 * refused. A moved item glides to its new place over the design system's normal duration, or at once if the reader
 * prefers reduced motion, and the focus follows it wherever it is drawn afresh.
 *
 * # Design
 *
 * - **Moves, not keyboard drags**: a reader without a pointer moves an item through a menu of plain buttons rather
 *   than by steering it with the arrow keys; every screen reader handles a menu, and a menu meets WCAG 2.5.7, which
 *   asks a single-pointer alternative to every drag and which a keyboard drag mode leaves unmet
 * - **Native drag and drop**: the browser performs drags, so files and links dropped from other apps are taken as
 *   readily as items of the page, with no third-party engine; touch drags are added where the browser leaves them out
 * - **Targets settle their own drops**: a column knows what taking a card means and an upload zone what to do with
 *   files, so each target answers its drops and the context carries no handlers of its own
 * - **Types, not scopes**: sources and targets meet by MIME type across the whole app, since the browser runs a single
 *   drag at a time anyway; two boards kept apart take distinct types, and their move menus list only their own
 * - **Visuals in each widget**: the module draws nothing but the hidden status region, so a board, a list and a tree
 *   each draw their items and indicators with the design system roles they need
 *
 * The approach follows Atlassian's Pragmatic drag and drop and its
 * [accessibility guidelines](https://atlassian.design/components/pragmatic-drag-and-drop/accessibility-guidelines),
 * which take menus rather than keyboard drags as the way a reader moves items without a pointer.
 *
 * # Accessibility
 *
 * Measured against WCAG 2.2 AA, the module guarantees the parts every widget would otherwise get wrong alike:
 *
 * - a path for every move that needs no drag (2.5.7, 2.1.1), through the `targets` and `move` of {@link useSource}
 * - the focus following a moved item (2.4.3), and the announcement closing each move (4.1.3)
 * - drops settled on release, a drop outside any target or `Escape` cancelling (2.5.2)
 * - the glide skipped where the reader prefers reduced motion (2.3.3)
 *
 * Each widget still owes the parts that depend on how it is drawn:
 *
 * - a visible control opening the moves: the grip doubling as the menu button where moving is the item's sole action,
 *   or a `More` button where the item is dragged by its whole surface, never both (2.5.7)
 * - a native file input beside a zone taking files (2.5.7)
 * - controls named after their item, with `aria-haspopup` and `aria-expanded` on menu buttons (4.1.2), menus closing on
 *   `Escape` and handing the focus back (2.1.2), and visible focus rings (2.4.7)
 * - grips and buttons of at least 24 by 24 CSS pixels (2.5.8), and menus and previews never covering the focus (2.4.11)
 * - drag states and drop targets told by shape or outline rather than colour alone (1.4.1), with marks holding 3:1
 *   against their background (1.4.11), as the selected role of the design system does
 *
 * @module
 */

import { type Optional } from "@metreeca/core";
import { type ComponentChildren, createContext, createElement } from "preact";
import { useContext, useEffect, useLayoutEffect, useState } from "preact/hooks";
import { Fields } from "./roving.core.js";
import { accepts, announcement, describe, edge, type Edge, milliseconds, type Outcome, settle } from "./transfer.core.js";

export type { Edge, Outcome } from "./transfer.core.js";

/**
 * How close to the edge of a scrolling container the pointer brings a drag before the container scrolls, in CSS
 * pixels, and how far it scrolls on each move.
 */
const Scroll = { margin: 32, step: 12 };

/**
 * Styles hiding the live region from sight while keeping it in the accessibility tree.
 */
const Hidden = {
	position: "absolute", width: "1px", height: "1px", margin: "-1px", padding: "0",
	overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: "0"
};

/**
 * How long a finger rests on a draggable element before a drag starts, in milliseconds; a shorter press is left to the
 * scroll or the tap the reader meant, so lists stay scrollable under the finger.
 */
const Hold = 350;

/**
 * How far a finger may wander while held before the press is taken as a scroll, in CSS pixels.
 */
const Slop = 8;

const ServiceContext = createContext<Optional<Service>>(undefined);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * A drop handed to a target.
 *
 * Either an {@link Internal} drop, moving an item of the page, by drag or by menu, or an {@link External} one, bringing
 * content from outside it; `"source" in drop` tells the two apart.
 */
export type Drop = Internal | External;

/**
 * A drop moving an item of the page.
 */
export interface Internal {

	/**
	 * The item moved.
	 */
	readonly source: Endpoint & { readonly type: string };

	/**
	 * The target the item was dropped onto.
	 */
	readonly target: Endpoint;

	/**
	 * The side of the target the item landed on; undefined for a target taking no edges, such as a board column, or
	 * for a move from a menu naming no side, as *Move to Done* names none where *Move up* names `before`.
	 */
	readonly edge?: Edge;

}

/**
 * A drop bringing content from outside the page, such as files from the desktop or a link from another app.
 */
export interface External {

	/**
	 * The files dropped, in the order the browser lists them; none if no file was dropped.
	 */
	readonly files: readonly File[];

	/**
	 * The text content dropped, keyed by the lowercase MIME type it was offered as, limited to the types the target
	 * takes.
	 */
	readonly strings: Readonly<Record<string, string>>;

	/**
	 * The target the content was dropped onto.
	 */
	readonly target: Endpoint;

	/**
	 * The side of the target the content landed on; undefined for a target taking no edges.
	 */
	readonly edge?: Edge;

}

/**
 * A source or a target taking part in a drop.
 */
export interface Endpoint {

	/**
	 * The identifier the source or the target was bound under.
	 */
	readonly id: string;

	/**
	 * The data the source or the target was bound with; undefined if none.
	 */
	readonly data?: unknown;

}

/**
 * A target a source may be moved to, as listed in a move menu.
 */
export interface Destination {

	/**
	 * The identifier the target was bound under.
	 */
	readonly id: string;

	/**
	 * The accessible name of the target, telling it apart in the menu.
	 */
	readonly name: string;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Offers item transfers to nested components.
 *
 * Mounted once, at the root of an app: every source and target inside it meets every other one by type, the browser
 * running a single drag at a time across the page anyway. A source or a target outside any stays inert.
 *
 * Draws a status region read out but never shown, announcing how each move ended, and lets touch readers drag on the
 * browsers that fire no drag events from a finger.
 *
 * @param options The components transfers are offered to
 *
 * @returns The nested components, with transfers offered to them
 */
export function Transfer({

	children

}: {

	/**
	 * The components transfers are offered to.
	 */
	children?: ComponentChildren

}) {

	const [message, setMessage] = useState("");

	/*
	 * The region is emptied before each announcement, so a message repeating the last one is still read out.
	 */

	const [service] = useState(() => createService(message => {
		setMessage("");
		requestAnimationFrame(() => setMessage(message));
	}));

	useEffect(() => lacking(window) ? touch(document) : undefined, []);
	useEffect(() => scroll(document), []);

	return createElement(ServiceContext.Provider, { value: service },
		children,
		createElement("p", { role: "status", style: Hidden }, message)
	);

}


/**
 * Makes an element an item that can be moved.
 *
 * The item is dragged by its handle or, with no handle, by its whole surface, a press on a field it holds being left
 * to the field; it is moved without dragging through the {@link Destination | targets} taking its type and the `move`
 * transition, which a component offers as a move menu.
 *
 * Renders the component again whenever the item starts or stops being dragged, starts or stops waiting for a move to
 * settle, glides into a new place, or the targets taking it change.
 *
 * @param options The source configuration
 *
 * @returns The state of the item and the moves open to it
 */
export function useSource({

	id,
	name,
	element,
	handle,
	focus,
	type,
	data,
	payload

}: {

	/**
	 * The identifier of the item, handed to targets as `drop.source.id`.
	 */
	id: string

	/**
	 * The accessible name of the item, telling it apart in announcements.
	 */
	name: string

	/**
	 * The DOM id of the element standing for the item, which glides into its new place once moved; the binding stays
	 * inert while no element carries the id.
	 */
	element: string

	/**
	 * The DOM id of the part of the element a drag starts from, such as a grip; the whole element if omitted.
	 */
	handle?: string

	/**
	 * The DOM id of the control taking back the focus once a move ends with the focus left on the page, such as the
	 * button opening the move menu; the handle if omitted, or the element itself with no handle either, which must then
	 * be focusable. Looked up by the identifier of the item, so a component drawn afresh after a move, under DOM ids
	 * of its own, still takes the focus back, wherever in the page the move has drawn it.
	 */
	focus?: string

	/**
	 * The MIME type of the item, matched against the types targets take.
	 */
	type: string

	/**
	 * The data handed to targets as `drop.source.data`; undefined if omitted.
	 */
	data?: unknown

	/**
	 * Text content offered to other apps the item is dragged into, keyed by MIME type, such as `text/plain` or
	 * `text/uri-list`; nothing offered if omitted.
	 */
	payload?: Readonly<Record<string, string>>

}): {

	/**
	 * Whether the item is being dragged.
	 */
	readonly dragging: boolean

	/**
	 * Whether the item is gliding into the place it was moved to.
	 */
	readonly dropping: boolean

	/**
	 * Whether a move of the item is waiting for its target to settle it.
	 */
	readonly pending: boolean

	/**
	 * The targets taking the type of the item, in the order they were bound, for a move menu to list.
	 */
	readonly targets: readonly Destination[]

	/**
	 * Moves the item to a target without dragging it.
	 *
	 * @param target The identifier of the target to move the item to
	 * @param edge The side of the target the item is to land on, such as `"before"` for *Move up*; none if omitted
	 *
	 * @returns A promise resolving to `true` once the target has taken the item, and to `false` if it refused it or
	 * no such target takes the item
	 */
	readonly move: (target: string, edge?: Edge) => Promise<boolean>

} {

	const service = useContext(ServiceContext);
	const entry = useEntry<SourceEntry>(service, { id, name, type, data, payload, element, handle, focus }, service => service.addSource);

	const [dragging, setDragging] = useState(false);

	useEffect(() => {

		const root = document.getElementById(element);
		const grip = handle === undefined ? root : document.getElementById(handle);

		return service && root && grip ? bind(service, entry, root, grip, setDragging) : undefined;

	}, [service, element, handle]);

	const state = service?.state(id);

	function takes(target: TargetEntry): boolean {
		return target.id !== id && accepts(target.accept, [type]);
	}

	return {

		dragging,
		dropping: state === "dropping",
		pending: state === "pending",

		targets: (service?.targets() ?? []).filter(takes).map(target => ({ id: target.id, name: target.name })),

		move: (target, edge) => {

			const destination = service?.targets().find(candidate => candidate.id === target && takes(candidate));

			return service && destination
				? service.drop(destination, { source: entry, from: document.getElementById(element)?.getBoundingClientRect() }, edge)
				: Promise.resolve(false);

		}

	};

}

/**
 * Makes an element a target items can be moved to.
 *
 * The target takes the items of the page whose type it accepts, by drag or by menu, and the outside content offered
 * as one of those types; the innermost target taking a drag under the pointer is the one meeting it.
 *
 * Renders the component again whenever an item it takes starts or stops being dragged over it, the side the pointer
 * stands nearest changes, or a drop onto it starts or stops waiting to be settled.
 *
 * @param options The target configuration
 *
 * @returns The state of the target
 */
export function useTarget({

	id,
	name,
	element,
	data,
	accept,
	edges = false,
	onDrop

}: {

	/**
	 * The identifier of the target, handed to it as `drop.target.id`.
	 */
	id: string

	/**
	 * The accessible name of the target, telling it apart in move menus and in announcements.
	 */
	name: string

	/**
	 * The DOM id of the element items are dropped onto; the binding stays inert while no element carries the id.
	 */
	element: string

	/**
	 * The data handed to the target as `drop.target.data`; undefined if omitted.
	 */
	data?: unknown

	/**
	 * The MIME types the target takes, such as the type of the items of a board or `Files`.
	 */
	accept: readonly string[]

	/**
	 * Whether the side of the target an item lands on matters, as it does for an item of an ordered list taking the
	 * item dropped before or after it; if so, drops carry their `edge` and announcements name the side, as in *moved
	 * before*. A target taking items into itself, such as a board column, takes none.
	 */
	edges?: boolean

	/**
	 * Settles a drop onto the target; returns `false` to refuse it, or a promise keeping it waiting until it settles,
	 * a promise resolving to `false` refusing it as well. A rejected promise ends the wait as a fulfilled one does,
	 * and is passed on unhandled, so a target reporting failures catches them in the promise it returns. Every drop is
	 * taken if omitted.
	 */
	onDrop?: (drop: Drop) => Outcome

}): {

	/**
	 * Whether an item or content the target takes is being dragged over it.
	 */
	readonly target: boolean

	/**
	 * The side of the target the pointer stands nearest while something it takes is dragged over it; undefined
	 * otherwise, and always for a target taking no `edges`, which only tells whether it is met.
	 */
	readonly edge: Optional<Edge>

	/**
	 * Whether a drop onto the target is waiting for it to be settled.
	 */
	readonly pending: boolean

} {

	const service = useContext(ServiceContext);
	const entry = useEntry<TargetEntry>(service, { id, name, data, accept, edges, onDrop }, service => service.addTarget);

	const [over, setOver] = useState<Optional<Over>>(undefined);

	useEffect(() => {

		const root = document.getElementById(element);

		return service && root ? listen(service, entry, root, setOver) : undefined;

	}, [service, element]);

	return {
		target: over !== undefined,
		edge: over?.edge,
		pending: service?.state(id) === "pending"
	};

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * A bound source, as held by the service while its component stands.
 */
interface SourceEntry {
	id: string
	name: string
	type: string
	data: unknown
	payload: Optional<Readonly<Record<string, string>>>
	element: string
	handle: Optional<string>
	focus: Optional<string>
}

/**
 * A bound target, as held by the service while its component stands.
 */
interface TargetEntry {
	id: string
	name: string
	data: unknown
	accept: readonly string[]
	edges: boolean
	onDrop: Optional<(drop: Drop) => Outcome>
}

/**
 * The state of an item or a target while a move involving it is under way.
 */
type State = "pending" | "dropping";

/**
 * A drag standing over a target that takes it, with the side the item would land on if the target takes edges.
 */
interface Over {
	readonly edge: Optional<Edge>
}

/**
 * What lands on a target: an item of the page, with the box it was dropped from if it is to glide to its new place,
 * or content brought from outside the page, such as files from the desktop or a link from another app.
 */
type Landing =
	| { readonly source: SourceEntry, readonly from: Optional<DOMRect> }
	| { readonly files: readonly File[], readonly strings: Readonly<Record<string, string>> };

/**
 * The transfer service behind {@link Transfer}, shared by the hooks of every component inside it.
 */
interface Service {

	readonly targets: () => readonly TargetEntry[]
	readonly addTarget: (entry: TargetEntry) => () => void
	readonly addSource: (entry: SourceEntry) => () => void

	readonly dragged: () => Optional<SourceEntry>
	readonly begin: (source: SourceEntry) => void
	readonly end: () => void

	readonly state: (id: string) => Optional<State>
	readonly subscribe: (listener: () => void) => () => void

	readonly drop: (target: TargetEntry, landing: Landing, edge: Optional<Edge>) => Promise<boolean>

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Binds an entry to the service for the lifetime of a component.
 *
 * The entry always carries the props of the last render, so DOM listeners reading it never act on stale values. The
 * component renders again whenever the service changes, so the state it reads off the service is never a render behind.
 *
 * @typeParam T The kind of entry bound, a source or a target
 *
 * @param service The service the entry is bound to; nothing is bound outside a {@link Transfer} context
 * @param props The props of the current render, copied into the entry
 * @param add Selects the service method adding the entry and returning the function that removes it again
 *
 * @returns The entry bound to the service, the same object across renders
 */
function useEntry<T extends object>(
	service: Optional<Service>,
	props: T,
	add: (service: Service) => (entry: T) => () => void
): T {

	const [entry] = useState<T>(() => ({ ...props }));
	const [, setVersion] = useState(0);

	useLayoutEffect(() => { Object.assign(entry, props); });

	useEffect(() => service && add(service)(entry), [service]);
	useEffect(() => service?.subscribe(() => setVersion(version => version+1)), [service]);

	return entry;

}

/**
 * Creates the transfer service behind a {@link Transfer} context.
 *
 * The registry, the drag under way and the state of each pending or gliding item are held by the service, a lifetime
 * spanning every component inside the context; components follow it through {@link Service.subscribe}.
 */
function createService(announce: (message: string) => void): Service {

	let targets: readonly TargetEntry[] = [];
	let sources: ReadonlyMap<string, SourceEntry> = new Map();
	let dragged: Optional<SourceEntry>;
	let states: ReadonlyMap<string, State> = new Map();

	const listeners = new Set<() => void>();

	function notify(): void {
		listeners.forEach(listener => listener());
	}

	function mark(ids: readonly string[], state: Optional<State>): void {

		states = new Map([
			...[...states].filter(([id]) => !ids.includes(id)),
			...(state === undefined ? [] : ids.map((id): [string, State] => [id, state]))
		]);

		notify();

	}

	/**
	 * Follows a moved source to where it is drawn afresh.
	 *
	 * Once the components have rendered the move, the element glides from where the move started to where it now
	 * stands. It takes back the focus if the move left the focus on the page, and never takes it from anywhere else.
	 * A component drawn afresh may bind the item under new DOM ids, so the source is found again by its item id.
	 *
	 * @param moved The source as it stood when the move started
	 * @param from The box the glide starts from; the element takes its new place at once if omitted
	 */
	function follow(moved: SourceEntry, from: Optional<DOMRect>): void {

		requestAnimationFrame(() => requestAnimationFrame(() => {

			const source = sources.get(moved.id) ?? moved;
			const element = document.getElementById(source.element);
			const focusable = document.getElementById(source.focus ?? source.handle ?? source.element);

			if ( document.activeElement === null || document.activeElement === document.body ) {
				focusable?.focus();
			}

			const to = element?.getBoundingClientRect();
			const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

			const styles = element ? getComputedStyle(element) : undefined;
			const duration = milliseconds(styles?.getPropertyValue("--skin--duration-normal") ?? "");
			const easing = styles?.getPropertyValue("--skin--easing-standard").trim() || "ease";

			if ( element && from && to && !reduced && duration > 0 && (from.left !== to.left || from.top !== to.top) ) {

				mark([source.id], "dropping");

				element.animate([
					{ translate: `${from.left-to.left}px ${from.top-to.top}px` },
					{ translate: "0 0" }
				], { duration, easing }).finished.finally(() => mark([source.id], undefined));

			}

		}));

	}

	return {

		targets: () => targets,

		addTarget: entry => {

			targets = [...targets, entry];
			notify();

			return () => {
				targets = targets.filter(target => target !== entry);
				notify();
			};

		},

		/*
		 * A source is held by its identifier, the last component bound under it winning: a component drawn afresh
		 * after a move, under DOM ids of its own, takes the place of the one it replaces.
		 */

		addSource: entry => {

			sources = new Map([...sources, [entry.id, entry]]);

			return () => {
				sources = new Map([...sources].filter(([, source]) => source !== entry));
			};

		},

		dragged: () => dragged,
		begin: source => { dragged = source; },
		end: () => { dragged = undefined; },

		state: id => states.get(id),

		subscribe: listener => {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},

		drop: (target, landing, edge) => {

			const { source, from, item, content } = "source" in landing ? {
				source: landing.source,
				from: landing.from,
				item: landing.source.name,
				content: { source: { id: landing.source.id, type: landing.source.type, data: landing.source.data } }
			} : {
				source: undefined,
				from: undefined,
				item: describe(landing.files),
				content: { files: landing.files, strings: landing.strings }
			};

			const side = edge === undefined || !target.edges ? {} : { edge };
			const drop: Drop = { ...content, target: { id: target.id, data: target.data }, ...side };

			const outcome = target.onDrop?.(drop);
			const waiting = outcome instanceof Promise;
			const ids = [target.id, ...(source ? [source.id] : [])];

			if ( waiting ) { mark(ids, "pending"); }

			return settle(outcome).then(taken => {

				if ( waiting ) { mark(ids, undefined); }

				announce(announcement(item, target.name, taken, drop.edge));

				if ( source ) { follow(source, taken ? from : undefined); }

				return taken;

			});

		}

	};

}

/**
 * Binds the drag listeners of a source to its element.
 *
 * @returns A function unbinding them
 */
function bind(
	service: Service,
	entry: SourceEntry,
	root: HTMLElement,
	grip: HTMLElement,
	setDragging: (dragging: boolean) => void
): () => void {

	const surface = grip === root;

	function onPointerDown(event: PointerEvent): void {
		grip.draggable = !(surface && event.target instanceof Element && event.target.closest(Fields) !== null);
	}

	function onDragStart(event: DragEvent): void {

		const { dataTransfer } = event;

		if ( dataTransfer !== null && event.target === grip ) {

			const box = root.getBoundingClientRect();

			dataTransfer.setData(entry.type, entry.id);
			Object.entries(entry.payload ?? {}).forEach(([type, value]) => dataTransfer.setData(type, value));
			dataTransfer.effectAllowed = "copyMove";
			dataTransfer.setDragImage(root, event.clientX-box.left, event.clientY-box.top);

			service.begin(entry);
			setDragging(true);

		}

	}

	function onDragEnd(): void {
		service.end();
		setDragging(false);
		grip.draggable = true;
	}

	grip.draggable = true;

	grip.addEventListener("pointerdown", onPointerDown);
	grip.addEventListener("dragstart", onDragStart);
	grip.addEventListener("dragend", onDragEnd);

	return () => {
		grip.removeAttribute("draggable");
		grip.removeEventListener("pointerdown", onPointerDown);
		grip.removeEventListener("dragstart", onDragStart);
		grip.removeEventListener("dragend", onDragEnd);
	};

}

/**
 * Binds the drop listeners of a target to its element.
 *
 * @returns A function unbinding them
 */
function listen(
	service: Service,
	entry: TargetEntry,
	root: HTMLElement,
	setOver: (over: Optional<Over>) => void
): () => void {

	function side(event: DragEvent): Optional<Edge> {
		return entry.edges ? edge(root.getBoundingClientRect(), event.clientY) : undefined;
	}

	function taken(event: DragEvent): event is DragEvent & { readonly dataTransfer: DataTransfer } {
		return event.dataTransfer !== null && accepts(entry.accept, [...event.dataTransfer.types]);
	}

	function onDragOver(event: DragEvent): void {

		if ( taken(event) ) {

			event.preventDefault(); // takes the drop
			event.stopPropagation(); // leaves no enclosing target taking it as well

			event.dataTransfer.dropEffect = service.dragged() ? "move" : "copy";

			setOver({ edge: side(event) });

		}

	}

	function onDragLeave(event: DragEvent): void {
		if ( !(event.relatedTarget instanceof Node && root.contains(event.relatedTarget)) ) { setOver(undefined); }
	}

	function onDrop(event: DragEvent): void {

		if ( taken(event) ) {

			event.preventDefault();
			event.stopPropagation();

			setOver(undefined);

			const { dataTransfer, clientX, clientY } = event;

			const source = service.dragged();
			const internal = source !== undefined && dataTransfer.getData(source.type) === source.id;
			const box = internal ? document.getElementById(source.element)?.getBoundingClientRect() : undefined;

			/*
			 * Outside content is read here, since a DataTransfer cannot be read once the drop event is over; an item
			 * of the page glides from the box it stood in under the pointer as it was dropped.
			 */

			const landing: Landing = internal
				? { source, from: box && new DOMRect(clientX-box.width/2, clientY-box.height/2, box.width, box.height) }
				: {
					files: [...dataTransfer.files],
					strings: Object.fromEntries([...dataTransfer.types]
						.map(type => type.toLowerCase())
						.filter(type => type !== "files" && accepts(entry.accept, [type]))
						.map(type => [type, dataTransfer.getData(type)])
					)
				};

			void service.drop(entry, landing, side(event));

		}

	}

	function onDragEnd(): void {
		setOver(undefined);
	}

	root.addEventListener("dragenter", onDragOver);
	root.addEventListener("dragover", onDragOver);
	root.addEventListener("dragleave", onDragLeave);
	root.addEventListener("drop", onDrop);
	document.addEventListener("dragend", onDragEnd);

	return () => {
		root.removeEventListener("dragenter", onDragOver);
		root.removeEventListener("dragover", onDragOver);
		root.removeEventListener("dragleave", onDragLeave);
		root.removeEventListener("drop", onDrop);
		document.removeEventListener("dragend", onDragEnd);
	};

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Checks whether the browser leaves touch drags undone.
 *
 * Firefox for Android and Samsung Internet fire no drag events from a finger; other touch browsers drag natively.
 *
 * @param window The window to check
 *
 * @returns `true` if `window` runs on a touch device whose browser fires no drag events from a finger
 */
function lacking(window: Window): boolean {

	const { userAgent, maxTouchPoints } = window.navigator;

	return maxTouchPoints > 0 && /Android/.test(userAgent) && /Firefox|SamsungBrowser/.test(userAgent);

}

/**
 * Follows touch gestures on the draggable elements of a document, dispatching the drag events they stand for: a long
 * press on a draggable element starts a drag, and the native drag events follow as the finger moves and lifts, so
 * sources and targets need no touch code of their own, the drag reaching them as a pointer drag would.
 *
 * @param document The document whose draggable elements are to follow touch; left alone if it has no window
 *
 * @returns A function removing the touch listeners and cancelling any drag under way
 */
function touch(document: Document): () => void {

	const window = document.defaultView;

	/*
	 * The gesture is a foreign lifetime spanning several events, so its state is held in two locals the listeners
	 * share, the press while the finger rests and the drag once it moves, both reset as either one ends.
	 */

	let press: Optional<{ readonly source: HTMLElement, readonly x: number, readonly y: number, readonly timer: number }>;
	let drag: Optional<{ readonly source: HTMLElement, readonly data: DataTransfer, readonly ghost: HTMLElement, readonly over: Optional<Element>, readonly accepted: boolean }>;

	function dispatch(type: string, target: EventTarget, x: number, y: number): boolean {
		return target.dispatchEvent(new DragEvent(type, {
			bubbles: true,
			cancelable: true,
			clientX: x,
			clientY: y,
			dataTransfer: drag?.data ?? null
		}));
	}

	function start(): void {

		if ( press !== undefined ) {

			const { source, x, y } = press;
			const box = source.getBoundingClientRect();

			/*
			 * The preview stands for the item to the eye alone: hidden from assistive technology, out of reach of the
			 * focus, and stripped of the ids it copied, which the item still answers to and its references still point at.
			 */

			const ghost = source.cloneNode(true) as HTMLElement; // ;(cast) cloneNode is typed as Node, but a clone keeps the element type

			[ghost, ...ghost.querySelectorAll("[id]")].forEach(element => element.removeAttribute("id"));

			ghost.setAttribute("aria-hidden", "true");
			ghost.inert = true;

			Object.assign(ghost.style, {
				position: "fixed", left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`,
				pointerEvents: "none", opacity: "0.8", zIndex: "2147483647"
			});

			press = undefined;
			drag = { source, data: new DataTransfer(), ghost, over: undefined, accepted: false };

			document.body.append(ghost);
			dispatch("dragstart", source, x, y);

		}

	}

	function move(x: number, y: number): void {

		if ( drag !== undefined ) {

			const { ghost, over } = drag;
			const box = ghost.getBoundingClientRect();

			ghost.style.translate = `${x-box.left-box.width/2}px ${y-box.top-box.height/2}px`;

			const under = document.elementFromPoint(x, y) ?? undefined;

			if ( under !== over ) {
				if ( over ) { dispatch("dragleave", over, x, y); }
				if ( under ) { dispatch("dragenter", under, x, y); }
			}

			drag = { ...drag, over: under, accepted: under !== undefined && !dispatch("dragover", under, x, y) };

		}

	}

	function end(x: number, y: number, cancelled: boolean): void {

		if ( press !== undefined ) {
			window?.clearTimeout(press.timer);
			press = undefined;
		}

		if ( drag !== undefined ) {

			const { source, ghost, over, accepted } = drag;

			if ( over && accepted && !cancelled ) {
				dispatch("drop", over, x, y);
			} else if ( over ) {
				dispatch("dragleave", over, x, y);
			}

			dispatch("dragend", source, x, y);

			ghost.remove();
			drag = undefined;

		}

	}


	function onTouchStart(event: TouchEvent): void {

		const touch = event.touches[0];
		const source = event.touches.length === 1 && event.target instanceof Element
			? event.target.closest<HTMLElement>("[draggable='true']")
			: null;

		if ( touch && source && window ) {
			press = { source, x: touch.clientX, y: touch.clientY, timer: window.setTimeout(start, Hold) };
		}

	}

	function onTouchMove(event: TouchEvent): void {

		const touch = event.touches[0];

		if ( touch !== undefined && drag !== undefined ) {
			event.preventDefault(); // the finger drags rather than scrolls
			move(touch.clientX, touch.clientY);
		} else if ( touch !== undefined && press !== undefined && Math.hypot(touch.clientX-press.x, touch.clientY-press.y) > Slop ) {
			end(touch.clientX, touch.clientY, true);
		}

	}

	function onTouchEnd(event: TouchEvent): void {

		const touch = event.changedTouches[0];

		end(touch?.clientX ?? 0, touch?.clientY ?? 0, event.type === "touchcancel");

	}


	document.addEventListener("touchstart", onTouchStart, { passive: true });
	document.addEventListener("touchmove", onTouchMove, { passive: false });
	document.addEventListener("touchend", onTouchEnd);
	document.addEventListener("touchcancel", onTouchEnd);

	return () => {
		end(0, 0, true);
		document.removeEventListener("touchstart", onTouchStart);
		document.removeEventListener("touchmove", onTouchMove);
		document.removeEventListener("touchend", onTouchEnd);
		document.removeEventListener("touchcancel", onTouchEnd);
	};

}

/**
 * Scrolls the container under a drag as the pointer nears its edge.
 *
 * @returns A function removing the listener
 */
function scroll(document: Document): () => void {

	function onDragOver({ target, clientX, clientY }: DragEvent): void {

		const container = target instanceof Element ? scrollable(target) : undefined;
		const box = container?.getBoundingClientRect();

		if ( container && box ) {

			const dx = clientX < box.left+Scroll.margin ? -Scroll.step : clientX > box.right-Scroll.margin ? Scroll.step : 0;
			const dy = clientY < box.top+Scroll.margin ? -Scroll.step : clientY > box.bottom-Scroll.margin ? Scroll.step : 0;

			if ( dx !== 0 || dy !== 0 ) { container.scrollBy(dx, dy); }

		}

	}

	document.addEventListener("dragover", onDragOver);

	return () => document.removeEventListener("dragover", onDragOver);

}

/**
 * Retrieves the nearest container scrolling an element, if any.
 */
function scrollable(element: Element): Optional<Element> {

	const { overflowX, overflowY } = getComputedStyle(element);
	const scrolls = /auto|scroll/.test(overflowX+overflowY)
		&& (element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth);

	return scrolls ? element : element.parentElement ? scrollable(element.parentElement) : undefined;

}

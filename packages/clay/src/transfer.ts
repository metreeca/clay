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

import { opt, type Optional } from "@metreeca/core";
import { type ComponentChildren, createContext, createElement } from "preact";
import { useContext, useEffect, useLayoutEffect, useState } from "preact/hooks";
import { Fields } from "./roving.core.js";
import { accepts, announcement, describe, edge, type Edge, install, lacking, milliseconds, type Outcome, settle } from "./transfer.core.js";

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


/**
 * A bound source, as held by the service while its component stands.
 */
interface SourceEntry {
	id: string;
	name: string;
	type: string;
	data: unknown;
	payload: Optional<Readonly<Record<string, string>>>;
	element: string;
	handle: Optional<string>;
	focus: Optional<string>;
}

/**
 * The state of an item or a target while a move involving it is under way.
 */
type State = "pending" | "dropping";

/**
 * Something a target takes standing over it, nearest the given side if the target takes edges.
 */
type Over = { readonly edge?: Edge };

/**
 * A bound target, as held by the service while its component stands.
 */
interface TargetEntry {
	id: string;
	name: string;
	data: unknown;
	accept: readonly string[];
	edges: boolean;
	onDrop: Optional<(drop: Drop) => Outcome>;
}

/**
 * The transfer service behind {@link Transfer}, shared by the hooks of every component inside it.
 */
interface Service {

	readonly targets: () => readonly TargetEntry[];
	readonly addTarget: (entry: TargetEntry) => () => void;

	readonly source: (id: string) => Optional<SourceEntry>;
	readonly addSource: (entry: SourceEntry) => () => void;

	readonly dragged: () => Optional<SourceEntry>;
	readonly begin: (source: SourceEntry) => void;
	readonly end: () => void;

	readonly state: (id: string) => Optional<State>;
	readonly subscribe: (listener: () => void) => () => void;

	readonly drop: (drop: Drop, source: Optional<SourceEntry>, target: TargetEntry, from: Optional<DOMRect>) => Promise<boolean>;

}

const ServiceContext = createContext<Optional<Service>>(undefined);


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

	useEffect(() => lacking(window) ? install(document) : undefined, []);
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

	const [entry] = useState<SourceEntry>(() => ({ id, name, type, data, payload, element, handle, focus }));
	const [dragging, setDragging] = useState(false);
	const [, setVersion] = useState(0);

	/*
	 * The entry is read by listeners bound to the DOM, a lifetime the render does not own, so it is brought up to date
	 * in place before the browser paints, where every listener finds the props of the last render.
	 */

	useLayoutEffect(() => {
		Object.assign(entry, { id, name, type, data, payload, element, handle, focus });
	});

	useEffect(() => service?.addSource(entry), [service]);
	useEffect(() => service?.subscribe(() => setVersion(version => version+1)), [service]);

	useEffect(() => {

		const root = document.getElementById(element);
		const grip = handle === undefined ? root : document.getElementById(handle);

		return service && root && grip ? bind(service, entry, root, grip, setDragging) : undefined;

	}, [service, element, handle]);

	const state = service?.state(id);

	return {

		dragging,
		dropping: state === "dropping",
		pending: state === "pending",

		targets: (service?.targets() ?? [])
			.filter(target => target.id !== id && accepts(target.accept, [type]))
			.map(target => ({ id: target.id, name: target.name })),

		move: (target, edge) => {

			const destination = service?.targets()
				.find(entry => entry.id === target && entry.id !== id && accepts(entry.accept, [type]));

			return service && destination ? service.drop({
				source: { id, type, data },
				target: { id: destination.id, data: destination.data },
				...(edge === undefined || !destination.edges ? {} : { edge })
			}, entry, destination, document.getElementById(element)?.getBoundingClientRect()) : Promise.resolve(false);

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

	const [entry] = useState<TargetEntry>(() => ({ id, name, data, accept, edges, onDrop }));
	const [over, setOver] = useState<Optional<Over>>(undefined);
	const [, setVersion] = useState(0);

	useLayoutEffect(() => {
		Object.assign(entry, { id, name, data, accept, edges, onDrop });
	});

	useEffect(() => service?.addTarget(entry), [service]);
	useEffect(() => service?.subscribe(() => setVersion(version => version+1)), [service]);

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

		source: id => sources.get(id),

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

		drop: (drop, source, target, from) => {

			const outcome = target.onDrop?.(drop);
			const waiting = outcome instanceof Promise;
			const ids = [target.id, ...(source ? [source.id] : [])];

			if ( waiting ) { mark(ids, "pending"); }

			const item = "source" in drop ? source?.name ?? drop.source.id : describe(drop.files);

			return settle(outcome).then(taken => {

				if ( waiting ) { mark(ids, undefined); }

				announce(announcement(item, target.name, taken, target.edges ? drop.edge : undefined));

				if ( source ) {
					follow(() => sources.get(source.id) ?? source, taken ? from : undefined,
						() => mark([source.id], "dropping"), () => mark([source.id], undefined)
					);
				}

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

		const transfer = event.dataTransfer;

		if ( transfer === null || event.target !== grip ) { return; }

		const box = root.getBoundingClientRect();

		transfer.setData(entry.type, entry.id);
		Object.entries(entry.payload ?? {}).forEach(([type, value]) => transfer.setData(type, value));
		transfer.effectAllowed = "copyMove";
		transfer.setDragImage(root, event.clientX-box.left, event.clientY-box.top);

		service.begin(entry);
		setDragging(true);

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

	function taken(event: DragEvent): boolean {
		return event.dataTransfer !== null && accepts(entry.accept, [...event.dataTransfer.types]);
	}

	function onDragOver(event: DragEvent): void {

		if ( !taken(event) ) { return; }

		event.preventDefault(); // takes the drop
		event.stopPropagation(); // leaves no enclosing target taking it as well

		event.dataTransfer!.dropEffect = service.dragged() ? "move" : "copy"; // taken() checked dataTransfer

		setOver(opt(side(event), edge => ({ edge })) ?? {});

	}

	function onDragLeave(event: DragEvent): void {
		if ( !(event.relatedTarget instanceof Node && root.contains(event.relatedTarget)) ) { setOver(undefined); }
	}

	function onDrop(event: DragEvent): void {

		if ( !taken(event) ) { return; }

		event.preventDefault();
		event.stopPropagation();

		setOver(undefined);

		const transfer = event.dataTransfer!; // taken() checked dataTransfer
		const landed = opt(side(event), edge => ({ edge })) ?? {};
		const source = service.dragged();
		const target = { id: entry.id, data: entry.data };

		const internal = source !== undefined && transfer.getData(source.type) === source.id;

		/*
		 * Outside content is read here, since a DataTransfer cannot be read once the drop event is over.
		 */

		const drop: Drop = internal
			? { source: { id: source.id, type: source.type, data: source.data }, target, ...landed }
			: {
				files: [...transfer.files],
				strings: Object.fromEntries([...transfer.types]
					.map(type => type.toLowerCase())
					.filter(type => type !== "files" && accepts(entry.accept, [type]))
					.map(type => [type, transfer.getData(type)])
				),
				target,
				...landed
			};

		const from = internal ? grabbed(source, event) : undefined;

		void service.drop(drop, internal ? source : undefined, entry, from);

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

/**
 * Locates the box a dragged source stood in under the pointer as it was dropped, which its glide starts from.
 */
function grabbed(source: SourceEntry, event: DragEvent): Optional<DOMRect> {

	const box = document.getElementById(source.element)?.getBoundingClientRect();

	return box && new DOMRect(event.clientX-box.width/2, event.clientY-box.height/2, box.width, box.height);

}

/**
 * Follows a moved source to where it is drawn afresh.
 *
 * Once the components have rendered the move, the element glides from where the move started to where it now stands,
 * and takes back the focus if the move left it on the page, never taking it from wherever else the reader put it. The
 * source is looked up as it stands then, since a component drawn afresh binds its item under DOM ids of its own.
 */
function follow(
	current: () => SourceEntry,
	from: Optional<DOMRect>,
	start: () => void,
	stop: () => void
): void {

	requestAnimationFrame(() => requestAnimationFrame(() => {

		const source = current();
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

			start();

			element.animate([
				{ translate: `${from.left-to.left}px ${from.top-to.top}px` },
				{ translate: "0 0" }
			], { duration, easing }).finished.finally(stop);

		}

	}));

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

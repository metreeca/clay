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
 *     onDrop: drop => drop.source ? store.move(drop.source.id, column.id) : false
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
 * - **Visuals in each widget**: the module draws nothing but the off-screen status region, so a board, a list and a
 *   tree each draw their items and indicators with the design system roles they need
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
 * - controls named after their item, with `aria-haspopup` and `aria-expanded` on menu buttons (4.1.2), menus closing
 *   on `Escape` and handing the focus back (2.1.2), and visible focus rings (2.4.7)
 * - grips and buttons at least 24 by 24 CSS pixels (2.5.8), and menus and previews never covering the focus (2.4.11)
 * - drag states and drop targets told by shape or outline rather than colour alone (1.4.1), with marks holding 3:1
 *   against their background (1.4.11), as the selected role of the design system does
 *
 * @module
 */

import { isPromiseLike, type Optional } from "@metreeca/core";
import { type Awaitable } from "@metreeca/core/async";
import { immutable } from "@metreeca/core/values";
import { type ComponentChildren, createContext, createElement } from "preact";
import { useContext, useEffect, useLayoutEffect, useState } from "preact/hooks";
import { isReserved } from "./index.js";


/**
 * How long a finger rests on a draggable element before a drag starts, in milliseconds; a shorter press is left to the
 * scroll or the tap the reader meant, so lists stay scrollable under the finger.
 */
const Hold = 350;

/**
 * How far a finger may wander while held before the press is taken as a scroll, in CSS pixels.
 */
const Slop = 8;

/**
 * How close to the edge of a scrolling container a drag comes before the container scrolls, in CSS pixels.
 */
const Margin = 32;

/**
 * How far a scrolling container scrolls on each move of a drag near its edge, in CSS pixels.
 */
const Step = 12;


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * The service of the enclosing {@link Transfer} context; undefined outside any, leaving sources and targets inert.
 */
const TransferContext = createContext<Optional<Transfer>>(undefined);


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * A source or a target taking part in a drop.
 */
export interface Endpoint {

	/**
	 * The identifier the source or the target was bound under.
	 */
	readonly id: string;

	/**
	 * The data the source or the target was bound with; undefined if none. Left to the consumer to narrow, since a
	 * target takes items of several types, each bound with data of its own, none of which the module can name.
	 */
	readonly data?: unknown;

}

/**
 * The item a drop moves.
 */
export interface Source extends Endpoint {

	/**
	 * The MIME type the item was bound with.
	 */
	readonly type: string;

}

/**
 * A target items may be moved to, as a drop lands on it or a move menu lists it.
 */
export interface Target extends Endpoint {

	/**
	 * The accessible name of the target, telling it apart in move menus and in announcements.
	 */
	readonly name: string;

}


/**
 * A drop handed to a target.
 *
 * Either an {@link Internal} drop, moving an item of the page, by drag or by menu, or an {@link External} one, bringing
 * content from outside it; `drop.source` tells the two apart, standing for the item moved or undefined for content.
 */
export type Drop =
	| Internal
	| External

/**
 * Where a drop landed: the target and, where it matters, the side of it.
 */
export interface Destination {

	/**
	 * The target the drop landed on.
	 */
	readonly target: Target;

	/**
	 * The side of the target the drop landed on; undefined for a target taking no sides, such as a board column, or
	 * for a move from a menu naming no side, as *Move to Done* names none where *Move up* names `before`.
	 */
	readonly side?: Side;

}

/**
 * A drop moving an item of the page.
 */
export interface Internal extends Destination {

	/**
	 * The item moved.
	 */
	readonly source: Source;

}

/**
 * A drop bringing content from outside the page, such as files from the desktop or a link from another app.
 */
export interface External extends Destination {

	/**
	 * No item of the page: the content came from outside it.
	 */
	readonly source?: undefined;

	/**
	 * The files dropped, in the order the browser lists them; none if no file was dropped.
	 */
	readonly files: readonly File[];

	/**
	 * The text content dropped, keyed by the lowercase MIME type it was offered as, limited to the types the target
	 * takes; the string items of the drag, as the browser calls them, beside its file items.
	 */
	readonly strings: Readonly<Record<string, string>>;

}


/**
 * The side of a target an item lands on, nearest the pointer along the vertical axis.
 */
export type Side =
	| "before"
	| "after"


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Offers item transfers to nested components.
 *
 * Mounted once, at the root of an app: every source and target inside it meets every other one by type, the browser
 * running a single drag at a time across the page anyway. A source or a target outside any stays inert.
 *
 * Draws a status region announcing how each move ended, and lets touch readers drag on the browsers that fire no drag
 * events from a finger. Only the `@metreeca/skin` stylesheet keeps the region from sight while leaving it to screen
 * readers: an app running without that stylesheet must hide `[data-offscreen]` elements with a rule of its own.
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

	const [service] = useState<Transfer>(() => {

		/*
		 * The registry, the drag under way and the state of each pending or gliding item are held by the service, a
		 * lifetime spanning every component inside the context; components follow it through its subscriptions.
		 */

		let targets: readonly TargetEntry[] = [];
		let sources: ReadonlyMap<string, SourceEntry> = new Map();
		let dragged: Optional<SourceEntry>;
		let phases: ReadonlyMap<string, Phase> = new Map();

		const listeners = new Set<() => void>();

		function notify(): void {
			listeners.forEach(listener => listener());
		}

		function mark(ids: readonly string[], phase: Optional<Phase>): void {

			phases = new Map([
				...[...phases].filter(([id]) => !ids.includes(id)),
				...(phase === undefined ? [] : ids.map((id): [string, Phase] => [id, phase]))
			]);

			notify();

		}

		/**
		 * Reads a message out through the status region.
		 *
		 * The region is emptied first, so a message repeating the last one is still read out.
		 *
		 * @param message The message to read out
		 */
		function announce(message: string): void {
			setMessage("");
			requestAnimationFrame(() => setMessage(message));
		}

		/**
		 * Follows a moved source to where it is drawn afresh.
		 *
		 * Once the components have rendered the move, the element glides from where the move started to where it now
		 * stands. It takes back the focus if the move left the focus on the page, and never takes it from anywhere
		 * else. A component drawn afresh may bind the item under new DOM ids, so the source is found again by item id.
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

				const shifted = from && to && (from.left !== to.left || from.top !== to.top);

				if ( element && shifted && !reduced && duration > 0 ) {

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

			phase: id => phases.get(id),

			subscribe: listener => {
				listeners.add(listener);
				return () => listeners.delete(listener);
			},

			drop: ({ target, side }, load) => {

				const { source, from, item, content } = load.source ? {
					source: load.source,
					from: load.from,
					item: load.source.name,
					content: { source: { id: load.source.id, type: load.source.type, data: load.source.data } }
				} : {
					source: undefined,
					from: undefined,
					item: describe(load.files),
					content: { files: load.files, strings: load.strings }
				};

				const drop: Drop = immutable({
					...content,
					target: { id: target.id, name: target.name, data: target.data },
					...(side === undefined || !target.sides ? {} : { side })
				});

				const outcome = target.onDrop?.(drop);
				const waiting = isPromiseLike(outcome);
				const ids = [target.id, ...(source ? [source.id] : [])];

				if ( waiting ) { mark(ids, "pending"); }

				return settle(outcome).then(taken => {

					if ( waiting ) { mark(ids, undefined); }

					announce(announcement(item, target.name, taken, drop.side));

					if ( source ) { follow(source, taken ? from : undefined); }

					return taken;

				});

			}

		};

	});

	useEffect(() => lacking() ? touch() : undefined, []);
	useEffect(() => scroll(), []);

	return createElement(TransferContext.Provider, { value: service },
		children,
		createElement("p", { role: "status", "data-offscreen": "" }, message)
	);

}


/**
 * Makes an element an item that can be moved.
 *
 * The item is dragged by its handle or, with no handle, by its whole surface. Presses {@link isReserved | reserved}
 * for a field inside the item stay with that field. The item is also moved without dragging, through the
 * {@link Target | targets} taking its type and the `move` transition, which a component offers as a move menu.
 *
 * Renders the component again whenever the item starts or stops being dragged or waiting for a move to settle, glides
 * into a new place, or the targets taking its type change, so a move menu always lists the current ones.
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
	readonly targets: readonly Target[]

	/**
	 * Moves the item to a target without dragging it.
	 *
	 * @param target The identifier of the target to move the item to
	 * @param side The side of the target the item is to land on, such as `"before"` for *Move up*; none if omitted
	 *
	 * @returns A promise resolving once the move settles: to `true` if the target took the item, to `false` otherwise
	 */
	readonly move: (target: string, side?: Side) => Promise<boolean>

} {

	const service = useContext(TransferContext);

	const entry = useEntry<SourceEntry>(service, {

		id,
		name,

		element,
		handle,
		focus,

		type,
		data,
		payload

	}, service => service.addSource);

	const [dragging, setDragging] = useState(false);

	useEffect(() => {

		const root = document.getElementById(element);
		const grip = handle === undefined ? root : document.getElementById(handle);

		return service && root && grip ? bind(service, entry, root, grip, setDragging) : undefined;

	}, [service, element, handle]);

	const phase = service?.phase(id);

	function takes(target: TargetEntry): boolean {
		return target.id !== id && accepts(target.accept, [type]);
	}

	return immutable({

		dragging,
		dropping: phase === "dropping",
		pending: phase === "pending",

		targets: (service?.targets() ?? []).filter(takes).map(target => ({
			id: target.id,
			name: target.name,
			data: target.data
		})),

		move: (target, side) => {

			const $target = service?.targets().find(candidate => candidate.id === target && takes(candidate));

			return service && $target
				? service.drop({ target: $target, side }, {
					source: entry,
					from: document.getElementById(element)?.getBoundingClientRect()
				})
				: Promise.resolve(false);

		}

	});

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

	sides = false,

	id,
	name,

	element,

	accept,
	data,

	onDrop

}: {

	/**
	 * Whether the side of the target an item lands on matters, as it does for an item of an ordered list taking the
	 * item dropped before or after it; if so, drops carry their `side` and announcements name the side, as in *moved
	 * before*. A target taking items into itself, such as a board column, takes none.
	 */
	sides?: boolean


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
	 * The MIME types the target takes, such as the type of the items of a board or `Files`.
	 */
	accept: readonly string[]

	/**
	 * The data handed to the target as `drop.target.data`; undefined if omitted.
	 */
	data?: unknown


	/**
	 * Settles a drop onto the target; returns `false` to refuse it, or a promise keeping the drop waiting until it
	 * settles and refusing it if resolved to `false`. A rejected promise takes the drop and is passed on unhandled, so
	 * a target reporting failures catches them in the promise it returns. Every drop is taken if omitted.
	 */
	onDrop?: (drop: Drop) => Awaitable<boolean | void>

}): {

	/**
	 * Whether an item or content the target takes is being dragged over it.
	 */
	readonly target: boolean

	/**
	 * The side of the target the pointer stands nearest while something it takes is dragged over it; undefined
	 * otherwise, and always for a target taking no `sides`, which only tells whether it is met.
	 */
	readonly side: Optional<Side>

	/**
	 * Whether a drop onto the target is waiting for it to be settled.
	 */
	readonly pending: boolean

} {

	const service = useContext(TransferContext);

	const entry = useEntry<TargetEntry>(service, {

		sides,

		id,
		name,

		accept,
		data,

		onDrop

	}, service => service.addTarget);

	const [target, setTarget] = useState(false);
	const [side, setSide] = useState<Optional<Side>>(undefined);

	useEffect(() => {

		const root = document.getElementById(element);

		return service && root ? listen(service, entry, root, setTarget, setSide) : undefined;

	}, [service, element]);

	return immutable({
		target,
		side,
		pending: service?.phase(id) === "pending"
	});

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * A bound source, as held by the service while its component stands. Mutable: the hook copies the props of each
 * render into the entry, so the service and the listeners holding it always read the current ones.
 */
type SourceEntry = Parameters<typeof useSource>[0]

/**
 * A bound target, as held by the service while its component stands, mutable as a {@link SourceEntry} is. Carries
 * its `sides` settled and no `element`: the service never reaches the element, which only the listeners bound by the
 * hook meet, where it does reach the element of a source to glide it and hand it the focus.
 */
type TargetEntry = Omit<Parameters<typeof useTarget>[0], "element" | "sides"> & { sides: boolean }

/**
 * The phase a move involving an item or a target stands in while under way.
 */
type Phase = "pending" | "dropping"

/**
 * What lands on a target: an item of the page, with the box it was dropped from if it is to glide to its new place,
 * or content brought from outside the page, such as files from the desktop or a link from another app. As with the
 * drop handed to the target, `load.source` tells the two apart, standing for the item moved or undefined for content.
 */
type Load =
	| { readonly source: SourceEntry, readonly from: Optional<DOMRect> }
	| { readonly source?: undefined, readonly files: External["files"], readonly strings: External["strings"] }

/**
 * The transfer service behind {@link Transfer}, shared by the hooks of every component inside it.
 */
interface Transfer {

	readonly targets: () => readonly TargetEntry[];
	readonly addTarget: (entry: TargetEntry) => () => void;
	readonly addSource: (entry: SourceEntry) => () => void;

	readonly dragged: () => Optional<SourceEntry>;
	readonly begin: (source: SourceEntry) => void;
	readonly end: () => void;

	readonly phase: (id: string) => Optional<Phase>;
	readonly subscribe: (listener: () => void) => () => void;

	readonly drop: (
		destination: { readonly target: TargetEntry, readonly side: Optional<Side> },
		load: Load
	) => Promise<boolean>;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Checks whether the browser leaves touch drags undone.
 *
 * Firefox for Android and Samsung Internet fire no drag events from a finger; other touch browsers drag natively.
 *
 * @returns `true` if the page runs on a touch device whose browser fires no drag events from a finger
 */
function lacking(): boolean {

	const { userAgent, maxTouchPoints } = navigator;

	return maxTouchPoints > 0 && /Android/.test(userAgent) && /Firefox|SamsungBrowser/.test(userAgent);

}

/**
 * Follows touch gestures on the draggable elements of the page, dispatching the drag events they stand for: a long
 * press on a draggable element starts a drag, and the native drag events follow as the finger moves and lifts, so
 * sources and targets need no touch code of their own, the drag reaching them as a pointer drag would.
 *
 * @returns A function removing the touch listeners and cancelling any drag under way
 */
function touch(): () => void {

	/*
	 * The gesture is a foreign lifetime spanning several events, so its state is held in two locals the listeners
	 * share, the press while the finger rests and the drag once it moves, both reset as either one ends.
	 */

	let press: Optional<{
		readonly source: HTMLElement,
		readonly x: number,
		readonly y: number,
		readonly timer: number
	}>;
	let drag: Optional<{
		readonly source: HTMLElement,
		readonly data: DataTransfer,
		readonly ghost: HTMLElement,
		readonly box: DOMRect,
		readonly over: Optional<Element>,
		readonly accepted: boolean
	}>;

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

			const ghost = source.cloneNode(true) as HTMLElement; // ;(cast) cloneNode is typed as Node, but a clone
																 // keeps the element type

			[ghost, ...ghost.querySelectorAll("[id]")].forEach(element => element.removeAttribute("id"));

			ghost.setAttribute("aria-hidden", "true");
			ghost.inert = true;

			Object.assign(ghost.style, {
				position: "fixed", left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`,
				pointerEvents: "none", opacity: "0.8", zIndex: "2147483647"
			});

			press = undefined;
			drag = { source, data: new DataTransfer(), ghost, box, over: undefined, accepted: false };

			document.body.append(ghost);
			dispatch("dragstart", source, x, y);

		}

	}

	function move(x: number, y: number): void {

		if ( drag !== undefined ) {

			const { ghost, box, over } = drag;

			// translated from the box the preview was placed at, which its own box would carry along

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
			clearTimeout(press.timer);
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

		if ( touch && source ) {
			press = { source, x: touch.clientX, y: touch.clientY, timer: setTimeout(start, Hold) };
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
function scroll(): () => void {

	function onDragOver({ target, clientX, clientY }: DragEvent): void {

		const container = target instanceof Element ? scrollable(target) : undefined;
		const box = container?.getBoundingClientRect();

		if ( container && box ) {

			const dx = clientX < box.left+Margin ? -Step : clientX > box.right-Margin ? Step : 0;
			const dy = clientY < box.top+Margin ? -Step : clientY > box.bottom-Margin ? Step : 0;

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
	service: Optional<Transfer>,
	props: T,
	add: (service: Transfer) => (entry: T) => () => void
): T {

	const [entry] = useState<T>(() => ({ ...props }));
	const [, setVersion] = useState(0);

	useLayoutEffect(() => { Object.assign(entry, props); });

	useEffect(() => service && add(service)(entry), [service]);
	useEffect(() => service?.subscribe(() => setVersion(version => version+1)), [service]);

	return entry;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Binds the drag listeners of a source to its element.
 *
 * @returns A function unbinding them
 */
function bind(
	service: Transfer,
	entry: SourceEntry,
	root: HTMLElement,
	grip: HTMLElement,
	setDragging: (dragging: boolean) => void
): () => void {

	const surface = grip === root;

	function onPointerDown(event: PointerEvent): void {
		grip.draggable = !(surface && isReserved(event));
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
	service: Transfer,
	entry: TargetEntry,
	root: HTMLElement,
	setTarget: (target: boolean) => void,
	setSide: (side: Optional<Side>) => void
): () => void {

	function locate({ clientY }: DragEvent): Optional<Side> {

		const { top, height } = root.getBoundingClientRect();

		return !entry.sides ? undefined : clientY < top+height/2 ? "before" : "after";

	}

	function leave(): void {
		setTarget(false);
		setSide(undefined);
	}

	function taken(event: DragEvent): event is DragEvent & { readonly dataTransfer: DataTransfer } {
		return event.dataTransfer !== null && accepts(entry.accept, [...event.dataTransfer.types]);
	}

	function onDragOver(event: DragEvent): void {

		if ( taken(event) ) {

			event.preventDefault(); // takes the drop
			event.stopPropagation(); // leaves no enclosing target taking it as well

			event.dataTransfer.dropEffect = service.dragged() ? "move" : "copy";

			setTarget(true);
			setSide(locate(event));

		}

	}

	function onDragLeave(event: DragEvent): void {
		if ( !(event.relatedTarget instanceof Node && root.contains(event.relatedTarget)) ) { leave(); }
	}

	function onDrop(event: DragEvent): void {

		if ( taken(event) ) {

			event.preventDefault();
			event.stopPropagation();

			leave();

			const { dataTransfer, clientX, clientY } = event;

			const source = service.dragged();
			const internal = source !== undefined && dataTransfer.getData(source.type) === source.id;
			const box = internal ? document.getElementById(source.element)?.getBoundingClientRect() : undefined;

			/*
			 * Outside content is read here, since a DataTransfer cannot be read once the drop event is over; an item
			 * of the page glides from the box it stood in under the pointer as it was dropped.
			 */

			const load: Load = internal
				? { source, from: box && new DOMRect(clientX-box.width/2, clientY-box.height/2, box.width, box.height) }
				: {
					files: [...dataTransfer.files],
					strings: Object.fromEntries([...dataTransfer.types]
						.map(type => type.toLowerCase())
						.filter(type => type !== "files" && accepts(entry.accept, [type]))
						.map(type => [type, dataTransfer.getData(type)])
					)
				};

			void service.drop({ target: entry, side: locate(event) }, load);

		}

	}

	function onDragEnd(): void {
		leave();
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
 * Checks whether a target takes any of the types a transfer carries.
 *
 * Types are compared regardless of case, since browsers lowercase the types they expose during a drag.
 *
 * @param accept The MIME types the target takes
 * @param types The MIME types the transfer carries
 *
 * @returns `true` if `accept` and `types` share at least one type
 */
function accepts(accept: readonly string[], types: readonly string[]): boolean {

	const taken = new Set(accept.map(type => type.toLowerCase()));

	return types.some(type => taken.has(type.toLowerCase()));

}

/**
 * Settles the answer of a target to a drop.
 *
 * A rejected promise ends the wait as a fulfilled one does, taking the drop, and is passed on unhandled, as if it had
 * never been returned, so a target reporting failures catches them in the promise it returns.
 *
 * @param outcome The answer of the target
 *
 * @returns A promise resolving to `false` if the target refused the drop, and to `true` otherwise
 */
function settle(outcome: Awaitable<boolean | void>): Promise<boolean> {

	return Promise.resolve(outcome).then(value => value !== false, error => {

		void Promise.reject(error); // passed on unhandled, as if the target had never returned it

		return true;

	});

}

/**
 * Words the announcement closing a transfer.
 *
 * @param source The name of the item moved
 * @param target The name of the target it was moved to
 * @param taken Whether the target took the item
 * @param side The side of the target the item landed on, for a target taking sides; the target itself if omitted
 *
 * @returns The English sentence telling a reader how the transfer ended
 */
function announcement(source: string, target: string, taken: boolean, side?: Side): string {

	const place = `${side ?? "to"} ${target}`;

	return taken ? `${source} moved ${place}.` : `Moving ${source} ${place} was refused.`;

}

/**
 * Names the content of an outside drop for announcements.
 *
 * @param files The files dropped
 *
 * @returns The name of the file dropped, the count of the files dropped, or `Content` where no file was dropped
 */
function describe(files: readonly File[]): string {
	return files.length > 1 ? `${files.length} files` : files[0]?.name ?? "Content";
}

/**
 * Converts a CSS time to milliseconds.
 *
 * Takes both units CSS states times in: a registered `<time>` property reads back in seconds whatever unit it took.
 *
 * @param time The CSS time, such as `200ms` or `0.2s`
 *
 * @returns The duration of `time` in milliseconds, or `0` if `time` is no CSS time
 */
function milliseconds(time: string): number {

	const match = /^\s*(-?[\d.]+)(ms|s)\s*$/i.exec(time);
	const value = match ? parseFloat(match[1] ?? "") : NaN;

	return Number.isFinite(value) ? match?.[2]?.toLowerCase() === "s" ? value*1000 : value : 0;

}

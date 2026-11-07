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
 * Transfer rules.
 *
 * Settles what a transfer means independently of how it is performed: which targets take which types, where on a
 * target an item lands, how the answer of a target reads, and what a reader is told once a transfer ends.
 *
 * Touch readers drag as well on browsers that fire no drag events from a finger: a long press on a draggable element
 * starts a drag, and the native drag events follow as the finger moves and lifts, so targets need no touch code.
 *
 * @module
 */

import { type Optional } from "@metreeca/core";

/**
 * The side of a target an item lands on, nearest the pointer along the vertical axis.
 */
export type Edge = "before" | "after";

/**
 * The answer of a target to a drop.
 *
 * Nothing takes the drop and `false` refuses it; a promise keeps the drop waiting until it settles, refusing it if it
 * resolves to `false`.
 */
export type Outcome = void | boolean | Promise<void | boolean>;


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
export function accepts(accept: readonly string[], types: readonly string[]): boolean {

	const taken = new Set(accept.map(type => type.toLowerCase()));

	return types.some(type => taken.has(type.toLowerCase()));

}

/**
 * Locates the side of a target nearest a point.
 *
 * @param box The vertical extent of the target
 * @param y The vertical coordinate of the point, in the same space as `box`
 *
 * @returns `"before"` if `y` falls in the upper half of `box`, `"after"` otherwise
 */
export function edge(box: { readonly top: number, readonly height: number }, y: number): Edge {
	return y < box.top+box.height/2 ? "before" : "after";
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
export function settle(outcome: Outcome): Promise<boolean> {

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
 * @param edge The side of the target the item landed on, for a target taking edges; the target itself if omitted
 *
 * @returns The English sentence telling a reader how the transfer ended
 */
export function announcement(source: string, target: string, taken: boolean, edge?: Edge): string {

	const place = `${edge ?? "to"} ${target}`;

	return taken ? `${source} moved ${place}.` : `Moving ${source} ${place} was refused.`;

}

/**
 * Names the content of an outside drop for announcements.
 *
 * @param files The files dropped
 *
 * @returns The name of the file dropped, the count of the files dropped, or `Content` where no file was dropped
 */
export function describe(files: readonly File[]): string {
	return files.length > 1 ? `${files.length} files` : files[0]?.name ?? "Content";
}

/**
 * Converts a CSS time to milliseconds.
 *
 * Takes both units CSS states times in, since a registered `<time>` property reads back in seconds whatever unit it
 * was declared in.
 *
 * @param time The CSS time, such as `200ms` or `0.2s`
 *
 * @returns The duration of `time` in milliseconds, or `0` if `time` is no CSS time
 */
export function milliseconds(time: string): number {

	const match = /^\s*(-?[\d.]+)(ms|s)\s*$/i.exec(time);
	const value = match ? parseFloat(match[1] ?? "") : NaN;

	return Number.isFinite(value) ? match?.[2]?.toLowerCase() === "s" ? value*1000 : value : 0;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
 * Checks whether the browser leaves touch drags undone.
 *
 * Firefox for Android and Samsung Internet fire no drag events from a finger; other touch browsers drag natively.
 *
 * @param window The window to check
 *
 * @returns `true` if `window` runs on a touch device whose browser fires no drag events from a finger
 */
export function lacking(window: Window): boolean {

	const { userAgent, maxTouchPoints } = window.navigator;

	return maxTouchPoints > 0 && /Android/.test(userAgent) && /Firefox|SamsungBrowser/.test(userAgent);

}

/**
 * Installs touch drags on a document.
 *
 * @param document The document whose draggable elements are to follow touch
 *
 * @returns A function removing the touch listeners
 */
export function install(document: Document): () => void {

	const window = document.defaultView;

	return window === null ? () => {} : follow(document, window); // a document with no window has no touch to follow

}

/**
 * Follows touch gestures on the draggable elements of a document, dispatching the drag events they stand for.
 *
 * @returns A function removing the touch listeners
 */
function follow(document: Document, window: Window): () => void {

	let press: Optional<{ readonly source: HTMLElement, readonly x: number, readonly y: number, readonly timer: number }>;
	let drag: Optional<{ readonly source: HTMLElement, readonly data: DataTransfer, readonly ghost: HTMLElement, over: Optional<Element>, accepted: boolean }>;

	/*
	 * The gesture is a foreign lifetime spanning several events, so its state is held in two locals the listeners
	 * share, the press while the finger rests and the drag once it moves, both reset as either one ends.
	 */

	function dispatch(type: string, target: EventTarget, init: { clientX: number, clientY: number }): boolean {

		const event = new DragEvent(type, {
			bubbles: true,
			cancelable: true,
			clientX: init.clientX,
			clientY: init.clientY,
			dataTransfer: drag?.data ?? null
		});

		return target.dispatchEvent(event);

	}

	function start(): void {

		if ( press === undefined ) { return; }

		const { source, x, y } = press;
		const data = new DataTransfer();
		const ghost = source.cloneNode(true) as HTMLElement; // cloneNode is typed as Node, but a clone keeps the element type

		const box = source.getBoundingClientRect();

		/*
		 * The preview stands for the item to the eye alone: hidden from assistive technology, out of reach of the focus,
		 * and stripped of the ids it copied, which the item still answers to and its references still point at.
		 */

		[ghost, ...ghost.querySelectorAll("[id]")].forEach(element => element.removeAttribute("id"));

		ghost.setAttribute("aria-hidden", "true");
		ghost.inert = true;

		Object.assign(ghost.style, {
			position: "fixed", left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`,
			pointerEvents: "none", opacity: "0.8", zIndex: "2147483647"
		});

		press = undefined;
		drag = { source, data, ghost, over: undefined, accepted: false };

		document.body.append(ghost);
		dispatch("dragstart", source, { clientX: x, clientY: y });

	}

	function move(x: number, y: number): void {

		if ( drag === undefined ) { return; }

		const box = drag.ghost.getBoundingClientRect();

		drag.ghost.style.translate = `${x-box.left-box.width/2}px ${y-box.top-box.height/2}px`;

		const over = document.elementFromPoint(x, y) ?? undefined;

		if ( over !== drag.over ) {
			if ( drag.over ) { dispatch("dragleave", drag.over, { clientX: x, clientY: y }); }
			if ( over ) { dispatch("dragenter", over, { clientX: x, clientY: y }); }
			drag.over = over;
		}

		drag.accepted = over !== undefined && !dispatch("dragover", over, { clientX: x, clientY: y });

	}

	function end(x: number, y: number, cancelled: boolean): void {

		if ( press !== undefined ) { window.clearTimeout(press.timer); press = undefined; }

		if ( drag === undefined ) { return; }

		const { source, ghost, over, accepted } = drag;

		if ( over && accepted && !cancelled ) {
			dispatch("drop", over, { clientX: x, clientY: y });
		} else if ( over ) {
			dispatch("dragleave", over, { clientX: x, clientY: y });
		}

		dispatch("dragend", source, { clientX: x, clientY: y });

		ghost.remove();
		drag = undefined;

	}


	function onTouchStart(event: TouchEvent): void {

		const touch = event.touches[0];
		const source = event.touches.length === 1 && event.target instanceof Element
			? event.target.closest<HTMLElement>("[draggable='true']")
			: null;

		if ( touch && source ) {
			press = {
				source, x: touch.clientX, y: touch.clientY,
				timer: window.setTimeout(start, Hold)
			};
		}

	}

	function onTouchMove(event: TouchEvent): void {

		const touch = event.touches[0];

		if ( touch === undefined ) {
			return;
		} else if ( drag !== undefined ) {
			event.preventDefault(); // the finger drags rather than scrolls
			move(touch.clientX, touch.clientY);
		} else if ( press !== undefined && Math.hypot(touch.clientX-press.x, touch.clientY-press.y) > Slop ) {
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

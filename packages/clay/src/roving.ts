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
 * Roving focus.
 *
 * Makes a group of controls, such as the tabs of a strip, the cards of a board or the buttons of a toolbar, a single
 * stop for `Tab`, the arrow keys moving the focus from item to item and `Home` and `End`
 * reaching the first and the last, after the roving tabindex pattern of the ARIA Authoring Practices:
 *
 * ```tsx
 * function Toolbar({ tools }: { tools: readonly string[] }) {
 *
 *   const [active, setActive] = useState<string>();
 *   const { tabIndex, onKeyDown } = useRoving({ items: tools, active, id: tool => `tool-${tool}`, onMove: setActive });
 *
 *   return <div role="toolbar" onKeyDown={onKeyDown}>{tools.map(tool =>
 *     <button key={tool} id={`tool-${tool}`} tabIndex={tabIndex(tool)} onFocus={() => setActive(tool)}>{tool}</button>
 *   )}</div>;
 *
 * }
 * ```
 *
 * The group keeps the item it last stood on as its state, so the stop stays where the reader left it; the hook moves
 * the focus and leaves keeping it in step to the group, which updates it as an item is focused by any means.
 *
 * @see [ARIA Authoring Practices: Managing Focus Within Components Using a Roving tabindex](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_roving_tabindex)
 *
 * @module
 */

import { type Optional } from "@metreeca/core";


/**
 * The keys moving the focus along each orientation, with the step each one takes.
 */
const Keys: Readonly<Record<"horizontal" | "vertical" | "both", Readonly<Record<string, number>>>> = {
	horizontal: { ArrowRight: +1, ArrowLeft: -1, Home: -Infinity, End: +Infinity },
	vertical: { ArrowDown: +1, ArrowUp: -1, Home: -Infinity, End: +Infinity },
	both: { ArrowRight: +1, ArrowDown: +1, ArrowLeft: -1, ArrowUp: -1, Home: -Infinity, End: +Infinity }
};

/**
 * The fields that keep the keys and presses aimed at them, moving a caret or a value rather than the focus or the
 * item they stand in: enabled text and value controls, native or carrying the matching role, and editable regions.
 */
const Fields = [
	"input:not([disabled]):not([type='button']):not([type='checkbox']):not([type='color']):not([type='file'])"
	+":not([type='image']):not([type='radio']):not([type='reset']):not([type='submit'])",
	"select:not([disabled])",
	"textarea:not([disabled])",
	"[contenteditable]:not([contenteditable='false'])",
	...["combobox", "scrollbar", "searchbox", "slider", "spinbutton", "textbox"].map(role => `[role~='${role}']`)
].join(", ");


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Makes a group of controls a single stop for `Tab`.
 *
 * @param options The group configuration
 *
 * @returns The tab index of each item and the keyboard handler of the group
 */
export function useRoving({

	items,
	active,
	id,
	orientation = "both",
	wrap = false,
	onMove

}: {

	/**
	 * The keys of the items the focus moves among, in display order; an item left out of them is passed over by the
	 * arrow keys, which is how a group keeps a disabled control out of their reach while leaving it on show.
	 */
	items: readonly string[]

	/**
	 * The key of the item the focus last stood on, which holds the stop of the group; the first item holds it
	 * instead where `active` is omitted, or where the item it names is no longer among the `items` of the group.
	 */
	active?: Optional<string>

	/**
	 * Retrieves the DOM id of the element standing for an item, which takes the focus once moved to.
	 */
	id: (item: string) => string

	/**
	 * The axis the arrow keys move along: `horizontal` takes the left and right arrows, `vertical` the up and
	 * down ones and `both` all four, every arrow key outside the chosen axis being left to the browser as it is.
	 */
	orientation?: "horizontal" | "vertical" | "both"

	/**
	 * Whether a step past either end comes round from the other, rather than stopping at the end.
	 */
	wrap?: boolean

	/**
	 * Notified with the key of the item a key moved the focus to, before the focus moves, so the group stores
	 * the key and hands it back as `active` from the next render, keeping the stop where the reader left it.
	 */
	onMove?: (item: string) => void

}): {

	/**
	 * Retrieves the tab index of an item: `0` for the item holding the stop, `-1` for the others.
	 */
	readonly tabIndex: (item: string) => 0 | -1

	/**
	 * Handles the keys moving the focus, claiming them from the browser; the group attaches the handler to the
	 * element holding its items, which receives the keys pressed on any of them as they bubble up to it. Keys pressed
	 * on a field inside an item, such as a text input, are left to the field, which moves its caret or value with them.
	 */
	readonly onKeyDown: (event: KeyboardEvent) => void

} {

	const holder = stop(items, active);

	return {

		tabIndex: item => item === holder ? 0 : -1,

		onKeyDown: event => {

			const offset = Keys[orientation][event.key];
			const target = offset === undefined || fielded(event.target) || event.altKey || event.ctrlKey || event.metaKey
				? undefined
				: step(items, active, offset, wrap);

			if ( target !== undefined ) {

				event.preventDefault();

				onMove?.(target);

				document.getElementById(id(target))?.focus();

			}

		}

	};

}

/**
 * Tells whether a key or a press lands in a field.
 *
 * @param target The target of the event the key or the press raised
 *
 * @returns `true` if `target` is an element standing in a field, so the key or the press is left to the field, which
 *     moves its caret or its value with it rather than the focus or the item it stands in; `false` otherwise
 */
export function fielded(target: EventTarget | null): boolean {
	return target instanceof Element && target.closest(Fields) !== null;
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Picks the item holding the `Tab` stop of a group.
 *
 * @param items The keys of the items of the group, in display order
 * @param active The key of the item the focus last stood on, if any
 *
 * @returns `active` if it still stands among `items`, or the first of `items` otherwise; undefined for no items
 */
function stop(items: readonly string[], active: Optional<string>): Optional<string> {
	return active !== undefined && items.includes(active) ? active : items[0];
}

/**
 * Steps from an item of a group to another.
 *
 * @param items The keys of the items of the group, in display order
 * @param active The key of the item the focus stands on, if any; where it stands among no item, the step starts
 *     from the {@link stop} of the group, which the first item holds once the item the focus left is gone
 * @param offset How many items to step by, forwards if positive; `±Infinity` reaches the last or the first item
 * @param wrap Whether a step past either end comes round from the other, rather than stopping at the end
 *
 * @returns The key of the item stepped to; undefined if `items` is empty
 */
function step(items: readonly string[], active: Optional<string>, offset: number, wrap: boolean): Optional<string> {

	const from = items.indexOf(stop(items, active) ?? "");
	const target = from+offset;

	// an infinite offset has no remainder, so it reaches the end by clamping whether wrapping or not

	const index = wrap && Number.isFinite(offset)
		? ((target%items.length)+items.length)%items.length
		: Math.min(Math.max(target, 0), items.length-1);

	return items[index];

}

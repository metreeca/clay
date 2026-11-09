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
 * Keyboard focus within groups of controls.
 *
 * Makes a group of controls, such as the tabs of a strip, the cards of a board or the buttons of a toolbar, a single
 * stop in the `Tab` sequence, so a keyboard reader crosses the whole group with one keystroke rather than one per item,
 * and moves the focus among its items, after the roving tabindex pattern of the ARIA Authoring Practices:
 *
 * - **Arrow keys** step to the previous or the next item along the axis the group is laid out on, or along both axes
 *   for a group with no fixed one; at either end they stop or come round from the other end, as the group chooses
 * - **`Home` and `End`** reach the first and the last item
 * - **Unavailable items**, such as disabled controls, stay on show while the arrow keys pass over them
 * - **Fields inside an item**, such as a text input, keep the keys they need to move their caret or change their value,
 *   and every key pressed with `Alt`, `Ctrl` or `Meta` is left to the browser, so shortcuts keep working
 *
 * ```tsx
 * function Toolbar({ tools }: { tools: readonly string[] }) {
 *
 *   const [active, setActive] = useState<string>();
 *   const { tabIndex, onKeyDown } = useFocus({
 *     items: tools, active, identify: tool => `tool-${tool}`, onMove: setActive
 *   });
 *
 *   return <div role="toolbar" onKeyDown={onKeyDown}>{tools.map(tool =>
 *     <button key={tool} id={`tool-${tool}`} tabIndex={tabIndex(tool)} onFocus={() => setActive(tool)}>{tool}</button>
 *   )}</div>;
 *
 * }
 * ```
 *
 * The group remembers the item the focus last stood on, so `Tab` brings the reader back where they left it. The item is
 * held in the state of the group, not in the hook: the group updates it from the focus events of its items, so the
 * stop follows the focus however it moves, by keys, by pointer or by a script calling `focus()`.
 *
 * @see [ARIA Authoring Practices: Managing Focus Within Components Using a Roving
 *     tabindex](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/#kbd_roving_tabindex)
 *
 * @module
 */

import { type Optional } from "@metreeca/core";
import { immutable } from "@metreeca/core/values";
import { isReserved } from "./index.js";


/**
 * Focus bindings of a group of controls, as returned by {@link useFocus}.
 *
 * The group gives each item the tab index retrieved by `tabIndex` and attaches `onKeyDown` to the element holding its
 * items, so the whole group takes a single stop in the `Tab` sequence and the arrow keys move the focus among them.
 */
export type Focus = {

	/**
	 * Retrieves the tab index of an item: `0` for the item holding the stop, `-1` for the others.
	 */
	readonly tabIndex: (item: string) => 0 | -1

	/**
	 * Handles the keys moving the focus, claiming them from the browser. The group attaches the handler to the element
	 * holding its items, so it receives the keys pressed on any of them. Keys {@link isReserved | reserved} for a
	 * field inside an item, such as a text input, are left to the field to move its caret or change its value.
	 */
	readonly onKeyDown: (event: KeyboardEvent) => void

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Makes a group of controls a single stop for `Tab`, moving the focus among its items with the arrow keys.
 *
 * The group renders each item with the tab index the hook returns and attaches the keyboard handler to the element
 * holding the items. It stores the item the focus lands on, from `onMove` and from the focus events of the items, and
 * hands it back as `active` on the next render, so the stop stays on the item the reader left.
 *
 * @param options The group configuration
 *
 * @returns The tab index of each item and the keyboard handler of the group
 */
export function useFocus({

	wrap = false,
	orientation,

	items,
	active,
	identify,

	onMove

}: {

	/**
	 * Whether a step past either end comes round from the other, rather than stopping at the end.
	 */
	wrap?: boolean

	/**
	 * The axis the arrow keys move along: `horizontal` takes the left and right arrows, `vertical` the up and down
	 * ones, and the arrows of the other axis are left to the browser. If omitted, as for a group with no fixed axis,
	 * all four arrows move the focus, the right and down arrows stepping forwards, the left and up ones backwards.
	 */
	orientation?: "horizontal" | "vertical"


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
	identify: (item: string) => string


	/**
	 * Notified with the key of the item a key moved the focus to, before the focus moves, so the group stores
	 * the key and hands it back as `active` from the next render, keeping the stop where the reader left it.
	 */
	onMove?: (item: string) => void

}): Focus {

	const holder = active !== undefined && items.includes(active) ? active : items[0];

	return immutable({

		tabIndex: item => item === holder ? 0 : -1,

		onKeyDown: event => {

			const offset = stride(event.key);
			const target = offset === undefined || isReserved(event) || event.altKey || event.ctrlKey || event.metaKey
				? undefined
				: step(offset);

			if ( target !== undefined ) {

				event.preventDefault();

				onMove?.(target);

				document.getElementById(identify(target))?.focus();

			}

		}

	});


	function stride(key: string): Optional<number> {

		const horizontal = orientation !== "vertical";
		const vertical = orientation !== "horizontal";

		return key === "Home" ? -Infinity
			: key === "End" ? +Infinity
				: horizontal && key === "ArrowRight" || vertical && key === "ArrowDown" ? +1
					: horizontal && key === "ArrowLeft" || vertical && key === "ArrowUp" ? -1
						: undefined;

	}

	function step(offset: number): Optional<string> {

		const target = items.indexOf(holder ?? "")+offset;

		// an infinite offset has no remainder, so it reaches the end by clamping whether wrapping or not

		const index = wrap && Number.isFinite(offset)
			? ((target%items.length)+items.length)%items.length
			: Math.min(Math.max(target, 0), items.length-1);

		return items[index];

	}

}

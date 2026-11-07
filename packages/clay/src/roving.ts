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
import { Fields, step, stop } from "./roving.core.js";


/**
 * The keys moving the focus along each orientation, with the step each one takes.
 */
const Keys: Readonly<Record<"horizontal" | "vertical" | "both", Readonly<Record<string, number>>>> = {
	horizontal: { ArrowRight: +1, ArrowLeft: -1, Home: -Infinity, End: +Infinity },
	vertical: { ArrowDown: +1, ArrowUp: -1, Home: -Infinity, End: +Infinity },
	both: { ArrowRight: +1, ArrowDown: +1, ArrowLeft: -1, ArrowUp: -1, Home: -Infinity, End: +Infinity }
};


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
	const offsets = Keys[orientation];

	return {

		tabIndex: item => item === holder ? 0 : -1,

		onKeyDown: event => {

			const offset = offsets[event.key];
			const field = event.target instanceof Element && event.target.closest(Fields) !== null;
			const target = offset === undefined || field || event.altKey || event.ctrlKey || event.metaKey
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

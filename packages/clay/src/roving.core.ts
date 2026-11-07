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
 * Roving focus rules.
 *
 * Settles which item of a group holds its single `Tab` stop and which item a key moving the focus lands on, so
 * every group drawing a roving focus, a tab strip or a board alike, keeps the stop and steps the same way.
 *
 * @module
 */

import { type Optional } from "@metreeca/core";


/**
 * The fields that keep the keys and presses aimed at them, moving a caret or a value rather than the focus or the
 * item they stand in: enabled text and value controls, native or carrying the matching role, and editable regions.
 */
export const Fields = [
	"input:not([disabled]):not([type='button']):not([type='checkbox']):not([type='color']):not([type='file'])"
	+":not([type='image']):not([type='radio']):not([type='reset']):not([type='submit'])",
	"select:not([disabled])",
	"textarea:not([disabled])",
	"[contenteditable]:not([contenteditable='false'])",
	...["combobox", "scrollbar", "searchbox", "slider", "spinbutton", "textbox"].map(role => `[role~='${role}']`)
].join(", ");


/**
 * Picks the item holding the `Tab` stop of a group.
 *
 * @param items The keys of the items of the group, in display order
 * @param active The key of the item the focus last stood on, if any
 *
 * @returns `active` if it still stands among `items`, or the first of `items` otherwise; undefined for no items
 */
export function stop(items: readonly string[], active: Optional<string>): Optional<string> {
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
export function step(items: readonly string[], active: Optional<string>, offset: number, wrap: boolean): Optional<string> {

	const from = items.indexOf(stop(items, active) ?? "");
	const target = from+offset;

	const index = !Number.isFinite(offset) ? (offset > 0 ? items.length-1 : 0)
		: wrap ? ((target%items.length)+items.length)%items.length
			: Math.min(Math.max(target, 0), items.length-1);

	return items[index];

}

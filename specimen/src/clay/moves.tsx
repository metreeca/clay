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
 * Move menu sample.
 *
 * @module
 */

import { useFocus } from "@metreeca/clay/focus";
import { type ComponentChildren } from "preact";
import { useId, useState } from "preact/hooks";


/**
 * A move a menu offers.
 */
export interface Choice {

	readonly label: string;
	readonly action: () => void;

}


/**
 * Creates a move menu.
 *
 * Draws a button opening a menu of moves, the single-pointer alternative to dragging an item that WCAG 2.5.7 asks for:
 * the button is the grip of the item or its `More` button. Opening the menu focuses its first move; the arrow keys,
 * `Home` and `End` step through the moves, and the menu closes on a choice, on `Escape`, or as the focus leaves it,
 * handing the focus back to the button. The item opens the same menu on `contextmenu` through {@link opening}.
 *
 * @param options The menu configuration
 *
 * @returns The move menu
 */
export function Moves({

	id,
	label,
	choices,
	children

}: {

	/**
	 * The DOM id of the button; a fresh one if omitted.
	 */
	id?: string

	/**
	 * The accessible name of the button, naming the item it moves.
	 */
	label: string

	/**
	 * The moves offered; the button is disabled if none is open.
	 */
	choices: readonly Choice[]

	/**
	 * The icon drawn on the button.
	 */
	children: ComponentChildren

}) {

	const own = useId();
	const trigger = id ?? own;
	const menu = useId();

	const [open, setOpen] = useState(false);
	const [active, setActive] = useState<string>();

	const labels = choices.map(choice => choice.label);
	const item = (label: string) => `${menu}-${labels.indexOf(label)}`; // ids by position, labels carrying spaces

	const { tabIndex, onKeyDown } = useFocus({
		wrap: true, orientation: "vertical", items: labels, active, identify: item, onMove: setActive
	});

	function show(): void {
		const [first] = labels;

		setOpen(true);
		setActive(first);
		requestAnimationFrame(() => first === undefined ? undefined : document.getElementById(item(first))?.focus());
	}

	function close(): void {
		setOpen(false);
		requestAnimationFrame(() => document.getElementById(trigger)?.focus());
	}

	return <span class="moves"

		onFocusOut={event => event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)
			? undefined
			: setOpen(false)
		}

		onKeyDown={event => event.key === "Escape" && open ? close() : undefined}

	>

		<button id={trigger} type="button"

			aria-label={label}
			aria-haspopup="menu"
			aria-expanded={open}
			aria-controls={menu}
			disabled={choices.length === 0}

			onClick={() => open ? close() : show()}

		>{children}</button>

		<ul id={menu} role="menu" aria-labelledby={trigger} hidden={!open} onKeyDown={onKeyDown}>{choices.map(choice =>

			<li key={choice.label} role="none">
				<button id={item(choice.label)} type="button" role="menuitem" tabIndex={tabIndex(choice.label)}
					onFocus={() => setActive(choice.label)}
					onClick={() => { choice.action(); close(); }}
				>{choice.label}</button>
			</li>

		)}</ul>

	</span>;

}

/**
 * Opens a move menu on `contextmenu`.
 *
 * Leaves the browser its own menu where the reader asks for it, with `Shift` held or text selected, so copying from
 * an item stays possible, while a plain right click on the item opens the moves its menu button offers.
 *
 * @param trigger The DOM id of the button opening the move menu
 *
 * @returns A `contextmenu` handler for the item the menu belongs to
 */
export function opening(trigger: string): (event: MouseEvent) => void {
	return event => {

		const selected = (window.getSelection()?.toString() ?? "").length > 0;

		if ( !event.shiftKey && !selected ) {
			event.preventDefault();
			document.getElementById(trigger)?.click();
		}

	};
}

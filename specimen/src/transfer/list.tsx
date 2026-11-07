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
 * Sortable list sample.
 *
 * @module
 */

import { type Drop, type Edge, useSource, useTarget } from "@metreeca/clay/transfer";
import { Icon } from "@metreeca/clay-widgets/icon";
import { Moves, opening } from "@metreeca/specimen/transfer/moves.js";
import { useId, useState } from "preact/hooks";
import "./transfer.css";


const StepType = "application/x-specimen-step";

const steps = ["Gather the requirements", "Sketch the screens", "Build the prototype", "Test with readers", "Ship it"];


/**
 * Reorders a list, moving an item next to another one.
 */
function reorder(items: readonly string[], item: string, next: string, edge: Edge): readonly string[] {

	const rest = items.filter(key => key !== item);
	const index = rest.indexOf(next)+(edge === "after" ? 1 : 0);

	return [...rest.slice(0, index), item, ...rest.slice(index)];

}


/**
 * Creates the list section.
 *
 * Shows a list reordered by dragging each step by its grip, the drop indicator standing on the side of the step the
 * pointer is nearest; the grip doubles as the button opening the moves, for the keyboard and for a single tap.
 *
 * @returns The list section
 */
export function List() {

	const [items, setItems] = useState<readonly string[]>(steps);

	function onDrop(drop: Drop, next: string): void {
		if ( "source" in drop && drop.source.id !== next ) {
			setItems(items => reorder(items, drop.source.id, next, drop.edge ?? "before"));
		}
	}

	return <>

		<p>Steps are dragged by their grip to a new place, a line telling where they will land. Pressing a grip opens
			the same moves as a menu, for the keyboard and for a single tap.</p>

		<ol class="transfer-list">{items.map((item, index) =>

			<Step key={item} item={item}
				previous={items[index-1]} next={items[index+1]}
				onDrop={drop => onDrop(drop, item)}
			/>

		)}</ol>

	</>;

}


function Step({

	item,
	previous,
	next,
	onDrop

}: {

	item: string
	previous?: string
	next?: string
	onDrop: (drop: Drop) => void

}) {

	const element = useId();
	const handle = useId();
	const grip = useId();

	const { dragging, dropping, move } = useSource({ id: item, name: item, element, handle, focus: grip, type: StepType });
	const { edge } = useTarget({ id: item, name: item, element, accept: [StepType], edges: true, onDrop });

	const choices = [
		...(previous === undefined ? [] : [{ label: "Move up", action: () => void move(previous, "before") }]),
		...(next === undefined ? [] : [{ label: "Move down", action: () => void move(next, "after") }])
	];

	return <li id={element} class="transfer-item"
		data-state={dragging ? "dragging" : dropping ? "dropping" : undefined}
		data-edge={dragging ? undefined : edge}
		onContextMenu={opening(grip)}
	>

		{/* the grip is wrapped, since Firefox starts no drag from a button */}
		<span id={handle} class="transfer-grip">
			<Moves id={grip} label={`Move ${item}`} choices={choices}><Icon.Grip/></Moves>
		</span>

		<span>{item}</span>

	</li>;

}

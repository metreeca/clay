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
 * Transfer samples.
 *
 * @module
 */

import { type Drop, type Edge, useSource, useTarget } from "@metreeca/clay/transfer";
import { Icon } from "@metreeca/clay-widgets/icon";
import { Moves, opening } from "@metreeca/specimen/clay/moves.js";
import { useId, useState } from "preact/hooks";
import "./transfer.css";


/**
 * Creates the transfer section.
 *
 * Shows items moved by dragging and through menus: cards across the columns of a board, steps within a list, and
 * files or links dropped from outside the page.
 *
 * @returns The transfer section
 */
export function Transfer() {
	return <>

		<h3>Columns</h3>

		<Columns/>

		<h3>List</h3>

		<List/>

		<h3>Uploads</h3>

		<Uploads/>

	</>;
}


const Issue = "application/x-specimen-issue";

const columns = ["To Do", "Doing", "Done"];

const issues = [
	{ id: "1", column: "To Do", title: "Fix the login timeout" },
	{ id: "2", column: "Doing", title: "Trim the export headers" },
	{ id: "3", column: "To Do", title: "Draft the release notes" },
	{ id: "4", column: "To Do", title: "Book the review room" },
	{ id: "5", column: "Done", title: "Collect the figures" }
];

type Issue = typeof issues[number];


/**
 * Creates the columns section.
 *
 * Shows a kanban board whose cards are dragged by their whole surface, each with a `More` button offering the same
 * moves without dragging. Moves wait on a simulated store, which takes a moment to settle each one and refuses any
 * issue skipping straight from to do to done.
 *
 * @returns The columns section
 */
function Columns() {

	const [items, setItems] = useState(issues);

	function move(id: string, column: string): false | Promise<void> {

		const issue = items.find(item => item.id === id);

		return issue === undefined || issue.column === "To Do" && column === "Done" ? false
			: new Promise<void>(resolve => setTimeout(resolve, 800)).then(() =>
				setItems(items => items.map(item => item.id === id ? { ...item, column } : item))
			);

	}

	return <>

		<p>Cards are dragged by their whole surface, with the pointer or by touch after a brief hold, into another column.
			Each card carries a <em>More</em> button listing the same moves, for the keyboard and for a single tap. A move
			waits for the store, the card standing faded meanwhile; this store refuses a card skipping straight from to do
			to done.</p>

		<div class="transfer-board">{columns.map(column =>

			<Column key={column} column={column} items={items.filter(item => item.column === column)}
				onDrop={drop => "source" in drop ? move(drop.source.id, column) : false}
			/>

		)}</div>

	</>;

}


function Column({

	column,
	items,
	onDrop

}: {

	column: string
	items: readonly Issue[]
	onDrop: (drop: Drop) => false | Promise<void>

}) {

	const element = useId();
	const heading = useId();

	const { target } = useTarget({ id: column, name: column, element, accept: [Issue], onDrop });

	return <section id={element} aria-labelledby={heading} data-target={target || undefined}>

		<h4 id={heading}>{column}</h4>

		<ul role="list">{items.map(item => <Card key={item.id} item={item}/>)}</ul>

	</section>;

}


function Card({ item }: { item: Issue }) {

	const element = useId();
	const more = useId();

	const { dragging, dropping, pending, targets, move } = useSource({
		id: item.id, name: item.title, element, focus: more, type: Issue, payload: { "text/plain": item.title }
	});

	return <li id={element} class="transfer-item"

		aria-busy={pending || undefined}
		data-state={pending ? "pending" : dragging ? "dragging" : dropping ? "dropping" : undefined}
		data-surface

		onContextMenu={opening(more)}

	>

		<span>{item.title}</span>

		<Moves id={more} label={`More actions for ${item.title}`} choices={targets
			.filter(target => target.id !== item.column)
			.map(target => ({ label: `Move to ${target.name}`, action: () => void move(target.id) }))
		}><Icon.More/></Moves>

	</li>;

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
function List() {

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


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates the uploads section.
 *
 * Shows a zone taking files dropped from the desktop and links dropped from another app, beside a native file input
 * offering the same upload with a single pointer, as WCAG 2.5.7 asks for.
 *
 * @returns The uploads section
 */
function Uploads() {

	const element = useId();
	const input = useId();

	const [received, setReceived] = useState<readonly string[]>([]);
	const [chosen, setChosen] = useState("");

	const { target } = useTarget({
		id: "uploads", name: "Uploads", element, accept: ["Files", "text/uri-list"],
		onDrop: drop => "source" in drop ? false : setReceived(received => [
			...received,
			...drop.files.map(file => file.name),
			...(drop.strings["text/uri-list"]?.split(/\r?\n/).filter(line => line && !line.startsWith("#")) ?? [])
		])
	});

	return <>

		<p>Files dropped from the desktop and links dropped from another app land in the zone below. The file input
			beside it offers the same upload with a single pointer.</p>

		<div id={element} class="transfer-uploads" data-target={target || undefined}>

			<label for={input}>Drop files or links here, or choose files</label>

			<input id={input} type="file" multiple onChange={({ currentTarget }) => {

				const names = [...currentTarget.files ?? []].map(file => file.name);

				setReceived(received => [...received, ...names]);
				setChosen(names.length === 1 ? `${names[0]} received.` : `${names.length} files received.`);

			}}/>

			{/* drops are announced by the transfer context; files chosen through the input are announced here */}

			<p role="status" class="transfer-status">{chosen}</p>

			<ul role="list">{received.map((name, index) => <li key={index}>{name}</li>)}</ul>

		</div>

	</>;

}

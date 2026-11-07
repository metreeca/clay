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
 * Board sample.
 *
 * @module
 */

import { type Drop, useSource, useTarget } from "@metreeca/clay/transfer";
import { Icon } from "@metreeca/clay-widgets/icon";
import { Moves, opening } from "@metreeca/specimen/transfer/moves.js";
import { useId, useState } from "preact/hooks";
import "./transfer.css";


const Issue = "application/x-specimen-issue";

const columns = ["To do", "Doing", "Done"];

const issues = [
	{ id: "1", column: "To do", title: "Fix the login timeout" },
	{ id: "2", column: "Doing", title: "Trim the export headers" },
	{ id: "3", column: "To do", title: "Draft the release notes" },
	{ id: "4", column: "To do", title: "Book the review room" },
	{ id: "5", column: "Done", title: "Collect the figures" }
];

type Issue = typeof issues[number];


/**
 * Creates the board section.
 *
 * Shows a kanban board whose cards are dragged by their whole surface, each with a `More` button offering the same
 * moves without dragging. Moves wait on a simulated store, which takes a moment to settle each one and refuses any
 * issue skipping straight from to do to done.
 *
 * @returns The board section
 */
export function Board() {

	const [items, setItems] = useState(issues);

	function move(id: string, column: string): false | Promise<void> {

		const issue = items.find(item => item.id === id);

		return issue === undefined || issue.column === "To do" && column === "Done" ? false
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

		<h3 id={heading}>{column}</h3>

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

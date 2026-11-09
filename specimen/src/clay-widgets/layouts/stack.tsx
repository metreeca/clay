/*
 * Copyright © 2025-2026 Metreeca srl
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
 * Stack samples.
 *
 * @module
 */

import { Stack } from "@metreeca/clay-widgets/stack";
import { Frame, Items } from "@metreeca/specimen/clay-widgets/sample.js";
import "../index.css";


type Options = Parameters<typeof Stack>[0]


const labels = [ "One", "Two", "Three" ];
const ragged = [ "A", "Bravo", "Charlie Delta" ];

const places: ReadonlyArray<NonNullable<Options["place"]>> = [ "start", "center", "end", "spread", "head", "tail" ];
const aligns: ReadonlyArray<NonNullable<Options["align"]>> = [ "start", "center", "end", "stretch" ];
const looks: ReadonlyArray<NonNullable<Options["look"]>> = [ "subtle", "normal", "strong" ];


/**
 * Creates the stack section.
 *
 * Shows items laid out one below the other, where they sit along a stack taller than they are, where each sits
 * across it, and the sunken, flat or raised surface a stack given a look sets them on.
 *
 * @returns The stack section
 */
export function Stacks() {
	return <>

		<p>A stack lays out what it holds as a column, one item below the other, set apart by a step of the spacing
			ladder. It carries no semantics of its own: it is a layout, and nothing else.</p>

		<p>Told to grow, a stack takes the room its container leaves, and <code>place</code> decides where the items
			sit in it: packed at either end or in the middle, spread from edge to edge, or split with the first item
			alone at the top and the others at the bottom (<code>head</code>), or the last alone at the
			bottom (<code>tail</code>), as a sidebar keeps its settings.</p>

		<div class="frames across tall">{places.map(place =>

			<Frame key={place} label={<code>place="{place}"</code>}>
				<Stack grow place={place} space="spacing050"><Items labels={labels}/></Stack>
			</Frame>
		)}</div>

		<p>Across the column, <code>align</code> decides where each item sits: against either edge, in the middle, or
			stretched to the full width, which is where a stack starts. The items below differ in width, so each setting
			reads off the ragged edge they leave.</p>

		<div class="frames across">{aligns.map(align =>

			<Frame key={align} label={<code>align="{align}"</code>}>
				<Stack align={align} space="spacing050"><Items labels={ragged}/></Stack>
			</Frame>
		)}</div>

		<p>Given a <code>look</code>, a stack sets its items on a padded, rounded surface of its own: sunk below the
			page (<code>subtle</code>), flat on the colour around it (<code>normal</code>), or raised and edged by a
			border (<code>strong</code>). A stack stating no look draws nothing, whatever the look around it.</p>

		<div class="frames across">{looks.map(look =>

			<Frame key={look} label={<code>look="{look}"</code>}>
				<Stack look={look} space="spacing050"><Items labels={labels}/></Stack>
			</Frame>
		)}</div>

	</>;
}

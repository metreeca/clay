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
 * Guard samples.
 *
 * @module
 */

import { Board, usePosts } from "@metreeca/clay/board";
import { Button } from "@metreeca/clay-widgets/button";
import { Empty } from "@metreeca/clay-widgets/empty";
import { Guard } from "@metreeca/clay-widgets/guard";
import { Icon } from "@metreeca/clay-widgets/icon";
import { useState } from "preact/hooks";
import "./index.css";


/**
 * Creates the guard section.
 *
 * Confines a failing widget to its own area, the fallback taking its place and the failure reaching the board.
 *
 * @returns The guard section
 */
export function Guards() {

	const [round, setRound] = useState(0);

	return <>

		<p>A guard confines a failure to the part of the screen it broke: once something it holds fails while rendering,
			a fallback takes its place, the rest of the screen goes on working, and the failure is raised on the board
			for a reader to see. Break the widget below and watch the post appear; reset to mount it again.</p>

		<Board>

			<div class="columns">

				<Guard key={round} fallback={<Empty look="strong"><Icon.Alert/>This part stopped working</Empty>}>
					<Fragile/>
				</Guard>

				<Posts/>

			</div>

			<div class="controls">
				<Button look="subtle" label="Reset" onClick={() => setRound(round + 1)}/>
			</div>

		</Board>

	</>;

}


/**
 * A widget failing on request, as a defect would make it fail on its own.
 */
function Fragile() {

	const [broken, setBroken] = useState(false);

	if ( broken ) {
		throw new Error("The widget stopped working");
	}

	return <Empty look="strong">
		<Icon.Accept/>
		<Button mode="danger" label="Break" onClick={() => setBroken(true)}/>
	</Empty>;

}

/**
 * Lists the posts the guard raised.
 */
function Posts() {

	const posts = usePosts();

	return posts.length === 0 ? <p><em>No failures raised.</em></p>
		: <ul>{posts.map(({ instance, status, message }) => <li key={instance}><code>{status}</code> {message}</li>)}</ul>;

}

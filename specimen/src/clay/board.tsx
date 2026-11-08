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
 * Board samples.
 *
 * @module
 */

import { Board as BoardProvider, useBoard, usePosts } from "@metreeca/clay/board";
import { Button } from "@metreeca/clay-widgets/button";
import "../clay-widgets/index.css";


/**
 * Creates the board section.
 *
 * Puts posts up on a status board from one component and lists them from another, neither knowing of the other.
 *
 * @returns The board section
 */
export function Board() {
	return <>

		<p>A component running an operation puts it up on the shared <code>Board</code> as a post, without knowing who
			shows it; a component showing posts lists them, without knowing who put them up. Below, the buttons and the
			list are two components sharing nothing but the board. Toasts are one way of showing the same posts, as the
			widgets page shows.</p>

		<BoardProvider>
			<Sources/>
			<Posts/>
		</BoardProvider>

	</>;
}


/**
 * Puts posts up, keeping each operation under one identity so that its outcome replaces its progress.
 */
function Sources() {

	const board = useBoard();

	function save() {

		const pending = board.post({ status: "pending", message: "Saving the changes…" });

		setTimeout(() => board.post({ instance: pending.instance, status: "success", message: "Changes saved" }), 1500);

	}

	return <div class="controls">
		<Button label="Save" onClick={save}/>
		<Button label="Fail" mode="danger" onClick={() => board.raise(new Error("The editor stopped working"))}/>
		<Button look="subtle" label="Clear" onClick={() => board.clear()}/>
	</div>;

}

/**
 * Lists the posts standing on the board, as plain text.
 */
function Posts() {

	const posts = usePosts();

	return posts.length === 0 ? <p><em>No posts on the board.</em></p>
		: <ul>{posts.map(({ instance, status, message }) => <li key={instance}>
			<code>{status}</code> {message}
		</li>)}</ul>;

}

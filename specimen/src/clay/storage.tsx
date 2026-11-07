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
 * Storage samples.
 *
 * @module
 */

import { useStorage } from "@metreeca/clay/storage";
import { Button } from "@metreeca/clay-widgets/button";
import "../clay-widgets/index.css";


/**
 * Creates the storage section.
 *
 * Keeps two notes in Web Storage, one per storage area, so the difference between the two is seen across a reload and
 * across the tabs of the site open in the browser at the same time.
 *
 * @returns The storage section
 */
export function Storage() {

	const [kept, setKept] = useStorage(localStorage, "specimen-note-local", "");
	const [held, setHeld] = useStorage(sessionStorage, "specimen-note-session", "");

	return <>

		<p>A value kept with <code>useStorage</code> survives a reload. In <code>localStorage</code> it is shared by every
			tab of the site and stays in step whichever tab writes it: open this page in a second tab and type in the first
			field to watch it follow. In <code>sessionStorage</code> it lasts as long as the tab and stays with it.
			Clearing a value removes it from storage, bringing the initial one back.</p>

		<div class="controls">
			<label>Kept in every tab{" "}
				<input value={kept} placeholder="Type a note" onInput={event => setKept(event.currentTarget.value)}/>
			</label>
			<Button look="subtle" label="Clear" onClick={() => setKept(undefined)}/>
		</div>

		<div class="controls">
			<label>Held by this tab{" "}
				<input value={held} placeholder="Type a note" onInput={event => setHeld(event.currentTarget.value)}/>
			</label>
			<Button look="subtle" label="Clear" onClick={() => setHeld(undefined)}/>
		</div>

		<p>The colour scheme chosen in the bar is kept the same way, so it carries across pages and visits.</p>

	</>;

}

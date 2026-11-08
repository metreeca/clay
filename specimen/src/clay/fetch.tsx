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
 * Fetch samples.
 *
 * @module
 */

import { app } from "@metreeca/clay";
import { useFetch, useFetching } from "@metreeca/clay/fetch";
import { Button } from "@metreeca/clay-widgets/button";
import { Icon } from "@metreeca/clay-widgets/icon";
import { useState } from "preact/hooks";
import "../clay-widgets/index.css";


/**
 * Creates the fetch section.
 *
 * Runs exchanges through the shared client, showing what each one answered and whether the client is busy.
 *
 * @returns The fetch section
 */
export function Fetch() {

	const fetch = useFetch();
	const fetching = useFetching();

	const [answers, setAnswers] = useState<readonly string[]>([]);

	function exchange() {

		const started = performance.now();

		void fetch(app.base).then(response => setAnswers(answers => [
			`${response.status} ${response.headers.get("Content-Type") ?? ""} in ${Math.round(performance.now() - started)} ms`,
			...answers
		].slice(0, 3)));

	}

	return <>

		<p>The page is assembled with one shared client, configured once with <code>Fetch</code> and reached anywhere
			below it with <code>useFetch</code>; here it answers every exchange from a mock after a second. While any
			exchange is in flight <code>useFetching</code> says so, which is what fades the shell and turns its mark: start
			a couple at once and watch the frame wait for the last.</p>

		<div class="controls">
			<Button icon={<Icon.Search/>} label="Run an exchange" onClick={exchange}/>
			<span>{fetching ? "Busy…" : "Idle"}</span>
		</div>

		{answers.length > 0 && <ul>{answers.map((answer, index) => <li key={`${index}:${answer}`}><code>{answer}</code></li>)}</ul>}

	</>;

}

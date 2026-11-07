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
 * Upload zone sample.
 *
 * @module
 */

import { useTarget } from "@metreeca/clay/transfer";
import { useId, useState } from "preact/hooks";
import "./transfer.css";


/**
 * Creates the uploads section.
 *
 * Shows a zone taking files dropped from the desktop and links dropped from another app, beside a native file input
 * offering the same upload with a single pointer, as WCAG 2.5.7 asks for.
 *
 * @returns The uploads section
 */
export function Uploads() {

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

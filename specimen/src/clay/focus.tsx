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
 * Group focus samples.
 *
 * @module
 */

import { useFocus } from "@metreeca/clay/focus";
import { useId, useState } from "preact/hooks";
import "../clay-widgets/index.css";


const tools = ["Bold", "Italic", "Underline", "Code", "Link"];


/**
 * Creates the focus section.
 *
 * Makes a toolbar a single tab stop, the arrow keys moving the focus between its buttons.
 *
 * @returns The focus section
 */
export function Focus() {

	const id = useId();

	const [active, setActive] = useState(tools[0]);
	const [pressed, setPressed] = useState<string>();

	const { tabIndex, onKeyDown } = useFocus({
		wrap: true, orientation: "horizontal", items: tools, active, identify: tool => `${id}-${tools.indexOf(tool)}`, onMove: setActive
	});

	return <>

		<p>A group of controls takes a single stop with <code>useFocus</code>: <kbd>Tab</kbd> lands on the item last
			moved to, the arrow keys move from item to item, wrapping at both ends, and <kbd>Home</kbd> and <kbd>End</kbd>
			reach either end. Tabs, cards and menus build on the same hook. Tab into the toolbar below and try the keys.</p>

		<div class="controls" role="toolbar" aria-label="Formatting" onKeyDown={onKeyDown}>{tools.map((tool, index) =>
			<button
				key={tool}
				id={`${id}-${index}`}
				type="button"
				tabIndex={tabIndex(tool)}
				aria-pressed={tool === pressed}
				onClick={() => {
					setActive(tool);
					setPressed(tool === pressed ? undefined : tool);
				}}
			>{tool}</button>
		)}</div>

	</>;

}

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
 * Shell samples.
 *
 * @module
 */


/**
 * Creates the shell section.
 *
 * Shows the frame a screen is laid out in by pointing at the one this page stands in, rather than nesting a second
 * frame inside it.
 *
 * @returns The shell section
 */
export function Shells() {
	return <>

		<p>The frame around this page is a shell: a tray of standing controls beside the content, each a header over a
			body over a footer, each scrolling on its own the whole height of the window while its bars stay in view.
			The headers of the two columns stand at the same height, and so do the footers, whichever holds more. A
			screen states what goes in each slot and leaves the arrangement to the shell.</p>

		<table>

			<thead>
				<tr>
					<th>Slot</th>
					<th>Holds</th>
					<th>On this page</th>
				</tr>
			</thead>

			<tbody>
				<tr><td><code>logo</code></td><td>the start of the tray header</td><td>the lockup, leading home</td></tr>
				<tr><td><code>meta</code></td><td>the end of the tray header</td><td>nothing</td></tr>
				<tr><td><code>tray</code></td><td>the tray body</td><td>the outline of this page</td></tr>
				<tr><td><code>info</code></td><td>the tray footer</td><td>the reader signed in or the way in, and the lock</td></tr>
				<tr><td><code>head</code></td><td>the start of the content header</td><td>the packages</td></tr>
				<tr><td><code>menu</code></td><td>the end of the content header</td><td>the widescreen and exchange controls, the colour scheme</td></tr>
				<tr><td><code>foot</code></td><td>the content footer</td><td>the copyright and the release</td></tr>
			</tbody>

		</table>

		<p>Three switches reshape the frame, two of them worked on this very page:</p>

		<ul>
			<li><code>wide</code> takes the content widescreen, lifting the measure it is otherwise capped at; the
				chevrons in the content header set it</li>
			<li><code>lock</code> takes the tray out of reach for pointer and keyboard alike; the padlock in the tray
				footer sets it for a second</li>
			<li><code>main</code> leaves the tray out of the frame altogether, for a screen meant to be seen through</li>
		</ul>

		<p>Waiting is stated by the shell itself: while the shared client has exchanges in flight, the frame fades and a
			turning mark stands in place of the controls at the end of the content header. The search control there runs
			an exchange against a mock answering after a second, so the whole of it can be watched.</p>

	</>;
}

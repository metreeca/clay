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
 * Junk shell samples.
 *
 * @module
 */

import { app } from "@metreeca/clay";
import { Button } from "@metreeca/clay-widgets/button";
import { Choice } from "@metreeca/clay-widgets/choice";
import { Icon } from "@metreeca/clay-widgets/icon";
import { Link } from "@metreeca/clay-widgets/link";
import { Logo } from "@metreeca/clay-widgets/logo";
import { TOC } from "@metreeca/clay-widgets/toc";
import { Junk } from "@metreeca/clay-widgets/junk";
import { useFetch } from "@metreeca/clay/fetch";
import { ClayWidgetsPath, schemes, useScheme } from "@metreeca/specimen/index.core.js";
import { useState } from "preact/hooks";
import "./junk.css";


/**
 * Creates the junk shell screen.
 *
 * Lays a whole screen out in a junk shell, filling every slot and offering every switch from the bars of the shell
 * itself, while the content documents what each slot holds and what each switch does.
 *
 * @returns The junk shell screen
 */
export function JunkScreen() {

	const fetch = useFetch();

	const [scheme, setScheme] = useScheme();

	const [wide, setWide] = useState(false);
	const [lock, setLock] = useState(false);
	const [main, setMain] = useState(false);


	function edit() {

		setLock(true);

		setTimeout(() => setLock(false), 1000);

	}


	return <Junk

		wide={wide}
		lock={lock}
		main={main}

		logo={<Link look="subtle" href={`${ClayWidgetsPath}#junk`}>
			<Logo/><span class="brand">@metreeca/<strong>clay</strong></span>
		</Link>}

		meta={<span>v{VERSION}</span>}

		tray={<TOC name="Sections" compact entries={[
			{ label: "Slots", href: "#slots" },
			{ label: "Switches", href: "#switches" },
			{ label: "Waiting", href: "#waiting" }
		]}/>}

		info={<Button icon={lock ? <Icon.Unlock/> : <Icon.Lock/>} look="subtle" name="Lock the tray"
			title="Lock the tray" onClick={edit}
		/>}

		head="Junk Shell"

		menu={<>

			<Button
				icon={main ? <Icon.PanelLeftOpen/> : <Icon.PanelLeftClose/>}
				look="subtle"
				name={main ? "Show the tray" : "Leave the tray out"}
				title={main ? "Show the tray" : "Leave the tray out"}
				onClick={() => setMain(!main)}
			/>

			<Button
				icon={wide ? <Icon.ChevronsRightLeft/> : <Icon.ChevronsLeftRight/>}
				look="subtle"
				name={wide ? "Cap the measure" : "Go widescreen"}
				title={wide ? "Cap the measure" : "Go widescreen"}
				onClick={() => setWide(!wide)}
			/>

			<Button
				icon={<Icon.Search/>}
				look="subtle"
				name="Run an exchange"
				title="Run an exchange"
				onClick={() => { void fetch(app.base); }}
			/>

			<Choice name="Colour scheme" options={schemes} value={scheme} onChange={setScheme}/>

		</>}

		copy={<span>{app.copy}</span>}

		foot={<code>@metreeca/clay-widgets/junk</code>}

	>

		<hgroup>
			<p>@metreeca/clay-widgets</p>
			<h1>Junk Shell</h1>
			<p>The frame the screens of an app or a tool are laid out in. A screen states what goes in each slot and
				leaves arranging and scrolling them to the shell.</p>
		</hgroup>

		<p>The shell lays a screen out as two columns filling the window, the tray beside the content, each a header over
			a body over a footer. Each column scrolls on its own, the whole height of the window, its bars staying in view
			while the body passes beneath them. The headers of the two columns stand at the same height, and so do the
			footers, whichever holds more.</p>

		<hgroup id="slots">
			<p>Junk Shell</p>
			<h2>Slots</h2>
		</hgroup>

		<figure class="schema">

			<div>
				<header><code>logo</code><code>meta</code></header>
				<section><code>tray</code></section>
				<footer><code>info</code></footer>
			</div>

			<div>
				<header><code>head / done</code><code>menu / back</code></header>
				<section><code>children</code><code>copy</code></section>
				<footer><code>foot</code></footer>
			</div>

			<figcaption>Where each slot stands: the tray beside the content, each column a header over a body over a
				footer, the alternative after a slash taking the place of the slot before it.</figcaption>

		</figure>

		<table>

			<thead>
				<tr>
					<th>Slot</th>
					<th>Holds</th>
					<th>On this screen</th>
				</tr>
			</thead>

			<tbody>
				<tr><td><code>logo</code></td><td>the start of the tray header</td><td>the lockup, leading back to the specimen</td></tr>
				<tr><td><code>meta</code></td><td>the end of the tray header</td><td>the release</td></tr>
				<tr><td><code>tray</code></td><td>the tray body</td><td>the outline of this screen</td></tr>
				<tr><td><code>info</code></td><td>the tray footer</td><td>the lock</td></tr>
				<tr><td><code>head</code></td><td>the start of the content header, naming the content</td><td>the name of the screen</td></tr>
				<tr><td><code>menu</code></td><td>the end of the content header</td><td>the switches and the colour scheme</td></tr>
				<tr><td><code>done</code></td><td>the way out, in place of <code>head</code></td><td>nothing</td></tr>
				<tr><td><code>back</code></td><td>the step before, in place of <code>menu</code></td><td>nothing</td></tr>
				<tr><td><code>copy</code></td><td>the notice closing the content, scrolling with it</td><td>the copyright</td></tr>
				<tr><td><code>foot</code></td><td>the content footer</td><td>the module</td></tr>
			</tbody>

		</table>

		<hgroup id="switches">
			<p>Junk Shell</p>
			<h2>Switches</h2>
		</hgroup>

		<p>Three switches reshape the frame, each worked from the bars of this screen:</p>

		<ul>
			<li><code>main</code> leaves the tray out of the frame altogether, for a screen meant to be seen through
				rather than moved around in; the panel control in the content header sets it</li>
			<li><code>wide</code> takes the content widescreen, lifting the measure it is otherwise capped at; the
				chevrons in the content header set it</li>
			<li><code>lock</code> takes the tray out of reach for pointer and keyboard alike; the padlock in the tray
				footer sets it for a second</li>
		</ul>

		<hgroup id="waiting">
			<p>Junk Shell</p>
			<h2>Waiting</h2>
		</hgroup>

		<p>Waiting is stated by the shell itself: while the shared client has exchanges in flight, the frame fades and a
			turning mark stands in place of the controls at the end of the content header. The search control there runs
			an exchange against a mock answering after a second, so the whole of it can be watched.</p>

	</Junk>;

}

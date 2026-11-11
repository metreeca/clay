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
 * Tool shell samples.
 *
 * @module
 */

import { app } from "@metreeca/clay";
import { Button } from "@metreeca/clay-widgets/button";
import { Icon } from "@metreeca/clay-widgets/icon";
import { Logo } from "@metreeca/clay-widgets/logo";
import { Strip } from "@metreeca/clay-widgets/strip";
import { TOC } from "@metreeca/clay-widgets/toc";
import { Tool } from "@metreeca/clay-widgets/tool";
import { useFetch, useFetching } from "@metreeca/clay/fetch";
import { useRouter } from "@metreeca/clay/router";
import { ClayWidgetsPath } from "@metreeca/specimen/index.core.js";
import { useState } from "preact/hooks";
import "./tool.css";


/**
 * Creates the tool shell screen.
 *
 * Lays a whole screen out in a tool shell, filling every slot, while the content documents what each slot holds.
 *
 * @returns The tool shell screen
 */
export function ToolScreen() {

	const router = useRouter();
	const fetch = useFetch();
	const busy = useFetching();

	const [wide, setWide] = useState(false);
	const [locked, setLocked] = useState(false);
	const [tucked, setTucked] = useState(false);

	return <Tool

		wide={wide}
		busy={busy}
		locked={locked}
		tucked={tucked}

		meta={<Button
			icon={<Logo/>}
			look="subtle"
			name="@metreeca/clay"
			title="@metreeca/clay"
			onClick={() => router(`${ClayWidgetsPath}#tool`)}
		/>}

		tray={<TOC name="Sections" compact entries={{
			Slots: "#slots",
			Switches: "#switches",
			Knobs: "#knobs"
		}}/>}

		more={<Button icon={<Icon.Settings/>} look="subtle" name="Settings" title="Settings"/>}

		head={<strong>Tool Shell</strong>}

		menu={<Strip align="center">

			<Button
				icon={tucked ? <Icon.PanelLeftOpen/> : <Icon.PanelLeftClose/>}
				look="subtle"
				name={tucked ? "Show the side column" : "Leave the side column out"}
				title={tucked ? "Show the side column" : "Leave the side column out"}
				onClick={() => setTucked(!tucked)}
			/>

			<Button
				icon={locked ? <Icon.Unlock/> : <Icon.Lock/>}
				look="subtle"
				name={locked ? "Unlock the side column" : "Lock the side column"}
				title={locked ? "Unlock the side column" : "Lock the side column"}
				onClick={() => setLocked(!locked)}
			/>

			<Button
				icon={wide ? <Icon.ChevronsRightLeft/> : <Icon.ChevronsLeftRight/>}
				look="subtle"
				name={wide ? "Cap the main column" : "Go wide"}
				title={wide ? "Cap the main column" : "Go wide"}
				onClick={() => setWide(!wide)}
			/>

			<Button
				icon={<Icon.Send/>}
				look="subtle"
				name="Send a request"
				title="Send a request"
				onClick={() => { void fetch(app.base); }}
			/>

		</Strip>}

		foot={<code>@metreeca/clay-widgets/tool</code>}

	>

		<hgroup>
			<p>@metreeca/clay-widgets</p>
			<h1>Tool Shell</h1>
			<p>The frame the screens of an app or a tool are laid out in: a side column of standing controls beside a
				main column holding the content of the moment.</p>
		</hgroup>

		<p>The shell lays a screen out as two columns, each with a head, a body and a foot. The heads of the two columns
			always match in height, and so do the feet. The body of each column scrolls on its own, while its head and
			foot stay in view.</p>

		<hgroup id="slots">
			<p>Tool Shell</p>
			<h2>Slots</h2>
		</hgroup>

		<figure class="schema">

			<div>
				<header><code>meta</code></header>
				<section><code>tray</code></section>
				<footer><code>more</code></footer>
			</div>

			<div>
				<header><code>head</code><code>menu</code></header>
				<section><code>children</code></section>
				<footer><code>foot</code></footer>
			</div>

			<figcaption>Where each slot stands: the side column beside the main one, each a head over a body over a
				foot.</figcaption>

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
				<tr><td><code>meta</code></td><td>the head of the side column</td><td>the lockup, leading back to the specimen</td></tr>
				<tr><td><code>tray</code></td><td>the body of the side column</td><td>the outline of this screen</td></tr>
				<tr><td><code>more</code></td><td>the foot of the side column</td><td>the settings</td></tr>
				<tr><td><code>head</code></td><td>the head of the main column, or the top of its body where two columns do not fit</td><td>the name of the screen</td></tr>
				<tr><td><code>menu</code></td><td>the end of the head of the main column</td><td>the switches and the send button</td></tr>
				<tr><td><code>children</code></td><td>the body of the main column</td><td>this documentation</td></tr>
				<tr><td><code>foot</code></td><td>the foot of the main column</td><td>the module</td></tr>
			</tbody>

		</table>

		<hgroup id="switches">
			<p>Tool Shell</p>
			<h2>Switches</h2>
		</hgroup>

		<p>Three switches reshape the frame, each worked from the buttons in the menu at the end of the main head:</p>

		<ul>
			<li><code>tucked</code> leaves the side column out of the frame, for a screen meant to be seen through rather
				than moved around in; the panel button sets it</li>
			<li><code>locked</code> takes the side column out of reach for pointer and keyboard alike, fading what it
				holds; the padlock sets it</li>
			<li><code>wide</code> lets the main column take the whole width of the frame, past its width limit; the
				chevrons set it</li>
		</ul>

		<p>Waiting is stated by the app through <code>busy</code>, which this screen sets while the shared fetch client
			has a request in flight: the frame ignores input aimed inside it, leaving the focus where it stands, then fades
			and announces waiting to screen readers. The send button runs a request against a mock answering after two
			seconds, so the whole of it can be watched.</p>

		<hgroup id="knobs">
			<p>Tool Shell</p>
			<h2>Knobs</h2>
		</hgroup>

		<p>The geometry and type of the frame are tuned through custom properties, set on a single shell or on any
			element containing shells:</p>

		<table>

			<thead>
				<tr>
					<th>Knob</th>
					<th>Tunes</th>
				</tr>
			</thead>

			<tbody>
				<tr><td><code>--clay-tool-side-width</code></td><td>the width of the side column</td></tr>
				<tr><td><code>--clay-tool-main-width</code></td><td>the widest the main column grows before the columns centre</td></tr>
				<tr><td><code>--clay-tool-frame-gutter</code></td><td>the inline gutter of the frame, against the window edges</td></tr>
				<tr><td><code>--clay-tool-side-gutter</code></td><td>the inline gutter of the side column</td></tr>
				<tr><td><code>--clay-tool-main-gutter</code></td><td>the inline gutter of the main column</td></tr>
				<tr><td><code>--clay-tool-head-gutter</code></td><td>the block gutter of the heads</td></tr>
				<tr><td><code>--clay-tool-body-gutter</code></td><td>the block gutter of the bodies</td></tr>
				<tr><td><code>--clay-tool-foot-gutter</code></td><td>the block gutter of the feet</td></tr>
				<tr><td><code>--clay-tool-head-font-size</code></td><td>the font size of the heads, the text size unless set</td></tr>
				<tr><td><code>--clay-tool-foot-font-size</code></td><td>the font size of the feet, the text size unless set</td></tr>
			</tbody>

		</table>

	</Tool>;

}

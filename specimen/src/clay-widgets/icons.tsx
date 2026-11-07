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
 * Icon samples.
 *
 * @module
 */

import { Icon } from "@metreeca/clay-widgets/icon";
import { type Entry } from "@metreeca/specimen/sample";
import { css, skin } from "@metreeca/skin";
import "./icons.css";


/**
 * The name of an icon role and the glyph standing for it.
 */
type Glyph = readonly [string, Icon.LucideIcon]

/**
 * The name of an area of the interface and the roles it answers for.
 */
type Area = readonly [string, ReadonlyArray<Glyph>]


/**
 * The scaling ladder, which sizes whatever is measured against the text rather than spaced from it.
 */
const scalings: ReadonlyArray<Entry> = [

	[ skin.scaling025, "a dot no larger than the full stop beside it" ],
	[ skin.scaling050, "a bullet or a caret, half the height of the text" ],
	[ skin.scaling075, "a mark subordinate to its text" ],
	[ skin.scaling090, "a mark set a shade below the text" ],
	[ skin.scaling100, "an icon beside a label" ],
	[ skin.scaling110, "a mark set a shade above it" ],
	[ skin.scaling125, "a roundel or a swatch" ],
	[ skin.scaling150, "a glyph standing without a label" ],
	[ skin.scaling200, "a mark heading a panel" ],
	[ skin.scaling250, "a display mark on an empty or failed screen" ]

];

const areas: ReadonlyArray<Area> = [

	[ "Session", [
		[ "LogIn", Icon.LogIn ],
		[ "LogOut", Icon.LogOut ]
	] ],

	[ "Navigation", [
		[ "Link", Icon.Link ],
		[ "Open", Icon.Open ],
		[ "Back", Icon.Back ]
	] ],

	[ "Disclosure", [
		[ "Expand", Icon.Expand ],
		[ "Collapse", Icon.Collapse ]
	] ],

	[ "Search", [
		[ "Search", Icon.Search ],
		[ "Clear", Icon.Clear ],
		[ "Reset", Icon.Reset ],
		[ "Options", Icon.Options ]
	] ],

	[ "Ordering", [
		[ "Sort", Icon.Sort ],
		[ "Increasing", Icon.Increasing ],
		[ "Decreasing", Icon.Decreasing ]
	] ],

	[ "Collections", [
		[ "Insert", Icon.Insert ],
		[ "Remove", Icon.Remove ]
	] ],

	[ "Records", [
		[ "Create", Icon.Create ],
		[ "Update", Icon.Update ],
		[ "Save", Icon.Save ],
		[ "Delete", Icon.Delete ]
	] ],

	[ "Confirmation", [
		[ "Accept", Icon.Accept ],
		[ "Cancel", Icon.Cancel ],
		[ "Close", Icon.Close ]
	] ],

	[ "Items", [
		[ "Grip", Icon.Grip ],
		[ "More", Icon.More ]
	] ],

	[ "Modes", [
		[ "Menu", Icon.Menu ],
		[ "Done", Icon.Done ]
	] ],

	[ "Notices", [
		[ "About", Icon.About ],
		[ "Info", Icon.Info ],
		[ "Alert", Icon.Alert ],
		[ "Help", Icon.Help ]
	] ],

	[ "Failures", [
		[ "Unauthorized", Icon.Unauthorized ],
		[ "Forbidden", Icon.Forbidden ],
		[ "NotFound", Icon.NotFound ],
		[ "Error", Icon.Error ]
	] ]

];

const strokes: ReadonlyArray<number> = [ 1, 1.5, 2, 3 ];

const tints: ReadonlyArray<Entry> = [

	[ skin.color, "a mark in the text colour, which it takes by inheritance" ],
	[ skin.colorEnabled, "a mark on an enabled control" ],
	[ skin.colorHover, "a mark under the pointer" ],
	[ skin.colorLabel, "a mark beside secondary text" ],
	[ skin.colorDisabled, "a mark on a control taking no input" ],
	[ skin.colorFail, "a mark telling a failure" ]

];


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates the icons section.
 *
 * Shows the roles a glyph is asked for by, grouped by the area of the interface each answers for, and what a glyph
 * takes from the text around it: the step of the scaling ladder it is drawn at, the weight it is stroked at, and the
 * colour it inherits.
 *
 * @returns The icons section
 */
export function Icons() {
	return <>

		<p>An icon is asked for by the role it plays rather than by the shape it draws, so every control doing the same
			thing carries the same glyph, and pointing a role at another glyph changes all of them at once.</p>

		<h3>Roles</h3>

		<div class="icon-areas">{areas.map(([ area, marks ]) => <section key={area}>

			<h4>{area}</h4>

			<div class="icon-tiles">{marks.map(([ name, Mark ]) =>
				<figure key={name} class="icon-tile">
					<span><Mark/></span>
					<figcaption>{name}</figcaption>
				</figure>
			)}</div>

		</section>)}</div>

		<h3>Size</h3>

		<p>A glyph is drawn at <code>{skin.scaling100}</code>, so it rides with the text around it; any other step of
			the ladder is a size stated on purpose. Hover a step for what it is meant for.</p>

		<ol class="icon-band">{scalings.map(([ property, note ]) =>
			<li key={property} title={note} class={property === skin.scaling100 ? "icon-default" : undefined}>
				<span><Icon.Rocket style={{ width: css.var(property), height: css.var(property) }}/></span>
				<code>{property.slice(-3)}</code>
			</li>
		)}</ol>

		<h3>Stroke</h3>

		<p>Every glyph is stroked at <code>{skin.strokeWidth}</code>, in user units of the icon viewport, so the weight
			holds whatever size the glyph is drawn at.</p>

		<ol class="icon-band">{strokes.map(width =>
			<li key={width} class={width === 2 ? "icon-default" : undefined}>
				<span><Icon.Alert style={{ width: css.var(skin.scaling200), height: css.var(skin.scaling200), strokeWidth: width }}/></span>
				<code>{width}</code>
			</li>
		)}</ol>

		<h3>Colour</h3>

		<p>A glyph strokes <code>currentColor</code>, so it takes the colour of whatever it sits in and matches its
			label through every state.</p>

		<div class="icon-tiles wide">{tints.map(([ property, note ]) =>
			<figure key={property} class="icon-tile" style={{ color: css.var(property) }}>
				<span><Icon.Alert/></span>
				<figcaption><code>{property.replace(/^--skin--/, "")}</code><small>{note}</small></figcaption>
			</figure>
		)}</div>

	</>;
}

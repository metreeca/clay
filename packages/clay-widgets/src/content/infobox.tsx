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
 * Infobox.
 *
 * Lists the properties of an item, each value beside the label naming it. A sidebar or the body of a page then shows
 * what is known about an item, without a table laid out for the purpose or a layout written for each property.
 *
 * @module infobox
 */

import { isBoolean } from "@metreeca/core";
import { type ComponentChildren, createElement, Fragment } from "preact";
import "./infobox.css";


/**
 * Creates an infobox.
 *
 * Lists properties as label and value pairs, read by assistive technology as the terms and definitions of a single
 * list. Properties with an empty value are left out, and an infobox left with none renders nothing, so a screen
 * hands over whatever it knows about an item without first checking what is missing. A value is empty when it is
 * `undefined`, `null` or an empty string; any other value is shown, `0` included, and a boolean reads as its name.
 *
 * Consecutive infoboxes are set apart by a rule, so a screen groups related properties by giving each group its own
 * infobox, without drawing a separator of its own between one group and the next.
 *
 * @param options The widget configuration
 *
 * @returns The infobox, or `null` if no property carries a value
 */
export function Infobox({

	place = "start",

	children

}: {

	/**
	 * Where labels and values sit across the infobox. At the `start`, the default, labels keep to the left edge of their
	 * column as values do, wrapping alike, so both columns read as aligned text; in the `center`, labels sit flush
	 * against the values they introduce and long values wrap across lines, as fits the body of a page; with `spread`,
	 * labels keep to the left edge and values to the right one, clipped to a single line, so that each pair spans the
	 * full width of the infobox without wrapping and a list of properties stays compact, as fits a narrow sidebar.
	 */
	place?: "start" | "center" | "spread"


	/**
	 * The properties to show, either as values keyed by their labels, or as an array of entries where labels are not
	 * plain strings or have to be shown in a given order; nothing is rendered if omitted.
	 */
	children?:
		| { readonly [label: string]: ComponentChildren }
		| readonly { readonly label: ComponentChildren, readonly value: ComponentChildren }[]

}) {

	const pairs = Array.isArray(children)
		? children
		: Object.entries(children ?? {}).map(([label, value]) => ({ label, value }));

	const entries = pairs.filter(({ value }) =>
		value !== undefined && value !== null && value !== ""
	);

	return entries.length > 0 ? createElement("clay-infobox", {

		place

	}, <dl>{entries.map(({ label, value }, index) =>
		<Fragment key={index}>

			<dt>{label}</dt>
			<dd>{isBoolean(value) ? String(value) : value}</dd>

		</Fragment>
	)}</dl>) : null;

}

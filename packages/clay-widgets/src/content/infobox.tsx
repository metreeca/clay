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
 * Lists the properties of an item in sections of related properties, each value beside the label naming it. A sidebar
 * or the body of a page then shows what is known about an item, without a layout written for the purpose.
 *
 * @module infobox
 */

import { isBoolean, isObject } from "@metreeca/core";
import { type Some, some } from "@metreeca/core/arrays";
import { type ComponentChildren, createElement, Fragment } from "preact";
import "./infobox.css";


/**
 * Infobox section keyed by labels.
 *
 * Maps each plain string label to the value it names, so a section is written as a single object literal. Properties
 * are shown in the order their labels appear in the object, but labels reading as non-negative integers, such as
 * `2026`, always come first in ascending order, so a section needing them elsewhere takes {@link Property} entries.
 */
export type Properties = {

	readonly [label: string]: ComponentChildren

}

/**
 * Infobox entry.
 *
 * Pairs a value with the label naming it. Entries serve labels that are not plain strings, such as links or emphasised
 * text, and sections whose properties have to be shown in a given order, numeric labels included.
 */
export type Property = {

	/**
	 * The label naming the value.
	 */
	readonly label: ComponentChildren

	/**
	 * The value shown beside the label; an empty value leaves the whole entry out, as {@link Infobox} defines it.
	 */
	readonly value: ComponentChildren

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates an infobox.
 *
 * Lists properties as label and value pairs, grouped into sections. Assistive technology reads each section as the
 * terms and definitions of a list of its own, so each group of related properties is announced apart from the next.
 *
 * Properties with an empty value are left out, and so are sections left with none. An infobox left with no section
 * renders nothing, so a screen hands over whatever it knows about an item without checking what is missing. A value
 * is empty when it is `undefined`, `null` or an empty string. Any other value is shown, `0` included, and a boolean
 * reads as its name, `true` or `false`, rather than vanishing as it would in plain markup.
 *
 * Sections are set apart by a rule and share the label and value columns, so a screen groups related properties by
 * giving each group its own section, without drawing a separator of its own or aligning one group with the next.
 *
 * @param options The widget configuration
 *
 * @returns The infobox, or `null` if no property carries a value
 */
export function Infobox({

	wrap = false,
	align = "start",

	children

}: {

	/**
	 * Whether long values wrap across lines, so each is shown in full, as fits the body of a page. A word too long for
	 * its column breaks wherever needed. By default each value is clipped to a single line with an ellipsis, so a long
	 * value never stretches its row and a list of properties stays compact, as fits a narrow sidebar.
	 */
	wrap?: boolean

	/**
	 * Where labels sit within their column. At the `start`, the default, labels keep to the leading edge as values
	 * do, so both columns read as aligned text. At the `end`, labels sit flush against the values they introduce, so
	 * each label reads as the caption of its value rather than as an entry of a column of its own.
	 */
	align?: "start" | "end"


	/**
	 * The properties to show, as one section or as an array of sections. A section holds either values keyed by their
	 * labels, or an array of entries where labels are not plain strings or have to be shown in a given order. An array
	 * whose elements hold no keys but `label` and `value` is read as a single section of entries, so a section keyed by
	 * those two labels alone is given as an array of entries instead. Nothing is rendered if omitted.
	 */
	children?: Some<Properties | readonly Property[]>

}) {

	const sections = (isEntries(children) ? [children] : some(children))
		.map(section => entries(section).filter(({ value }) =>
			value !== undefined && value !== null && value !== ""
		))
		.filter(section => section.length > 0);

	return sections.length > 0 ? createElement("clay-infobox", {

		wrap,
		align

	}, sections.map((section, index) => <dl key={index}>{section.map(({ label, value }, index) =>
		<Fragment key={index}>

			<dt>{label}</dt>
			<dd>{isBoolean(value) ? String(value) : value}</dd>

		</Fragment>
	)}</dl>)) : null;


	function isEntries(children: Some<Properties | readonly Property[]>): children is readonly Property[] {
		return Array.isArray(children) && children.every(child =>
			isObject(child, { label: () => true, value: () => true })
		);
	}

	function entries(section: Properties | readonly Property[]): readonly Property[] {
		return Array.isArray(section) ? section : Object.entries(section).map(
			([label, value]) => ({ label, value })
		);
	}

}

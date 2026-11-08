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
 * Summary card.
 *
 * Sums up an item in a single block: its title and badge over a description, beside an image standing for it. A list
 * of search results or related items then reads as a run of cards without a layout written for each entry.
 *
 * @module card
 */

import { isContent } from "../index.js";
import { type ComponentChildren, createElement } from "preact";
import "./card.css";


/**
 * Creates a summary card.
 *
 * Sets the title over the description in a main column, and the badge over the image in a side column at the end of
 * the card, sized to its content up to the cap set by the `--clay-card-side-max-width` knob. A description with no
 * image beneath the side column runs on under the badge. Consecutive cards are set a spacing step apart, so a run of
 * them reads as a list of entries rather than as one block of text, with no layout written for each entry.
 *
 * Empty parts are left out, and a card left with none renders nothing, so a screen hands over whatever it knows about
 * an item without first checking what is missing. A part is empty when it is `undefined`, `null`, an empty string
 * or a boolean, as left by a conditional such as `label && <Link/>`; any other part is shown, `0` included.
 *
 * A card given a look sets its parts on a padded, rounded surface of its own, painting everything inside it as
 * standing on that surface, so a run of results reads as a deck of tiles rather than as a list of entries.
 *
 * @param options The widget configuration
 *
 * @returns The card, or `null` if every part is empty
 */
export function Card({

	look,

	title,
	badge,
	image,

	children

}: {

	/**
	 * The surface the card sets its parts on: sunk below the page (`subtle`), flat on the page colour (`normal`), or
	 * raised and edged by a border (`strong`); none if omitted, whatever the look of the area around the card.
	 */
	look?: "subtle" | "normal" | "strong"


	/**
	 * The title naming the item, at the top of the main column.
	 */
	title?: ComponentChildren

	/**
	 * The badge classifying the item, at the top of the side column across from the title: a line of text, chips or
	 * anything else kept to one line, clipped with an ellipsis where it outruns the column.
	 */
	badge?: ComponentChildren

	/**
	 * The image standing for the item, under the badge in the side column: a picture, captioned or not, as set by an
	 * {@link image!Image Image}, or an icon or initials, shown as given in the label colour the card sets for the badge.
	 */
	image?: ComponentChildren


	/**
	 * The description of the item, under the title in the main column.
	 */
	children?: ComponentChildren

}) {

	return [title, badge, image, children].some(isContent) ? createElement("clay-card", { look }, <>

		{isContent(title) && <span>{title}</span>}
		{isContent(badge) && <span class="badge">{badge}</span>}

		{isContent(children) && <div>{children}</div>}

		{isContent(image) && <i>{image}</i>}

	</>) : null;

}

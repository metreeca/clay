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
 * Captioned image.
 *
 * Sets a picture together with what is said about it, such as its credits, as one block held to the width of the
 * picture, so a card, a stack or a page places an image without a layout of its own for the caption beneath it.
 *
 * @module image
 */

import { isContent } from "../index.js";
import { type ComponentChildren, createElement } from "preact";
import "./image.css";


/**
 * Creates an image.
 *
 * Shows the picture scaled down to the room it is given, never stretched past its own size. A caption is set under
 * the picture and wraps within its width rather than widening the block; picture and caption are then exposed to
 * assistive technology as a figure named by its caption, so a screen reader announces the two together.
 *
 * A picture is decorative unless given a text alternative: it is left out of the accessibility tree, and out of the
 * layout if it fails to load. An alternative is owed wherever the picture tells something its surroundings do not.
 *
 * A caption is left out when it is `undefined`, `null`, an empty string or a boolean, as left by a conditional such as
 * `credits && <span/>`, so a screen hands over whatever it knows about the picture without checking first.
 *
 * @param options The widget configuration
 *
 * @returns The image
 */
export function Image({

	look, // deliberately left undefaulted, so an unstated look falls through to the one the area assigns

	src,
	alt = "",

	caption

}: {

	/**
	 * How loud the image appears: `subtle` sets the picture bare, `normal` outlines it with a quiet border, and
	 * `strong` holds picture and caption in a rounded box, the picture rounded to match.
	 *
	 * An image stating nothing takes the look the {@link style!Style styled area} around it assigns as `imageLook`,
	 * which is `normal` where nothing assigns it. Stating a look here answers to that alone, whatever the area says.
	 */
	look?: "subtle" | "normal" | "strong"


	/**
	 * The URL of the picture.
	 */
	src: string

	/**
	 * The text alternative standing for the picture where it is not seen; the picture is taken as decorative if empty.
	 */
	alt?: string


	/**
	 * The caption set under the picture, in the label colour, such as its credits.
	 */
	caption?: ComponentChildren

}) {

	const picture = <img alt={alt} src={src}/>;

	return createElement("clay-image", { look }, isContent(caption)
		? <figure>{picture}<figcaption>{caption}</figcaption></figure>
		: picture
	);

}

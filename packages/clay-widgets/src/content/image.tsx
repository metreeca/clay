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
 * picture, so a card, a stack or a page places an image, or floats it beside the text, with no layout of its own.
 *
 * @module image
 */

import { isContent } from "../index.js";
import { type ComponentChildren, createElement } from "preact";
import "./image.css";


/**
 * Creates an image.
 *
 * Shows the picture scaled down to the room it is given, or to a smaller box where one is set, and never stretched
 * past its own size. A caption is set under the picture and wraps within its width rather than widening the block.
 * Picture and caption are then exposed to assistive technology as one figure named by its caption.
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
	float,
	within,

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
	 * The side of the column the image floats to, in the writing direction.
	 *
	 * The text that follows a floating image wraps around it and keeps clear of it by the design system spacing. An
	 * image floating to no side stands in the column as a block of its own, with the text resuming below it.
	 */
	float?: "start" | "end"

	/**
	 * The box the picture is scaled down to fit within, as CSS lengths.
	 *
	 * A single length bounds both sides alike, and a pair bounds the width and then the height. A side given as `none`,
	 * or as a value CSS does not accept, takes no bound beyond the column, which limits the width but not the height.
	 *
	 * Percentages are relative to the column, and a percentage height has no effect because the column sets no height.
	 */
	within?: string | readonly [width: string, height: string]


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

	return createElement("clay-image", {

		look,
		float,
		style: within === undefined ? undefined : bounds(within)

	}, isContent(caption)
		? <figure>{picture}<figcaption>{caption}</figcaption></figure>
		: picture
	);


	function bounds(within: string | readonly [string, string]): Readonly<Record<string, string>> {

		const [width, height] = typeof within === "string" ? [within, within] : within;

		return {
			"--clay-image-max-width": width,
			"--clay-image-max-height": height
		};

	}

}

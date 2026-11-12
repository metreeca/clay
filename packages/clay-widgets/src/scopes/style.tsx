/*
 * Copyright © 2026 Metreeca srl
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
 * Token override scope.
 *
 * Restyles everything an area holds, assigning it design system tokens and widget looks while taking no room.
 *
 * @module style
 */

import { assert } from "@metreeca/core";
import { css as compile, skin, type Tokens } from "@metreeca/skin";
import { type ComponentChildren, createElement } from "preact";
import "./style.css";


/**
 * The default look of each kind of widget inside an area.
 *
 * Keyed by the camel-cased name of a widget followed by `Look`, as in `buttonLook` or `menuItemLook`, so any widget
 * taking a look is reached without the area knowing it in advance. Every widget of that kind in the area takes the
 * look given here unless it states one of its own, and an area nested inside another settles what the wider one left.
 *
 * Each look is carried by the `--clay-{name}-look` custom property, the name hyphenated as the widget element is, so
 * `menuItemLook` sets `--clay-menu-item-look`. A key the design system already uses for a token stays that token.
 */
export type Looks = {

	readonly [K in `${string}Look`]?: "subtle" | "normal" | "strong"

}


/**
 * Creates a styled area.
 *
 * Assigns the tokens given to an area of the interface, so everything inside it that reads one is restyled and
 * everything that doesn't is left alone: a token inherits, which makes an enclosing element the scope the design
 * system is retuned over. A token assigned nearer the thing it paints wins, so an area nests inside another and
 * settles what the wider one left.
 *
 * The same area sets the default {@link Looks look} of each kind of widget it holds, so a whole toolbar is quietened
 * at once, while a control stating a look of its own keeps that look whatever the area assigns.
 *
 * Tokens are named through the {@link @metreeca/skin!index.skin published contract} rather than as literal
 * strings, so a renamed token breaks the build instead of silently losing its styling; a token mapped to `undefined`
 * is left out, so a conditional override is expressed inline. A screen that already renders an element of its own
 * assigns the same tokens to it with {@link @metreeca/skin!index.css css}, sparing the extra wrapper; that helper
 * knows no looks, so such an element sets them through the custom properties {@link Looks} names.
 *
 * The area takes no box of its own, so what it holds sits in the row, the grid or the flow around it exactly as it
 * would without the wrapper. Having no box, it takes nothing from the box tokens, `padding`, `borderRadius` and
 * `boxShadow`: an area set apart on a surface of its own is a {@link stack!Stack stack}, a {@link strip!Strip strip}
 * or a {@link card!Card card} given a look instead, retuned by a styled area around it. Being an element all the
 * same, it stands between what it holds and whatever encloses that: a rule reaching its children by `> *`,
 * `:first-child` or `:nth-child()` stops at the area, so a screen styling them that way puts a class on them instead.
 *
 * @param options The widget configuration
 *
 * @returns The styled area
 */
export function Style({

	css,

	children

}: {

	/**
	 * The value each token takes inside the area, keyed by {@link @metreeca/skin!index.Token token name}, along with
	 * the default {@link Looks look} of each kind of widget it holds; a token or a look left out or given `undefined`
	 * keeps whatever the cascade already gives it. A value naming a token of the same kind stands for whatever that one
	 * carries, so an area is set from the design system rather than from a literal.
	 *
	 * @throws TypeError If a key names neither a token nor a look, or a look is given a step it does not have
	 */
	css: Tokens & Looks

	/**
	 * What the area holds, restyled by the tokens and looks assigned to it, and laid out as it would be outside it.
	 */
	children: ComponentChildren

}) {

	return createElement("clay-style", { style: style(css) }, children);

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

type Step = NonNullable<Looks[`${string}Look`]>


const steps: readonly unknown[] = ["subtle", "normal", "strong"] satisfies readonly Step[];


function isStep(value: unknown): value is Step {
	return steps.includes(value);
}

function isLook(key: string): boolean {
	return /^[a-z][a-zA-Z0-9]*Look$/.test(key);
}


/**
 * Compiles tokens through the design system and looks to the knobs widgets read them from.
 */
function style(css: Tokens & Looks): Readonly<Record<string, string>> {

	const [tokens, looks] = Object.entries(css).reduce<readonly [Tokens, Readonly<Record<string, string>>]>(
		([tokens, looks], [key, value]) => key in skin ? [{ ...tokens, [key]: value }, looks]
			: value === undefined ? [tokens, looks]
				: [tokens, { ...looks, [knob(key)]: step(key, value) }],
		[{}, {}]
	);

	return { ...compile(tokens), ...looks };

}

/**
 * Names the knob a look is read from, hyphenating the widget name as its element is.
 */
function knob(key: string): string {

	const $key = assert(key, isLook, `unknown token or look <${key}>`);

	return `--clay-${$key.slice(0, -"Look".length).replace(/[A-Z]/g, upper => `-${upper.toLowerCase()}`)}-look`;

}

function step(key: string, value: unknown): Step {
	return assert(value, isStep, `illegal <${key}> step <${value}>`);
}

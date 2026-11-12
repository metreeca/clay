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
 * Preact interface components.
 *
 * Provides the defaults a widget's controls observe, and the attribute values and event handlers it builds out of
 * state, so a control offers the surface the platform already carries without restating it. The widgets themselves
 * come from their own modules, leaving a screen with the ones it renders and nothing else.
 *
 * Also tells the content of a slot apart from a slot left empty, so a widget renders nothing for a part it was not
 * given and a screen hands over whatever it knows without checking what is missing.
 *
 * @module index
 */

import { isBoolean, type Optional } from "@metreeca/core";


/**
 * The delay a self-submitting control waits out before acting on what was typed (ms).
 */
export const AutoDelay = 500;

/**
 * The number of characters a self-submitting control waits for before acting on what was typed.
 */
export const AutoLength = 2;

/**
 * The number of entries a self-submitting control offers at a time.
 */
export const AutoSize = 10;


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Checks if a value is content.
 *
 * Values that JSX renders as nothing are not content: they are what a conditional such as `label && <Link/>` leaves
 * in a slot when its condition fails. A component checks each slot to leave out the wrapper of a part it was given
 * nothing for, rather than rendering an empty element. Any other value is content, `0` and whitespace included.
 *
 * @param value The value to check
 *
 * @returns True if the value is neither `undefined`, `null`, a boolean nor the empty string; false otherwise
 */
export function isContent(value: unknown): boolean {

	return value !== undefined
		&& value !== null
		&& value !== ""
		&& !isBoolean(value);

}


/**
 * Names the classes in force.
 *
 * Lets a component state which classes apply, rather than assembling the `class` attribute string that says so.
 *
 * @param classes The candidate class names, each against the state deciding whether it is in force
 *
 * @returns The names whose state holds, separated by spaces, or `undefined` if none does, so that the value is
 * assigned to a `class` attribute without leaving an empty one behind
 */
export function classes(classes: Readonly<{ [name: string]: Optional<boolean> }>): Optional<string> {

	return Object.entries(classes)
		.filter(([, state]) => state)
		.map(([name]) => name)
		.join(" ") || undefined;

}

/**
 * Maps keys to what they do.
 *
 * Declares keyboard behaviour as the actions a component offers rather than as the dispatch selecting among them, and
 * settles with the browser which keys the component has taken over.
 *
 * @param handlers The action taken for each key, named as `KeyboardEvent.key` reports it; a key whose browser default
 * is to survive is left out of the map, which a caller assembles as the state of the moment requires
 *
 * @returns A keyboard handler taking the key it is given an action for, and claiming it from the browser default
 */
export function keys(handlers: Readonly<{ [key: string]: (event: KeyboardEvent) => void }>) {

	return (event: KeyboardEvent) => {

		const handler = handlers[event.key];

		if ( handler !== undefined ) {

			handler(event);

			event.preventDefault();

		}

	};

}

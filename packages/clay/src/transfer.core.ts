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
 * Transfer rules.
 *
 * Settles what a transfer means independently of how it is performed: which targets take which types, where on a
 * target an item lands, how the answer of a target reads, and what a reader is told once a transfer ends.
 *
 * @module
 */

/**
 * The side of a target an item lands on, nearest the pointer along the vertical axis.
 */
export type Edge = "before" | "after";

/**
 * The answer of a target to a drop.
 *
 * Nothing takes the drop and `false` refuses it; a promise keeps the drop waiting until it settles, refusing it if it
 * resolves to `false`.
 */
export type Outcome = void | boolean | Promise<void | boolean>;


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Checks whether a target takes any of the types a transfer carries.
 *
 * Types are compared regardless of case, since browsers lowercase the types they expose during a drag.
 *
 * @param accept The MIME types the target takes
 * @param types The MIME types the transfer carries
 *
 * @returns `true` if `accept` and `types` share at least one type
 */
export function accepts(accept: readonly string[], types: readonly string[]): boolean {

	const taken = new Set(accept.map(type => type.toLowerCase()));

	return types.some(type => taken.has(type.toLowerCase()));

}

/**
 * Locates the side of a target nearest a point.
 *
 * @param box The vertical extent of the target
 * @param y The vertical coordinate of the point, in the same space as `box`
 *
 * @returns `"before"` if `y` falls in the upper half of `box`, `"after"` otherwise
 */
export function edge(box: { readonly top: number, readonly height: number }, y: number): Edge {
	return y < box.top+box.height/2 ? "before" : "after";
}

/**
 * Settles the answer of a target to a drop.
 *
 * A rejected promise ends the wait as a fulfilled one does, taking the drop, and is passed on unhandled, as if it had
 * never been returned, so a target reporting failures catches them in the promise it returns.
 *
 * @param outcome The answer of the target
 *
 * @returns A promise resolving to `false` if the target refused the drop, and to `true` otherwise
 */
export function settle(outcome: Outcome): Promise<boolean> {

	return Promise.resolve(outcome).then(value => value !== false, error => {

		void Promise.reject(error); // passed on unhandled, as if the target had never returned it

		return true;

	});

}

/**
 * Words the announcement closing a transfer.
 *
 * @param source The name of the item moved
 * @param target The name of the target it was moved to
 * @param taken Whether the target took the item
 * @param edge The side of the target the item landed on, for a target taking edges; the target itself if omitted
 *
 * @returns The English sentence telling a reader how the transfer ended
 */
export function announcement(source: string, target: string, taken: boolean, edge?: Edge): string {

	const place = `${edge ?? "to"} ${target}`;

	return taken ? `${source} moved ${place}.` : `Moving ${source} ${place} was refused.`;

}

/**
 * Names the content of an outside drop for announcements.
 *
 * @param files The files dropped
 *
 * @returns The name of the file dropped, the count of the files dropped, or `Content` where no file was dropped
 */
export function describe(files: readonly File[]): string {
	return files.length > 1 ? `${files.length} files` : files[0]?.name ?? "Content";
}

/**
 * Converts a CSS time to milliseconds.
 *
 * Takes both units CSS states times in, since a registered `<time>` property reads back in seconds whatever unit it
 * was declared in.
 *
 * @param time The CSS time, such as `200ms` or `0.2s`
 *
 * @returns The duration of `time` in milliseconds, or `0` if `time` is no CSS time
 */
export function milliseconds(time: string): number {

	const match = /^\s*(-?[\d.]+)(ms|s)\s*$/i.exec(time);
	const value = match ? parseFloat(match[1] ?? "") : NaN;

	return Number.isFinite(value) ? match?.[2]?.toLowerCase() === "s" ? value*1000 : value : 0;

}

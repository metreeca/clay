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

import type { Token } from "@metreeca/skin";
import { describe, expectTypeOf, it } from "vitest";
import { type Looks, Style } from "./style.js";


type Area = Parameters<typeof Style>[0]["css"];


describe("Looks", () => {

	it("takes the three steps of a look", () => {
		expectTypeOf<NonNullable<Looks[`${string}Look`]>>().toEqualTypeOf<"subtle" | "normal" | "strong">();
	});

	it("takes any widget name", () => {
		expectTypeOf<{ buttonLook: "subtle", menuItemLook: "strong" }>().toExtend<Looks>();
	});

	it("shares no name with a token", () => {
		expectTypeOf<Extract<Token, `${string}Look`>>().toBeNever();
	});

});

describe("Style()", () => {

	it("takes tokens and looks together", () => {
		expectTypeOf<{ color: "#f00", buttonLook: "subtle" }>().toExtend<Area>();
	});

	it("rejects a step a look does not have", () => {
		expectTypeOf<{ buttonLook: "loud" }>().not.toExtend<Area>();
	});

	it("rejects a key naming neither a token nor a look", () => {
		// @ts-expect-error an object literal is held to the keys the area takes
		const area: Area = { button: "subtle" };
		expectTypeOf(area).toEqualTypeOf<Area>();
	});

});

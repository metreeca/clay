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

import { css, skin } from "@metreeca/skin";
import { render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { Style } from "./style.js";


/**
 * The declarations the area carries, keyed by property.
 */
function assigned(tokens: Parameters<typeof Style>[0]["css"]): Readonly<Record<string, string>> {

	act(() => render(<Style css={tokens}>{null}</Style>, document.body));

	const area = document.body.querySelector("clay-style");
	const style = area instanceof HTMLElement ? area.style : undefined;

	return Object.fromEntries(Array.from(style ?? [], property => [property, style?.getPropertyValue(property) ?? ""]));

}


afterEach(async () => {
	act(() => render(null, document.body));
});


describe("Style", () => {

	describe("tokens", () => {

		it("assigns tokens as the design system compiles them", async () => {
			expect(assigned({ color: "#f00" })).toEqual(css({ color: "#f00" }));
		});

	});

	describe("looks", () => {

		it("assigns a look to the knob of the widget it names", async () => {
			expect(assigned({ buttonLook: "subtle" })).toEqual({ "--clay-button-look": "subtle" });
		});

		it("hyphenates a compound name as the element is", async () => {
			expect(assigned({ menuItemLook: "strong" })).toEqual({ "--clay-menu-item-look": "strong" });
		});

		it("keeps digits with the word they follow", async () => {
			expect(assigned({ h1Look: "normal" })).toEqual({ "--clay-h1-look": "normal" });
		});

		it("assigns looks alongside tokens", async () => {
			expect(assigned({ color: "#f00", linkLook: "strong" })).toEqual({
				...css({ color: "#f00" }),
				"--clay-link-look": "strong"
			});
		});

		it("leaves out a look given undefined", async () => {
			expect(assigned({ buttonLook: undefined, linkLook: "subtle" })).toEqual({ "--clay-link-look": "subtle" });
		});

		it("keeps a token name as a token", async () => {
			expect(assigned({ color: "#f00" })).not.toHaveProperty("--clay-color");
			expect(assigned({ color: "#f00" })).toHaveProperty(skin.color);
		});

	});

	describe("rejecting", () => {

		it("rejects a step a look does not have", async () => {
			// @ts-expect-error checking the guard a JavaScript caller meets
			expect(() => assigned({ buttonLook: "loud" })).toThrow(TypeError);
		});

		it("rejects a look naming no widget", async () => {
			expect(() => assigned({ Look: "subtle" })).toThrow(TypeError);
		});

		it("rejects a look name not camel-cased", async () => {
			expect(() => assigned({ ButtonLook: "subtle" })).toThrow(TypeError);
			expect(() => assigned({ "menu-itemLook": "subtle" })).toThrow(TypeError);
		});

		it("rejects a key naming neither a token nor a look", async () => {
			// @ts-expect-error checking the guard a JavaScript caller meets
			expect(() => assigned({ button: "subtle" })).toThrow(TypeError);
		});

	});

});

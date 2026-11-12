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

import { type JSX, render } from "preact";
import { describe, expect, it } from "vitest";
import { Strip } from "./strip.js";


describe("Strip", () => {

	const rendered = (element: JSX.Element): null | HTMLElement => {

		const container = document.createElement("div");

		render(element, container);

		return container.querySelector<HTMLElement>(":scope > clay-strip");

	};


	describe("look", () => {

		it("carries the given look", async () => {

			expect(rendered(<Strip look="subtle"><p>held</p></Strip>)?.getAttribute("look")).toBe("subtle");

		});

		it("states no look of its own by default", async () => {

			expect(rendered(<Strip><p>held</p></Strip>)?.hasAttribute("look")).toBe(false);

		});

	});

});

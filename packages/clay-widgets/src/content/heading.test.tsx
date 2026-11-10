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

import { type JSX, render } from "preact";
import { describe, expect, it } from "vitest";
import { Heading } from "./heading.js";


describe("Heading", () => {

	const markup = (element: JSX.Element): string => {

		const container = document.createElement("div");

		render(element, container);

		return container.innerHTML;

	};


	describe("title", () => {

		it("sets the title outside the outline by default", async () => {

			expect(markup(<Heading><em>Colours</em></Heading>)).toBe("<clay-heading><em>Colours</em></clay-heading>");

		});

		it("sets the title as a heading at the level given", async () => {

			expect(markup(<Heading level={1}><em>Colours</em></Heading>)).toBe("<h1><em>Colours</em></h1>");
			expect(markup(<Heading level={2}>Anchors</Heading>)).toBe("<h2>Anchors</h2>");
			expect(markup(<Heading level={3}>Hues</Heading>)).toBe("<h3>Hues</h3>");

		});

		it("renders nothing when given no title", async () => {

			expect(markup(<Heading/>)).toBe("");
			expect(markup(<Heading id="colours" level={1}/>)).toBe("");

		});

	});

	describe("target", () => {

		it("carries the id given", async () => {

			expect(markup(<Heading id="colours">Colours</Heading>)).toBe(`<clay-heading id="colours">Colours</clay-heading>`);
			expect(markup(<Heading id="colours" level={1}>Colours</Heading>)).toBe(`<h1 id="colours">Colours</h1>`);

		});

	});

});

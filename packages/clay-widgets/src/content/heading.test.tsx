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

	const rendered = (element: JSX.Element): null | HTMLElement => {

		const container = document.createElement("div");

		render(element, container);

		return container.querySelector<HTMLElement>(":scope > clay-heading");

	};

	const outline = (element: JSX.Element): readonly string[] =>
		Array.from(rendered(element)?.children ?? [], ({ localName }) => localName);


	describe("title", () => {

		it("sets the title as a first-rank heading by default", async () => {

			expect(outline(<Heading>Colours</Heading>)).toEqual(["h1"]);

		});

		it("sets the title at the level given", async () => {

			expect(outline(<Heading level={2}>Anchors</Heading>)).toEqual(["h2"]);
			expect(outline(<Heading level={3}>Hues</Heading>)).toEqual(["h3"]);

		});

		it("holds the title given", async () => {

			expect(rendered(<Heading><em>Colours</em></Heading>)?.innerHTML).toBe("<h1><em>Colours</em></h1>");

		});

		it("holds nothing when given no title", async () => {

			expect(outline(<Heading/>)).toEqual([]);

		});

	});

	describe("target", () => {

		it("carries the id given", async () => {

			expect(rendered(<Heading id="colours">Colours</Heading>)?.id).toBe("colours");

		});

		it("carries no id if none is given", async () => {

			expect(rendered(<Heading>Colours</Heading>)?.hasAttribute("id")).toBe(false);

		});

	});

});

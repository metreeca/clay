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
import { Section } from "./section.js";


describe("Section", () => {

	const rendered = (element: JSX.Element): null | HTMLElement => {

		const container = document.createElement("div");

		render(element, container);

		return container.querySelector<HTMLElement>(":scope > clay-section");

	};

	const outline = (element: JSX.Element): readonly string[] =>
		Array.from(rendered(element)?.querySelector(":scope > hgroup")?.children ?? [], ({ localName }) => localName);


	describe("heading group", () => {

		it("sets the eyebrow, the title and the lead in order", async () => {

			expect(outline(<Section eyebrow="Foundations" title="Colours" lead="Anchors and roles."/>))
				.toEqual(["p", "h1", "p"]);

		});

		it("leaves out the parts not given", async () => {

			expect(outline(<Section title="Colours"/>)).toEqual(["h1"]);
			expect(outline(<Section eyebrow="Foundations" lead="Anchors and roles."/>)).toEqual(["p", "p"]);

		});

		it("leaves out the heading group when given no part of it", async () => {

			expect(rendered(<Section><p>Content</p></Section>)?.querySelector("hgroup")).toBeNull();

		});

		it("sets the title at the level given", async () => {

			expect(outline(<Section level={2} title="Anchors"/>)).toEqual(["h2"]);
			expect(outline(<Section level={3} title="Hues"/>)).toEqual(["h3"]);

		});

	});

	describe("content", () => {

		it("follows the heading group", async () => {

			const section = rendered(<Section title="Colours"><p>Content</p></Section>);

			expect(Array.from(section?.children ?? [], ({ localName }) => localName)).toEqual(["hgroup", "p"]);

		});

	});

	describe("target", () => {

		it("carries the id given", async () => {

			expect(rendered(<Section id="colours" title="Colours"/>)?.id).toBe("colours");

		});

		it("carries no id if none is given", async () => {

			expect(rendered(<Section title="Colours"/>)?.hasAttribute("id")).toBe(false);

		});

	});

});

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
import { Infobox } from "./infobox.js";


describe("Infobox", () => {

	const rendered = (element: JSX.Element): null | HTMLElement => {

		const container = document.createElement("div");

		render(element, container);

		return container.querySelector<HTMLElement>(":scope > clay-infobox");

	};

	const labels = (element: JSX.Element): readonly (null | string)[] =>
		Array.from(rendered(element)?.querySelectorAll("dt") ?? [], ({ textContent }) => textContent);

	const values = (element: JSX.Element): readonly (null | string)[] =>
		Array.from(rendered(element)?.querySelectorAll("dd") ?? [], ({ textContent }) => textContent);


	describe("wrapping", () => {

		it("keeps values to one line by default", async () => {

			expect(rendered(<Infobox>{{ label: "value" }}</Infobox>)?.hasAttribute("wrap")).toBe(false);

		});

		it("wraps values if required", async () => {

			expect(rendered(<Infobox wrap>{{ label: "value" }}</Infobox>)?.hasAttribute("wrap")).toBe(true);

		});

	});

	describe("alignment", () => {

		it("aligns labels to the start by default", async () => {

			expect(rendered(<Infobox>{{ label: "value" }}</Infobox>)?.getAttribute("align")).toBe("start");

		});

		it("aligns labels to the end if required", async () => {

			expect(rendered(<Infobox align="end">{{ label: "value" }}</Infobox>)?.getAttribute("align")).toBe("end");

		});

	});


	describe("sections", () => {

		const sections = (element: JSX.Element): readonly (readonly (null | string)[])[] =>
			Array.from(rendered(element)?.querySelectorAll(":scope > dl") ?? [], section =>
				Array.from(section.querySelectorAll(":scope > dt"), ({ textContent }) => textContent)
			);

		it("renders a record as a single section", async () => {

			expect(sections(<Infobox>{{ first: "value", second: "value" }}</Infobox>))
				.toEqual([["first", "second"]]);

		});

		it("renders a plain array of entries as a single section in the given order", async () => {

			expect(sections(<Infobox>{[
				{ label: "second", value: "value" },
				{ label: "first", value: "value" }
			]}</Infobox>)).toEqual([["second", "first"]]);

		});

		it("renders an array of entry arrays as a section for each", async () => {

			expect(sections(<Infobox>{[
				[{ label: "first", value: "value" }],
				[{ label: "second", value: "value" }]
			]}</Infobox>)).toEqual([["first"], ["second"]]);

		});

		it("renders an array of records as a section for each", async () => {

			expect(sections(<Infobox>{[
				{ first: "value" },
				{ second: "value", third: "value" }
			]}</Infobox>)).toEqual([["first"], ["second", "third"]]);

		});

		it("renders records and entry arrays as a section for each", async () => {

			expect(sections(<Infobox>{[
				{ first: "value" },
				[{ label: "second", value: "value" }]
			]}</Infobox>)).toEqual([["first"], ["second"]]);

		});

		it("leaves out sections with no values", async () => {

			expect(sections(<Infobox>{[
				{ empty: undefined },
				[{ label: "shown", value: "value" }]
			]}</Infobox>)).toEqual([["shown"]]);

		});

		it("renders nothing if every section is empty", async () => {

			expect(rendered(<Infobox>{[
				{ empty: undefined },
				[{ label: "empty", value: null }]
			]}</Infobox>)).toBeNull();

		});

	});

	describe("empty values", () => {

		it("leaves out undefined, null and empty string values", async () => {

			expect(labels(<Infobox>{{
				undefined: undefined,
				null: null,
				empty: "",
				shown: "value"
			}}</Infobox>)).toEqual(["shown"]);

		});

		it("shows zero", async () => {

			expect(values(<Infobox>{{ count: 0 }}</Infobox>)).toEqual(["0"]);

		});

		it("shows booleans by name", async () => {

			expect(values(<Infobox>{{ draft: false, published: true }}</Infobox>)).toEqual(["false", "true"]);

		});

		it("renders nothing if every value is empty", async () => {

			expect(rendered(<Infobox>{{ undefined: undefined, null: null, empty: "" }}</Infobox>)).toBeNull();

		});

	});

});

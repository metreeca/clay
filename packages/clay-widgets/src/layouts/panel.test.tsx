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
import { Panel } from "./panel.js";


describe("Panel", () => {

	const rendered = (element: JSX.Element): null | HTMLElement => {

		const container = document.createElement("div");

		render(element, container);

		return container.querySelector<HTMLElement>(":scope > clay-panel");

	};


	it("renders what it holds inside a panel", async () => {

		expect(rendered(<Panel><p>held</p></Panel>)?.innerHTML).toBe("<p>held</p>");

	});

	it("takes its look from the design system alone", async () => {

		expect(rendered(<Panel><p>held</p></Panel>)?.getAttribute("style")).toBeNull();

	});

});

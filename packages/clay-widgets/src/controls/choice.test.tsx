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
import { act } from "preact/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Choice } from "./choice.js";


describe("Choice", () => {

	const schemes = { auto: "System", light: "Light", dark: "Dark" };

	function mount(element: JSX.Element): null | HTMLElement {

		act(() => render(element, document.body));

		return document.querySelector<HTMLElement>("clay-choice");

	}

	function radios(): readonly HTMLInputElement[] {
		return Array.from(document.querySelectorAll<HTMLInputElement>("clay-choice input"));
	}


	afterEach(() => {
		act(() => render(null, document.body));
	});


	describe("group", () => {

		it("renders a group named as given", async () => {

			const group = mount(<Choice name="Colour scheme" options={schemes}/>)?.querySelector("fieldset");

			expect(group?.getAttribute("aria-label")).toBe("Colour scheme");

		});

		it("offers the options as radio buttons, in order, labelled as given", async () => {

			mount(<Choice name="Colour scheme" options={schemes}/>);

			expect(radios().map(radio => radio.type)).toEqual(["radio", "radio", "radio"]);
			expect(radios().map(radio => radio.value)).toEqual(["auto", "light", "dark"]);
			expect(radios().map(radio => radio.closest("label")?.textContent)).toEqual(["System", "Light", "Dark"]);

		});

		it("ties the radio buttons into one group", async () => {

			mount(<Choice name="Colour scheme" options={schemes}/>);

			expect(new Set(radios().map(radio => radio.name)).size).toBe(1);
			expect(radios()[0]?.name).not.toBe("");

		});

		it("keeps the groups of two choices apart", async () => {

			act(() => render(<>
				<Choice name="Colour scheme" options={schemes}/>
				<Choice name="Density" options={{ tight: "Tight", loose: "Loose" }}/>
			</>, document.body));

			expect(new Set(radios().map(radio => radio.name)).size).toBe(2);

		});

	});

	describe("look", () => {

		it("carries the look given", async () => {

			const choice = mount(<Choice name="Colour scheme" options={schemes} look="strong"/>);

			expect(choice?.getAttribute("look")).toBe("strong");

		});

		it("carries no look if none is given", async () => {

			const choice = mount(<Choice name="Colour scheme" options={schemes}/>);

			expect(choice?.hasAttribute("look")).toBe(false);

		});

	});

	describe("value", () => {

		it("shows the value given as chosen", async () => {

			mount(<Choice name="Colour scheme" options={schemes} value="light"/>);

			expect(radios().map(radio => radio.checked)).toEqual([false, true, false]);

		});

		it("shows no option as chosen without a value", async () => {

			mount(<Choice name="Colour scheme" options={schemes}/>);

			expect(radios().map(radio => radio.checked)).toEqual([false, false, false]);

		});

		it("hands the option a reader chooses to the handler", async () => {

			const onChange = vi.fn();

			mount(<Choice name="Colour scheme" options={schemes} value="auto" onChange={onChange}/>);

			act(() => radios()[2]?.click());

			expect(onChange).toHaveBeenCalledExactlyOnceWith("dark");

		});

	});

});

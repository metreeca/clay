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
import { act } from "preact/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Select } from "./select.js";


describe("Select", () => {

	const countries = { it: "Italy", fr: "France", de: "Germany" };

	function mount(element: JSX.Element): null | HTMLSelectElement {

		act(() => render(element, document.body));

		return document.querySelector<HTMLSelectElement>("clay-select > select");

	}

	function options(select: null | HTMLSelectElement): readonly HTMLOptionElement[] {
		return Array.from(select?.options ?? []);
	}


	afterEach(() => {
		act(() => render(null, document.body));
	});


	describe("menu", () => {

		it("names the menu as given", async () => {

			expect(mount(<Select name="Country" options={countries}/>)?.getAttribute("aria-label")).toBe("Country");

		});

		it("carries the id a split label names it by", async () => {

			expect(mount(<Select id="country" options={countries}/>)?.id).toBe("country");

		});

		it("states its options", async () => {

			const select = mount(<Select disabled required options={countries}/>);

			expect(select?.disabled).toBe(true);
			expect(select?.required).toBe(true);

		});

		it("offers the options in order, labelled as given", async () => {

			const select = mount(<Select options={countries}/>);

			expect(options(select).map(option => option.value)).toEqual(["it", "fr", "de"]);
			expect(options(select).map(option => option.text)).toEqual(["Italy", "France", "Germany"]);

		});

	});

	describe("placeholder", () => {

		it("opens on the placeholder while no option is picked", async () => {

			const select = mount(<Select options={countries} placeholder="Pick a country"/>);

			expect(options(select)[0]?.text).toBe("Pick a country");
			expect(options(select)[0]?.disabled).toBe(true);
			expect(select?.value).toBe("");

		});

		it("fails its constraints on the placeholder where required", async () => {

			const select = mount(<Select required options={countries} placeholder="Pick a country"/>);

			expect(select?.checkValidity()).toBe(false);

		});

		it("offers no placeholder unless given", async () => {

			expect(options(mount(<Select options={countries}/>)).length).toBe(3);

		});

	});

	describe("value", () => {

		it("shows the option given as picked", async () => {

			expect(mount(<Select options={countries} placeholder="Pick a country" value="fr"/>)?.value).toBe("fr");

		});

		it("hands over the value of the option picked", async () => {

			const onChange = vi.fn();
			const select = mount(<Select options={countries} value="it" onChange={onChange}/>)!; // test harness: menu
																								 // rendered

			act(() => {
				select.value = "de";
				select.dispatchEvent(new Event("change", { bubbles: true }));
			});

			expect(onChange).toHaveBeenCalledWith("de");

		});

	});

});

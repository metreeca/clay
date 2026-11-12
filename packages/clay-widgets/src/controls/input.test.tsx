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
import { Input } from "./input.js";


describe("Input", () => {

	function mount(element: JSX.Element): null | HTMLInputElement {

		act(() => render(element, document.body));

		return document.querySelector<HTMLInputElement>("clay-input > input");

	}


	afterEach(() => {
		act(() => render(null, document.body));
	});


	describe("field", () => {

		it("renders a text field by default", async () => {

			expect(mount(<Input/>)?.type).toBe("text");

		});

		it("renders the field of the type given", async () => {

			expect(mount(<Input type="email"/>)?.type).toBe("email");

		});

		it("names the field as given", async () => {

			expect(mount(<Input name="Title"/>)?.getAttribute("aria-label")).toBe("Title");

		});

		it("carries the id a split label names it by", async () => {

			expect(mount(<Input id="title"/>)?.id).toBe("title");

		});

		it("states its options", async () => {

			const input = mount(<Input disabled readonly required/>);

			expect(input?.disabled).toBe(true);
			expect(input?.readOnly).toBe(true);
			expect(input?.required).toBe(true);

		});

		it("states its constraints", async () => {

			const input = mount(<Input
				type="number" min="1" max="9" step="2"
				minLength={2} maxLength={4} pattern="[0-9]+"
			/>);

			expect(input?.getAttribute("min")).toBe("1");
			expect(input?.getAttribute("max")).toBe("9");
			expect(input?.getAttribute("step")).toBe("2");
			expect(input?.getAttribute("minlength")).toBe("2");
			expect(input?.getAttribute("maxlength")).toBe("4");
			expect(input?.getAttribute("pattern")).toBe("[0-9]+");

		});

		it("shows the placeholder given", async () => {

			expect(mount(<Input placeholder="e.g. Rome"/>)?.placeholder).toBe("e.g. Rome");

		});

	});

	describe("emptiness", () => {

		function empty(): boolean {
			return document.querySelector("clay-input")?.hasAttribute("empty") ?? false;
		}


		it("marks a field holding no value as empty", async () => {

			mount(<Input type="date"/>);

			expect(empty()).toBe(true);

		});

		it("marks a field holding a value given as filled", async () => {

			mount(<Input type="date" value="2026-11-12"/>);

			expect(empty()).toBe(false);

		});

		it("marks a field filled once the reader enters a value", async () => {

			const input = mount(<Input type="date"/>)!; // test harness: field rendered

			act(() => {
				input.value = "2026-11-12";
				input.dispatchEvent(new Event("input", { bubbles: true }));
			});

			expect(empty()).toBe(false);

		});

	});

	describe("value", () => {

		it("shows the value given", async () => {

			expect(mount(<Input value="Rome"/>)?.value).toBe("Rome");

		});

		it("hands over the value on every edit", async () => {

			const onChange = vi.fn();
			const input = mount(<Input value="" onChange={onChange}/>)!; // test harness: field rendered

			act(() => {
				input.value = "R";
				input.dispatchEvent(new Event("input", { bubbles: true }));
			});

			expect(onChange).toHaveBeenCalledWith("R");

		});

	});

});

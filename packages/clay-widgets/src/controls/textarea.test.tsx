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
import { Textarea } from "./textarea.js";


describe("Textarea", () => {

	function mount(element: JSX.Element): null | HTMLTextAreaElement {

		act(() => render(element, document.body));

		return document.querySelector<HTMLTextAreaElement>("clay-textarea > textarea");

	}


	afterEach(() => {
		act(() => render(null, document.body));
	});


	describe("field", () => {

		it("names the field as given", async () => {

			expect(mount(<Textarea name="Notes"/>)?.getAttribute("aria-label")).toBe("Notes");

		});

		it("carries the id a split label names it by", async () => {

			expect(mount(<Textarea id="notes"/>)?.id).toBe("notes");

		});

		it("states its options", async () => {

			const textarea = mount(<Textarea disabled readonly required/>);

			expect(textarea?.disabled).toBe(true);
			expect(textarea?.readOnly).toBe(true);
			expect(textarea?.required).toBe(true);

		});

		it("states its constraints", async () => {

			const textarea = mount(<Textarea minLength={2} maxLength={4}/>);

			expect(textarea?.getAttribute("minlength")).toBe("2");
			expect(textarea?.getAttribute("maxlength")).toBe("4");

		});

		it("shows the placeholder given", async () => {

			expect(mount(<Textarea placeholder="Anything else?"/>)?.placeholder).toBe("Anything else?");

		});

	});

	describe("value", () => {

		it("shows the value given", async () => {

			expect(mount(<Textarea value={"one\ntwo"}/>)?.value).toBe("one\ntwo");

		});

		it("hands over the value on every edit", async () => {

			const onChange = vi.fn();
			const textarea = mount(<Textarea value="" onChange={onChange}/>)!; // test harness: field rendered

			act(() => {
				textarea.value = "one";
				textarea.dispatchEvent(new Event("input", { bubbles: true }));
			});

			expect(onChange).toHaveBeenCalledWith("one");

		});

	});

});

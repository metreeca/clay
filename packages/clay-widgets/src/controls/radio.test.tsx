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
import { Radio } from "./radio.js";


describe("Radio", () => {

	function mount(element: JSX.Element): readonly HTMLInputElement[] {

		act(() => render(element, document.body));

		return Array.from(document.querySelectorAll<HTMLInputElement>("clay-radio > input"));

	}


	afterEach(() => {
		act(() => render(null, document.body));
	});


	describe("button", () => {

		it("renders a native radio button in the group given", async () => {

			const [radio] = mount(<Radio group="delivery" value="post"/>);

			expect(radio?.type).toBe("radio");
			expect(radio?.name).toBe("delivery");
			expect(radio?.value).toBe("post");

		});

		it("names the button as given", async () => {

			const [radio] = mount(<Radio name="Post" group="delivery" value="post"/>);

			expect(radio?.getAttribute("aria-label")).toBe("Post");

		});

		it("carries the id a split label names it by", async () => {

			const [radio] = mount(<Radio id="post" group="delivery" value="post"/>);

			expect(radio?.id).toBe("post");

		});

		it("states its options", async () => {

			const [radio] = mount(<Radio disabled required group="delivery" value="post"/>);

			expect(radio?.disabled).toBe(true);
			expect(radio?.required).toBe(true);

		});

	});

	describe("pick", () => {

		it("shows the pick given", async () => {

			const [post, courier] = mount(<>
				<Radio group="delivery" value="post" checked={false}/>
				<Radio group="delivery" value="courier" checked/>
			</>);

			expect(post?.checked).toBe(false);
			expect(courier?.checked).toBe(true);

		});

		it("hands over the value of the button picked", async () => {

			const onChange = vi.fn();

			const [, courier] = mount(<>
				<Radio group="delivery" value="post" checked onChange={onChange}/>
				<Radio group="delivery" value="courier" checked={false} onChange={onChange}/>
			</>);

			act(() => courier?.click());

			expect(onChange).toHaveBeenCalledWith("courier");

		});

	});

});

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
import { Checkbox } from "./checkbox.js";


describe("Checkbox", () => {

	function mount(element: JSX.Element): null | HTMLInputElement {

		act(() => render(element, document.body));

		return document.querySelector<HTMLInputElement>("clay-checkbox > input");

	}


	afterEach(() => {
		act(() => render(null, document.body));
	});


	describe("box", () => {

		it("renders a native checkbox", async () => {

			expect(mount(<Checkbox/>)?.type).toBe("checkbox");

		});

		it("names the box as given", async () => {

			expect(mount(<Checkbox name="Remember me"/>)?.getAttribute("aria-label")).toBe("Remember me");

		});

		it("carries the id a split label names it by", async () => {

			expect(mount(<Checkbox id="remember"/>)?.id).toBe("remember");

		});

		it("states its options", async () => {

			const box = mount(<Checkbox disabled required/>);

			expect(box?.disabled).toBe(true);
			expect(box?.required).toBe(true);

		});

		it("shows the mixed state while indeterminate", async () => {

			expect(mount(<Checkbox indeterminate/>)?.indeterminate).toBe(true);

		});

	});

	describe("state", () => {

		it("shows the state given", async () => {

			expect(mount(<Checkbox checked/>)?.checked).toBe(true);
			expect(mount(<Checkbox checked={false}/>)?.checked).toBe(false);

		});

		it("hands over the state on every tick", async () => {

			const onChange = vi.fn();
			const box = mount(<Checkbox checked={false} onChange={onChange}/>)!; // test harness: box rendered

			act(() => box.click());

			expect(onChange).toHaveBeenCalledWith(true);

		});

	});

});

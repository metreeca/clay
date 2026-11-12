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
import { Switch } from "./switch.js";


describe("Switch", () => {

	function mount(element: JSX.Element): null | HTMLInputElement {

		act(() => render(element, document.body));

		return document.querySelector<HTMLInputElement>("clay-switch > input");

	}


	afterEach(() => {
		act(() => render(null, document.body));
	});


	describe("switch", () => {

		it("renders a native checkbox announced as a switch", async () => {

			const toggle = mount(<Switch/>);

			expect(toggle?.type).toBe("checkbox");
			expect(toggle?.getAttribute("role")).toBe("switch");

		});

		it("names the switch as given", async () => {

			expect(mount(<Switch name="Notifications"/>)?.getAttribute("aria-label")).toBe("Notifications");

		});

		it("carries the id a split label names it by", async () => {

			expect(mount(<Switch id="notifications"/>)?.id).toBe("notifications");

		});

		it("states its options", async () => {

			expect(mount(<Switch disabled/>)?.disabled).toBe(true);

		});

	});

	describe("state", () => {

		it("shows the state given", async () => {

			expect(mount(<Switch checked/>)?.checked).toBe(true);
			expect(mount(<Switch checked={false}/>)?.checked).toBe(false);

		});

		it("hands over the state on every flip", async () => {

			const onChange = vi.fn();
			const toggle = mount(<Switch checked onChange={onChange}/>)!; // test harness: switch rendered

			act(() => toggle.click());

			expect(onChange).toHaveBeenCalledWith(false);

		});

	});

});

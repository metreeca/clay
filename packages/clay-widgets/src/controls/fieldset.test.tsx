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
import { afterEach, describe, expect, it } from "vitest";
import { Fieldset } from "./fieldset.js";


describe("Fieldset", () => {

	function mount(element: JSX.Element): null | HTMLFieldSetElement {

		act(() => render(element, document.body));

		return document.querySelector<HTMLFieldSetElement>("clay-fieldset > fieldset");

	}


	afterEach(() => {
		act(() => render(null, document.body));
	});


	it("gathers the fields given", async () => {

		const group = mount(<Fieldset><input name="street"/><input name="city"/></Fieldset>);

		expect(group?.querySelectorAll("input").length).toBe(2);

	});

	it("captions the group with the label given", async () => {

		const group = mount(<Fieldset label="Address"><input/></Fieldset>);

		expect(group?.firstElementChild?.tagName).toBe("LEGEND");
		expect(group?.querySelector("legend")?.textContent).toBe("Address");

	});

	it("shows no caption unless given", async () => {

		expect(mount(<Fieldset><input/></Fieldset>)?.querySelector("legend")).toBeNull();

	});

	it("names a group showing no caption as given", async () => {

		expect(mount(<Fieldset name="Address"><input/></Fieldset>)?.getAttribute("aria-label")).toBe("Address");

	});

	it("turns off every field it holds where disabled", async () => {

		const group = mount(<Fieldset disabled><input/></Fieldset>);

		// the platform turns off the fields of a disabled field set, which happy-dom does not model in :disabled

		expect(group?.disabled).toBe(true);

	});

});

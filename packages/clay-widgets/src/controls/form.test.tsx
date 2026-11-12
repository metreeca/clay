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
import { Form } from "./form.js";


describe("Form", () => {

	function mount(element: JSX.Element): HTMLFormElement {

		act(() => render(element, document.body));

		return document.querySelector<HTMLFormElement>("clay-form > form")!; // test harness: form rendered

	}


	afterEach(() => {
		act(() => render(null, document.body));
	});


	describe("rendering", () => {

		it("renders the fields inside a native form", async () => {

			const form = mount(<Form><input name="title"/></Form>);

			expect(form.querySelector("input[name=title]")).not.toBeNull();

		});

	});

	describe("validation", () => {

		function type(field: HTMLInputElement, value: string): void {
			act(() => {
				field.value = value;
				field.dispatchEvent(new Event("input", { bubbles: true }));
			});
		}


		it("hands over true when every field meets its constraints", async () => {

			const onValidate = vi.fn();
			const form = mount(<Form onValidate={onValidate}><input name="title" required/></Form>);

			type(form.querySelector("input[name=title]")!, "Title");

			expect(onValidate).toHaveBeenLastCalledWith(true);

		});

		it("hands over false when a field fails its constraints", async () => {

			const onValidate = vi.fn();
			const form = mount(<Form onValidate={onValidate}><input name="title" required/></Form>);

			type(form.querySelector("input[name=title]")!, "");

			expect(onValidate).toHaveBeenLastCalledWith(false);

		});

		it("checks again on an input event dispatched by a composite field", async () => {

			const onValidate = vi.fn();
			const form = mount(<Form onValidate={onValidate}>
				<div id="composite"/>
			</Form>);

			act(() => {
				form.querySelector("#composite")!.dispatchEvent(new Event("input", { bubbles: true }));
			});

			expect(onValidate).toHaveBeenCalledWith(true);

		});

		it("lets input events reach listeners above the form", async () => {

			const listener = vi.fn();
			const form = mount(<Form onValidate={() => {}}><input name="title"/></Form>);

			document.body.addEventListener("input", listener);

			try {

				type(form.querySelector("input[name=title]")!, "Title");

				expect(listener).toHaveBeenCalled();

			} finally {
				document.body.removeEventListener("input", listener);
			}

		});

	});

	describe("submission", () => {

		function submit(form: HTMLFormElement, submitter?: HTMLElement): SubmitEvent {

			const event = new SubmitEvent("submit", { bubbles: true, cancelable: true, submitter });

			act(() => {
				form.dispatchEvent(event);
			});

			return event;

		}


		it("hands over a submission asked for from the keyboard", async () => {

			const onSubmit = vi.fn();
			const form = mount(<Form onSubmit={onSubmit}><input name="title"/></Form>);

			submit(form, form.querySelector<HTMLElement>("input[type=submit]")!);

			expect(onSubmit).toHaveBeenCalledOnce();

		});

		it("hands over a submission requested with no submitter", async () => {

			const onSubmit = vi.fn();
			const form = mount(<Form onSubmit={onSubmit}><input name="title"/></Form>);

			submit(form);

			expect(onSubmit).toHaveBeenCalledOnce();

		});

		it("leaves submissions by a submit button to the button", async () => {

			const onSubmit = vi.fn();
			const form = mount(<Form onSubmit={onSubmit}>
				<button type="submit">Save</button>
			</Form>);

			submit(form, form.querySelector("button")!);

			expect(onSubmit).not.toHaveBeenCalled();

		});

		it("keeps the page from navigating", async () => {

			const form = mount(<Form><input name="title"/></Form>);

			expect(submit(form).defaultPrevented).toBe(true);

		});

		it("keeps the page from navigating on a submit button", async () => {

			const form = mount(<Form>
				<button type="submit">Save</button>
			</Form>);

			expect(submit(form, form.querySelector("button")!).defaultPrevented).toBe(true);

		});

	});

});

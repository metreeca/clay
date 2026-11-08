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
import { Image } from "./image.js";


describe("Image", () => {

	const src = "https://example.com/image.png";

	const rendered = (element: JSX.Element): null | HTMLElement => {

		const container = document.createElement("div");

		render(element, container);

		return container.querySelector<HTMLElement>(":scope > clay-image");

	};

	const structure = (element: JSX.Element): readonly string[] =>
		Array.from(rendered(element)?.querySelectorAll("*") ?? [], ({ localName }) => localName);


	describe("picture", () => {

		it("shows the picture at the given URL", async () => {

			expect(rendered(<Image src={src}/>)?.querySelector("img")?.getAttribute("src")).toBe(src);

		});

		it("takes the picture as decorative by default", async () => {

			expect(rendered(<Image src={src}/>)?.querySelector("img")?.getAttribute("alt")).toBe("");

		});

		it("carries the given text alternative", async () => {

			expect(rendered(<Image src={src} alt="Glacier front"/>)?.querySelector("img")?.getAttribute("alt"))
				.toBe("Glacier front");

		});

	});

	describe("look", () => {

		it("carries the given look", async () => {

			expect(rendered(<Image src={src} look="strong"/>)?.getAttribute("look")).toBe("strong");

		});

		it("states no look of its own by default", async () => {

			expect(rendered(<Image src={src}/>)?.hasAttribute("look")).toBe(false);

		});

	});

	describe("caption", () => {

		it("shows a bare picture with no caption", async () => {

			expect(structure(<Image src={src}/>)).toEqual([ "img" ]);

		});

		it("sets picture and caption as a figure named by the caption", async () => {

			const image = rendered(<Image src={src} caption="© Credits"/>);

			expect(structure(<Image src={src} caption="© Credits"/>)).toEqual([ "figure", "img", "figcaption" ]);
			expect(image?.querySelector("figure > figcaption")?.textContent).toBe("© Credits");

		});

		it("leaves out undefined, null, empty string and boolean captions", async () => {

			expect(structure(<Image src={src} caption={undefined}/>)).toEqual([ "img" ]);
			expect(structure(<Image src={src} caption={null}/>)).toEqual([ "img" ]);
			expect(structure(<Image src={src} caption=""/>)).toEqual([ "img" ]);
			expect(structure(<Image src={src} caption={false}/>)).toEqual([ "img" ]);

		});

		it("shows a zero caption", async () => {

			expect(rendered(<Image src={src} caption={0}/>)?.querySelector("figcaption")?.textContent).toBe("0");

		});

	});

});

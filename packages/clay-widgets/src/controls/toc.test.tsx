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

import { render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createToc } from "./toc.core.js";
import { Toc, type TocEntry } from "./toc.js";


describe("createToc", () => {

	describe("creation", () => {

		it("lists no section by default", async () => {

			const toc = createToc();

			expect(toc.sections).toEqual([]);
			expect(toc.current).toBeUndefined();

		});

		it("lists the sections given, in order, with none current", async () => {

			const toc = createToc({ sections: ["one", "two", "three"] });

			expect(toc.sections).toEqual(["one", "two", "three"]);
			expect(toc.current).toBeUndefined();

		});

		it("removes duplicate sections, keeping the first occurrence", async () => {

			expect(createToc({ sections: ["one", "two", "one"] }).sections).toEqual(["one", "two"]);

		});

	});

	describe("following", () => {

		const toc = createToc({ sections: ["one", "two", "three"] });

		it("takes the last section scrolled up to the line as current", async () => {

			expect(toc.follow({ one: -400, two: -10, three: 300 }).current).toBe("two");

		});

		it("takes a section starting exactly on the line as current", async () => {

			expect(toc.follow({ one: -100, two: 0, three: 300 }).current).toBe("two");

		});

		it("takes no section as current above the first one", async () => {

			expect(toc.follow({ one: 10, two: 300, three: 600 }).current).toBeUndefined();

		});

		it("goes by page order rather than by offset", async () => {

			expect(toc.follow({ one: -10, two: -400, three: 300 }).current).toBe("two");

		});

		it("never takes a section missing from the page as current", async () => {

			expect(toc.follow({ one: -400, three: 300 }).current).toBe("one");

		});

		it("ignores offsets of elements it does not list", async () => {

			expect(toc.follow({ one: 10, stray: -100 }).current).toBeUndefined();

		});

		it("yields itself when the current section is unchanged", async () => {

			const scrolled = toc.follow({ one: -10, two: 300 });

			expect(scrolled.follow({ one: -50, two: 260 })).toBe(scrolled);

		});

		it("leaves the outline it was called on as it stands", async () => {

			toc.follow({ one: -10 });

			expect(toc.current).toBeUndefined();

		});

	});

});

describe("Toc", () => {

	const entries: readonly TocEntry[] = [
		{
			label: "Foundations", entries: [
				{ label: "Colours", href: "#colours" },
				{ label: "Spacing", href: "#spacing" }
			]
		},
		{ label: "Guide", href: "/guide" }
	];

	/**
	 * Mounts the outline beside the sections it names, each starting at the offset below the top of the viewport given
	 * for it; the reading line stands a third of the way down the 900 pixel viewport, at 300.
	 */
	async function mount(tops: Readonly<Record<string, number>> = {}, outline: readonly TocEntry[] = entries): Promise<void> {

		vi.spyOn(window, "innerHeight", "get").mockReturnValue(900);

		act(() => render(<>
			{Object.keys(tops).map(id => <h2 key={id} id={id}>{id}</h2>)}
			<Toc name="Contents" entries={outline}/>
		</>, document.body));

		await scroll(tops);

	}

	function place(id: string, top: number): void {

		const element = document.getElementById(id);

		if ( element ) {
			vi.spyOn(element, "getBoundingClientRect").mockReturnValue(new DOMRect(0, top, 100, 20));
		}

	}

	/**
	 * Moves the sections to the offsets given and scrolls the page, waiting out the render the outline takes after it,
	 * as a model notifies its change asynchronously rather than within the scroll.
	 */
	async function scroll(tops: Readonly<Record<string, number>>): Promise<void> {

		Object.entries(tops).forEach(([id, top]) => place(id, top));

		await act(async () => { window.dispatchEvent(new Event("scroll")); });

	}

	function marked(): readonly string[] {
		return Array.from(document.querySelectorAll("clay-toc a[aria-current='location']"), link => link.textContent ?? "");
	}


	afterEach(() => {

		act(() => render(null, document.body));

		vi.restoreAllMocks();

	});


	describe("outline", () => {

		it("renders a named navigation landmark", async () => {

			await mount();

			expect(document.querySelector("clay-toc > nav")?.getAttribute("aria-label")).toBe("Contents");

		});

		it("lists the entries as nested lists, in order", async () => {

			await mount();

			expect(Array.from(document.querySelectorAll("clay-toc li"), item => item.firstElementChild?.textContent))
				.toEqual(["Foundations", "Colours", "Spacing", "Guide"]);

			expect(document.querySelectorAll("clay-toc > nav > ul > li > ul > li")).toHaveLength(2);

		});

		it("links an entry to its location", async () => {

			await mount();

			expect(Array.from(document.querySelectorAll("clay-toc a"), link => link.getAttribute("href")))
				.toEqual(["#colours", "#spacing", "/guide"]);

		});

		it("shows an entry with no location as a label leading nowhere", async () => {

			await mount();

			const label = document.querySelector("clay-toc > nav > ul > li > :first-child");

			expect(label?.localName).toBe("span");
			expect(label?.textContent).toBe("Foundations");

		});

		it("renders nothing for an empty outline", async () => {

			await mount({}, []);

			expect(document.querySelector("clay-toc")).toBeNull();

		});

	});

	describe("location", () => {

		it("marks the link of the section the reader is in", async () => {

			await mount({ colours: 100, spacing: 400 });

			expect(marked()).toEqual(["Colours"]);

		});

		it("marks no link above the first section", async () => {

			await mount({ colours: 400, spacing: 800 });

			expect(marked()).toEqual([]);

		});

		it("follows the reader as the page scrolls", async () => {

			await mount({ colours: 100, spacing: 800 });
			await scroll({ colours: -500, spacing: 200 });

			expect(marked()).toEqual(["Spacing"]);

		});

		it("never marks a link whose location is not a section on the page", async () => {

			await mount({ colours: -800, spacing: -400 });

			expect(document.querySelector("clay-toc a[href='/guide']")?.hasAttribute("aria-current")).toBe(false);

		});

	});

});

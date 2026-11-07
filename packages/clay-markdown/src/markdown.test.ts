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

import { createElement, Fragment, render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Markdown } from "./markdown.js";


function mount(text: string, meta?: Parameters<typeof Markdown>[0]["meta"]): void {
	act(() => render(createElement(Markdown, { meta, children: text }), document.body));
}

function texts(selector: string): string[] {
	return Array.from(document.querySelectorAll(selector), element => element.textContent ?? "");
}

function attributes(selector: string, name: string): string[] {
	return Array.from(document.querySelectorAll(selector), element => element.getAttribute(name) ?? "");
}


beforeEach(async () => {
	history.replaceState(null, "", "/");
});

afterEach(async () => {
	act(() => render(null, document.body));
	vi.restoreAllMocks();
});


describe("Markdown", () => {

	describe("document", () => {

		it("should render the text in a clay-markdown element", async () => {

			mount("# Title\n\nSome *text*.");

			expect(texts("clay-markdown > h1")).toEqual(["Title"]);
			expect(texts("clay-markdown > p > em")).toEqual(["text"]);

		});

		it("should leave the front matter unrendered", async () => {

			mount("---\ntitle: Hidden\n---\n\nShown");

			expect(document.body.textContent).not.toContain("Hidden");
			expect(texts("clay-markdown > p")).toEqual(["Shown"]);

		});

		it("should give headings unique slug ids", async () => {

			mount("# Hello World\n\n## Hello World");

			expect(attributes("h1, h2", "id")).toEqual(["hello-world", "hello-world-1"]);

		});

		it("should render GitHub Flavored Markdown tables", async () => {

			mount("| a | b |\n|---|---|\n| 1 | 2 |");

			expect(texts("table td")).toEqual(["1", "2"]);

		});

		it("should render GitHub alerts", async () => {

			mount("> [!NOTE]\n> Noted");

			expect(document.querySelector(".markdown-alert-note")?.textContent).toContain("Noted");

		});

		it("should title GitHub alerts in sentence case", async () => {

			mount("> [!CAUTION]\n> Careful\n\n> [!IMPORTANT]\n> Vital");

			expect(texts(".markdown-alert-title")).toEqual(["Caution", "Important"]);

		});

		it("should replace emoji shortcodes", async () => {

			mount("Fine :+1:");

			expect(texts("p")).toEqual(["Fine 👍"]);

		});

		it("should highlight fenced code by language", async () => {

			mount("```js\nconst x = 1;\n```");

			expect(document.querySelectorAll("pre > code.hljs span[class^='hljs-']").length).toBeGreaterThan(0);

		});

		it("should trim fenced code and compact its indentation", async () => {

			mount("```\n\n\ta\n        b\n\n```");

			expect(texts("pre > code")).toEqual(["a\n    b\n"]); // the closing newline is added to every block

		});

		it("should label task list checkboxes by the text of their item", async () => {

			mount("- [ ] Buy *fresh* milk\n  - [x] Check the date");

			expect(attributes("input[type='checkbox']", "aria-label")).toEqual(["Buy fresh milk", "Check the date"]);

		});

		it("should make code blocks reachable by keyboard, so a reader scrolls the overflow without a pointer", async () => {

			mount("```\ncode\n```");

			expect(attributes("pre", "tabindex")).toEqual(["0"]);

		});

		it("should never render raw HTML", async () => {

			mount("<script>alert(1)</script>\n\n<b>bold</b>");

			expect(document.querySelectorAll("script, b").length).toBe(0);

		});

		describe("links", () => {

			it("should rewrite links to Markdown files to their routes", async () => {

				mount([
					"[a](guide.md)",
					"[b](docs/guide.md#part)",
					"[c](index.md)",
					"[d](docs/index.md#part)",
					"[e](https://example.com/page)",
					"[f](notes.md.txt)"
				].join(" "));

				expect(attributes("a", "href")).toEqual([
					"guide",
					"docs/guide#part",
					"",
					"docs/#part",
					"https://example.com/page",
					"notes.md.txt"
				]);

			});

			it("should drop links and sources with unsafe protocols", async () => {

				mount("[a](javascript:alert(1)) ![b](data:image/png;base64,AAAA) [c](mailto:x@example.com)");

				expect(attributes("a", "href")).toEqual(["", "mailto:x@example.com"]);
				expect(attributes("img", "src")).toEqual([""]);

			});

		});

		describe("images", () => {

			function widths(): string[] {
				return Array.from(document.querySelectorAll("img"), image =>
					image.style.getPropertyValue("--clay-markdown-width")
				);
			}

			it("should size images by the percentage hint in their fragment", async () => {

				mount("![a](a.png#50)\n\n![b](docs/b.png#100)\n\n![c](c.png#5)");

				expect(attributes("img", "src")).toEqual(["a.png", "docs/b.png", "c.png"]);
				expect(widths()).toEqual(["50%", "100%", "5%"]);

			});

			it("should leave images without a percentage hint unsized", async () => {

				mount("![a](a.png)\n\n![b](b.png#0)\n\n![c](c.png#150)\n\n![d](d.png#part)");

				expect(attributes("img", "src")).toEqual(["a.png", "b.png#0", "c.png#150", "d.png#part"]);
				expect(widths()).toEqual(["", "", "", ""]);

			});

			it("should keep the alt text authors give", async () => {

				mount("![A chart](a.png \"A title\")");

				expect(attributes("img", "alt")).toEqual(["A chart"]);

			});

			it("should describe images lacking alt text by their title", async () => {

				mount("![](a.png \"A sales chart\")");

				expect(attributes("img", "alt")).toEqual(["A sales chart"]);

			});

			it("should describe images lacking alt text and title by their file name", async () => {

				mount("![](docs/sales-chart_2026.png#50)\n\n![](https://example.com/q3%20results.jpg?v=2)");

				expect(attributes("img", "alt")).toEqual(["sales chart 2026", "q3 results"]);

			});

			it("should leave the fragments of links alone", async () => {

				mount("[a](page#50)");

				expect(attributes("a", "href")).toEqual(["page#50"]);
				expect(attributes("a", "style")).toEqual([""]);

			});

		});

		describe("scrolling", () => {

			it("should scroll the heading named by the fragment into view on render", async () => {

				const scroll = vi.spyOn(Element.prototype, "scrollIntoView").mockImplementation(() => {});

				history.replaceState(null, "", "/#second");

				mount("# First\n\n# Second");

				expect(scroll.mock.contexts.filter(element => element instanceof Element).map(element => element.id)).toEqual(["second"]);

			});

			it("should scroll the heading named by the fragment into view on fragment change", async () => {

				const scroll = vi.spyOn(Element.prototype, "scrollIntoView").mockImplementation(() => {});

				mount("# First\n\n# Second");

				history.replaceState(null, "", "/#first");

				act(() => { window.dispatchEvent(new HashChangeEvent("hashchange")); });

				expect(scroll.mock.contexts.filter(element => element instanceof Element).map(element => element.id)).toEqual(["first"]);

			});

			it("should move focus to the heading named by the fragment", async () => {

				vi.spyOn(Element.prototype, "scrollIntoView").mockImplementation(() => {});

				mount("# First\n\n# Second");

				history.replaceState(null, "", "/#second");

				act(() => { window.dispatchEvent(new HashChangeEvent("hashchange")); });

				expect(document.activeElement?.id).toBe("second");

			});

			it("should stop following the fragment once removed", async () => {

				const scroll = vi.spyOn(Element.prototype, "scrollIntoView").mockImplementation(() => {});

				mount("# First");

				act(() => render(null, document.body));

				history.replaceState(null, "", "/#first");

				window.dispatchEvent(new HashChangeEvent("hashchange"));

				expect(scroll).not.toHaveBeenCalled();

			});

		});

	});

	describe("table of contents", () => {

		it("should list headings as links to their slug ids", async () => {

			mount("---\ntitle: T\n---\n\n# Hello World\n\nText\n\n## Hello World\n\n### Other", "toc");

			expect(texts("clay-toc a")).toEqual(["Hello World", "Hello World", "Other"]);
			expect(attributes("clay-toc a", "href")).toEqual(["#hello-world", "#hello-world-1", "#other"]);

		});

		it("should nest headings in lists by level", async () => {

			mount("# A\n\n## B\n\n### C\n\n## D\n\n# E", "toc");

			expect(texts("clay-toc > nav > ul > li > a")).toEqual(["A", "E"]);
			expect(texts("clay-toc > nav > ul > li > ul > li > a")).toEqual(["B", "D"]);
			expect(texts("clay-toc > nav > ul > li > ul > li > ul > li > a")).toEqual(["C"]);

		});

		it("should nest a heading under the nearest heading of a higher level", async () => {

			mount("## A\n\n# B\n\n### C", "toc");

			expect(texts("clay-toc > nav > ul > li > a")).toEqual(["A", "B"]);
			expect(texts("clay-toc > nav > ul > li > ul > li > a")).toEqual(["C"]);

		});

		it("should render no nested list for a heading introducing none", async () => {

			mount("# A\n\n# B", "toc");

			expect(document.querySelectorAll("clay-toc li > ul").length).toBe(0);

		});

		it("should render rich heading content in labels", async () => {

			mount("# The `Toc` widget", "toc");

			expect(texts("clay-toc a > code")).toEqual(["Toc"]);

		});

		it("should render no heading elements", async () => {

			mount("# A\n\n## B", "toc");

			expect(document.querySelectorAll("clay-toc :is(h1, h2, h3, h4, h5, h6)").length).toBe(0);

		});

		it("should leave non-heading content out", async () => {

			mount("# A\n\nText\n\n- item", "toc");

			expect(texts("clay-toc li")).toEqual(["A"]);
			expect(document.querySelectorAll("clay-toc p").length).toBe(0);

		});

		it("should render nothing for a text without headings", async () => {

			mount("Text", "toc");

			expect(document.querySelectorAll("clay-toc").length).toBe(0);

		});

		it("should leave headings below the third level of the outline out", async () => {

			mount("# A\n\n## B\n\n### C\n\n#### D\n\n##### E", "toc");

			expect(texts("clay-toc a")).toEqual(["A", "B", "C"]);

		});

		it("should name the navigation landmark", async () => {

			act(() => render(createElement(Markdown, { meta: "toc", name: "Contents", children: "# A" }), document.body));

			expect(attributes("clay-toc > nav", "aria-label")).toEqual(["Contents"]);

		});

		it("should leave the navigation landmark unnamed if no name is given", async () => {

			mount("# A", "toc");

			expect(document.querySelector("clay-toc > nav")?.hasAttribute("aria-label")).toBe(false);

		});

		describe("current section", () => {

			const text = "# A\n\n## B\n\n# C";

			/**
			 * Renders the document and its table of contents side by side, as a page showing both does.
			 */
			async function page(): Promise<void> {
				await act(async () => render(createElement(Fragment, {},
					createElement(Markdown, { children: text }),
					createElement(Markdown, { meta: "toc", children: text })
				), document.body));
			}

			/**
			 * Places each heading at the given distance from the top of the viewport, as scrolling would.
			 */
			function place(tops: { readonly [id: string]: number }): void {
				vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (this: Element) {
					return new DOMRect(0, tops[this.id] ?? 0, 0, 0);
				});
			}

			/**
			 * Scrolls the page, waiting out the render the outline takes after it, as its model notifies asynchronously.
			 */
			async function scroll(): Promise<void> {
				await act(async () => { window.dispatchEvent(new Event("scroll")); });
			}

			function current(): string[] {
				return texts("clay-toc a[aria-current='location']");
			}

			it("should mark the entry of the last heading scrolled above the top band", async () => {

				place({ a: -400, b: 10, c: 900 });

				await page();

				expect(current()).toEqual(["B"]);

			});

			it("should mark no entry above the first heading", async () => {

				place({ a: 700, b: 900, c: 1100 });

				await page();

				expect(current()).toEqual([]);

			});

			it("should follow scrolling", async () => {

				place({ a: 10, b: 600, c: 900 });

				await page();

				place({ a: -900, b: -600, c: 50 });

				await scroll();

				expect(current()).toEqual(["C"]);

			});

			it("should mark no entry for headings missing from the page", async () => {

				place({});

				mount(text, "toc");

				expect(current()).toEqual([]);

			});

			it("should stop following scrolling once removed", async () => {

				place({ a: 700, b: 900, c: 1100 });

				await page();

				const getter = vi.spyOn(document, "getElementById");

				act(() => render(null, document.body));

				await scroll();

				expect(getter).not.toHaveBeenCalled();

			});

		});

	});

	describe("front matter", () => {

		const text = "---\ntitle: The Title\nauthor:  Someone  \n---\n\n# Body";

		it("should render the value of a key", async () => {

			mount(text, "author");

			expect(document.body.textContent).toBe("Someone");

		});

		it("should render nothing for a missing key", async () => {

			mount(text, "date");

			expect(document.body.textContent).toBe("");

		});

		it("should render nothing for a text without front matter", async () => {

			mount("# Body", "title");

			expect(document.body.textContent).toBe("");

		});

		it("should hand all values to a function", async () => {

			const meta = vi.fn(() => "rendered");

			mount(text, meta);

			expect(meta).toHaveBeenCalledWith({ title: "The Title", author: "Someone" });
			expect(document.body.textContent).toBe("rendered");

		});

	});

});

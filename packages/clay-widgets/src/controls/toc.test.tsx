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

import { type Optional } from "@metreeca/core";
import { render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createTOC, type TOCMetrics } from "./toc.core.js";
import { TOC, type TOCEntry } from "./toc.js";


describe("createTOC", () => {

	describe("creation", () => {

		it("lists no section by default", async () => {

			const toc = createTOC();

			expect(toc.sections).toEqual([]);
			expect(toc.current).toBeUndefined();

		});

		it("lists the sections given, in order, with none current", async () => {

			const toc = createTOC({ sections: ["one", "two", "three"] });

			expect(toc.sections).toEqual(["one", "two", "three"]);
			expect(toc.current).toBeUndefined();

		});

		it("removes duplicate sections, keeping the first occurrence", async () => {

			expect(createTOC({ sections: ["one", "two", "one"] }).sections).toEqual(["one", "two"]);

		});

	});

	/**
	 * The metrics of a 900 pixel viewport whose reading line stands at 300, the sections starting at the offsets given.
	 */
	function metrics(tops: Readonly<Record<string, number>>, end = false): TOCMetrics {
		return { tops, height: 900, end };
	}


	describe("following", () => {

		const toc = createTOC({ sections: ["one", "two", "three"] });

		it("takes the last section scrolled up to the line as current", async () => {

			expect(toc.scroll(metrics({ one: -100, two: 290, three: 600 })).current).toBe("two");

		});

		it("takes a section starting exactly on the line as current", async () => {

			expect(toc.scroll(metrics({ one: -100, two: 300, three: 600 })).current).toBe("two");

		});

		it("takes no section as current above the first one", async () => {

			expect(toc.scroll(metrics({ one: 310, two: 600, three: 900 })).current).toBeUndefined();

		});

		it("goes by page order rather than by offset", async () => {

			expect(toc.scroll(metrics({ one: 290, two: -100, three: 600 })).current).toBe("two");

		});

		it("never takes a section missing from the page as current", async () => {

			expect(toc.scroll(metrics({ one: -100, three: 600 })).current).toBe("one");

		});

		it("ignores offsets of elements it does not list", async () => {

			expect(toc.scroll(metrics({ one: 310, stray: -100 })).current).toBeUndefined();

		});

		it("yields itself when the current section is unchanged", async () => {

			const scrolled = toc.scroll(metrics({ one: 290, two: 600 }));

			expect(scrolled.scroll(metrics({ one: 250, two: 560 }))).toBe(scrolled);

		});

		it("leaves the outline it was called on as it stands", async () => {

			toc.scroll(metrics({ one: 290 }));

			expect(toc.current).toBeUndefined();

		});

	});

	describe("following to the end of the page", () => {

		const toc = createTOC({ sections: ["one", "two", "three"] });

		it("takes the last section in view as current", async () => {

			expect(toc.scroll(metrics({ one: -400, two: 100, three: 700 }, true)).current).toBe("three");

		});

		it("passes over sections below the viewport", async () => {

			expect(toc.scroll(metrics({ one: -400, two: 100, three: 950 }, true)).current).toBe("two");

		});

		it("goes by the reading line short of the end", async () => {

			expect(toc.scroll(metrics({ one: -400, two: 100, three: 700 })).current).toBe("two");

		});

	});

	describe("choosing", () => {

		const toc = createTOC({ sections: ["one", "two", "three"] });

		it("makes the section chosen current and pinned", async () => {

			const chosen = toc.select("three");

			expect(chosen.current).toBe("three");
			expect(chosen.pinned).toBe(true);

		});

		it("ignores a section it does not list", async () => {

			expect(toc.select("stray")).toBe(toc);

		});

		it("holds the section chosen against the scroll position", async () => {

			const chosen = toc.select("three");

			expect(chosen.scroll(metrics({ one: -400, two: 100, three: 600 }))).toBe(chosen);

		});

		it("follows the page again once released", async () => {

			const released = toc.select("three").release();

			expect(released.pinned).toBe(false);
			expect(released.scroll(metrics({ one: -400, two: 100, three: 600 })).current).toBe("two");

		});

		it("keeps the section chosen current until the page is followed again", async () => {

			expect(toc.select("three").release().current).toBe("three");

		});

		it("yields itself when released with nothing pinned", async () => {

			expect(toc.release()).toBe(toc);

		});

	});

});

describe("TOC", () => {

	const entries: readonly TOCEntry[] = [
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
	async function mount(
		tops: Readonly<Record<string, number>> = {}, outline: readonly TOCEntry[] = entries, compact?: boolean
	): Promise<void> {

		vi.spyOn(window, "innerHeight", "get").mockReturnValue(900);

		act(() => render(<>
			{Object.keys(tops).map(id => <h2 key={id} id={id}>{id}</h2>)}
			<TOC name="Contents" compact={compact} entries={outline}/>
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


	/**
	 * Scrolls the 900 pixel viewport to the end of a page 2000 pixels tall.
	 */
	function end(): void {
		vi.spyOn(window, "scrollY", "get").mockReturnValue(1100);
		vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(2000);
	}

	/**
	 * Follows a link to a section, as the browser does: the fragment changes, then the page scrolls to the section.
	 */
	async function follow(fragment: string, tops: Readonly<Record<string, number>>): Promise<void> {

		await act(async () => {
			history.pushState(history.state, "", fragment);
			window.dispatchEvent(new HashChangeEvent("hashchange"));
		});

		await scroll(tops);

	}


	afterEach(() => {

		act(() => render(null, document.body));

		history.replaceState(history.state, "", location.pathname);

		vi.restoreAllMocks();

	});


	describe("outline", () => {

		it("renders a named navigation landmark", async () => {

			await mount();

			expect(document.querySelector("clay-toc nav")?.getAttribute("aria-label")).toBe("Contents");

		});

		it("lists the entries as nested lists, in order", async () => {

			await mount();

			expect(Array.from(document.querySelectorAll("clay-toc li"), item => item.firstElementChild?.textContent))
				.toEqual(["Foundations", "Colours", "Spacing", "Guide"]);

			expect(document.querySelectorAll("clay-toc nav > ul > li > ul > li")).toHaveLength(2);

		});

		it("links an entry to its location", async () => {

			await mount();

			expect(Array.from(document.querySelectorAll("clay-toc a"), link => link.getAttribute("href")))
				.toEqual(["#colours", "#spacing", "/guide"]);

		});

		it("opens an entry in the browsing context it names", async () => {

			await mount({}, [
				{ label: "Here", href: "/here" },
				{ label: "Apart", href: "/apart", target: "_blank" }
			]);

			expect(Array.from(document.querySelectorAll("clay-toc a"), link => link.getAttribute("target")))
				.toEqual([null, "_blank"]);

		});

		it("shows an entry with no location as a label leading nowhere", async () => {

			await mount();

			const label = document.querySelector("clay-toc nav > ul > li > :first-child");

			expect(label?.localName).toBe("span");
			expect(label?.textContent).toBe("Foundations");

		});

		it("renders nothing for an empty outline", async () => {

			await mount({}, []);

			expect(document.querySelector("clay-toc")).toBeNull();

		});

	});

	describe("folding", () => {

		function details(): Optional<HTMLDetailsElement> {
			return document.querySelector<HTMLDetailsElement>("clay-toc > details") ?? undefined;
		}

		function summary(): Optional<string> {
			return document.querySelector("clay-toc > details > summary")?.textContent ?? undefined;
		}

		async function toggle(open: boolean): Promise<void> {
			await act(async () => {
				const element = details();
				if ( element ) {
					element.open = open;
					element.dispatchEvent(new Event("toggle"));
				}
			});
		}


		it("wraps the navigation landmark in a disclosure", async () => {

			await mount();

			expect(document.querySelector("clay-toc > details > summary + nav")).not.toBeNull();

		});

		it("starts folded", async () => {

			await mount();

			expect(details()?.open).toBe(false);

		});

		it("sums up the folded outline with the section the reader is in", async () => {

			await mount({ colours: 100, spacing: 400 });

			expect(summary()).toBe("Colours");

		});

		it("sums up the folded outline with its name above the first section", async () => {

			await mount({ colours: 400, spacing: 800 });

			expect(summary()).toBe("Contents");

		});

		it("stays unfolded as the page scrolls", async () => {

			await mount({ colours: 100, spacing: 800 });
			await toggle(true);
			await scroll({ colours: -500, spacing: 200 });

			expect(details()?.open).toBe(true);

		});

		it("folds once the reader follows one of its links", async () => {

			await mount({ colours: 100, spacing: 800 });
			await toggle(true);

			await act(async () => {
				document.querySelector<HTMLAnchorElement>("clay-toc a[href='#spacing']")?.click();
			});

			expect(details()?.open).toBe(false);

		});

	});

	describe("compact", () => {

		const groups: readonly TOCEntry[] = [
			{
				label: "Foundations", entries: [
					{ label: "Colours", href: "#colours" },
					{ label: "Spacing", href: "#spacing" }
				]
			},
			{
				label: "Components", entries: [
					{ label: "Buttons", href: "#buttons" }
				]
			},
			{
				label: "Guide", href: "/guide", entries: [
					{ label: "Install", href: "/guide/install" }
				]
			}
		];

		function folds(): readonly HTMLDetailsElement[] {
			return Array.from(document.querySelectorAll<HTMLDetailsElement>("clay-toc nav > ul > li > details"));
		}

		function open(): readonly string[] {
			return folds().filter(fold => fold.open).map(fold => fold.querySelector("summary")?.textContent ?? "");
		}


		it("lists groups unfolded by default", async () => {

			await mount({}, groups);

			expect(folds()).toEqual([]);

		});

		it("folds each group leading nowhere behind its label", async () => {

			await mount({}, groups, true);

			expect(folds().map(fold => fold.querySelector(":scope > summary")?.textContent)).toEqual(["Foundations", "Components"]);
			expect(document.querySelectorAll("clay-toc nav > ul > li > details > summary + ul > li")).toHaveLength(3);

		});

		it("keeps a group with a location as a link listing its entries", async () => {

			await mount({}, groups, true);

			expect(document.querySelector("clay-toc nav > ul > li > a[href='/guide'] + ul a[href='/guide/install']"))
				.not.toBeNull();

		});

		it("opens one group at a time", async () => {

			await mount({}, groups, true);

			const names = folds().map(fold => fold.getAttribute("name"));

			expect(names[0]).toBeTruthy();
			expect(new Set(names).size).toBe(1);

		});

		it("keeps groups apart across outlines", async () => {

			act(() => render(<>
				<TOC compact entries={groups}/>
				<TOC compact entries={groups}/>
			</>, document.body));

			expect(new Set(folds().map(fold => fold.getAttribute("name"))).size).toBe(2);

		});

		it("keeps every group folded above the first section", async () => {

			await mount({ colours: 400, spacing: 800, buttons: 1200 }, groups, true);

			expect(open()).toEqual([]);

		});

		it("opens the group holding the section the reader is in", async () => {

			await mount({ colours: 100, spacing: 800, buttons: 1200 }, groups, true);

			expect(open()).toEqual(["Foundations"]);

		});

		it("opens the group the reader scrolls into, folding the one they leave", async () => {

			await mount({ colours: 100, spacing: 800, buttons: 1200 }, groups, true);
			await scroll({ colours: -1000, spacing: -500, buttons: 200 });

			expect(open()).toEqual(["Components"]);

		});

		it("folds the outline rather than the group once the reader follows one of its links", async () => {

			await mount({ colours: 100, spacing: 800, buttons: 1200 }, groups, true);

			await act(async () => {
				const outline = document.querySelector<HTMLDetailsElement>("clay-toc > details");
				if ( outline ) { outline.open = true; }
				document.querySelector<HTMLAnchorElement>("clay-toc a[href='#spacing']")?.click();
			});

			expect(document.querySelector<HTMLDetailsElement>("clay-toc > details")?.open).toBe(false);
			expect(open()).toEqual(["Foundations"]);

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

		it("marks the last section in view once the page is scrolled to its end", async () => {

			end();

			await mount({ colours: -800, spacing: 500 });

			expect(marked()).toEqual(["Spacing"]);

		});

	});

	describe("scrolling box", () => {

		/**
		 * Mounts the outline beside sections scrolling within a box standing 100 pixels below the top of the viewport,
		 * 600 pixels tall with 60 pixels of scroll padding at its top, so its reading line stands at 100 + 60 + 540 / 3.
		 */
		async function boxed(tops: Readonly<Record<string, number>>, end = false): Promise<void> {

			act(() => render(<>
				<div id="box" style={{ overflowY: "auto", scrollPaddingTop: "60px" }}>
					{Object.keys(tops).map(id => <h2 key={id} id={id}>{id}</h2>)}
				</div>
				<TOC name="Contents" entries={entries}/>
			</>, document.body));

			const box = document.getElementById("box");

			if ( box ) {
				vi.spyOn(box, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 100, 800, 600));
				vi.spyOn(box, "clientHeight", "get").mockReturnValue(600);
				vi.spyOn(box, "scrollHeight", "get").mockReturnValue(2000);
				vi.spyOn(box, "scrollTop", "get").mockReturnValue(end ? 1400 : 0);
			}

			Object.entries(tops).forEach(([id, top]) => place(id, top));

			await act(async () => { box?.dispatchEvent(new Event("scroll")); });

		}


		it("follows sections scrolling within a box rather than the window", async () => {

			await boxed({ colours: 200, spacing: 360 });

			expect(marked()).toEqual(["Colours"]);

		});

		it("measures the reading line on the part of the box left in view", async () => {

			await boxed({ colours: 200, spacing: 330 });

			expect(marked()).toEqual(["Spacing"]);

		});

		it("passes over a box scrolling its content across alone for the box scrolling it down", async () => {

			act(() => render(<>
				<div id="box" style={{ overflowY: "auto", scrollPaddingTop: "60px" }}>
					<div id="wide" style={{ overflowX: "auto" }}>
						{["colours", "spacing"].map(id => <h2 key={id} id={id}>{id}</h2>)}
					</div>
				</div>
				<TOC name="Contents" entries={entries}/>
			</>, document.body));

			const box = document.getElementById("box");
			const wide = document.getElementById("wide");

			if ( box && wide ) {
				vi.spyOn(box, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 100, 800, 600));
				vi.spyOn(box, "clientHeight", "get").mockReturnValue(600);
				vi.spyOn(box, "scrollHeight", "get").mockReturnValue(2000);
				vi.spyOn(wide, "getBoundingClientRect").mockReturnValue(new DOMRect(0, -500, 800, 2000));
				vi.spyOn(wide, "clientHeight", "get").mockReturnValue(2000);
				vi.spyOn(wide, "scrollHeight", "get").mockReturnValue(2000);
			}

			place("colours", 200);
			place("spacing", 360);

			await act(async () => { box?.dispatchEvent(new Event("scroll")); });

			expect(marked()).toEqual(["Colours"]);

		});

		it("marks the last section in view once the box is scrolled to its end", async () => {

			await boxed({ colours: -800, spacing: 600 }, true);

			expect(marked()).toEqual(["Spacing"]);

		});

	});

	describe("choice", () => {

		it("marks the section a followed link names, whatever the scroll position", async () => {

			await mount({ colours: 100, spacing: 800 });
			await follow("#spacing", { colours: -100, spacing: 600 });

			expect(marked()).toEqual(["Spacing"]);

		});

		it("marks the section the fragment names on arrival", async () => {

			history.replaceState(history.state, "", "#spacing");

			await mount({ colours: 100, spacing: 800 });

			expect(marked()).toEqual(["Spacing"]);

		});

		it("follows the page again once the reader scrolls on their own", async () => {

			await mount({ colours: 100, spacing: 800 });
			await follow("#spacing", { colours: -100, spacing: 600 });

			await act(async () => { window.dispatchEvent(new Event("wheel")); });
			await scroll({ colours: -150, spacing: 550 });

			expect(marked()).toEqual(["Colours"]);

		});

	});

	describe("fragment", () => {

		it("follows the section marked as the page scrolls", async () => {

			await mount({ colours: 100, spacing: 800 });
			await scroll({ colours: -500, spacing: 200 });

			expect(location.hash).toBe("#spacing");

		});

		it("is cleared above the first section", async () => {

			history.replaceState(history.state, "", "#colours");

			await mount({ colours: 100, spacing: 800 });

			await act(async () => { window.dispatchEvent(new Event("wheel")); });
			await scroll({ colours: 400, spacing: 1100 });

			expect(location.hash).toBe("");

		});

		it("adds no entries to the history", async () => {

			await mount({ colours: 100, spacing: 800 });

			const entries = history.length;

			await scroll({ colours: -500, spacing: 200 });

			expect(history.length).toBe(entries);

		});

	});

});

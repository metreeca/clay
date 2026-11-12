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

import { render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createTOC, type TOCMetrics } from "./toc.core.js";
import { TOC, type TOCEntries, type TOCEntry } from "./toc.js";


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
	 * The metrics of a 900 pixel viewport, the sections starting at the offsets given below its top, short of the end
	 * of the page unless `end` is set, where the last section in view is taken as current.
	 */
	function metrics(tops: Readonly<Record<string, number>>, { end = false }: { end?: boolean } = {}): TOCMetrics {
		return { tops, height: 900, end };
	}


	describe("following", () => {

		const toc = createTOC({ sections: ["one", "two", "three"] });

		it("takes the last section scrolled up to the top edge as current", async () => {

			expect(toc.scroll(metrics({ one: -400, two: -100, three: 400 })).current).toBe("two");

		});

		it("takes a section starting exactly on the top edge as current", async () => {

			expect(toc.scroll(metrics({ one: -400, two: 0, three: 200 })).current).toBe("two");

		});

		it("takes the first section starting in the top third of the view as current", async () => {

			expect(toc.scroll(metrics({ one: -400, two: 120, three: 250 })).current).toBe("two");

		});

		it("keeps the section at the top edge current while the next ones come into view below the top third", async () => {

			expect(toc.scroll(metrics({ one: -10, two: 350, three: 600 })).current).toBe("one");

		});

		it("takes the first section starting in the top third as current just short of the end of the page", async () => {

			expect(toc.scroll(metrics({ one: -134, two: 154, three: 503 })).current).toBe("two");

		});

		it("takes the first section in view as current before any reaches the top", async () => {

			expect(toc.scroll(metrics({ one: 420, two: 600, three: 700 })).current).toBe("one");

		});

		it("takes no section as current while the first one starts below the view", async () => {

			expect(toc.scroll(metrics({ one: 950, two: 1200 })).current).toBeUndefined();

		});

		it("goes by page order rather than by offset", async () => {

			expect(toc.scroll(metrics({ one: 350, two: -100, three: 600 })).current).toBe("two");

		});

		it("never takes a section missing from the page as current", async () => {

			expect(toc.scroll(metrics({ one: -100, three: 600 })).current).toBe("one");

		});

		it("ignores offsets of elements it does not list", async () => {

			expect(toc.scroll(metrics({ one: 950, stray: -100 })).current).toBeUndefined();

		});

		it("yields itself when the current section is unchanged", async () => {

			const scrolled = toc.scroll(metrics({ one: -10, two: 600 }));

			expect(scrolled.scroll(metrics({ one: -50, two: 560 }))).toBe(scrolled);

		});

		it("leaves the outline it was called on as it stands", async () => {

			toc.scroll(metrics({ one: -10 }));

			expect(toc.current).toBeUndefined();

		});

	});

	describe("following to the end of the page", () => {

		const toc = createTOC({ sections: ["one", "two", "three"] });

		it("takes the last section in view as current", async () => {

			expect(toc.scroll(metrics({ one: -400, two: 100, three: 700 }, { end: true })).current).toBe("three");

		});

		it("passes over sections below the viewport", async () => {

			expect(toc.scroll(metrics({ one: -400, two: 100, three: 950 }, { end: true })).current).toBe("two");

		});

		it("takes the section at the top edge as current with no section in view", async () => {

			expect(toc.scroll(metrics({ one: -400, two: -100 }, { end: true })).current).toBe("two");

		});

		it("goes by the top of the view short of the end", async () => {

			expect(toc.scroll(metrics({ one: -400, two: 400, three: 700 })).current).toBe("one");

		});

	});

	describe("following a released choice", () => {

		const toc = createTOC({ sections: ["one", "two", "three"] });

		it("keeps the section chosen current while its start is in view", async () => {

			const released = toc.select("three").release();

			expect(released.chosen).toBe("three");
			expect(released.scroll(metrics({ one: -400, two: 100, three: 700 })).current).toBe("three");

		});

		it("keeps it current at the end of the page as well", async () => {

			const released = toc.select("two").release();

			expect(released.scroll(metrics({ one: -400, two: 100, three: 700 }, { end: true })).current).toBe("two");

		});

		it("follows the page once its start leaves the view", async () => {

			const scrolled = toc.select("one").release().scroll(metrics({ one: -400, two: -100, three: 950 }));

			expect(scrolled.current).toBe("two");
			expect(scrolled.chosen).toBeUndefined();

		});

		it("never moves back to an earlier section as its start leaves the view", async () => {

			const scrolled = toc.select("two").release().scroll(metrics({ one: -400, two: -10, three: 600 }));

			expect(scrolled.current).toBe("two");

		});

		it("lets the choice lapse for good once its start has left the view", async () => {

			const lapsed = toc.select("three").release().scroll(metrics({ one: -400, two: 100, three: 950 }));

			expect(lapsed.scroll(metrics({ one: -800, two: -300, three: 600 })).current).toBe("two");

		});

	});

	describe("choosing", () => {

		const toc = createTOC({ sections: ["one", "two", "three"] });

		it("makes the section chosen current and pinned", async () => {

			const chosen = toc.select("three");

			expect(chosen.current).toBe("three");
			expect(chosen.pinned).toBe(true);
			expect(chosen.chosen).toBe("three");

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
			expect(released.scroll(metrics({ one: -400, two: -100, three: 950 })).current).toBe("two");

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
	 * for it, in a 900 pixel viewport, and waits out the render the outline takes after measuring them.
	 */
	async function mount(
		tops: Readonly<Record<string, number>> = {}, outline: readonly TOCEntry[] | TOCEntries = entries, compact?: boolean
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

	/**
	 * Clicks a link with the main button, then waits for the outline to settle the click and for the render that
	 * follows. The link itself is never followed. happy-dom follows every link a click passes through, modifiers and
	 * downloads included, and changes the fragment where a browser would leave it alone. For the rest of the test,
	 * anchors therefore dispatch events like any other element, following nothing, and the fragment stays as it was.
	 */
	async function click(link: Element | null, init: MouseEventInit = {}): Promise<void> {

		const { dispatchEvent } = HTMLElement.prototype;

		vi.spyOn(HTMLAnchorElement.prototype, "dispatchEvent").mockImplementation(function (this: HTMLAnchorElement, event) {
			return dispatchEvent.call(this, event);
		});

		await act(async () => {
			link?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, ...init }));
			await new Promise(resolve => setTimeout(resolve));
		});

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

		it("stands as the navigation landmark alone, folding behind no disclosure", async () => {

			await mount({ colours: 100, spacing: 400 });

			expect(Array.from(document.querySelector("clay-toc")?.children ?? [], child => child.localName)).toEqual(["nav"]);

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

	describe("keyed entries", () => {

		const keyed: TOCEntries = {
			Foundations: { Colours: "#colours", Spacing: "#spacing" },
			Guide: "/guide"
		};

		function markup(outline: readonly TOCEntry[] | TOCEntries): string {

			act(() => render(<TOC name="Contents" entries={outline}/>, document.body));

			return document.body.innerHTML;

		}

		it("lists entries keyed by their labels as the entries they stand for", async () => {
			expect(markup(keyed)).toBe(markup(entries));
		});

		it("lists entries keyed by their labels nested under an entry", async () => {
			expect(markup([{ label: "Foundations", entries: { Colours: "#colours", Spacing: "#spacing" } }, {
				label: "Guide",
				href: "/guide"
			}])).toBe(markup(entries));
		});

		it("marks the link of the section the reader is in", async () => {

			await mount({ colours: 100, spacing: 500 }, keyed);

			expect(marked()).toEqual(["Colours"]);

		});

		it("renders nothing for an empty outline", async () => {

			await mount({}, {});

			expect(document.querySelector("clay-toc")).toBeNull();

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

		it("keeps every group folded while the first section starts below the view", async () => {

			await mount({ colours: 1000, spacing: 1400, buttons: 1800 }, groups, true);

			expect(open()).toEqual([]);

		});

		it("opens the group holding the section the reader is in", async () => {

			await mount({ colours: 100, spacing: 800, buttons: 1200 }, groups, true);

			expect(open()).toEqual(["Foundations"]);

		});

		it("opens the group the reader scrolls into, folding the one they leave", async () => {

			await mount({ colours: 100, spacing: 800, buttons: 1200 }, groups, true);
			await scroll({ colours: -1000, spacing: -500, buttons: -10 });

			expect(open()).toEqual(["Components"]);

		});

	});

	describe("clipping", () => {

		const groups: readonly TOCEntry[] = [
			{
				label: "Foundations", entries: [
					{ label: "Colours", href: "#colours" },
					{ label: <code>schema:EducationalOccupationalCredential</code>, href: "#credential" }
				]
			}
		];

		function tooltips(selector: string): readonly (null | string)[] {
			return Array.from(document.querySelectorAll(`${selector} > span`), label => label.getAttribute("title"));
		}


		it("clips labels by default", async () => {

			await mount({}, groups);

			expect(document.querySelector("clay-toc")?.hasAttribute("wrap")).toBe(false);

		});

		it("wraps labels if required", async () => {

			act(() => render(<TOC wrap entries={groups}/>, document.body));

			expect(document.querySelector("clay-toc")?.hasAttribute("wrap")).toBe(true);

		});

		it("offers the full wording of a link label as a tooltip", async () => {

			await mount({}, groups);

			expect(tooltips("clay-toc a")).toEqual(["Colours", null]);

		});

		it("offers the full wording of a label leading nowhere as a tooltip", async () => {

			await mount({}, groups);

			expect(Array.from(document.querySelectorAll("clay-toc li > span"), label => label.getAttribute("title")))
				.toEqual(["Foundations"]);

		});

		it("offers the full wording of a folded group label as a tooltip", async () => {

			await mount({}, groups, true);

			expect(tooltips("clay-toc li > details > summary")).toEqual(["Foundations"]);

		});

		it("leaves links without a tooltip of their own, named by their label alone", async () => {

			await mount({}, groups);

			expect(Array.from(document.querySelectorAll("clay-toc a"), link => link.getAttribute("title")))
				.toEqual([null, null]);

		});

	});

	describe("location", () => {

		it("marks the link of the section the reader is in", async () => {

			await mount({ colours: 100, spacing: 400 });

			expect(marked()).toEqual(["Colours"]);

		});

		it("marks the first section in view at the start of the page", async () => {

			await mount({ colours: 0, spacing: 150 });

			expect(marked()).toEqual(["Colours"]);

		});

		it("marks the first section in view before any reaches the top", async () => {

			await mount({ colours: 400, spacing: 800 });

			expect(marked()).toEqual(["Colours"]);

		});

		it("marks no link while the first section starts below the view", async () => {

			await mount({ colours: 1000, spacing: 1400 });

			expect(marked()).toEqual([]);

		});

		it("follows the reader as the page scrolls", async () => {

			await mount({ colours: 100, spacing: 800 });
			await scroll({ colours: -500, spacing: -10 });

			expect(marked()).toEqual(["Spacing"]);

		});

		it("marks the section starting in the top third of the view", async () => {

			await mount({ colours: 100, spacing: 800 });
			await scroll({ colours: -500, spacing: 200 });

			expect(marked()).toEqual(["Spacing"]);

		});

		it("keeps the section at the top edge marked while the next one comes into view below the top third", async () => {

			await mount({ colours: 100, spacing: 800 });
			await scroll({ colours: -500, spacing: 400 });

			expect(marked()).toEqual(["Colours"]);

		});

		it("keeps the section the fragment names marked while its start is in view", async () => {

			history.replaceState(history.state, "", "#spacing");

			await mount({ colours: 100, spacing: 800 });

			await act(async () => { window.dispatchEvent(new Event("wheel")); });
			await scroll({ colours: -500, spacing: 200 });

			expect(marked()).toEqual(["Spacing"]);

		});

		it("follows the page once the start of the section the fragment names leaves the view", async () => {

			history.replaceState(history.state, "", "#colours");

			await mount({ colours: 100, spacing: 800 });

			await act(async () => { window.dispatchEvent(new Event("wheel")); });
			await scroll({ colours: -500, spacing: -10 });

			expect(marked()).toEqual(["Spacing"]);

		});

		it("stops preferring the section the fragment names once its start has left the view", async () => {

			history.replaceState(history.state, "", "#spacing");

			await mount({ colours: -500, spacing: 100 });

			await act(async () => { window.dispatchEvent(new Event("wheel")); });
			await scroll({ colours: 100, spacing: 950 });
			await scroll({ colours: -500, spacing: 600 });

			expect(marked()).toEqual(["Colours"]);

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
		 * 600 pixels tall with 60 pixels of scroll padding at its top, so its top edge stands at 160, scrolled partway
		 * down its 2400 pixels of content, or to their end if asked, where the last section in view is marked.
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
				vi.spyOn(box, "scrollHeight", "get").mockReturnValue(2400);
				vi.spyOn(box, "scrollTop", "get").mockReturnValue(end ? 1800 : 600);
			}

			Object.entries(tops).forEach(([id, top]) => place(id, top));

			await act(async () => { box?.dispatchEvent(new Event("scroll")); });

		}


		it("follows sections scrolling within a box rather than the window", async () => {

			await boxed({ colours: 200, spacing: 360 });

			expect(marked()).toEqual(["Colours"]);

		});

		it("measures the top edge on the part of the box left in view", async () => {

			await boxed({ colours: 120, spacing: 150 });

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

		it("brings the section the fragment names into view on arrival", async () => {

			const reveal = vi.spyOn(Element.prototype, "scrollIntoView").mockImplementation(() => {});

			history.replaceState(history.state, "", "#spacing");

			await mount({ colours: 100, spacing: 800 });

			expect(reveal).toHaveBeenCalledOnce();
			expect(reveal.mock.contexts[0]).toBe(document.getElementById("spacing"));

		});

		it("leaves the page where it stands on arrival without a fragment naming a section", async () => {

			const reveal = vi.spyOn(Element.prototype, "scrollIntoView").mockImplementation(() => {});

			history.replaceState(history.state, "", "#elsewhere");

			await mount({ colours: 100, spacing: 800 });

			expect(reveal).not.toHaveBeenCalled();

		});

		it("leaves scrolling to a followed link to the browser", async () => {

			const reveal = vi.spyOn(Element.prototype, "scrollIntoView").mockImplementation(() => {});

			await mount({ colours: 100, spacing: 800 });
			await follow("#spacing", { colours: -100, spacing: 600 });

			expect(reveal).not.toHaveBeenCalled();

		});

		it("follows the page again once the reader scrolls on their own", async () => {

			await mount({ colours: 100, spacing: 800 });
			await follow("#spacing", { colours: -100, spacing: 600 });

			await act(async () => { window.dispatchEvent(new Event("wheel")); });
			await scroll({ colours: -150, spacing: 950 });

			expect(marked()).toEqual(["Colours"]);

		});

		it("marks a section followed again through a link to the fragment already in the location", async () => {

			const outline: readonly TOCEntry[] = [
				{ label: "Colours", href: "#colours" },
				{ label: "Spacing", href: "#spacing" },
				{ label: "Buttons", href: "#buttons" }
			];

			history.replaceState(history.state, "", "#spacing");

			await mount({ colours: -1500, spacing: -1000, buttons: -500 }, outline);

			await act(async () => { window.dispatchEvent(new Event("wheel")); });
			await scroll({ colours: -2000, spacing: -1500, buttons: -1000 });

			end();

			const link = document.querySelector<HTMLAnchorElement>("clay-toc a[href='#spacing']");

			await click(link);
			await scroll({ colours: -100, spacing: 400, buttons: 700 });

			expect(location.hash).toBe("#spacing");
			expect(marked()).toEqual(["Spacing"]);

		});

		it("leaves a link clicked with a modifier to the browser", async () => {

			await mount({ colours: -100, spacing: 400 });

			const link = document.querySelector<HTMLAnchorElement>("clay-toc a[href='#spacing']");

			await click(link, { metaKey: true });

			expect(marked()).toEqual(["Colours"]);

		});

		it("leaves a link whose click is cancelled to whatever cancelled it", async () => {

			await mount({ colours: -100, spacing: 400 });

			const cancel = (event: Event) => event.preventDefault();

			document.addEventListener("click", cancel);

			try {
				await click(document.querySelector("clay-toc a[href='#spacing']"));
			} finally {
				document.removeEventListener("click", cancel);
			}

			expect(marked()).toEqual(["Colours"]);

		});

		it.each([
			["a new browsing context", (link: HTMLAnchorElement) => link.setAttribute("target", "_blank")],
			["a download", (link: HTMLAnchorElement) => link.setAttribute("download", "")]
		])("leaves a link opening %s to the browser", async (_, open) => {

			await mount({ colours: -100, spacing: 400 });

			const link = document.body.appendChild(Object.assign(document.createElement("a"), { href: "#spacing", textContent: "Spacing" }));

			open(link);

			await click(link);

			expect(marked()).toEqual(["Colours"]);

		});

		it("follows a link clicked within a shadow tree", async () => {

			await mount({ colours: -100, spacing: 400 });

			const host = document.body.appendChild(document.createElement("div"));
			const link = host.attachShadow({ mode: "open" })
				.appendChild(Object.assign(document.createElement("a"), { href: "#spacing", textContent: "Spacing" }));

			await click(link, { composed: true });

			expect(marked()).toEqual(["Spacing"]);

		});

	});

	describe("fragment", () => {

		it("is left alone as the page scrolls into a section", async () => {

			await mount({ colours: 100, spacing: 800 });
			await scroll({ colours: -500, spacing: 200 });

			expect(location.hash).toBe("");

		});

		it("is left alone as the reader scrolls away from the section it names", async () => {

			history.replaceState(history.state, "", "#colours");

			await mount({ colours: 100, spacing: 800 });

			await act(async () => { window.dispatchEvent(new Event("wheel")); });
			await scroll({ colours: -500, spacing: 200 });

			expect(location.hash).toBe("#colours");

		});

		it("is left alone as the reader scrolls back up", async () => {

			history.replaceState(history.state, "", "#colours");

			await mount({ colours: 100, spacing: 800 });

			await act(async () => { window.dispatchEvent(new Event("wheel")); });
			await scroll({ colours: 400, spacing: 1100 });

			expect(location.hash).toBe("#colours");

		});

	});

});

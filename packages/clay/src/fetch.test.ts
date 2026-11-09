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

import type { Fetch as Client } from "@metreeca/http";
import { createElement, render } from "preact";
import { act } from "preact/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Fetch, useFetch, useFetching } from "./fetch.js";


/**
 * The client and status of every render.
 */
const seen = vi.fn<(client: Client, busy: boolean) => void>();

function Probe() {

	const client = useFetch();
	const busy = useFetching();

	seen(client, busy);

	return null;

}

function mount(fetch?: Client): void {
	act(() => render(fetch
			? createElement(Fetch, { fetch, children: createElement(Probe, {}) })
			: createElement(Probe, {}),
		document.body
	));
}

function client(): Client {
	return seen.mock.lastCall![0]; // test harness: Probe has rendered at least once
}

function busy(): boolean {
	return seen.mock.lastCall![1]; // test harness: Probe has rendered at least once
}


/**
 * A fetch function answering each exchange only when the test settles it.
 */
function createPending() {

	const settlers: Array<(response: Response) => void> = [];

	const fetch = vi.fn<Client>(() => new Promise(resolve => { settlers.push(resolve); }));

	return {

		fetch,

		settle(index: number, response = new Response("{}")): void {
			settlers[index](response);
		}

	};

}

function request(fetch: ReturnType<typeof vi.fn<Client>>): Request {
	return new Request(...fetch.mock.lastCall!); // test harness: the stub has been called at least once
}


afterEach(async () => {
	act(() => render(null, document.body));
	seen.mockClear();
});


describe("useFetch()", () => {

	it("should return the global fetch function outside any context", async () => {

		mount();

		expect(client()).toBe(globalThis.fetch);

	});

	it("should perform exchanges through the fetch function of the context", async () => {

		const fetch = vi.fn<Client>(async () => new Response("{}"));

		mount(fetch);

		await client()("https://example.com/");

		expect(fetch).toHaveBeenCalledOnce();
		expect(request(fetch).url).toBe("https://example.com/");

	});

	it("should ask for JSON by default", async () => {

		const fetch = vi.fn<Client>(async () => new Response("{}"));

		mount(fetch);

		await client()("https://example.com/");

		expect(request(fetch).headers.get("Accept")).toBe("application/json");

	});

	it("should keep the content an exchange asks for", async () => {

		const fetch = vi.fn<Client>(async () => new Response(""));

		mount(fetch);

		await client()("https://example.com/", { headers: { "Accept": "text/html" } });

		expect(request(fetch).headers.get("Accept")).toBe("text/html");

	});

	it("should keep the client across renders", async () => {

		const fetch = vi.fn<Client>(async () => new Response("{}"));

		mount(fetch);

		const initial = client();

		mount(fetch);

		expect(client()).toBe(initial);

	});

	it("should ignore a fetch function handed over later", async () => {

		const initial = vi.fn<Client>(async () => new Response("{}"));
		const later = vi.fn<Client>(async () => new Response("{}"));

		mount(initial);
		mount(later);

		await client()("https://example.com/");

		expect(initial).toHaveBeenCalledOnce();
		expect(later).not.toHaveBeenCalled();

	});

});

describe("useFetching()", () => {

	it("should be idle outside any context", async () => {

		mount();

		expect(busy()).toBe(false);

	});

	it("should be idle before any exchange", async () => {

		mount(vi.fn<Client>(async () => new Response("{}")));

		expect(busy()).toBe(false);

	});

	it("should be busy while an exchange is in flight", async () => {

		const pending = createPending();

		mount(pending.fetch);

		act(() => void client()("https://example.com/"));

		await vi.waitFor(() => expect(busy()).toBe(true));

		pending.settle(0);

		await vi.waitFor(() => expect(busy()).toBe(false));

	});

	it("should fall idle after a failed exchange", async () => {

		const fetch = vi.fn<Client>(async () => { throw new TypeError("failed to fetch"); });

		mount(fetch);

		await act(async () => void await client()("https://example.com/"));

		expect(busy()).toBe(false);

	});

	it("should hold concurrent exchanges as a single stretch of waiting", async () => {

		const pending = createPending();

		mount(pending.fetch);

		act(() => {
			void client()("https://example.com/a");
			void client()("https://example.com/b");
		});

		await vi.waitFor(() => expect(pending.fetch).toHaveBeenCalledTimes(2));

		pending.settle(0);

		await new Promise(resolve => setTimeout(resolve, 10)); // let the first answer reach the status

		expect(busy()).toBe(true);

		pending.settle(1);

		await vi.waitFor(() => expect(busy()).toBe(false));

		expect(seen.mock.calls.map(([, busy]) => busy).filter((busy, index, all) => busy !== all[index - 1]))
			.toEqual([false, true, false]);

	});

});

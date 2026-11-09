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

import { describe, expectTypeOf, it } from "vitest";
import { type Focus, useFocus } from "./focus.js";


describe("useFocus()", () => {

	it("takes no orientation beyond the two axes", () => {
		expectTypeOf<NonNullable<Parameters<typeof useFocus>[0]["orientation"]>>()
			.toEqualTypeOf<"horizontal" | "vertical">();
	});

	it("hands out a focus handler per item", () => {
		expectTypeOf<Focus["onFocus"]>().toEqualTypeOf<(item: string) => void>();
	});

	it("requires the move callback", () => {
		expectTypeOf<Parameters<typeof useFocus>[0]["onMove"]>().toEqualTypeOf<(item: string) => void>();
	});

});

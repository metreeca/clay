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

/**
 * Model samples.
 *
 * @module
 */

import { useModel } from "@metreeca/clay/model";
import { Button } from "@metreeca/clay-widgets/button";
import { createState } from "@metreeca/core/state";
import "../clay-widgets/index.css";


/**
 * A bounded counter, stated once as a state object with no rendering layer in sight.
 */
interface Counter {

	readonly count: number;
	readonly limit: number;

	increment(): this;

	decrement(): this;

	reset(): this;

}


function createCounter({ limit }: { limit: number }): Counter {
	return createState<Counter>({

		count: 0,
		limit,

		increment() {
			return { count: Math.min(this.count + 1, this.limit) };
		},

		decrement() {
			return { count: Math.max(this.count - 1, 0) };
		},

		reset() {
			return { count: 0 };
		}

	});
}


/**
 * Creates the model section.
 *
 * Adopts a headless counter as component state, the buttons calling its transitions straight as handlers.
 *
 * @returns The model section
 */
export function Model() {

	const { count, limit, increment, decrement, reset } = useModel(() => createCounter({ limit: 5 }));

	return <>

		<p>Behaviour is stated once as an immutable state object, here a counter bounded between zero and five, and
			adopted by a component with <code>useModel</code>. Its transitions go straight to the buttons as handlers;
			each one renders the component again, while one changing nothing, such as stepping past either bound, renders
			nothing at all. The widgets keeping state, tabs and tables of contents among them, are built the same way.</p>

		<div class="controls">
			<Button label="Less" onClick={decrement}/>
			<strong>{count} of {limit}</strong>
			<Button label="More" onClick={increment}/>
			<Button look="subtle" label="Reset" onClick={reset}/>
		</div>

	</>;

}

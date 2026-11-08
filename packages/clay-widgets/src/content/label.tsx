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
 * Content label.
 *
 * Introduces the content that follows it with wording set apart by colour and size, so that a caption or a field name
 * reads as guidance for the content rather than as part of it, on any surface the design system paints.
 *
 * @module label
 */

import { type ComponentChildren, createElement } from "preact";
import "./label.css";


/**
 * Creates a label.
 *
 * Sets its wording in the label colour at a smaller size, and keeps it readable against the page. The label adds no
 * box of its own, so it sits in the line, the row or the column around it exactly as the bare wording would.
 *
 * @param options The widget configuration
 *
 * @returns The label
 */
export function Label({

	children

}: {

	/**
	 * The wording introducing the content the label precedes.
	 */
	children: ComponentChildren

}) {

	return createElement("clay-label", {}, children);

}

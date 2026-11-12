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

/**
 * Field label.
 *
 * Names a form control, so assistive technology announces the control by the text the reader sees beside it, and a
 * press on that text reaches the control as a press on the control itself would.
 *
 * @module label
 */

import { type ComponentChildren, createElement } from "preact";
import "./label.css";


/**
 * Creates a label.
 *
 * Names its control in either of two ways, the placement of the text and the control being left to the caller:
 *
 * - **wrapped**: the control is given among the children, with the text before or after it, and is named without
 *   any id, as in `<Label>Title <Input/></Label>` or `<Label><Checkbox/> Remember me</Label>`
 * - **split**: the label stands apart from its control, such as in another column of a grid, and names it by the id
 *   given as `control`, which the control carries as its own `id` wherever on the screen it stands
 *
 * @param options The widget configuration
 *
 * @returns The label
 *
 * @see [HTML: The label element][label]
 *
 * [label]: https://html.spec.whatwg.org/multipage/forms.html#the-label-element
 */
export function Label({

	orientation = "vertical",

	control,

	children

}: {

	/**
	 * How a wrapped control and its text are arranged: `vertical`, the default, stacks them one over the other, each
	 * aligned to the start, as a field stands under the text naming it; `horizontal` sets them side by side on one
	 * line, centred on each other, as a checkbox, a radio button or a switch stands beside the text naming it.
	 */
	orientation?: "vertical" | "horizontal"

	/**
	 * The id of the control the label names where the label stands apart from it; the control wrapped among the
	 * children if omitted. The id has to resolve to a rendered control, or the label names nothing at all.
	 */
	control?: string

	/**
	 * The text naming the control, and the control itself where the label wraps it.
	 *
	 * Plain text may be given as it stands, but text mixing in markup, such as a link to the terms being accepted,
	 * goes inside a single `span`: each run of text and each element is otherwise laid out as a part of its own.
	 */
	children?: ComponentChildren

}) {

	return createElement("clay-label", { orientation }, <label for={control}>{children}</label>);

}

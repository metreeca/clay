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
 * Service samples.
 *
 * @module
 */

import { Columns } from "@metreeca/specimen/clay/columns.js";
import { Exchanges } from "@metreeca/specimen/clay/fetch.js";
import { Focus } from "@metreeca/specimen/clay/focus.js";
import { List } from "@metreeca/specimen/clay/list.js";
import { Model } from "@metreeca/specimen/clay/model.js";
import { Notices } from "@metreeca/specimen/clay/notices.js";
import { Storage } from "@metreeca/specimen/clay/storage.js";
import { Uploads } from "@metreeca/specimen/clay/uploads.js";
import { Page, type Sample } from "@metreeca/specimen/index.core.js";


const samples: readonly Sample[] = [

	{ id: "model", group: "State", title: "Model", view: <Model/> },
	{ id: "storage", group: "State", title: "Storage", view: <Storage/> },

	{ id: "exchanges", group: "Services", title: "Exchanges", view: <Exchanges/> },
	{ id: "notices", group: "Services", title: "Notices", view: <Notices/> },

	{ id: "focus", group: "Interaction", title: "Focus", view: <Focus/> },
	{ id: "columns", group: "Interaction", title: "Columns", view: <Columns/> },
	{ id: "list", group: "Interaction", title: "List", view: <List/> },
	{ id: "uploads", group: "Interaction", title: "Uploads", view: <Uploads/> }

];


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function Clay() {

	return <Page

		eyebrow="@metreeca/clay"
		title="Contexts and Hooks"
		lead={<>
			The behaviour an interface is wired to, with no rendering of its own: state objects adopted as component
			state, values kept across reloads, one shared client and status board, and the focus and transfers a widget
			draws its own way. Every sample below draws its own markup over the same hooks the widgets use.
		</>}

		samples={samples}

	/>;

}

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
 * Service samples.
 *
 * @module
 */

import { Board } from "@metreeca/specimen/clay/board.js";
import { Fetch } from "@metreeca/specimen/clay/fetch.js";
import { Focus } from "@metreeca/specimen/clay/focus.js";
import { Model } from "@metreeca/specimen/clay/model.js";
import { Storage } from "@metreeca/specimen/clay/storage.js";
import { Transfer } from "@metreeca/specimen/clay/transfer.js";
import { Page, type Sample } from "@metreeca/specimen/index.core.js";


const samples: readonly Sample[] = [

	{ id: "model", group: "State", title: "Model", view: <Model/> },
	{ id: "storage", group: "State", title: "Storage", view: <Storage/> },

	{ id: "fetch", group: "Services", title: "Fetch", view: <Fetch/> },
	{ id: "board", group: "Services", title: "Board", view: <Board/> },

	{ id: "focus", group: "Interaction", title: "Focus", view: <Focus/> },
	{ id: "transfer", group: "Interaction", title: "Transfer", view: <Transfer/> }

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

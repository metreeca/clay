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
 * Transfer samples.
 *
 * @module
 */

import { Page, type Sample } from "@metreeca/specimen/index.core.js";
import { Board } from "@metreeca/specimen/transfer/board.js";
import { List } from "@metreeca/specimen/transfer/list.js";
import { Uploads } from "@metreeca/specimen/transfer/uploads.js";


const samples: readonly Sample[] = [

	{ id: "board", group: "Moves", title: "Board", view: <Board/> },
	{ id: "list", group: "Moves", title: "List", view: <List/> },
	{ id: "uploads", group: "Files", title: "Uploads", view: <Uploads/> }

];


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function Transfers() {

	return <Page

		eyebrow="@metreeca/clay/transfer"
		title="Moving items"
		lead={<>
			Items moved by drag or by menu, and files dropped or picked, each widget drawing its own grip and drop
			indicator over the shared transfer state.
		</>}

		samples={samples}

	/>;

}

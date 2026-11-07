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

import { Link } from "@metreeca/clay-widgets/link";
import { Routes } from "@metreeca/clay/router";
import { Page } from "@metreeca/specimen/index.core.js";
import { Board } from "@metreeca/specimen/transfer/board.js";
import { List } from "@metreeca/specimen/transfer/list.js";
import { Uploads } from "@metreeca/specimen/transfer/uploads.js";


export const TransferPath = "/transfer/";


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function Transfers() {

	const sections = {

		Board: <Board/>,
		List: <List/>,
		Uploads: <Uploads/>

	};

	const path = (label: string) => label.toLowerCase();

	return <Page

		tray={<>

			{Object.keys(sections).map(label =>
				<Link key={label} active look="subtle" href={`${TransferPath}${path(label)}`}>{label}</Link>
			)}

		</>}
	>

		<Routes>{{

			"/": `/${path("Board")}`,

			...Object.fromEntries(Object.entries(sections).map(([label, view]) => [`/${path(label)}`, view]))

		}}</Routes>

	</Page>;

}

/*
 * Copyright © 2025-2026 Metreeca srl
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
 * Layout samples.
 *
 * @module
 */

import { Button } from "@metreeca/clay-widgets/button";
import { Icon } from "@metreeca/clay-widgets/icon";
import { Link } from "@metreeca/clay-widgets/link";
import { Panel } from "@metreeca/clay-widgets/panel";
import { Stack } from "@metreeca/clay-widgets/stack";
import { Strip } from "@metreeca/clay-widgets/strip";
import { Well } from "@metreeca/clay-widgets/well";
import "./index.css";


const here = "/clay-widgets/layout";

const seasons: ReadonlyArray<readonly [string, string]> = [
	[ "Spring", "Days lengthen, and the first leaves open." ],
	[ "Summer", "The longest days, and the warmest." ],
	[ "Autumn", "Days shorten, and the leaves turn." ],
	[ "Winter", "The shortest days, and the coldest." ]
];


/**
 * Creates the layout section.
 *
 * Shows a screen assembled from surfaces, stacks and strips alone, with no layout rule written for it: a bar setting
 * its title apart from its actions, a sidebar keeping its settings at the bottom, and a wrapping row of tiles.
 *
 * @returns The layout section
 */
export function Layouts() {
	return <>

		<p>Surfaces, stacks and strips compose into a whole screen with no layout rule written for it. The screen sits
			in a well, and the bar is a panel holding a strip that sets the title apart from the
			actions (<code>place="head"</code>). Below it, a strip stretching its items sets a sidebar beside the
			content: the sidebar is a panel as tall as the content it stands beside, and the stack it holds fills it,
			keeping its settings at the bottom (<code>place="tail"</code>). The content is a wrapping strip of tiles,
			each a panel stretched to the tallest in its row, holding a stack that keeps its action at the bottom,
			pushed to the end by a strip of its own (<code>place="end"</code>).</p>

		<Well>
			<Stack space="spacing100">

				<Panel>
					<Strip place="head" align="center" space="spacing050">
						<strong>Seasons</strong>
						<Button icon={<Icon.Create/>} label="New"/>
						<Button look="strong" mode="commit" icon={<Icon.Save/>} label="Save"/>
					</Strip>
				</Panel>

				<Strip align="stretch" space="spacing150">

					<Panel>
						<Stack place="tail" space="spacing050">
							<Link look="subtle" href={here}>Overview</Link>
							<Link look="subtle" href={here}>Calendar</Link>
							<Link look="subtle" href={here}>Archive</Link>
							<Link look="subtle" href={here}>Settings</Link>
						</Stack>
					</Panel>

					<Strip grow wrap align="stretch" space="spacing100">{seasons.map(([ season, text ]) =>

						<Panel key={season}>
							<Stack place="tail" space="spacing050">
								<strong>{season}</strong>
								<span>{text}</span>
								<Strip place="end"><Button icon={<Icon.Update/>} label="Edit"/></Strip>
							</Stack>
						</Panel>
					)}</Strip>

				</Strip>

			</Stack>
		</Well>

	</>;
}

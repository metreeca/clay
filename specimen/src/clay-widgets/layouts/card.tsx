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
 * Summary card samples.
 *
 * @module
 */

import { Card } from "@metreeca/clay-widgets/card";
import { Icon } from "@metreeca/clay-widgets/icon";
import { Image } from "@metreeca/clay-widgets/image";
import { Frame, landscape } from "@metreeca/specimen/clay-widgets/sample.js";
import "../index.css";


type Options = Parameters<typeof Card>[0]


const looks: ReadonlyArray<NonNullable<Options["look"]>> = ["subtle", "normal", "strong"];


/**
 * Creates the summary card section.
 *
 * Shows runs of entries standing for their items by a captioned picture, by an icon or initials, and by nothing, and
 * the same entries again in a narrow box, where the side column is capped to a third of the card, and on a surface.
 *
 * @returns The summary card section
 */
export function Cards() {

	const survey = <Card
		title="Alpine survey"
		badge="Report · 2025"
		image={<Image src={landscape("#bcd7ea", "#3f6b4c", "#f2c14e")} caption="Photo © Field Survey Team"/>}
	>
		Snow cover and glacier retreat measured across the western range over five seasons, with the station data the
		figures are drawn from.
	</Card>;

	const minutes = <Card title="Board minutes" badge="Record · Restricted" image={<Icon.FileText/>}>
		Decisions of the March meeting on budget allocation and the renewal of the audit committee.
	</Card>;

	const plan = <Card title="Sustainability plan" badge="Plan · Draft">
		Targets and milestones for reducing emissions across the operations of the group, with no image beneath the side
		column, so the description runs on under the badge across the full width of the card.
	</Card>;

	const entries = <>

		{survey}

		<Card
			title="Coastal dunes"
			badge="Dataset · Open"
			image={<Image src={landscape("#f4dcc0", "#b07a3c", "#e8603c")} caption="Aerial survey, 2024"/>}
		>
			Dune profiles along the southern shore, sampled monthly.
		</Card>

		{minutes}

		<Card title="Maria Rossi" badge="Person" image={<>MR</>}>
			Lead researcher for the climate programme and contact point for data access requests.
		</Card>

		{plan}

	</>;

	return <>

		<p>A card sums up an item: its title over a description, beside its badge over an image standing for it at the
			end
			of the card. The image may be a picture, captioned with its credits, or an icon or initials set in the label
			colour; a description with no image beneath the side column runs on under the badge.</p>

		<div class="frames">
			<Frame label="pictures, icons, initials and no image">{entries}</Frame>
		</div>

		<p>The side column grows as wide as what it holds, up to a third of the card, so in a narrow box pictures are
			scaled
			down and long badges are clipped, while the main column keeps the rest.</p>

		<div class="columns">
			<Frame label="wide">{survey}{minutes}{plan}</Frame>
			<Frame label="narrow">{survey}{minutes}{plan}</Frame>
		</div>

		<p>Empty parts are left out: a card may carry a title alone, and a picture failing to load leaves the
			layout.</p>

		<div class="frames">
			<Frame label="partial cards">

				<Card title="Untitled draft"/>

				<Card title="Harbour lights" badge="Photo" image={<Image src="missing-picture.jpg"/>}>
					A picture that fails to load is dropped, leaving the description beside the badge.
				</Card>

			</Frame>
		</div>

		<p>Given a <code>look</code>, a card sets its parts on a padded, rounded surface of its own, as a stack does, so
			a run of results reads as a deck of tiles rather than as a list of entries.</p>

		<div class="frames">{looks.map(look =>

			<Frame key={look} label={<code>look="{look}"</code>}>

				<Card look={look} title="Board minutes" badge="Record · Restricted" image={<Icon.FileText/>}>
					Decisions of the March meeting on budget allocation and the renewal of the audit committee.
				</Card>

				<Card look={look} title="Maria Rossi" badge="Person" image={<>MR</>}>
					Lead researcher for the climate programme and contact point for data access requests.
				</Card>

			</Frame>
		)}</div>

	</>;
}

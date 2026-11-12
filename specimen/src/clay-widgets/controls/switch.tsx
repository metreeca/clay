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
 * Switch samples.
 *
 * @module
 */

import { Label } from "@metreeca/clay-widgets/label";
import { Switch } from "@metreeca/clay-widgets/switch";
import { useState } from "preact/hooks";
import "../index.css";


/**
 * Creates the switch section.
 *
 * Offers a switch whose state is held by the caller and takes effect at once, and switches stating options.
 *
 * @returns The switch section
 */
export function Switches() {

	const [notifications, setNotifications] = useState(true);

	return <>

		<p>A switch turns a setting on or off with immediate effect, rather than when a form is submitted. The thumb
			stands at the end of the track while on, so the state reads by position as well as by colour.</p>

		<div class="controls">
			<Label orientation="horizontal"><Switch checked={notifications} onChange={setNotifications}/><span>Notifications</span></Label>
			<output>{notifications ? "on" : "off"}</output>
			<Label orientation="horizontal"><Switch disabled/><span>Disabled</span></Label>
			<Label orientation="horizontal"><Switch disabled checked/><span>Disabled and On</span></Label>
		</div>

	</>;

}

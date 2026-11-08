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
 * Specimen frame.
 *
 * Lays every package page out as one long scrolling sheet inside the frame an app lays its own screens out in: a bar
 * carrying the packages and the page settings, an outline of the sections following the reader, and the sections
 * themselves, each opened by its heading group, so the frame is shown by being used rather than described.
 *
 * @module
 */

import { app, isContent } from "@metreeca/clay";
import { Button } from "@metreeca/clay-widgets/button";
import { Choice } from "@metreeca/clay-widgets/choice";
import { Icon } from "@metreeca/clay-widgets/icon";
import { Link } from "@metreeca/clay-widgets/link";
import { Logo } from "@metreeca/clay-widgets/logo";
import { Shell } from "@metreeca/clay-widgets/shell";
import { TOC, type TOCEntry } from "@metreeca/clay-widgets/toc";
import { useFetch } from "@metreeca/clay/fetch";
import { useStorage } from "@metreeca/clay/storage";
import { type ComponentChildren, createElement, Fragment } from "preact";
import { useEffect, useState } from "preact/hooks";


export const Root = "/";

export const ClayPath = "/clay/";
export const ClayWidgetsPath = "/clay-widgets/";
export const ClayMarkdownPath = "/clay-markdown/";


/**
 * A section of a package page: the id it is linked to by, the group of the outline it is listed under, what it is
 * called, the shorter name the outline lists it by if its title is too long for the rail, what it is about and the
 * samples it shows to the reader as live widgets rather than as pictures or descriptions of them.
 */
export interface Sample {

	readonly id: string
	readonly group: string
	readonly title: string
	readonly label?: string
	readonly lead?: ComponentChildren
	readonly view: ComponentChildren

}


const schemes = { auto: "System", light: "Light", dark: "Dark" };

type Scheme = keyof typeof schemes


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Creates a package page.
 *
 * Opens the page with what the package is, lists every section in the outline of the tray under the group it belongs
 * to, and sets the sections one after the other, each opened by its heading group.
 *
 * @param options The page configuration
 *
 * @returns The package page, inside the specimen frame
 */
export function Page({

	eyebrow,
	title,
	lead,
	samples

}: {

	eyebrow: string
	title: string
	lead: ComponentChildren
	samples: readonly Sample[]

}) {

	const fetch = useFetch();

	const [wide, setWide] = useState(false);
	const [lock, setLock] = useState(false);
	const [user, setUser] = useState<string>();

	const [scheme, setScheme] = useStorage<Scheme>(localStorage, "specimen-scheme", "auto");

	// the scheme is pinned on the root of the document, which no render of this page owns

	useEffect(() => apply(scheme), [scheme]);


	function edit() {

		setLock(true);

		setTimeout(() => setLock(false), 1000);

	}


	return <Shell

		wide={wide}
		lock={lock}

		logo={<Link look="subtle" href={Root}>
			<Logo/><span class="brand">@metreeca/<strong>clay</strong></span>
		</Link>}

		head={<nav class="packages" aria-label="Packages">
			<Link active look="subtle" href={`${ClayPath}*`}>Hooks</Link>
			<Link active look="subtle" href={`${ClayWidgetsPath}*`}>Widgets</Link>
			<Link active look="subtle" href={`${ClayMarkdownPath}*`}>Markdown</Link>
		</nav>}

		menu={<>

			<Button
				icon={wide ? <Icon.ChevronsRightLeft/> : <Icon.ChevronsLeftRight/>}
				look="subtle"
				name={wide ? "Cap the measure" : "Go widescreen"}
				title={wide ? "Cap the measure" : "Go widescreen"}
				onClick={() => setWide(!wide)}
			/>

			<Button
				icon={<Icon.Search/>}
				look="subtle"
				name="Run an exchange"
				title="Run an exchange"
				onClick={() => { void fetch(app.base); }}
			/>

			<Choice name="Colour scheme" options={schemes} value={scheme} onChange={setScheme}/>

		</>}

		tray={<TOC name="Sections" compact entries={outline(samples)}/>}

		info={user

			? <>
				<span>{user}</span>
				<Button icon={<Icon.LogOut/>} look="subtle" name="Sign out" title="Sign out"
					onClick={() => setUser(undefined)}
				/>
			</>

			: <>
				<Button icon={<Icon.LogIn/>} look="subtle" name="Sign in" title="Sign in"
					onClick={() => setUser("user@example.com")}
				/>
				<Button icon={lock ? <Icon.Unlock/> : <Icon.Lock/>} look="subtle" name="Lock the tray"
					title="Lock the tray" onClick={edit}
				/>
			</>
		}

		foot={<>
			<span>{app.copy}</span>
			<span>v{VERSION}</span>
		</>}

	>

		<Intro eyebrow={eyebrow} title={title} lead={lead}/>

		{samples.map(({ id, group, title, lead, view }) => <Fragment key={id}>
			<Intro id={id} level={2} eyebrow={group} title={title} lead={lead}/>
			{view}
		</Fragment>)}

	</Shell>;

}


/**
 * Opens a page or one of its samples with the heading group of the design system: the part of the page it belongs to,
 * the title ranked at `level`, and what it is about; the id given is the target its outline entry links to.
 */
function Intro({

	id,

	level = 1,

	eyebrow,
	title,
	lead

}: {

	id?: string

	level?: 1 | 2

	eyebrow: ComponentChildren
	title: ComponentChildren
	lead?: ComponentChildren

}) {

	return <hgroup id={id}>
		<p>{eyebrow}</p>
		{createElement(`h${level}`, {}, title)}
		{isContent(lead) && <p>{lead}</p>}
	</hgroup>;

}

/**
 * Groups the sections of a page into the outline listing them, in the order the page holds them.
 */
function outline(samples: readonly Sample[]): readonly TOCEntry[] {

	const groups = [...new Set(samples.map(({ group }) => group))];

	return groups.map(group => ({
		label: group,
		entries: samples
			.filter(sample => sample.group === group)
			.map(({ id, title, label = title }) => ({ label, href: `#${id}` }))
	}));

}

/**
 * Pins the colour scheme chosen on the root of the page, or leaves it to the platform.
 */
function apply(scheme: Scheme): void {

	if ( scheme === "auto" ) {
		document.documentElement.removeAttribute("data-scheme");
	} else {
		document.documentElement.setAttribute("data-scheme", scheme);
	}

}

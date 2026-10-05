import type { IDataObject } from 'n8n-workflow';

/** Domains never contain commas or spaces, so any of these separate them */
export const DOMAIN_SEPARATOR = /[\s,]+/;

/** Path and domain patterns are regular expressions, which can contain commas, so only new lines separate them */
export const PATTERN_SEPARATOR = /\r?\n+/;

/**
 * Turns a list field's value into a flat list of non-empty strings. Handles list entries that
 * hold several values (for example "openai.com, reuters.com" from an expression or the model),
 * arrays from expressions, and empty entries, which Tavily rejects.
 */
export function cleanList(value: unknown, separator: RegExp): string[] {
	const values = Array.isArray(value) ? value.flat(Infinity) : [value];
	return values
		.filter((entry): entry is string => typeof entry === 'string')
		.flatMap((entry) => entry.split(separator))
		.map((entry) => entry.trim())
		.filter((entry) => entry.length > 0);
}

/** Cleans the given list fields in a request body, and removes the ones that end up empty */
export function cleanListFields(body: IDataObject, keys: string[], separator: RegExp): void {
	for (const key of keys) {
		if (!(key in body)) continue;
		const list = cleanList(body[key], separator);
		if (list.length === 0) {
			delete body[key];
		} else {
			body[key] = list;
		}
	}
}

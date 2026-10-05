import type {
	IDataObject,
	IDisplayOptions,
	IExecuteFunctions,
	INodeProperties,
} from 'n8n-workflow';
import { tavilyApiRequest } from '../../transport';
import { queryOptions } from "../../descriptions";

const TOPICS = ['general', 'news', 'finance'];
const TIME_RANGES = ['day', 'week', 'month', 'year'];
const TOOL_DEFAULT_MAX_RESULTS = 5;

// Version 2 adds agent-friendly defaults to the Tavily Tool (the node attached to an AI Agent).
// Version 1 workflows and the regular Tavily node behave exactly as before.
const TOOL_V2 = { '@tool': [true], '@version': [{ _cnd: { gte: 2 } }] };

const operationDisplay = (extra: IDataObject = {}): IDisplayOptions => ({
	show: {
		resource: ['search'],
		operation: ['query'],
		...extra,
	} as IDisplayOptions['show'],
});

// Same format the editor writes when you click "Let the model define this parameter",
// so these fields show up as model-defined and stay editable.
const fromAI = (key: string, description: string) =>
	`={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('${key}', \`${description}\`, 'string') }}`;

const queryField: INodeProperties = {
	displayName: 'Query',
	name: 'query',
	description: 'Type your query',
	type: 'string',
	required: true,
	default: '',
	placeholder: 'e.g. who is leo messi?',
};

export const properties: INodeProperties[] = [
	{
		...queryField,
		displayOptions: operationDisplay({ '@version': [1] }),
	},
	{
		...queryField,
		displayOptions: operationDisplay({ '@version': [{ _cnd: { gte: 2 } }], '@tool': [false] }),
	},
	{
		...queryField,
		default: fromAI(
			'query',
			'The web search query. Write a specific, self-contained query that names the people, products, places or versions involved. Do not add years or dates you are not sure of; use time_range to ask for recent results instead.',
		),
		displayOptions: operationDisplay(TOOL_V2),
	},
	{
		displayName: 'Topic',
		name: 'topic',
		type: 'options',
		options: [
			{ name: 'Finance', value: 'finance' },
			{ name: 'General', value: 'general' },
			{ name: 'News', value: 'news' },
		],
		default: fromAI(
			'topic',
			'Search category. One of: general (most searches), news (current events, announcements and releases), finance (markets and companies). Use general if unsure.',
		),
		description: 'The category of the search. Defined by the model by default.',
		displayOptions: operationDisplay(TOOL_V2),
	},
	{
		displayName: 'Time Range',
		name: 'timeRange',
		type: 'options',
		options: [
			{ name: 'Any Time', value: '' },
			{ name: 'Day', value: 'day' },
			{ name: 'Month', value: 'month' },
			{ name: 'Week', value: 'week' },
			{ name: 'Year', value: 'year' },
		],
		default: fromAI(
			'time_range',
			'Only return results published within this period. One of: day, week, month, year. Use an empty string for no date restriction.',
		),
		description:
			'Only return results published within this period back from today. Defined by the model by default.',
		displayOptions: operationDisplay(TOOL_V2),
	},
	{
		displayName: 'Simplify',
		name: 'simple',
		type: 'boolean',
		default: true,
		description: 'Whether to return a simplified version of the response instead of the raw data',
		displayOptions: operationDisplay(TOOL_V2),
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add option',
		default: {},
		options: queryOptions,
		displayOptions: operationDisplay(),
	},
];

export const description = properties;

export async function execute(this: IExecuteFunctions, index: number) {
	const query = this.getNodeParameter('query', index) as string;
	const options = this.getNodeParameter('options', index) as IDataObject;

	const body: IDataObject = {
		'query': query,
		...options,
	};

	const node = this.getNode();
	const isToolV2 = node.typeVersion >= 2 && node.type.endsWith('Tool');

	if (isToolV2) {
		// Ignore values the model gets wrong instead of failing the call
		const topic = normalize(this.getNodeParameter('topic', index, ''));
		if (TOPICS.includes(topic)) {
			body.topic = topic;
		}

		const timeRange = normalize(this.getNodeParameter('timeRange', index, ''));
		if (TIME_RANGES.includes(timeRange)) {
			body.time_range = timeRange;
		}

		// Every result goes into the agent's context on each step, so use the default the
		// Max Results option shows (5) unless the user picked a value
		if (options.max_results === undefined) {
			body.max_results = TOOL_DEFAULT_MAX_RESULTS;
		}
	}

	const endpoint = "/search";

	const responseData = (await tavilyApiRequest.call(this, 'POST', endpoint, body)) as IDataObject;

	const simplify = isToolV2 && (this.getNodeParameter('simple', index, true) as boolean);

	return this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(simplify ? simplifySearchResponse(responseData) : responseData),
		{itemData: {item: index}},
	);
}

function normalize(value: unknown): string {
	return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

const RESULT_FIELDS = ['title', 'url', 'content', 'score', 'published_date', 'raw_content', 'favicon'];
const RESPONSE_FIELDS = ['query', 'answer', 'follow_up_questions', 'images', 'usage'];

/** Keep only fields useful to an AI agent, and drop empty values. */
export function simplifySearchResponse(response: IDataObject): IDataObject {
	const results = ((response.results as IDataObject[] | undefined) ?? []).map((result) =>
		pickNonEmpty(result, RESULT_FIELDS),
	);

	return { ...pickNonEmpty(response, RESPONSE_FIELDS), results };
}

function pickNonEmpty(source: IDataObject, keys: string[]): IDataObject {
	const picked: IDataObject = {};
	for (const key of keys) {
		const value = source[key];
		if (value === null || value === undefined || value === '') continue;
		if (Array.isArray(value) && value.length === 0) continue;
		picked[key] = value;
	}
	return picked;
}

import type {
	IDataObject,
	IDisplayOptions,
	IExecuteFunctions,
	INodeProperties,
} from 'n8n-workflow';
import { tavilyApiRequest } from '../../transport';
import { cleanList, cleanListFields, DOMAIN_SEPARATOR } from '../lists';
import { queryOptions } from "../../descriptions";
import { fromAI, getChoice, isToolV2, modelChoiceField, TOOL_V2 } from '../tool';

const TOPICS = ['general', 'news', 'finance'];
const TIME_RANGES = ['day', 'week', 'month', 'year'];
const SEARCH_DEPTHS = ['basic', 'advanced', 'fast', 'ultra-fast'];
const ANSWER_LEVELS = ['none', 'basic', 'advanced'];
const TOOL_DEFAULT_MAX_RESULTS = 5;
const DOMAIN_LIST_FIELDS = ['include_domains', 'exclude_domains'];

const OPERATION_SHOW = { resource: ['search'], operation: ['query'] };

const operationDisplay = (extra: IDataObject = {}): IDisplayOptions => ({
	show: { ...OPERATION_SHOW, ...extra } as IDisplayOptions['show'],
});

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
			'The web search query. Write a specific, self-contained query that names the people, products, places or versions involved. Do not add years or dates you are not sure of; use time_range to ask for recent results instead. To limit results to specific websites, use include_domains rather than site: in the query.',
		),
		displayOptions: operationDisplay(TOOL_V2),
	},
	...modelChoiceField({
		displayName: 'Topic',
		name: 'topic',
		key: 'topic',
		modelDescription:
			'Search category. One of: general (most searches), news (current events, announcements and releases), finance (markets and companies). Use general if unsure.',
		description: 'The category of the search',
		choices: [
			{ name: 'Finance', value: 'finance' },
			{ name: 'General', value: 'general' },
			{ name: 'News', value: 'news' },
		],
		show: { ...OPERATION_SHOW, ...TOOL_V2 },
	}),
	...modelChoiceField({
		displayName: 'Time Range',
		name: 'timeRange',
		key: 'time_range',
		modelDescription:
			'Only return results published within this period. One of: day, week, month, year. Use an empty string for no date restriction.',
		description: 'Only return results published within this period back from today',
		choices: [
			{ name: 'Any Time', value: 'any' },
			{ name: 'Day', value: 'day' },
			{ name: 'Month', value: 'month' },
			{ name: 'Week', value: 'week' },
			{ name: 'Year', value: 'year' },
		],
		show: { ...OPERATION_SHOW, ...TOOL_V2 },
	}),
	...modelChoiceField({
		displayName: 'Search Depth',
		name: 'searchDepth',
		key: 'search_depth',
		modelDescription:
			'How thorough the search is. One of: basic (good default), fast (quicker), ultra-fast (quickest, least thorough), advanced (most relevant results, costs twice as many credits; use only when basic results are not good enough).',
		description: 'The depth of the search. Advanced costs 2 credits per search instead of 1.',
		choices: [
			{ name: 'Advanced', value: 'advanced' },
			{ name: 'Basic', value: 'basic' },
			{ name: 'Fast', value: 'fast' },
			{ name: 'Ultra-Fast', value: 'ultra-fast' },
		],
		show: { ...OPERATION_SHOW, ...TOOL_V2 },
	}),
	...modelChoiceField({
		displayName: 'Include Answer',
		name: 'includeAnswer',
		key: 'include_answer',
		modelDescription:
			'Whether Tavily should also return a short answer written from the results. One of: none, basic (quick answer), advanced (more detailed answer). Use none if you will read the results yourself.',
		description: 'Include an LLM-generated answer to the query in the response',
		choices: [
			{ name: 'Advanced', value: 'advanced' },
			{ name: 'Basic', value: 'basic' },
			{ name: 'None', value: 'none' },
		],
		show: { ...OPERATION_SHOW, ...TOOL_V2 },
	}),
	{
		displayName: 'Include Domains',
		name: 'includeDomains',
		type: 'string',
		default: fromAI(
			'include_domains',
			'Only return results from these websites, separated by commas, for example openai.com, reuters.com. Use an empty string to search the whole web.',
		),
		description:
			'Only return results from these domains, separated by commas. Defined by the model by default. Added to any domains set under Options.',
		placeholder: 'e.g. openai.com, reuters.com',
		displayOptions: operationDisplay(TOOL_V2),
	},
	{
		displayName: 'Exclude Domains',
		name: 'excludeDomains',
		type: 'string',
		default: fromAI(
			'exclude_domains',
			'Never return results from these websites, separated by commas, for example pinterest.com. Use an empty string to exclude nothing.',
		),
		description:
			'Never return results from these domains, separated by commas. Defined by the model by default. Added to any domains set under Options.',
		placeholder: 'e.g. pinterest.com',
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

	const isTool = isToolV2.call(this);

	if (isTool) {
		const topic = getChoice.call(this, 'topic', index, TOPICS);
		if (topic) {
			body.topic = topic;
		}

		const timeRange = getChoice.call(this, 'timeRange', index, TIME_RANGES);
		if (timeRange) {
			body.time_range = timeRange;
		}

		const searchDepth = getChoice.call(this, 'searchDepth', index, SEARCH_DEPTHS);
		if (searchDepth) {
			body.search_depth = searchDepth;
		}

		const includeAnswer = getChoice.call(this, 'includeAnswer', index, ANSWER_LEVELS);
		if (includeAnswer === 'none') {
			delete body.include_answer;
		} else if (includeAnswer) {
			body.include_answer = includeAnswer;
		}

		for (const [field, key] of [
			['includeDomains', 'include_domains'],
			['excludeDomains', 'exclude_domains'],
		]) {
			const fromTool = this.getNodeParameter(field, index, '');
			body[key] = [...cleanList(body[key], DOMAIN_SEPARATOR), ...cleanList(fromTool, DOMAIN_SEPARATOR)];
		}

		// Every result goes into the agent's context on each step, so use the default the
		// Max Results option shows (5) unless the user picked a value
		if (options.max_results === undefined) {
			body.max_results = TOOL_DEFAULT_MAX_RESULTS;
		}
	}

	cleanListFields(body, DOMAIN_LIST_FIELDS, DOMAIN_SEPARATOR);

	const endpoint = "/search";

	const responseData = (await tavilyApiRequest.call(this, 'POST', endpoint, body)) as IDataObject;

	const simplify = isTool && (this.getNodeParameter('simple', index, true) as boolean);

	return this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(simplify ? simplifySearchResponse(responseData) : responseData),
		{itemData: {item: index}},
	);
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

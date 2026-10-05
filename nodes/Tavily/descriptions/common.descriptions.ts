import type { INodeProperties } from 'n8n-workflow';

// Options are listed alphabetically, as n8n's UX guidelines require. Options that only apply
// with another option are hidden until they apply.

const includeFavicon: INodeProperties = {
	displayName: 'Include Favicon',
	name: 'include_favicon',
	type: 'boolean',
	default: false,
	description: 'Whether to include the favicon URL for each result',
};

const includeUsage: INodeProperties = {
	displayName: 'Include Usage',
	name: 'include_usage',
	type: 'boolean',
	default: false,
	description: 'Whether to include credit usage information in the response',
};

export const extractOptions: INodeProperties[] = [
	{
		displayName: 'Chunks Per Source',
		name: 'chunks_per_source',
		type: 'number',
		default: 3,
		description:
			"The number of content chunks to retrieve from each source. Each chunk's length is maximum 500 characters.",
		typeOptions: {
			minValue: 1,
			maxValue: 5,
		},
		displayOptions: {
			show: {
				query: [{ _cnd: { exists: true } }],
			},
		},
	},
	{
		displayName: 'Extract Depth',
		name: 'extract_depth',
		type: 'options',
		default: 'basic',
		options: [
			{
				name: 'Basic',
				value: 'basic',
			},
			{
				name: 'Advanced',
				value: 'advanced',
			},
		],
		description:
			'The depth of the extraction process. advanced extraction retrieves more data, including tables and embedded content, with higher success but may increase latency.',
	},
	{
		displayName: 'Format',
		name: 'format',
		type: 'options',
		default: 'markdown',
		options: [
			{ name: 'Markdown', value: 'markdown' },
			{ name: 'Text', value: 'text' },
		],
		description:
			'The format of the extracted web page content. markdown returns content in markdown format. text returns plain text and may increase latency.',
	},
	includeFavicon,
	{
		displayName: 'Include Images',
		name: 'include_images',
		type: 'boolean',
		default: false,
		description: 'Whether to include a list of images extracted from the URLs',
	},
	includeUsage,
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		default: '',
		description:
			'A natural language query describing the information you want to extract from the provided URLs. Enables Chunks Per Source.',
	},
];

export const queryOptions: INodeProperties[] = [
	{
		displayName: 'Auto Parameters',
		name: 'auto_parameters',
		type: 'boolean',
		default: false,
		description:
			"Whether Tavily automatically configures search parameters based on your query's content and intent. Options you set explicitly still apply.",
	},
	{
		displayName: 'Chunks Per Source',
		name: 'chunks_per_source',
		type: 'number',
		default: 3,
		description:
			"The number of content chunks to retrieve from each source. Each chunk's length is maximum 500 characters.",
		typeOptions: {
			minValue: 1,
			maxValue: 3,
		},
		displayOptions: {
			hide: {
				search_depth: ['ultra-fast'],
			},
		},
	},
	{
		displayName: 'Country',
		name: 'country',
		type: 'string',
		default: '',
		description:
			'Boost search results from a specific country. Available only when the topic is general. Full list of options: https://docs.tavily.com/documentation/api-reference/endpoint/search#body-country.',
		displayOptions: {
			hide: {
				topic: ['news', 'finance'],
			},
		},
	},
	{
		displayName: 'End Date',
		name: 'end_date',
		type: 'string',
		default: '',
		description:
			'Will return all results before the specified end date (publish date). Required to be written in the format YYYY-MM-DD.',
		placeholder: '2025-02-09',
	},
	{
		displayName: 'Exact Match',
		name: 'exact_match',
		type: 'boolean',
		default: false,
		description: 'Whether to only return results containing the exact phrase(s) in quotes in your query',
	},
	{
		displayName: 'Exclude Domains',
		name: 'exclude_domains',
		type: 'string',
		typeOptions: {
			multipleValues: true,
		},
		default: [],
		description: 'A list of domains to exclude from the search results',
		placeholder: 'example.com',
	},
	{
		displayName: 'Include Answer',
		name: 'include_answer',
		type: 'options',
		default: 'basic',
		description: 'Include an LLM-generated answer to the provided query',
		options: [
			{
				name: 'Basic',
				value: 'basic',
				description: 'Returns a quick answer',
			},
			{
				name: 'Advanced',
				value: 'advanced',
				description: 'Returns a more detailed answer',
			},
		],
	},
	{
		displayName: 'Include Domains',
		name: 'include_domains',
		type: 'string',
		typeOptions: {
			multipleValues: true,
		},
		default: [],
		description: 'A list of domains to specifically include in the search results',
		placeholder: 'example.com',
	},
	includeFavicon,
	{
		displayName: 'Include Image Descriptions',
		name: 'include_image_descriptions',
		type: 'boolean',
		default: false,
		description: 'Whether to add a descriptive text for each image',
		displayOptions: {
			show: {
				include_images: [true],
			},
		},
	},
	{
		displayName: 'Include Images',
		name: 'include_images',
		type: 'boolean',
		default: false,
		description: 'Whether to perform an image search and include the results in the response',
	},
	{
		displayName: 'Include Raw Content',
		name: 'include_raw_content',
		type: 'boolean',
		default: false,
		description: 'Whether to include the cleaned and parsed HTML content of each search result',
	},
	includeUsage,
	{
		displayName: 'Max Results',
		name: 'max_results',
		type: 'number',
		default: 5,
		description: 'The maximum number of search results to return',
		typeOptions: {
			minValue: 1,
			maxValue: 20,
		},
	},
	{
		displayName: 'Search Depth',
		name: 'search_depth',
		type: 'options',
		default: 'basic',
		options: [
			{
				name: 'Basic',
				value: 'basic',
			},
			{
				name: 'Advanced',
				value: 'advanced',
			},
			{
				name: 'Fast',
				value: 'fast',
			},
			{
				name: 'Ultra-Fast',
				value: 'ultra-fast',
			},
		],
		description:
			'The depth of the search. basic provides generic content snippets. advanced is tailored to retrieve the most relevant sources. fast is optimized for low latency with high relevance. ultra-fast prioritizes latency above all else.',
	},
	{
		displayName: 'Start Date',
		name: 'start_date',
		type: 'string',
		default: '',
		description:
			'Will return all results after the specified start date (publish date). Required to be written in the format YYYY-MM-DD.',
		placeholder: '2025-02-09',
	},
	{
		displayName: 'Time Range',
		name: 'time_range',
		type: 'options',
		default: 'day',
		options: [
			{
				name: 'Day',
				value: 'day',
			},
			{
				name: 'Week',
				value: 'week',
			},
			{
				name: 'Month',
				value: 'month',
			},
			{
				name: 'Year',
				value: 'year',
			},
		],
		description:
			'The time range back from the current date to filter results. Useful when looking for sources that have published data.',
	},
	{
		displayName: 'Topic',
		name: 'topic',
		type: 'options',
		default: 'general',
		description: 'The category of the search',
		options: [
			{
				name: 'General',
				value: 'general',
			},
			{
				name: 'News',
				value: 'news',
			},
			{
				name: 'Finance',
				value: 'finance',
			},
		],
	},
];

const crawlAndMapFilters: INodeProperties[] = [
	{
		displayName: 'Exclude Domains',
		name: 'exclude_domains',
		type: 'string',
		typeOptions: { multipleValues: true },
		default: [],
		description: 'Regex patterns to exclude specific domains or subdomains from crawling',
	},
	{
		displayName: 'Exclude Paths',
		name: 'exclude_paths',
		type: 'string',
		typeOptions: { multipleValues: true },
		default: [],
		description: 'Regex patterns to exclude URLs with specific path patterns (e.g., "/private/.*")',
	},
];

export const crawlOptions: INodeProperties[] = [
	{
		displayName: 'Allow External',
		name: 'allow_external',
		type: 'boolean',
		default: false,
		description: 'Whether to allow following links that go to external domains',
	},
	{
		displayName: 'Chunks Per Source',
		name: 'chunks_per_source',
		type: 'number',
		default: 3,
		description:
			"The number of content chunks to retrieve from each source. Each chunk's length is maximum 500 characters.",
		typeOptions: {
			minValue: 1,
			maxValue: 5,
		},
		displayOptions: {
			show: {
				instructions: [{ _cnd: { exists: true } }],
			},
		},
	},
	...crawlAndMapFilters,
	{
		displayName: 'Extract Depth',
		name: 'extract_depth',
		type: 'options',
		default: 'basic',
		options: [
			{ name: 'Basic', value: 'basic' },
			{ name: 'Advanced', value: 'advanced' },
		],
		description:
			'The depth of the extraction process. advanced extraction retrieves more data, including tables and embedded content, but may increase latency.',
	},
	{
		displayName: 'Format',
		name: 'format',
		type: 'options',
		default: 'markdown',
		options: [
			{ name: 'Markdown', value: 'markdown' },
			{ name: 'Text', value: 'text' },
		],
		description: 'The format of the extracted web page content',
	},
	includeFavicon,
	{
		displayName: 'Include Images',
		name: 'include_images',
		type: 'boolean',
		default: false,
		description: 'Whether to include images in the crawl results',
	},
	includeUsage,
	{
		displayName: 'Instructions',
		name: 'instructions',
		type: 'string',
		default: '',
		description: 'Natural language instructions for the crawler. Enables Chunks Per Source.',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		description: 'Max number of results to return',
		typeOptions: { minValue: 1 },
	},
	{
		displayName: 'Max Breadth',
		name: 'max_breadth',
		type: 'number',
		default: 20,
		description: 'Max number of links to follow per level',
		typeOptions: { minValue: 1 },
	},
	{
		displayName: 'Max Depth',
		name: 'max_depth',
		type: 'number',
		default: 1,
		description: 'Max depth of the crawl',
		typeOptions: { minValue: 1 },
	},
	{
		displayName: 'Select Domains',
		name: 'select_domains',
		type: 'string',
		typeOptions: { multipleValues: true },
		default: [],
		description: 'Regex patterns to select crawling to specific domains or subdomains',
	},
	{
		displayName: 'Select Paths',
		name: 'select_paths',
		type: 'string',
		typeOptions: { multipleValues: true },
		default: [],
		description: 'Regex patterns to select only URLs with specific path patterns (e.g., "/docs/.*")',
	},
];

export const researchOptions: INodeProperties[] = [
	{
		displayName: 'Citation Format',
		name: 'citation_format',
		type: 'options',
		default: 'numbered',
		options: [
			{
				name: 'APA',
				value: 'apa',
			},
			{
				name: 'Chicago',
				value: 'chicago',
			},
			{
				name: 'MLA',
				value: 'mla',
			},
			{
				name: 'Numbered',
				value: 'numbered',
			},
		],
		description: 'The format for citations in the research report',
	},
	{
		displayName: 'Model',
		name: 'model',
		type: 'options',
		default: 'auto',
		options: [
			{
				name: 'Auto',
				value: 'auto',
				description: 'Automatically selects the best model for the task',
			},
			{
				name: 'Mini',
				value: 'mini',
				description:
					'Optimized for targeted, efficient research. Works best for narrow or well-scoped questions.',
			},
			{
				name: 'Pro',
				value: 'pro',
				description:
					'Provides comprehensive, multi-angle research. Suited for complex topics that span multiple subtopics or domains.',
			},
		],
		description: 'The model used by the research agent',
	},
	{
		displayName: 'Output Schema',
		name: 'output_schema',
		type: 'json',
		default: '',
		description:
			'A JSON Schema object that defines the structure of the research output. When provided, the research response will be structured to match this schema.',
		placeholder:
			'{"properties": {"company": {"type": "string", "description": "Company name"}}, "required": ["company"]}',
	},
	{
		displayName: 'Stream',
		name: 'stream',
		type: 'boolean',
		default: false,
		description:
			'Whether to stream the research results as they are generated. When enabled, returns Server-Sent Events (SSE) with real-time progress updates, tool calls, and incremental results.',
	},
];

export const mapOptions: INodeProperties[] = [
	{
		displayName: 'Allow External',
		name: 'allow_external',
		type: 'boolean',
		default: true,
		description: 'Whether to include external domain links in the final results list',
	},
	...crawlAndMapFilters,
	{
		displayName: 'Instructions',
		name: 'instructions',
		type: 'string',
		default: '',
		description: 'Natural language instructions guiding the mapping process',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		description: 'Max number of results to return',
		typeOptions: { minValue: 1 },
	},
	{
		displayName: 'Max Breadth',
		name: 'max_breadth',
		type: 'number',
		default: 20,
		description: 'Maximum number of links to follow per level of the tree (i.e., per page)',
		typeOptions: { minValue: 1 },
	},
	{
		displayName: 'Max Depth',
		name: 'max_depth',
		type: 'number',
		default: 1,
		description: 'Defines how far from the base URL the crawler can explore',
		typeOptions: { minValue: 1 },
	},
	{
		displayName: 'Select Domains',
		name: 'select_domains',
		type: 'string',
		typeOptions: { multipleValues: true },
		default: [],
		description: 'Regex patterns to select crawling to specific domains or subdomains',
	},
	{
		displayName: 'Select Paths',
		name: 'select_paths',
		type: 'string',
		typeOptions: { multipleValues: true },
		default: [],
		description: 'Regex patterns to select only URLs with specific path patterns (e.g., "/docs/.*")',
	},
	{
		displayName: 'Timeout',
		name: 'timeout',
		type: 'number',
		default: 150,
		description: 'Maximum time in seconds to wait for the map operation before timing out (10-150)',
		typeOptions: {
			minValue: 10,
			maxValue: 150,
		},
	},
];

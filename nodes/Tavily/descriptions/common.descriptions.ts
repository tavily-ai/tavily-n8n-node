import {INodeProperties} from "n8n-workflow";
export const extractOptions: INodeProperties[] = [
	{
		displayName: 'Include Images',
		name: 'include_images',
		type: 'boolean',
		default: false,
		description: 'Whether to include a list of images extracted from the URLs. Default is false.',
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
			}
		],
		description: 'The depth of the extraction process. advanced extraction retrieves more data, including tables and embedded content, with higher success but may increase latency.',
	},
	{
		displayName: 'Format',
		name: 'format',
		type: 'options',
		default: 'markdown',
		options: [
			{ name: 'Markdown', value: 'markdown' },
			{ name: 'Text', value: 'text' }
		],
		description: 'The format of the extracted web page content. markdown returns content in markdown format. text returns plain text and may increase latency.'
	},
	{
		displayName: 'Include Favicon',
		name: 'include_favicon',
		type: 'boolean',
		default: false,
		description: 'Whether to include the favicon URL for each result'
	},
	{
		displayName: 'Query',
		name: 'query',
		type: 'string',
		default: '',
		description: 'When supplied, triggers intent-based extraction, returning content most relevant to the query.',
	},
	{
		displayName: 'Chunks Per Source',
		name: 'chunks_per_source',
		type: 'number',
		default: 3,
		description: 'The number of top chunks to return per source for a given query. Only used when query is provided.',
		typeOptions: {
			minValue: 1,
		},
	},
];

export const queryOptions: INodeProperties[] = [
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
			}
		],
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
			}
		],
		description: 'The depth of the search. advanced search is tailored to retrieve the most relevant sources and content snippets for your query, while basic search provides generic content snippets from each source.',
	},
	{
		displayName: 'Chunks Per Source',
		name: 'chunks_per_source',
		type: 'number',
		default: 3,
		description: 'The number of content chunks to retrieve from each source. Each chunk\'s length is maximum 500 characters. Available only when search_depth is advanced.',
		typeOptions: {
			minValue: 1,
			maxValue: 3,
		},
	},
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
			}
		],
		description: 'The time range back from the current date to filter results. Useful when looking for sources that have published data.',
	},
	{
		displayName: 'Days',
		name: 'days',
		type: 'number',
		default: 3,
		description: 'Number of days back from the current date to include. Available only if topic is news.',
		typeOptions: {
			minValue: 1,
			maxValue: 365,
		},
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
			}
		],
	},
	{
		displayName: 'Include Raw Content',
		name: 'include_raw_content',
		type: 'boolean',
		default: false,
		description: 'Whether to include the cleaned and parsed HTML content of each search result',
	},
	{
		displayName: 'Include Images',
		name: 'include_images',
		type: 'boolean',
		default: false,
		description: 'Whether to perform an image search and include the results in the response',
	},
	{
		displayName: 'Include Image Descriptions',
		name: 'include_image_descriptions',
		type: 'boolean',
		default: false,
		description: 'Whether to add a descriptive text for each image when include_images is true',
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
		displayName: 'Include Favicon',
		name: 'include_favicon',
		type: 'boolean',
		default: false,
		description: 'Whether to include the favicon URL for each result'
	},
	{
		displayName: 'Auto Parameters',
		name: 'auto_parameters',
		type: 'boolean',
		default: false,
		description: 'Whether auto_parameters is enabled, Tavily automatically configures search parameters based on your query\'s content and intent',
	},
	{
		displayName: 'Start Date',
		name: 'start_date',
		type: 'string',
		default: '',
		description: 'Will return all results after the specified start date (publish date). Required to be written in the format YYYY-MM-DD.',
		placeholder: '2025-02-09'
	},
	{
		displayName: 'End Date',
		name: 'end_date',
		type: 'string',
		default: '',
		description: 'Will return all results before the specified end date (publish date). Required to be written in the format YYYY-MM-DD.',
		placeholder: '2000-01-28'
	},
	{
		displayName: 'Country',
		name: 'country',
		type: 'string',
		default: '',
		description: 'Boost search results from a specific country. This will prioritize content from the selected country in the search results. Available only if topic is general. Full available options: https://docs.tavily.com/documentation/api-reference/endpoint/search#body-country'
	},
];

export const queryFields = [
	{
		name: 'Child Folder Count',
		value: 'childFolderCount',
	},
	{
		name: 'Display Name',
		value: 'displayName',
	},
	{
		name: 'Is Hidden',
		value: 'isHidden',
	},
	{
		name: 'Parent Folder ID',
		value: 'parentFolderId',
	},
	{
		name: 'Total Item Count',
		value: 'totalItemCount',
	},
	{
		name: 'Unread Item Count',
		value: 'unreadItemCount',
	},
];

export const crawlOptions: INodeProperties[] = [
	{
		displayName: 'Instructions',
		name: 'instructions',
		type: 'string',
		default: '',
		description: 'Natural language instructions for the crawler'
	},
	{
		displayName: 'Max Depth',
		name: 'max_depth',
		type: 'number',
		default: 1,
		description: 'Max depth of the crawl',
		typeOptions: { minValue: 1 }
	},
	{
		displayName: 'Max Breadth',
		name: 'max_breadth',
		type: 'number',
		default: 20,
		description: 'Max number of links to follow per level',
		typeOptions: { minValue: 1 }
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		description: 'Max number of results to return',
		typeOptions: { minValue: 1 }
	},
	{
		displayName: 'Select Paths',
		name: 'select_paths',
		type: 'string',
		typeOptions: { multipleValues: true },
		default: [],
		description: 'Regex patterns to select only URLs with specific path patterns'
	},
	{
		displayName: 'Select Domains',
		name: 'select_domains',
		type: 'string',
		typeOptions: { multipleValues: true },
		default: [],
		description: 'Regex patterns to select crawling to specific domains or subdomains'
	},
	{
		displayName: 'Exclude Paths',
		name: 'exclude_paths',
		type: 'string',
		typeOptions: { multipleValues: true },
		default: [],
		description: 'Regex patterns to exclude URLs with specific path patterns'
	},
	{
		displayName: 'Exclude Domains',
		name: 'exclude_domains',
		type: 'string',
		typeOptions: { multipleValues: true },
		default: [],
		description: 'Regex patterns to exclude specific domains or subdomains from crawling'
	},
	{
		displayName: 'Allow External',
		name: 'allow_external',
		type: 'boolean',
		default: false,
		description: 'Whether to allow following links that go to external domains'
	},
	{
		displayName: 'Include Images',
		name: 'include_images',
		type: 'boolean',
		default: false,
		description: 'Whether to include images in the crawl results'
	},
	{
		displayName: 'Extract Depth',
		name: 'extract_depth',
		type: 'options',
		default: 'basic',
		options: [
			{ name: 'Basic', value: 'basic' },
			{ name: 'Advanced', value: 'advanced' }
		],
		description: 'Extraction depth'
	},
	{
		displayName: 'Format',
		name: 'format',
		type: 'options',
		default: 'markdown',
		options: [
			{ name: 'Markdown', value: 'markdown' },
			{ name: 'Text', value: 'text' }
		],
		description: 'Format of the extracted web page content'
	},
	{
		displayName: 'Include Favicon',
		name: 'include_favicon',
		type: 'boolean',
		default: false,
		description: 'Whether to include the favicon URL for each result'
	},
];

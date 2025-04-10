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

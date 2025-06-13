import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { tavilyApiRequest } from '../../transport';

export const properties: INodeProperties[] = [
  {
    displayName: 'URL',
    name: 'url',
    type: 'string',
    required: true,
    default: '',
    description: 'The root URL to begin the crawl',
		placeholder: 'https://www.example.com'
  },
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
		displayName: 'Categories',
		name: 'categories',
		type: 'multiOptions',
		default: [],
		options: [
			{ name: 'About', value: 'About' },
			{ name: 'Blog', value: 'Blog' },
			{ name: 'Careers', value: 'Careers' },
			{ name: 'Community', value: 'Community' },
			{ name: 'Contact', value: 'Contact' },
			{ name: 'Developers', value: 'Developers' },
			{ name: 'Documentation', value: 'Documentation' },
			{ name: 'Media', value: 'Media' },
			{ name: 'Pricing', value: 'Pricing' },
		],
		description: 'Filter URLs using predefined categories',
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
  }
];

export async function execute(this: IExecuteFunctions, index: number) {
  const body: IDataObject = {};
  for (const prop of properties) {
    const value = this.getNodeParameter(prop.name, index);
    if (value !== undefined && value !== '') {
      body[prop.name] = value;
    }
  }
  const responseData = await tavilyApiRequest.call(this, 'POST', '/crawl', body);
  return this.helpers.returnJsonArray([responseData]);
}

export const description = properties;

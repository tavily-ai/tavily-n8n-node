import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { tavilyApiRequest } from '../../transport';
import { cleanListFields, PATTERN_SEPARATOR } from '../lists';
import { updateDisplayOptions } from '../../display';
import { crawlOptions } from '../../descriptions/common.descriptions';

export const properties: INodeProperties[] = [
  {
    displayName: 'URL',
    name: 'url',
    description: 'The root URL to begin the crawl',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'https://www.example.com',
    displayOptions: {
      show: {
        resource: ['crawl'],
      },
    },
  },
  {
    displayName: 'Options',
    name: 'options',
    type: 'collection',
    placeholder: 'Add option',
    default: {},
    options: crawlOptions
	},
];

const displayOptions = {
  show: {
    resource: ['crawl'],
    operation: ['url'],
  },
};

export const description = updateDisplayOptions(displayOptions, properties);

const PATTERN_LIST_FIELDS = ['select_paths', 'select_domains', 'exclude_paths', 'exclude_domains'];

export async function execute(this: IExecuteFunctions, index: number) {
  const url = this.getNodeParameter('url', index) as string;
  const options = this.getNodeParameter('options', index) as IDataObject;

  const body: IDataObject = {
    url,
    ...options,
  };

  cleanListFields(body, PATTERN_LIST_FIELDS, PATTERN_SEPARATOR);

  const responseData = await tavilyApiRequest.call(this, 'POST', '/crawl', body);
  return this.helpers.returnJsonArray([responseData]);
}

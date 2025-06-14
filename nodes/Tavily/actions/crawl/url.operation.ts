import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { tavilyApiRequest } from '../../transport';
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

export async function execute(this: IExecuteFunctions, index: number) {
  const url = this.getNodeParameter('url', index) as string;
  const options = this.getNodeParameter('options', index) as IDataObject;

  // Ensure boolean values are properly converted
  const processedOptions: IDataObject = {};
  for (const [key, value] of Object.entries(options)) {
    if (typeof value === 'boolean') {
      processedOptions[key] = value;
    } else {
      processedOptions[key] = value;
    }
  }

  const body: IDataObject = {
    url,
    ...processedOptions,
  };

  const responseData = await tavilyApiRequest.call(this, 'POST', '/crawl', body);
  return this.helpers.returnJsonArray([responseData]);
}

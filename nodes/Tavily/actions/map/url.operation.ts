import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { tavilyApiRequest } from '../../transport';
import { updateDisplayOptions } from '../../display';
import { mapOptions } from '../../descriptions/common.descriptions';

export const properties: INodeProperties[] = [
  {
    displayName: 'URL',
    name: 'url',
    description: 'The root URL to begin mapping',
    type: 'string',
    required: true,
    default: '',
    placeholder: 'https://docs.tavily.com',
    displayOptions: {
      show: {
        resource: ['map'],
      },
    },
  },
  {
    displayName: 'Options',
    name: 'options',
    type: 'collection',
    placeholder: 'Add option',
    default: {},
    options: mapOptions,
  },
];

const displayOptions = {
  show: {
    resource: ['map'],
    operation: ['url'],
  },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, index: number) {
  const url = this.getNodeParameter('url', index) as string;
  const options = this.getNodeParameter('options', index) as IDataObject;

  const body: IDataObject = {
    url,
    ...options,
  };

  const responseData = await tavilyApiRequest.call(this, 'POST', '/map', body);
  return this.helpers.returnJsonArray([responseData]);
}


import { INodeProperties } from 'n8n-workflow';
import * as url from './url.operation';

export { url };

export const description: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['map'],
      },
    },
    options: [
      {
        name: 'URL',
        value: 'url',
        description: 'Discover all internal links starting from a base URL',
        action: 'Map',
      },
    ],
    default: 'url',
  },
  ...url.description,
];


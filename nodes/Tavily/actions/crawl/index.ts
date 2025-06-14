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
        resource: ['crawl'],
      },
    },
    options: [
      {
        name: 'URL',
        value: 'url',
        description: 'The root URL to begin the crawl',
        action: 'Crawl',
      },
    ],
    default: 'url',
  },
  ...url.description,
];

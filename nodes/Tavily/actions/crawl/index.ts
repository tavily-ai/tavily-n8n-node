import { INodeProperties } from 'n8n-workflow';
import * as crawl from './crawl.operation';

export { crawl };

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
        name: 'Crawl',
        value: 'crawl',
        description: 'Crawl a site',
        action: 'Crawl',
      },
    ],
    default: 'crawl',
  },
  ...crawl.description,
];

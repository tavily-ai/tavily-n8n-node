import type { INodeProperties } from 'n8n-workflow';

import * as query from './query.operation';


export { query };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['search'],
			},
		},
		options: [
			{
				name: 'Query',
				value: 'query',
				description: "Search query",
				action: 'Search',
			},
		],
		default: 'query',
	},
	...query.description,
];

import type { INodeProperties } from 'n8n-workflow';

import * as urls from './urls.operation';


export { urls };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['extract'],
			},
		},
		options: [
			{
				name: 'URLs',
				value: 'urls',
				description: "Extract raw content from URLs",
				action: 'Extract',
			},
		],
		default: 'urls',
	},
	...urls.description,
];

import type { INodeProperties } from 'n8n-workflow';

import * as create from './create.operation';
import * as status from './status.operation';

export { create, status };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['research'],
			},
		},
		options: [
			{
				name: 'Create Research Task',
				value: 'create',
				description: 'Initiate a comprehensive research task on a given topic',
				action: 'Create research task',
			},
			{
				name: 'Get Research Status',
				value: 'status',
				description: 'Retrieve the status and results of a research task',
				action: 'Get research status',
			},
		],
		default: 'create',
	},
	...create.description,
	...status.description,
];


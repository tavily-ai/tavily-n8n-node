/* eslint-disable n8n-nodes-base/node-filename-against-convention */
import { NodeConnectionType, type INodeTypeDescription } from 'n8n-workflow';

import * as search from './search';
import * as extract from './extract';

export const description: INodeTypeDescription = {
	displayName: 'Tavily',
	name: 'tavily',
	group: ['transform'],
	icon: 'file:img.svg',
	version: 1,
	subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
	description: 'Tavily API',
	defaults: {
		name: 'Tavily',
	},
	inputs: [NodeConnectionType.Main],
	outputs: `={{['main']}}` as const,
	credentials: [
		{
			name: 'tavilyApi',
			required: true,
		},
	],
	properties: [
		{
			displayName: 'Resource',
			name: 'resource',
			type: 'options',
			noDataExpression: true,
			default: 'search',
			options: [
				{
					name: 'Search',
					value: 'search',
				},
				{
					name: 'Extract',
					value: 'extract',
				}
			],
		},
		...extract.description,
		...search.description,
	],
};

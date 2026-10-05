import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import * as crawl from './actions/crawl';
import * as extract from './actions/extract';
import * as map from './actions/map';
import * as research from './actions/research';
import * as search from './actions/search';
import { router } from './actions/router';

export class Tavily implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Tavily',
		name: 'tavily',
		group: ['transform'],
		icon: { light: 'file:tavily.svg', dark: 'file:tavily.dark.svg' },
		version: [1, 2],
		defaultVersion: 2,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'Search the web, extract page content, crawl and map websites, and run in-depth research with Tavily',
		defaults: {
			name: 'Tavily',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
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
						name: 'Crawl',
						value: 'crawl',
					},
					{
						name: 'Extract',
						value: 'extract',
					},
					{
						name: 'Map',
						value: 'map',
					},
					{
						name: 'Research',
						value: 'research',
					},
					{
						name: 'Search',
						value: 'search',
					},
				],
			},
			...extract.description,
			...search.description,
			...crawl.description,
			...map.description,
			...research.description,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		return await router.call(this);
	}
}

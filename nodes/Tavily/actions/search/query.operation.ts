import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { tavilyApiRequest } from '../../transport';
import { updateDisplayOptions } from '../../display';
import { queryOptions } from "../../descriptions";


export const properties: INodeProperties[] = [
	{
		displayName: 'Query',
		name: 'query',
		description: 'Type your query',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. who is leo messi?',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add option',
		default: {},
		options: queryOptions,
	},
];

const displayOptions = {
	show: {
		resource: ['search'],
		operation: ['query'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, index: number) {
	const query = this.getNodeParameter('query', index) as string;
	const options = this.getNodeParameter('options', index) as IDataObject;

	const body: IDataObject = {
		'query': query,
		...options,
	};

	const endpoint = "/search";

	const responseData = await tavilyApiRequest.call(this, 'POST', endpoint, body);

	return this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData as IDataObject[]),
		{itemData: {item: index}},
	);
}

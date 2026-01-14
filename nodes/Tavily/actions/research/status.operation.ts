import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { tavilyApiRequest } from '../../transport';
import { updateDisplayOptions } from '../../display';

export const properties: INodeProperties[] = [
	{
		displayName: 'Request ID',
		name: 'requestId',
		description: 'The unique identifier of the research task',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. 123e4567-e89b-12d3-a456-426614174111',
		displayOptions: {
			show: {
				resource: ['research'],
			},
		},
	},
];

const displayOptions = {
	show: {
		resource: ['research'],
		operation: ['status'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, index: number) {
	const requestId = this.getNodeParameter('requestId', index) as string;

	const endpoint = `/research/${requestId}`;

	const responseData = await tavilyApiRequest.call(this, 'GET', endpoint);

	return this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData as IDataObject[]),
		{ itemData: { item: index } },
	);
}


import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { tavilyApiRequest } from '../../transport';
import { updateDisplayOptions } from '../../display';
import { researchOptions } from '../../descriptions';

export const properties: INodeProperties[] = [
	{
		displayName: 'Input',
		name: 'input',
		description: 'The research task or question to investigate',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. What are the latest developments in AI?',
		displayOptions: {
			show: {
				resource: ['research'],
			},
		},
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add option',
		default: {},
		options: researchOptions,
	},
];

const displayOptions = {
	show: {
		resource: ['research'],
		operation: ['create'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, index: number) {
	const input = this.getNodeParameter('input', index) as string;
	const options = this.getNodeParameter('options', index) as IDataObject;

	const body: IDataObject = {
		input,
		...options,
	};

	// Parse output_schema from JSON string to object if provided
	if (body.output_schema && typeof body.output_schema === 'string') {
		try {
			body.output_schema = JSON.parse(body.output_schema as string);
		} catch (e) {
			throw new Error('Invalid JSON in Output Schema field');
		}
	}

	const endpoint = '/research';

	const responseData = await tavilyApiRequest.call(this, 'POST', endpoint, body);

	return this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData as IDataObject[]),
		{ itemData: { item: index } },
	);
}


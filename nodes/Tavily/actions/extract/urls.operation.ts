import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { tavilyApiRequest } from '../../transport';
import { updateDisplayOptions } from '../../display';
import { extractOptions } from "../../descriptions/common.descriptions";


export const properties: INodeProperties[] = [
	{
		displayName: 'URLs',
		name: 'urls',
		description: 'A list of URLs to extract content from',
		type: 'string',
		typeOptions: {
			multipleValues: true,
			multipleValueButtonText: 'Add URL',
		},
		required: true,
		default: [],
		placeholder: 'e.g. https://tavily.com'
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add option',
		default: {},
		options: extractOptions,
	},
];

const displayOptions = {
	show: {
		resource: ['extract'],
		operation: ['urls'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, index: number) {
	const urls = this.getNodeParameter('urls', index) as string[];
	const options = this.getNodeParameter('options', index) as IDataObject;

	// Ensure boolean values are properly converted
	const processedOptions: IDataObject = {};
	for (const [key, value] of Object.entries(options)) {
		if (typeof value === 'boolean') {
			processedOptions[key] = value;
		} else {
			processedOptions[key] = value;
		}
	}

	const body: IDataObject = {
		'urls': urls,
		...processedOptions,
	};

	const endpoint = "/extract";

	const responseData = await tavilyApiRequest.call(this, 'POST', endpoint, body);

	return this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData as IDataObject[]),
		{itemData: {item: index}},
	);
}

import type {
	IDataObject,
	IDisplayOptions,
	IExecuteFunctions,
	INodeProperties,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { tavilyApiRequest } from '../../transport';
import { cleanList } from '../lists';
import { extractOptions } from "../../descriptions/common.descriptions";
import { fromAI, getChoice, isToolV2, modelChoiceField, TOOL_V2 } from '../tool';

const EXTRACT_DEPTHS = ['basic', 'advanced'];

const OPERATION_SHOW = { resource: ['extract'], operation: ['urls'] };

const operationDisplay = (extra: IDataObject = {}): IDisplayOptions => ({
	show: { ...OPERATION_SHOW, ...extra } as IDisplayOptions['show'],
});

const urlsField: INodeProperties = {
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
	placeholder: 'e.g. https://tavily.com',
};

export const properties: INodeProperties[] = [
	{
		...urlsField,
		displayOptions: operationDisplay({ '@version': [1] }),
	},
	{
		...urlsField,
		displayOptions: operationDisplay({ '@version': [{ _cnd: { gte: 2 } }], '@tool': [false] }),
	},
	// A list field can't be model-defined in the editor, so the tool gets a single text field
	{
		displayName: 'URLs',
		name: 'urls',
		description: 'The URLs to extract content from, separated by commas or new lines. Defined by the model by default.',
		type: 'string',
		required: true,
		default: fromAI(
			'urls',
			'One or more full web page URLs to extract content from, starting with https://. Separate multiple URLs with commas. Up to 20 URLs.',
		),
		placeholder: 'e.g. https://tavily.com, https://docs.tavily.com',
		displayOptions: operationDisplay(TOOL_V2),
	},
	...modelChoiceField({
		displayName: 'Extract Depth',
		name: 'extractDepth',
		key: 'extract_depth',
		modelDescription:
			'How thoroughly to extract each page. One of: basic (good default), advanced (also gets tables and embedded content, and works on more pages, but costs twice as many credits; use it if basic misses the content you need).',
		description: 'The depth of the extraction. Advanced costs twice as many credits.',
		choices: [
			{ name: 'Advanced', value: 'advanced' },
			{ name: 'Basic', value: 'basic' },
		],
		show: { ...OPERATION_SHOW, ...TOOL_V2 },
	}),
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add option',
		default: {},
		options: extractOptions,
		displayOptions: operationDisplay(),
	},
];

export const description = properties;

export async function execute(this: IExecuteFunctions, index: number) {
	const urls = parseUrls(this.getNodeParameter('urls', index));
	const options = this.getNodeParameter('options', index) as IDataObject;

	if (urls.length === 0) {
		throw new NodeOperationError(this.getNode(), 'No URLs to extract', {
			itemIndex: index,
			description: 'Add at least one URL, starting with https://.',
		});
	}

	const body: IDataObject = {
		'urls': urls,
		...options,
	};

	if (isToolV2.call(this)) {
		const extractDepth = getChoice.call(this, 'extractDepth', index, EXTRACT_DEPTHS);
		if (extractDepth) {
			body.extract_depth = extractDepth;
		}
	}

	const endpoint = "/extract";

	const responseData = await tavilyApiRequest.call(this, 'POST', endpoint, body);

	return this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData),
		{itemData: {item: index}},
	);
}

/**
 * Accepts a list of URLs, a string of URLs separated by commas, spaces or new lines, or a mix (for
 * example an expression that returns an array inside one list entry). Only splits where the next
 * part starts with http:// or https://, so commas inside a URL are kept.
 */
export function parseUrls(value: unknown): string[] {
	return cleanList(value, /[\s,]+(?=https?:\/\/)/i);
}

import { primaryInputFields } from '../tool';
import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { tavilyApiRequest } from '../../transport';
import { updateDisplayOptions } from '../../display';
import { researchOptions } from '../../descriptions';
import { cleanListFields, DOMAIN_SEPARATOR } from '../lists';

const MAX_FILES = 5;
const MAX_WORDS = 80000;
const FILE_EXTENSIONS = ['.txt', '.md', '.json'];
const BASE64 = /^[A-Za-z0-9+/]*={0,2}$/;

/** Whitespace is allowed (it is ignored); the rest must be canonical padded base64, so Buffer cannot silently decode junk. */
function isCanonicalBase64(data: string): boolean {
	const compact = data.replace(/\s+/g, '');
	return compact.length > 0 && compact.length % 4 === 0 && BASE64.test(compact) && Buffer.from(compact, 'base64').toString('base64') === compact;
}

type FileEntry = { name?: unknown; data?: unknown; type?: unknown };

/** Convert the Files fixedCollection into the API's `files` array, validating it before any request. */
function buildFiles(this: IExecuteFunctions, raw: unknown, index: number): IDataObject[] | undefined {
	const entries = (raw as { file?: FileEntry[] } | undefined)?.file ?? (Array.isArray(raw) ? (raw as FileEntry[]) : []);
	if (!entries.length) return undefined;
	const fail = (message: string): never => {
		throw new NodeOperationError(this.getNode(), message, { itemIndex: index });
	};
	if (entries.length > MAX_FILES) fail(`Files: at most ${MAX_FILES} files can be attached, got ${entries.length}.`);
	let totalWords = 0;
	const files = entries.map((entry, position) => {
		const label = `Files entry ${position + 1}`;
		const name = typeof entry.name === 'string' ? entry.name.trim() : '';
		const data = typeof entry.data === 'string' ? entry.data.trim() : '';
		const type = entry.type === undefined || entry.type === '' ? 'base64' : entry.type;
		if (!name) fail(`${label}: a file name is required.`);
		if (!data) fail(`${label} (${name}): base64 data is required.`);
		if (type !== 'base64') fail(`${label} (${name}): type must be base64.`);
		if (!FILE_EXTENSIONS.some((extension) => name.toLowerCase().endsWith(extension))) {
			fail(`${label} (${name}): supported file types are ${FILE_EXTENSIONS.join(', ')}.`);
		}
		if (!isCanonicalBase64(data)) fail(`${label} (${name}): data is not valid base64.`);
		const words = Buffer.from(data, 'base64').toString('utf8').split(/\s+/).filter(Boolean).length;
		if (words > MAX_WORDS) fail(`${label} (${name}): ${words} words exceeds the ${MAX_WORDS} word limit per file.`);
		totalWords += words;
		return { name, data, type: 'base64' } as IDataObject;
	});
	if (totalWords > MAX_WORDS) fail(`Files: ${totalWords} words in total exceeds the ${MAX_WORDS} word limit across all files.`);
	return files;
}

export const properties: INodeProperties[] = [
	...primaryInputFields({
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
	}, { resource: ['research'], operation: ['create'] }, 'A self-contained research task. This submits a task and returns a request_id; use Research Status to obtain its completed result.'),
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

	if (options.stream === true) {
		throw new NodeOperationError(this.getNode(), 'Streaming is not supported by this JSON task node. Disable Stream and use Create Research Task, then Get Research Status with a Wait node.', { itemIndex: index });
	}

	const body: IDataObject = {
		input,
		...options,
		stream: false,
	};

	// Parse output_schema from JSON string to object if provided
	if (body.output_schema && typeof body.output_schema === 'string') {
		try {
			body.output_schema = JSON.parse(body.output_schema as string);
		} catch {
			throw new NodeOperationError(this.getNode(), 'Invalid JSON in Output Schema field', {
				itemIndex: index,
				description: 'Enter a valid JSON Schema object, or remove the Output Schema option.',
			});
		}
	}

	if (body.output_schema !== undefined && body.output_schema !== '') {
		const schema = body.output_schema;
		const properties = (schema as IDataObject | null)?.properties;
		if (!schema || typeof schema !== 'object' || Array.isArray(schema) ||
			!properties || typeof properties !== 'object' || Array.isArray(properties)) {
			throw new NodeOperationError(this.getNode(), 'Output Schema must be an object containing a properties object', { itemIndex: index });
		}
	} else {
		delete body.output_schema;
	}

	cleanListFields(body, ['include_domains', 'exclude_domains'], DOMAIN_SEPARATOR);

	if ('files' in body) {
		const files = buildFiles.call(this, body.files, index);
		if (files) body.files = files;
		else delete body.files;
	}

	const endpoint = '/research';

	const responseData = await tavilyApiRequest.call(this, 'POST', endpoint, body);

	return this.helpers.constructExecutionMetaData(
		this.helpers.returnJsonArray(responseData),
		{ itemData: { item: index } },
	);
}

import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

import * as search from './search';
import * as extract from './extract';
import type {Tavily} from "./node.type";


export async function router(this: IExecuteFunctions) {
	const items = this.getInputData();

	const returnData: INodeExecutionData[] = [];

	const resource = this.getNodeParameter<Tavily>('resource', 0) as string;
	const operation = this.getNodeParameter('operation', 0);

	let responseData;

	const tavily = {
		resource,
		operation,
	} as Tavily;


	for (let i = 0; i < items.length; i++) {
		try {
			switch (tavily.resource) {
				case 'search':
					responseData = await search[tavily.operation].execute.call(this, i);
					break;
				case 'extract':
					responseData = await extract[tavily.operation].execute.call(this, i);
					break;
				default:
					throw new NodeOperationError(this.getNode(), `The resource "${resource}" is not known`);
			}

			returnData.push(...responseData);
		} catch (error) {
			if (this.continueOnFail()) {
				const executionErrorData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray({ error: error.message }),
					{ itemData: { item: i } },
				);
				returnData.push(...executionErrorData);
				continue;
			}
			//NodeApiError will be missing the itemIndex, add it
			if (error instanceof NodeApiError && error?.context?.itemIndex === undefined) {
				if (error.context === undefined) {
					error.context = {};
				}
				error.context.itemIndex = i;
			}
			throw error;
		}
	}
	return [returnData];
}

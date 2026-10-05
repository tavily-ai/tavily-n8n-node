import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

import * as search from './search';
import * as extract from './extract';
import * as crawl from './crawl';
import * as map from './map';
import * as research from './research';

type OperationExecute = (
	this: IExecuteFunctions,
	index: number,
) => Promise<INodeExecutionData[]>;

const operations: Record<string, Record<string, OperationExecute>> = {
	search: { query: search.query.execute },
	extract: { urls: extract.urls.execute },
	crawl: { url: crawl.url.execute },
	map: { url: map.url.execute },
	research: { create: research.create.execute, status: research.status.execute },
};

export async function router(this: IExecuteFunctions) {
	const items = this.getInputData();

	const returnData: INodeExecutionData[] = [];

	const resource = this.getNodeParameter('resource', 0) as string;
	const operation = this.getNodeParameter('operation', 0) as string;

	for (let i = 0; i < items.length; i++) {
		try {
			const execute = operations[resource]?.[operation];
			if (!execute) {
				throw new NodeOperationError(
					this.getNode(),
					`The operation "${operation}" for resource "${resource}" is not known`,
					{ itemIndex: i },
				);
			}

			const responseData = await execute.call(this, i);
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

			if (error instanceof NodeApiError || error instanceof NodeOperationError) {
				// Already an n8n error with its HTTP details; only the item index is missing
				const nodeError = error;
				if (nodeError.context.itemIndex === undefined) {
					nodeError.context.itemIndex = i;
				}
				throw nodeError;
			}

			throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
		}
	}

	return [returnData];
}

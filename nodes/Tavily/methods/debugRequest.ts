import { IExecuteSingleFunctions, IHttpRequestOptions } from 'n8n-workflow';

export async function debugRequest(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	return requestOptions;
}

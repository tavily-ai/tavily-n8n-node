import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	IN8nHttpFullResponse,
	INode,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

const TAVILY_API_URL = 'https://api.tavily.com';
const TAVILY_DASHBOARD_URL = 'https://app.tavily.com/home';
const TAVILY_BILLING_URL = 'https://app.tavily.com/billing';

export async function tavilyApiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	resource: string,
	body: IDataObject = {},
	query: IDataObject = {},
	uri?: string,
	headers: IDataObject = {},
) {
	const options: IHttpRequestOptions = {
		headers: {
			'Content-Type': 'application/json',
			...headers,
		},
		method,
		url: uri || `${TAVILY_API_URL}${resource}`,
		json: true,
		returnFullResponse: true,
		ignoreHttpStatusErrors: true,
	};

	if (Object.keys(body).length !== 0) {
		options.body = body;
	}

	if (Object.keys(query).length !== 0) {
		options.qs = query;
	}

	const response = (await this.helpers.httpRequestWithAuthentication.call(
		this,
		'tavilyApi',
		options,
	)) as IN8nHttpFullResponse;

	if (response.statusCode >= 400) {
		throw tavilyApiError(this.getNode(), response);
	}

	return response.body;
}

/**
 * Tavily returns errors as `{ "detail": { "error": "..." } }`. Turn them into messages that tell
 * the user (or an AI agent calling this node as a tool) what went wrong and how to recover.
 */
function tavilyApiError(node: INode, response: IN8nHttpFullResponse): NodeApiError {
	const statusCode = response.statusCode;
	const body = (response.body ?? {}) as JsonObject;
	const detail = getErrorDetail(body);
	const withDetail = (text: string) => (detail ? `${text} Tavily said: ${detail}` : text);

	let message: string;
	let description: string;

	switch (statusCode) {
		case 400:
			message = detail ? `Tavily rejected the request: ${detail}` : 'Tavily rejected the request';
			description = 'Check the values sent to Tavily, such as the query, URLs and options.';
			break;
		case 401:
			message = 'Tavily rejected the API key';
			description = withDetail(
				`Check the API key in your Tavily credential. You can find your key at ${TAVILY_DASHBOARD_URL}.`,
			);
			break;
		case 429: {
			const retryAfter = response.headers?.['retry-after'];
			message = 'Tavily rate limit reached';
			description = withDetail(
				`Too many requests in a short time. ${
					retryAfter ? `Retry after ${String(retryAfter)} seconds` : 'Wait a moment and try again'
				}, or slow down how often this node runs.`,
			);
			break;
		}
		case 432:
			message = 'Tavily plan or API key usage limit reached';
			description = withDetail(
				`Upgrade your Tavily plan or raise the key's limit at ${TAVILY_BILLING_URL}.`,
			);
			break;
		case 433:
			message = 'Tavily pay-as-you-go limit reached';
			description = withDetail(`Raise your pay-as-you-go limit at ${TAVILY_BILLING_URL}.`);
			break;
		default:
			if (statusCode >= 500) {
				message = 'Tavily is having trouble right now';
				description = withDetail('This is usually temporary. Try again in a few moments.');
			} else {
				message = detail
					? `Tavily request failed (HTTP ${statusCode}): ${detail}`
					: `Tavily request failed (HTTP ${statusCode})`;
				description = 'Check the node settings and try again.';
			}
	}

	return new NodeApiError(node, body, {
		message,
		description,
		httpCode: String(statusCode),
	});
}

function getErrorDetail(body: JsonObject): string | undefined {
	const detail = body.detail as JsonObject | string | undefined;
	if (typeof detail === 'string') return detail;
	if (detail && typeof detail.error === 'string') return detail.error;
	if (typeof body.error === 'string') return body.error;
	if (typeof body.message === 'string') return body.message;
	return undefined;
}

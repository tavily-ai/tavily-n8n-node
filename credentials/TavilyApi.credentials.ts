import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class TavilyApi implements ICredentialType {
	name = 'tavilyApi';

	displayName = 'Tavily API';

	documentationUrl = 'https://docs.tavily.com/documentation/quickstart';

	icon: Icon = { light: 'file:icons/tavily.svg', dark: 'file:icons/tavily.dark.svg' };

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			description:
				'Tavily API key. You can find your API key in your Tavily dashboard at https://app.tavily.com/home',
			default: '',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'hidden',
			default: 'https://api.tavily.com',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
				'X-Client-Name': 'n8n',
				'X-Client-Source': 'api',
			},
		},
	};

	// The usage endpoint checks the key without running a search, so testing uses no credits
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl || "https://api.tavily.com"}}',
			url: '/usage',
			method: 'GET',
		},
	};
}

//eslint-disable-next-line n8n-nodes-base/cred-filename-against-convention
import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	Icon,
} from 'n8n-workflow';


export class TavilyApi implements ICredentialType {
	name = 'tavilyApi';
	displayName = 'Tavily API';
	documentationUrl =
		'https://docs.tavily.com/docs/welcome';
	icon: Icon = 'file:icons/img.svg';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			description: "Tavily API key. You can find your API key in your Tavily dashboard at https://app.tavily.com/home",
			default: "",
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			description: "Base URL of Tavily's API",
			default: 'https://api.tavily.com',
		},
	];
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
				'X-Client-Source': 'n8n'
			},
		},
	};

	test: ICredentialTestRequest = {
			request: {
				baseURL: 'https://api.tavily.com',
				url: '/search',
				method: 'POST',
				headers: {
					Authorization: '=Bearer {{$credentials.apiKey}}',
					'X-Client-Source': 'n8n'
				},
				body: {
					query: 'Hello n8n!',
				},
			},
		};
}

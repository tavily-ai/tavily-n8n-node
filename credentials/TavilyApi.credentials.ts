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
			description: "Tavily API key",
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
			},
		},
	};

	test: ICredentialTestRequest = {
			request: {
				baseURL: 'https://api.tavily.com',
				url: '/search',
				method: 'POST',
				body: {
					query: 'Hello n8n!',
				},
			},
		};
}

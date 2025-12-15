import type { AllEntities } from 'n8n-workflow';

type NodeMap = {
	search: 'query';
	extract: 'urls';
	crawl: 'url';
	map: 'url';
};

export type Tavily = AllEntities<NodeMap>;

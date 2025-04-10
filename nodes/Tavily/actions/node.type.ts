import type { AllEntities } from 'n8n-workflow';

type NodeMap = {
	search: 'query';
	extract: 'urls';
};

export type Tavily = AllEntities<NodeMap>;

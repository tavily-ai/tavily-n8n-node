// Offline tests for the built node (run `npm test`): mock n8n's execute functions and assert the
// request Tavily would receive. No network and no real key.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { TavilyApi } = require('../dist/credentials/TavilyApi.credentials.js');
const search = require('../dist/nodes/Tavily/actions/search/query.operation.js');
const extract = require('../dist/nodes/Tavily/actions/extract/urls.operation.js');
const crawl = require('../dist/nodes/Tavily/actions/crawl/url.operation.js');
const research = require('../dist/nodes/Tavily/actions/research/create.operation.js');
const { queryOptions, extractOptions, crawlOptions, researchOptions } = require('../dist/nodes/Tavily/descriptions/common.descriptions.js');

function context(params) {
	const requests = [];
	const ctx = {
		requests,
		getNodeParameter: (name, _i, fallback) => (name in params ? params[name] : fallback),
		getNode: () => ({ name: 'Tavily', type: 'tavily', typeVersion: 1 }),
		getCredentials: async () => ({ baseUrl: 'https://api.tavily.com' }),
		getNodeInputData: () => [],
		getInputData: () => [],
		helpers: {
			httpRequestWithAuthentication: async (_cred, options) => {
				requests.push(options);
				return { statusCode: 200, headers: {}, body: { results: [] } };
			},
			returnJsonArray: (data) => [].concat(data).map((json) => ({ json })),
			constructExecutionMetaData: (items) => items,
		},
	};
	return ctx;
}

const names = (options) => options.map((o) => o.name);

test('credential sends the integration identity as X-Client-Name and source api', () => {
	const headers = new TavilyApi().authenticate.properties.headers;
	assert.equal(headers['X-Client-Name'], 'n8n');
	assert.equal(headers['X-Client-Source'], 'api');
	assert.match(headers.Authorization, /^=Bearer /);
});

test('new current options exist, in alphabetical order, in each collection', () => {
	for (const n of ['filter_by_language', 'filter_by_published_date', 'include_domains_mode', 'include_published_date', 'language', 'safe_search']) {
		assert.ok(names(queryOptions).includes(n), `search option ${n}`);
	}
	assert.ok(names(extractOptions).includes('timeout'));
	assert.ok(names(crawlOptions).includes('timeout'));
	for (const n of ['include_domains', 'exclude_domains', 'output_length']) assert.ok(names(researchOptions).includes(n), `research option ${n}`);
	for (const list of [queryOptions, extractOptions, crawlOptions, researchOptions]) {
		const labels = list.map((o) => o.displayName);
		assert.deepEqual(labels, [...labels].sort((a, b) => a.localeCompare(b)));
	}
});

test('search sends the newer options in the request body', async () => {
	const ctx = context({ query: 'q', options: { include_domains: ['example.com'], include_domains_mode: 'restrict', language: 'english', filter_by_language: true, safe_search: true, include_published_date: true, filter_by_published_date: true, chunks_per_source: 2, search_depth: 'basic' } });
	await search.execute.call(ctx, 0);
	const body = ctx.requests[0].body;
	assert.equal(ctx.requests[0].url, 'https://api.tavily.com/search');
	assert.deepEqual(body.include_domains, ['example.com']);
	assert.equal(body.include_domains_mode, 'restrict');
	assert.equal(body.language, 'english');
	assert.equal(body.filter_by_language, true);
	assert.equal(body.safe_search, true);
	assert.equal(body.include_published_date, true);
	assert.equal(body.filter_by_published_date, true);
	assert.equal(body.chunks_per_source, 2);
});

test('search rejects dependent options that do not fit before sending a request', async () => {
	for (const options of [{ include_domains_mode: 'prefer' }, { filter_by_language: true }, { safe_search: true, search_depth: 'fast' }]) {
		const ctx = context({ query: 'q', options });
		await assert.rejects(() => search.execute.call(ctx, 0));
		assert.equal(ctx.requests.length, 0);
	}
});

test('extract and crawl pass timeout through', async () => {
	const e = context({ urls: ['https://example.com'], options: { timeout: 45, query: 'x' } });
	await extract.execute.call(e, 0);
	assert.equal(e.requests[0].body.timeout, 45);
	const c = context({ url: 'https://example.com', options: { timeout: 60 } });
	await crawl.execute.call(c, 0);
	assert.equal(c.requests[0].body.timeout, 60);
});

test('research sends cleaned domain lists and output_length', async () => {
	const ctx = context({ input: 'q', options: { include_domains: ['sec.gov, example.com'], exclude_domains: ['medium.com'], output_length: 'short' } });
	await research.execute.call(ctx, 0);
	const body = ctx.requests[0].body;
	assert.deepEqual(body.include_domains, ['sec.gov', 'example.com']);
	assert.deepEqual(body.exclude_domains, ['medium.com']);
	assert.equal(body.output_length, 'short');
});

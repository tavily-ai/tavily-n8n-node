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
const { queryOptions, extractOptions, crawlOptions, mapOptions, researchOptions } = require('../dist/nodes/Tavily/descriptions/common.descriptions.js');

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

test('crawl allow_external defaults to true like the API and is only sent when set', async () => {
	const option = crawlOptions.find((o) => o.name === 'allow_external');
	assert.equal(option.default, true);
	assert.match(option.description, /include external domain links/i);
	const mapOption = mapOptions.find((o) => o.name === 'allow_external');
	assert.equal(mapOption.default, option.default);
	const omitted = context({ url: 'https://example.com', options: {} });
	await crawl.execute.call(omitted, 0);
	assert.ok(!('allow_external' in omitted.requests[0].body), 'unset option is not sent, so the API default (true) applies');
	for (const value of [true, false]) {
		const c = context({ url: 'https://example.com', options: { allow_external: value } });
		await crawl.execute.call(c, 0);
		assert.equal(c.requests[0].body.allow_external, value);
	}
});

test('research files: forwarded as base64 entries and validated before any request', async () => {
	const b64 = (text) => Buffer.from(text).toString('base64');
	const ok = context({ input: 'q', options: { files: { file: [{ name: 'a.md', data: b64('hello world') }, { name: 'b.JSON', data: b64('{"a":1}') }] } } });
	await research.execute.call(ok, 0);
	assert.deepEqual(ok.requests[0].body.files, [
		{ name: 'a.md', data: b64('hello world'), type: 'base64' },
		{ name: 'b.JSON', data: b64('{"a":1}'), type: 'base64' },
	]);
	const none = context({ input: 'q', options: { files: {} } });
	await research.execute.call(none, 0);
	assert.ok(!('files' in none.requests[0].body));
	const cases = {
		'more than 5 files': Array.from({ length: 6 }, (_, i) => ({ name: `f${i}.txt`, data: b64('x') })),
		'missing name': [{ name: '', data: b64('x') }],
		'missing data': [{ name: 'a.txt', data: '' }],
		'unsupported extension': [{ name: 'a.pdf', data: b64('x') }],
		'wrong type': [{ name: 'a.txt', data: b64('x'), type: 'hex' }],
		'invalid base64': [{ name: 'a.txt', data: '***not base64***' }],
		'padding only (=)': [{ name: 'a.txt', data: '=' }],
		'padding only (==)': [{ name: 'a.txt', data: '==' }],
		'impossible length (A)': [{ name: 'a.txt', data: 'A' }],
		'non-canonical padding bits': [{ name: 'a.txt', data: 'QR==' }],
		'padding in the middle': [{ name: 'a.txt', data: 'QUJD=QUJD' }],
		'too many words in one file': [{ name: 'a.txt', data: b64('w '.repeat(80001)) }],
		'too many words combined': [{ name: 'a.txt', data: b64('w '.repeat(50000)) }, { name: 'b.txt', data: b64('w '.repeat(50000)) }],
	};
	for (const [label, file] of Object.entries(cases)) {
		const ctx = context({ input: 'q', options: { files: { file } } });
		await assert.rejects(() => research.execute.call(ctx, 0), /Files/, label);
		assert.equal(ctx.requests.length, 0, `${label}: no request must be made`);
	}
	// whitespace policy: line breaks inside otherwise valid base64 stay accepted
	const wrapped = b64('hello wrapped world').replace(/(.{8})/g, '$1\n');
	const wrappedCtx = context({ input: 'q', options: { files: { file: [{ name: 'a.txt', data: wrapped }] } } });
	await research.execute.call(wrappedCtx, 0);
	assert.equal(wrappedCtx.requests.length, 1);
	assert.ok(names(researchOptions).includes('files'));
	assert.match(researchOptions.find((o) => o.name === 'files').description, /80,000 words/);
});

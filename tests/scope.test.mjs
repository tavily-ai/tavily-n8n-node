import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { Tavily } = require('../dist/nodes/Tavily/Tavily.node.js');
const { queryOptions, researchOptions } = require('../dist/nodes/Tavily/descriptions/common.descriptions.js');

test('Map, Crawl and Research retain configured primary inputs rather than new model defaults', () => {
	const properties = new Tavily().description.properties;
	for (const [resource, operation, name] of [
		['map', 'url', 'url'], ['crawl', 'url', 'url'],
		['research', 'create', 'input'], ['research', 'status', 'requestId'],
	]) {
		const fields = properties.filter((p) => p.name === name &&
			p.displayOptions?.show?.resource?.includes(resource) &&
			p.displayOptions?.show?.operation?.includes(operation));
		assert.equal(fields.length, 1, `${resource}.${operation} keeps its existing input`);
		assert.equal(fields[0].default, '');
		assert.ok(!('@tool' in fields[0].displayOptions.show));
	}
});

test('Research exposes its existing JSON task controls without added parity settings', () => {
	assert.deepEqual(researchOptions.map((p) => p.name), ['citation_format', 'model', 'output_schema']);
	const statusFields = new Tavily().description.properties.filter((p) =>
		p.displayOptions?.show?.resource?.includes('research') &&
		p.displayOptions?.show?.operation?.includes('status'));
	assert.deepEqual(statusFields.map((p) => p.name), ['requestId']);
});

test('Search editor retains the original positive minimum and can represent saved raw-content booleans', () => {
	assert.equal(queryOptions.find((p) => p.name === 'max_results').typeOptions.minValue, 1);
	const raw = queryOptions.find((p) => p.name === 'include_raw_content');
	assert.equal(raw.default, false);
	assert.ok(raw.options.some((option) => option.value === true));
	assert.ok(raw.options.some((option) => option.value === false));
});

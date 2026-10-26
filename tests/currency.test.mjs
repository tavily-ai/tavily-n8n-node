import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { Tavily } = require('../dist/nodes/Tavily/Tavily.node.js');
const props = require('../dist/nodes/Tavily/descriptions/common.descriptions.js');
const search = require('../dist/nodes/Tavily/actions/search/query.operation.js');
const extract = require('../dist/nodes/Tavily/actions/extract/urls.operation.js');
const create = require('../dist/nodes/Tavily/actions/research/create.operation.js');
const status = require('../dist/nodes/Tavily/actions/research/status.operation.js');

function context(parameters, responses = [{ statusCode: 200, body: { results: [] } }], tool = false) {
 const requests = [];
 return { requests,
  getNodeParameter: (key, _index, fallback) => parameters[key] ?? fallback,
  getNode: () => ({ name: 'Tavily', type: tool ? 'tavilyTool' : 'tavily', typeVersion: 2.1 }),
  getCredentials: async () => ({ baseUrl: 'https://api.tavily.com' }),
  getInputData: () => [{ json: {} }], continueOnFail: () => false,
  helpers: {
   httpRequestWithAuthentication: async (_credentials, request) => { requests.push(request); return { headers: {}, ...responses.shift() }; },
   returnJsonArray: data => [].concat(data).map(json => ({ json })),
   constructExecutionMetaData: (items, metadata) => items.map(item => ({ ...item, pairedItem: metadata.itemData })),
  },
 };
}

test('Search editor supports disabled answer, both content formats, and zero results', async () => {
 const option = name => props.queryOptions.find(p => p.name === name);
 assert.ok(option('include_answer').options.some(o => o.value === false));
 assert.equal(option('include_raw_content').type, 'options');
 assert.deepEqual(option('include_raw_content').options.map(o => o.value), [false, 'markdown', 'text']);
 assert.equal(option('max_results').typeOptions.minValue, 0);
 for (const raw of [false, true, 'markdown', 'text']) {
  const ctx = context({ query: 'question', options: { include_raw_content: raw, max_results: 0, include_answer: false, safe_search: false } });
  await search.execute.call(ctx, 0);
  assert.equal(ctx.requests[0].body.include_raw_content, raw);
  assert.equal(ctx.requests[0].body.max_results, 0);
  assert.equal(ctx.requests[0].body.include_answer, false);
  assert.equal(ctx.requests[0].body.safe_search, false);
 }
});

test('Extract rejects batches over the public 20-URL limit without HTTP', async () => {
 const ctx = context({ urls: Array.from({length:21},(_,i)=>`https://example.com/${i}`), options:{} });
 await assert.rejects(() => extract.execute.call(ctx,0), /20/);
 assert.equal(ctx.requests.length,0);
 const response = {results:[{url:'https://example.com',raw_content:'content',images:[]}],failed_results:[{url:'https://example.com/fail',error:'blocked'}],usage:{credits:1}};
 const ok=context({urls:Array.from({length:20},(_,i)=>`https://example.com/${i}`),options:{}},[{statusCode:200,body:response}]);
 assert.deepEqual((await extract.execute.call(ok,0))[0].json,response);
});

test('Map and Crawl editor traversal bounds match public API', () => {
 for(const list of [props.mapOptions,props.crawlOptions]) {
  assert.equal(list.find(p=>p.name==='max_depth').typeOptions.maxValue,5);
  assert.equal(list.find(p=>p.name==='max_breadth').typeOptions.maxValue,500);
 }
});

test('Every AI-tool operation has a model-defined primary input without changing regular nodes', () => {
 const all=new Tavily().description.properties;
 for(const [resource,operation,name] of [['map','url','url'],['crawl','url','url'],['research','create','input'],['research','status','requestId']]) {
  const matches=all.filter(p=>p.name===name && p.displayOptions?.show?.resource?.includes(resource) && p.displayOptions?.show?.operation?.includes(operation));
  const tool=matches.find(p=>p.displayOptions.show['@tool']?.includes(true));
  assert.ok(tool,`${resource}.${operation} has a tool field`);
  assert.match(tool.default,/\$fromAI\(/);
  const ordinary=matches.find(p=>p.displayOptions.show['@tool']?.includes(false));
  assert.equal(ordinary.default,'');
 }
});

test('Research refuses legacy streaming in the JSON task node before starting a task', async () => {
 const ctx=context({input:'task',options:{stream:true}});
 await assert.rejects(()=>create.execute.call(ctx,0),/stream|Create.*Status/i);
 assert.equal(ctx.requests.length,0);
 assert.ok(!props.researchOptions.some(p=>p.name==='stream'));
});

test('Research accepts201, preserves202 pending and200 complete through real node routing', async () => {
 const submitted={request_id:'task-id',status:'pending',model:'mini'};
 const pending={request_id:'task-id',status:'in_progress'};
 const completed={request_id:'task-id',status:'completed',content:{summary:'answer'},sources:[{url:'https://example.com',title:'source'}],response_time:1};
 const ctx=context({resource:'research',operation:'create',input:'task',options:{model:'mini',output_schema:'{"properties":{"summary":{"type":"string","description":"Summary"}}}'}},[{statusCode:201,body:submitted}]);
 const node=new Tavily();assert.deepEqual((await node.execute.call(ctx))[0][0].json,submitted);
 assert.equal(ctx.requests[0].body.stream,false);
 for(const response of [{statusCode:202,body:pending},{statusCode:200,body:completed}]) {
  const result=context({resource:'research',operation:'status',requestId:'task-id',includeUsage:true},[response],true);
  assert.deepEqual((await node.execute.call(result))[0][0].json,response.body);
  assert.equal(result.requests[0].qs.include_usage,true);
 }
});

test('Research validates structured output object and request ID before HTTP', async () => {
 for(const output_schema of ['[]','null','42','{}']) {
  const ctx=context({input:'task',options:{output_schema}});
  await assert.rejects(()=>create.execute.call(ctx,0),/Schema|schema/);assert.equal(ctx.requests.length,0);
 }
 const empty=context({requestId:' '});await assert.rejects(()=>status.execute.call(empty,0),/Request ID/);assert.equal(empty.requests.length,0);
 const path=context({requestId:'id/with?query'});await status.execute.call(path,0);
 assert.equal(path.requests[0].url,'https://api.tavily.com/research/id%2Fwith%3Fquery');
});

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

test('Search preserves explicit false, zero and legacy boolean content options on the wire', async () => {
 const option = name => props.queryOptions.find(p => p.name === name);
 assert.ok(option('include_answer').options.some(o => o.value === false));
 assert.equal(option('include_raw_content').type, 'options');
 assert.deepEqual(option('include_raw_content').options.map(o => o.value), [false, true, 'markdown', 'text']);
 assert.equal(option('max_results').typeOptions.minValue, 1);
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
  const result=context({resource:'research',operation:'status',requestId:'task-id'},[response],true);
  assert.deepEqual((await node.execute.call(result))[0][0].json,response.body);
  assert.equal(result.requests[0].qs,undefined);
 }
});

test('Research keeps existing JSON parsing and safely addresses task IDs', async () => {
 const malformed=context({input:'task',options:{output_schema:'{"bad"'}});
 await assert.rejects(()=>create.execute.call(malformed,0),/Invalid JSON/);
 assert.equal(malformed.requests.length,0);
 const schema={properties:{summary:{type:'string',description:'Summary'}},required:['summary']};
 for(const value of [JSON.stringify(schema),schema]) {
  const valid=context({input:'task',options:{model:'mini',citation_format:'apa',output_schema:value}});
  await create.execute.call(valid,0);
  assert.deepEqual(valid.requests[0].body,{input:'task',model:'mini',citation_format:'apa',output_schema:schema,stream:false});
 }
 const empty=context({requestId:' '});await assert.rejects(()=>status.execute.call(empty,0),/Request ID/);assert.equal(empty.requests.length,0);
 const path=context({requestId:'id/with?query'});await status.execute.call(path,0);
 assert.equal(path.requests[0].url,'https://api.tavily.com/research/id%2Fwith%3Fquery');
});

test('Search retains tool defaults, author/model precedence and optional full output', async () => {
 const response={query:'question',answer:'answer',results:[{title:'Page',url:'https://example.com',content:'text',score:0.9,internal:'omit'}],request_id:'id',usage:{credits:1}};
 const parameters={resource:'search',operation:'query',query:'question',topic:'model',topicByModel:'news',timeRange:'month',searchDepth:'model',searchDepthByModel:'not-a-depth',includeAnswer:'none',includeDomains:'example.org, example.com',excludeDomains:'blocked.example',options:{topic:'general',time_range:'year',search_depth:'basic',include_answer:true,include_domains:['example.com'],safe_search:false}};
 const ctx=context(parameters,[{statusCode:200,body:response}],true);
 const output=(await new Tavily().execute.call(ctx))[0][0];
 assert.deepEqual(ctx.requests[0].body,{query:'question',topic:'news',time_range:'month',search_depth:'basic',include_domains:['example.com','example.org','example.com'],exclude_domains:['blocked.example'],safe_search:false,max_results:5});
 assert.deepEqual(output.json,{query:'question',answer:'answer',usage:{credits:1},results:[{title:'Page',url:'https://example.com',content:'text',score:0.9}]});
 assert.deepEqual(output.pairedItem,{item:0});
 const full=context({...parameters,simple:false,options:{...parameters.options,max_results:1}},[{statusCode:200,body:response}],true);
 assert.deepEqual((await new Tavily().execute.call(full))[0][0].json,response);
 assert.equal(full.requests[0].body.max_results,1);
 const ordinary=context({query:'question',topic:'news',options:{}});
 await search.execute.call(ordinary,0);
 assert.deepEqual(ordinary.requests[0].body,{query:'question'});
});

test('Extract retains model depth precedence and literal configured options', async () => {
 const ctx=context({urls:'https://example.com, https://example.org',extractDepth:'model',extractDepthByModel:'advanced',options:{extract_depth:'basic',format:'text',query:'specific facts',include_images:false,timeout:30}},undefined,true);
 await extract.execute.call(ctx,0);
 assert.deepEqual(ctx.requests[0].body,{urls:['https://example.com','https://example.org'],extract_depth:'advanced',format:'text',query:'specific facts',include_images:false,timeout:30});
});

test('All existing operations retain authenticated transport, base URLs and structured API errors', async () => {
 const operations=[
  {resource:'search',operation:'query',query:'q',options:{}},
  {resource:'extract',operation:'urls',urls:['https://example.com'],options:{}},
  {resource:'map',operation:'url',url:'https://example.com',options:{}},
  {resource:'crawl',operation:'url',url:'https://example.com',options:{}},
  {resource:'research',operation:'create',input:'task',options:{}},
  {resource:'research',operation:'status',requestId:'id'},
 ];
 for(const parameters of operations) {
  for(const statusCode of [400,401,429,432,433,503]) {
   const ctx=context(parameters,[{statusCode,body:{detail:{error:'fixture detail'}},headers:{'retry-after':'3'}}]);
   await assert.rejects(()=>new Tavily().execute.call(ctx),error=>error.name==='NodeApiError' && error.httpCode===String(statusCode) && error.context.itemIndex===0 && `${error.message} ${error.description}`.includes('fixture detail'));
   assert.equal(ctx.requests.length,1);
  }
 }
 for(const baseUrl of [undefined,'','https://gateway.example/tavily/']) {
  const ctx=context(operations[0]);
  ctx.getCredentials=async(name)=>{assert.equal(name,'tavilyApi');return {baseUrl};};
  await new Tavily().execute.call(ctx);
  assert.equal(ctx.requests[0].url,baseUrl?'https://gateway.example/tavily/search':'https://api.tavily.com/search');
 }
 const failed={request_id:'id',status:'failed',error:'research stopped'};
 const ctx=context(operations[5],[{statusCode:200,body:failed}]);
 assert.deepEqual((await new Tavily().execute.call(ctx))[0][0].json,failed);
});

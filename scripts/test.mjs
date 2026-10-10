import assert from 'node:assert/strict';
import worker from '../worker/index.js';
const base='https://example.test';
const run=(path,init={},env={})=>worker.fetch(new Request(base+path,init),env);
let response=await run('/');assert.equal(response.status,200);assert.match(await response.text(),/Your question in\. Python code out\./);
assert.deepEqual(await (await run('/api/status')).json(),{ready:false});
assert.equal((await run('/api/solve',{method:'POST'})).status,503);
assert.equal((await run('/api/solve',{method:'POST',headers:{Origin:'https://other.test'}},{OPENAI_API_KEY:'fixture-not-real'})).status,403);
const realFetch=globalThis.fetch;const seen=[];
globalThis.fetch=async(url,init)=>{
 seen.push({url,init});
 if(url.endsWith('/files')&&init.method==='POST'){const purpose=init.body.get('purpose');assert.ok(['vision','user_data'].includes(purpose));assert.equal(init.body.get('expires_after[seconds]'),'86400');return Response.json({id:'file_fixture'+seen.length})}
 if(url.endsWith('/responses')){const body=JSON.parse(init.body);assert.equal(body.text.format.strict,true);assert.equal(body.tools[0].type,'code_interpreter');return Response.json({id:'resp_fixture1',status:'completed',output:[{type:'code_interpreter_call',outputs:[{type:'logs',logs:'6\n'}]},{type:'message',content:[{type:'output_text',text:JSON.stringify({code:'print(2 * 3)'}),annotations:[{type:'container_file_citation',container_id:'cntr_fixture1',file_id:'cfile_fixture1',filename:'chart.png'}]}]}]})}
 if(url.endsWith('/content'))return new Response('file contents');
 throw new Error('Unexpected API call '+url);
};
const env={OPENAI_API_KEY:'fixture-not-real'};
const form=new FormData();form.set('question','Solve the screenshot and analyze my data');form.append('files',new File(['test image bytes'],'question.png',{type:'image/png'}));form.append('files',new File(['x,y\n1,2\n'],'data.csv',{type:'text/csv'}));
response=await run('/api/solve',{method:'POST',body:form,headers:{Origin:base}},env);assert.equal(response.status,200);const data=await response.json();assert.equal(data.code,'print(2 * 3)');assert.equal(data.logs,'6\n');assert.equal(data.files[0].filename,'chart.png');
const body=JSON.parse(seen.find(v=>v.url.endsWith('/responses')).init.body);assert.ok(body.input[0].content.some(v=>v.type==='input_image'));assert.equal(body.tools[0].container.file_ids.length,1);
response=await run('/api/download?container=cntr_fixture1&file=cfile_fixture1',{},env);assert.equal(await response.text(),'file contents');
assert.equal((await run('/api/download?container=bad&file=bad',{},env)).status,400);
const invalid=new FormData();invalid.set('question','test');invalid.append('files',new File(['abc'],'not-supported.exe'));const count=seen.length;assert.equal((await run('/api/solve',{method:'POST',body:invalid},env)).status,400);assert.equal(seen.length,count);
globalThis.fetch=async()=>Response.json({error:{message:'Rate limit reached'}},{status:429});const limited=new FormData();limited.set('question','test');assert.equal((await run('/api/solve',{method:'POST',body:limited},env)).status,429);
globalThis.fetch=realFetch;
console.log('Passed: page, missing connection, origin check, screenshot + CSV requests, code-only response, run output, file download, invalid uploads, API errors. OpenAI calls used fixtures.');

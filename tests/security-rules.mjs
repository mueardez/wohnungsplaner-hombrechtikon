// Read-only rule evaluation; no inventory or photo data is created.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
const project='wohnungsplaner-hombrechtikon';
const token=execFileSync('gcloud',['auth','print-access-token'],{encoding:'utf8'}).trim();
const auth=(verified=true,provider='google.com')=>({uid:'test-member',token:{email:'member@example.com',email_verified:verified,firebase:{sign_in_provider:provider}}});
const mock=(name,value)=>({function:name,args:[{anyValue:{}}],result:{value}});
const run=async(file,testCases)=>{
  const response=await fetch(`https://firebaserules.googleapis.com/v1/projects/${project}:test`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json','X-Goog-User-Project':project},body:JSON.stringify({source:{files:[{name:file,content:fs.readFileSync(file,'utf8')}]},testSuite:{testCases}})});
  const body=await response.json();
  assert.equal(response.status,200,JSON.stringify(body));
  assert.equal(body.testResults?.length,testCases.length,JSON.stringify(body));
  body.testResults.forEach((result,index)=>assert.equal(result.state,'SUCCESS',`${file} case ${index}: ${JSON.stringify(result)}`));
  console.log(`${file}: ${testCases.length} security checks passed`);
};
const dbPath='/databases/(default)/documents/households/hombrechtikon/items/test';
const item={id:'test',title:'Test',description:'',quantity:1};
const c=(expectation,path,method,user,member=true,resource)=>({expectation,request:{path,method,auth:user,...(resource?{resource}: {})},functionMocks:[mock('exists',member)]});
await run('firestore.rules',[
  c('DENY',dbPath,'get',null), c('DENY',dbPath,'get',auth(),false),
  c('DENY',dbPath,'get',auth(false)), c('DENY',dbPath,'get',auth(true,'password')),
  c('ALLOW',dbPath,'get',auth()), c('ALLOW',dbPath,'create',auth(),true,{data:item}),
  c('DENY',dbPath,'create',auth(),true,{data:{...item,quantity:0}}),
  c('DENY','/databases/(default)/documents/access/member@example.com','create',auth(),true,{data:{role:'member'}}),
  c('ALLOW','/databases/(default)/documents/access/member@example.com','get',auth()),
  c('DENY','/databases/(default)/documents/access/other@example.com','get',auth()),
]);
const path='/b/wohnungsplaner-hombrechtikon.firebasestorage.app/o/households/hombrechtikon/photos/test.jpg';
const s=(expectation,method,user,member=true,resource)=>({expectation,request:{path,method,auth:user,...(resource?{resource}: {})},functionMocks:[mock('firestore.exists',member)]});
await run('storage.rules',[
  s('DENY','get',null),s('DENY','get',auth(),false),s('DENY','get',auth(false)),s('DENY','get',auth(true,'password')),
  s('ALLOW','get',auth()),s('ALLOW','create',auth(),true,{size:1000,contentType:'image/jpeg'}),
  s('DENY','create',auth(),true,{size:6*1024*1024,contentType:'image/jpeg'}),
  s('DENY','create',auth(),true,{size:1000,contentType:'text/html'}),s('DENY','update',auth()),s('DENY','delete',auth()),
]);

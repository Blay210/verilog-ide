import assert from 'node:assert/strict';
import { requestFixture } from './semantic-request.mjs';
export async function semanticMergeCalls({before=false,files=300}={}){
  const f=await requestFixture({files,baseline:before?'.dev/cloud/h7q/slang-before.ts':false,bridgeBaseline:before?'.dev/cloud/h7q/analyze-before.py':false});
  try{
    const original=JSON.stringify;let symbols=0,bytes=0;let result;
    JSON.stringify=function(value,...rest){const text=original(value,...rest);if(value?.location&&typeof value.name==='string'&&typeof value.kind==='string'&&typeof value.detail==='string'){symbols++;bytes+=text.length;}return text;};
    const started=performance.now();
    try{result=await f.provider.complete(f.project,[],{file:f.file,offset:f.text.indexOf('$display')});}finally{JSON.stringify=original;}
    assert.ok(result.some(s=>s.name==='dut'));await f.clean();
    return{mode:before?'H7P':'H7Q',files,sources:f.sources,symbolStringifies:symbols,stringifiedCharacters:bytes,wallMs:performance.now()-started,scope:'Actual Node provider/Python; count of semantic-symbol JSON.stringify only. Timings with the counting wrapper are not an uninstrumented latency benchmark.',livePythonAfter:0,originalsPreserved:true};
  }finally{await f.dispose();}
}

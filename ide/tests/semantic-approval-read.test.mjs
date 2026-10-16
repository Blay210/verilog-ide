import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { root } from '../scripts/environment.mjs';
const require=createRequire(import.meta.url),{checkedProcess}=require('../dist/runtime/core/index.js');
test('package approval retries only transient file access with a bound and never hides malformed JSON',async t=>{
 const directory=await fs.mkdtemp(path.join(root,'.dev/approval-read-'));
 t.after(async()=>{assert.equal(path.dirname(directory),path.join(root,'.dev'));await fs.rm(directory,{recursive:true,force:true});});
 const file=path.join(directory,'approval.json');await fs.writeFile(file,'{"protocol":1,"approval":"approved"}');
 const script=`import sys,json,builtins,time\nsys.path.insert(0,${JSON.stringify(path.join(root,'language/python'))})\nimport analyze\nfile=${JSON.stringify(file)}\noriginal=builtins.open\ncalls=0\ndef transient(*args,**kwargs):\n global calls\n calls+=1\n if calls<=2: raise PermissionError('simulated Windows sharing denial')\n return original(*args,**kwargs)\nanalyze.open=transient\nassert analyze.read_package_approval(file,0.5)=={'protocol':1,'approval':'approved'} and calls==3\ndef denied(*args,**kwargs): raise PermissionError('permanent denial')\nanalyze.open=denied\nstarted=time.monotonic()\ntry: analyze.read_package_approval(file,0.03); assert False\nexcept TimeoutError: pass\nassert time.monotonic()-started<1\nanalyze.open=original\nwith original(file,'w') as f: f.write('malformed')\ntry: analyze.read_package_approval(file,0.5); assert False\nexcept json.JSONDecodeError: pass\nprint('bounded sharing retry; malformed protocol remains an error')\n`;
 assert.ok(process.env.RTL_SEMANTIC_PYTHON);
 assert.match(await checkedProcess({executable:process.env.RTL_SEMANTIC_PYTHON,termination:'process',args:['-I','-B','-c',script],cwd:root}),/bounded sharing retry/);
});

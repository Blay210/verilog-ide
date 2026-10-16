import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { build } from 'esbuild';
import { root } from '../environment.mjs';
const require = createRequire(import.meta.url);
const digest = async file => createHash('sha256').update(await fs.readFile(file)).digest('hex');
export async function requestFixture({ files = 300, baseline = false, holdSecond = false, bridgeBaseline = false, completionProfile = false, completionStages = false, enumCacheLimits = false } = {}) {
  const python = process.env.RTL_SEMANTIC_PYTHON;
  assert.ok(python, 'Activate the verified semantic runtime; no silent skip.');
  const directory = await fs.mkdtemp(path.join(root, '.dev/semantic-request-'));
  const projectRoot = path.join(directory, 'project'), cache = path.join(directory, 'cache');
  for (const name of ['rtl','pkg','a','b']) await fs.mkdir(path.join(projectRoot,name),{recursive:true});
  const originals = new Map();
  const put = async (name,text) => { const file=path.join(projectRoot,name);await fs.writeFile(file,text);originals.set(file,text);return file; };
  const pkg = await put('pkg/z-provider.sv','package base; parameter int WIDTH=4; endpackage\n');
  await put('pkg/a-consumer.sv','package consumer; import base::*; parameter int N=WIDTH; endpackage\n');
  await put('rtl/defs.inc','`define BASE consumer::N\n');
  const text='`include "defs.inc"\nmodule dut #(parameter int W=`BASE); logic [W-1:0] local_value; initial $display(local_value); endmodule\n';
  const file=await put('rtl/dut.sv',text);
  for(let i=1;i<files;i++)await put(`rtl/filler-${i}.sv`,`module filler_${i}; endmodule\n`);
  const tests=[];
  for(const [name,width] of [['a',6],['b',8]]){
    await put(`${name}/defs.inc`,`\x60define TEST_WIDTH ${width}\n`);
    const source='`include "defs.inc"\nmodule top; dut #(.W(`TEST_WIDTH)) u(); int '+name+'_only; initial $display('+name+'_only); endmodule\nmodule helper; endmodule\n';
    tests.push({file:await put(`${name}/test.sv`,source),text:source});
  }
  await put('rtl.toml','version=1\n[project]\nname="requests"\n[sources]\nrtl=["rtl/*.sv"]\npackages=["pkg/*.sv"]\n[[test]]\nname="a"\ntop="top"\nsources=["a/*.sv"]\n[[test]]\nname="b"\ntop="top"\nsources=["b/*.sv"]\n');
  const rowsDirectory=path.join(directory,'profile'), gate=path.join(directory,'hold');await fs.mkdir(rowsDirectory);
  // Instrument an owned copy only: profiling is never enabled in the product.
  const bridgeSource=path.join(root,'language/python/analyze.py');
  const bridgeEntry=bridgeBaseline?path.join(root,typeof bridgeBaseline==='string'?bridgeBaseline:'.dev/cloud/h7p/analyze-before.py'):bridgeSource;
  let source=await fs.readFile(bridgeEntry,'utf8');
  const analyzeSignature=source.includes('def analyze(request, retained=None):')?'def analyze(request, retained=None):':'def analyze(request):';
  const edits=[
    [analyzeSignature,analyzeSignature+'\n    _phase("input-read")'],
    ['    tree = slang.syntax.SyntaxTree.fromBuffers','    _phase("parse")\n    tree = slang.syntax.SyntaxTree.fromBuffers'],
    ["    if request.get('operation') == 'dependencies':","    _phase(\"dependency\" if request.get('operation') == 'dependencies' else \"selected-elaboration\")\n    if request.get('operation') == 'dependencies':"],
    ['    root.visit(visit)','    _phase("selected-traversal-diagnostics")\n    root.visit(visit)'],
    ['    options = slang.ast.CompilationOptions()','    _phase("default-elaboration-signatures")\n    options = slang.ast.CompilationOptions()'],
    ["    files = {os.path.abspath(file) for file in request['sources']}","    _phase(\"input-tracking\")\n    files = {os.path.abspath(file) for file in request['sources']}"],
    ["    if request.get('query'):","    _phase(\"completion\")\n    if request.get('query'):"],
  ];
  for(const [needle,replacement]of edits){assert.equal(source.split(needle).length,2,`Profile boundary changed: ${needle}`);source=source.replace(needle,replacement);}
  if(source.includes("channel['graph']")){
    const approval="        continuation = read_package_approval(channel['continue'])";
    const waits=source.includes(approval)?[[approval,"        _phase('package-core-wait')\n"+approval+"\n        _phase('package-continue-read')"]]:[["        deadline = time.monotonic() + 15","        _phase('package-core-wait')\n        deadline = time.monotonic() + 15"],["        with open(channel['continue'],","        _phase('package-continue-read')\n        with open(channel['continue'],"]];
    for(const [needle,replacement]of [["        with open(channel['graph'] + '.tmp'","        _phase('package-graph-write')\n        with open(channel['graph'] + '.tmp'"],...waits]){assert.equal(source.split(needle).length,2);source=source.replace(needle,replacement);}
  }
  const instrumented=path.join(directory,'instrumented.py');await fs.writeFile(instrumented,source);
  const bridge=path.join(directory,'bridge.py');
  if(enumCacheLimits){
    assert.ok(Object.entries(enumCacheLimits).every(([key,value])=>['max_types','max_values','max_bytes'].includes(key)&&Number.isInteger(value)&&value>=0));
    assert.equal(source.split('enum_values = ScopeEnumValues()').length,2);
    source=source.replace('enum_values = ScopeEnumValues()',`enum_values = ScopeEnumValues(**json.loads(${JSON.stringify(JSON.stringify(enumCacheLimits))}))`);
  }
  if(completionProfile){assert.ok(source.includes('scope.lookupName('));source=source.replaceAll('scope.lookupName(','_measured_lookup(scope,');}
  if(completionStages){
    const membershipBoundary=source.includes("    filename = os.path.normcase(os.path.realpath(query['file']))")?"    filename = os.path.normcase(os.path.realpath(query['file']))":"    filename = canonical(query['file'])";
    const scopeBoundary=source.includes("    primary_names, primary_ranges = inventory(compilation, 'primary')")?"    primary_names, primary_ranges = inventory(compilation, 'primary')":'    compilation.getRoot().visit(collect)';
    const packageBoundary=source.includes("    if 'package_names' not in index:")?"    if 'package_names' not in index:":"\n    for package in compilation.getPackages():";
    for(const [needle,name]of [[membershipBoundary,'completion-membership'],[scopeBoundary,'completion-candidate-scopes'],[packageBoundary,'completion-package-names'],['    smallest = min(size for size, _ in scopes)','completion-lookup-enum'],['    visible = [value for name, value in results[0].items()','completion-agreement-definitions']]){
      assert.equal(source.split(needle).length,2);const prefix=needle.startsWith('\n')?'\n':'';source=source.replace(needle,prefix+`    _phase(${JSON.stringify(name)})\n`+needle.trimStart().padStart(needle.trimStart().length+4,' '));
    }
    await fs.writeFile(instrumented,source);
  }else if(completionProfile||enumCacheLimits)await fs.writeFile(instrumented,source);
  const completionInstrumentation=completionProfile?`_counts=0
_wall=_cpu=0
def _measured_lookup(scope,*args):
    global _counts,_wall,_cpu
    _counts+=1
    wall=time.perf_counter(); cpu=time.process_time()
    try: return scope.lookupName(*args)
    finally:
        _wall+=(time.perf_counter()-wall)*1000
        _cpu+=(time.process_time()-cpu)*1000
ns['_measured_lookup']=_measured_lookup
_original_complete=ns['complete']
def _profile_complete(*args,**kwargs):
    global _counts,_wall,_cpu
    _counts=0; _wall=_cpu=0
    try: return _original_complete(*args,**kwargs)
    finally: log({'completionProfile':True,'lookupCalls':_counts,'nativeLookupWallMs':_wall,'nativeLookupCpuMs':_cpu})
ns['complete']=_profile_complete
` : '';
  await fs.writeFile(bridge,`import os,sys,json,time\nrows=${JSON.stringify(rowsDirectory)}\nsequence=0\ndef log(value):\n    global sequence\n    sequence+=1\n    record=os.path.join(rows,f'{time.time_ns():020d}-{os.getpid():010d}-{sequence:08d}.json')\n    with open(record+'.tmp','w',encoding='utf-8') as f: json.dump({'pid':os.getpid(),**value},f)\n    os.replace(record+'.tmp',record)\nactive=None\nwall=cpu=0\ndef phase(name):\n    global active,wall,cpu\n    now=time.perf_counter(); used=time.process_time()\n    if active is not None: log({'phase':active,'wallMs':(now-wall)*1000,'cpuMs':(used-cpu)*1000})\n    active=name; wall=now; cpu=used\nwith open(sys.argv[1],encoding='utf-8') as f: request=json.load(f)\nlog({'launch':True,'operation':request.get('operation','analysis'),'query':bool(request.get('query')),'root':os.getcwd()})\nphase('bridge-import')\nns={'__name__':'h7n_profile','__file__':${JSON.stringify(bridgeSource)},'_phase':phase}\nwith open(${JSON.stringify(instrumented)},encoding='utf-8') as f: exec(compile(f.read(),ns['__file__'],'exec'),ns)\nphase(None)\noriginal=ns['analyze']\ndef call(value):\n    log({'groupStart':True,'operation':value.get('operation'),'top':value.get('top'),'sources':len(value['sources'])})\n    ${holdSecond ? `if any('/b/' in file.replace('\\\\','/') for file in value['sources']):\n        log({'held':True})\n        while os.path.exists(${JSON.stringify(gate)}): time.sleep(0.02)` : 'pass'}\n    try: return original(value)\n    finally: phase(None)\nns['analyze']=call\n${completionInstrumentation}result=ns.get('run_request',call)(request)\nphase('serialization')\nwith open(sys.argv[2],'w',encoding='utf-8') as f: json.dump(result,f,ensure_ascii=False)\nphase(None)\ntry:\n    import resource\n    peak=resource.getrusage(resource.RUSAGE_SELF).ru_maxrss * (1 if sys.platform == 'darwin' else 1024)\nexcept ImportError:\n    peak=None\nlog({'done':True,'peakRssBytes':peak})\n`);
  const { loadProject }=require('../../dist/runtime/core/config.js');const project=await loadProject(projectRoot);
  const providerEntry=baseline?path.join(root,typeof baseline==='string'?baseline:'.dev/cloud/h7n/slang-before.ts'):path.join(root,'runtime/semantic/slang.ts');
  const providerOutput=path.join(directory,'provider.cjs');
  await build({stdin:{contents:await fs.readFile(providerEntry,'utf8'),loader:'ts',resolveDir:path.join(root,'runtime/semantic'),sourcefile:'slang.ts'},outfile:providerOutput,bundle:true,platform:'node',format:'cjs'});
  const { SlangProvider }=require(providerOutput);const provider=new SlangProvider(python,bridge,cache);
  const rows=async()=>Promise.all((await fs.readdir(rowsDirectory)).filter(name=>name.endsWith('.json')).sort().map(async name=>JSON.parse(await fs.readFile(path.join(rowsDirectory,name),'utf8'))));
  const clean=async()=>{for(const row of(await rows()).filter(row=>row.launch))assert.throws(()=>process.kill(row.pid,0),{code:'ESRCH'});assert.deepEqual(await fs.readdir(cache),[]);for(const [file,text]of originals)assert.equal(await fs.readFile(file,'utf8'),text);};
  return {directory,projectRoot,project,provider,cache,file,text,pkg,tests,gate,bridge,rows,clean,sources:{provider:await digest(providerEntry),bridge:await digest(bridgeEntry)},dispose:()=>fs.rm(directory,{recursive:true,force:true})};
}
export async function semanticRequest({ before=false, files=300, bridgeBaseline=false, hierarchy=false, large=false, providerBaseline=false, completionStages=false }={}) {
  const f=await requestFixture({baseline:providerBaseline||before,files,bridgeBaseline,completionStages});
  const receipt={mode:providerBaseline||typeof bridgeBaseline==='string'?'private provider/bridge baseline':bridgeBaseline?'H7O bridge':before?'H7M provider/current bridge':'H7S',files,large,scope:'Actual provider/Python/slang; isolated tests in one project. Stage profiling uses an owned instrumented bridge; wall clocks are observations, no native UI claim.',sources:f.sources,phases:[]};
  const text=large?'// 한글 😀 é\r\n'.repeat(2000)+'`include "defs.inc"\r\nmodule dut #(parameter int W=`BASE)('+Array.from({length:96},(_,i)=>'input logic [W-1:0] p'+i).join(',')+');\r\nlogic [W-1:0] local_value;\r\n'+Array.from({length:128},(_,i)=>'int common_'+i+';').join('\r\n')+'\r\ninitial $display(local_value); endmodule\r\n':f.text;
  const initialOverlays=large?[{file:f.file,text}]:[];
  try{
    const phase=async(name,operation)=>{const start=(await f.rows()).length,clock=performance.now(),cpuStart=process.cpuUsage();const result=await operation();const wallMs=performance.now()-clock,cpu=process.cpuUsage(cpuStart),rows=(await f.rows()).slice(start);
      const normalized=JSON.stringify(result).replaceAll(JSON.stringify(f.projectRoot).slice(1,-1),'$PROJECT');
      receipt.phases.push({name,wallMs,nodeCpuMs:(cpu.user+cpu.system)/1000,semanticHash:createHash('sha256').update(normalized).digest('hex'),launches:rows.filter(r=>r.launch).length,groups:rows.filter(r=>r.groupStart).length,peakPythonRssBytes:Math.max(...rows.filter(r=>r.done).map(r=>r.peakRssBytes??0)),stages:rows.filter(r=>r.phase)});return result;};
    const analyzed=await phase('analysis-two-tests',()=>f.provider.analyze(f.project,initialOverlays));
    assert.equal(analyzed.diagnostics.filter(d=>d.severity==='error').length,0,JSON.stringify(analyzed.diagnostics));
    for(const test of f.tests)assert.ok(analyzed.inputs.files.includes(test.file));
    const overlays=[{file:f.file,text:text.replaceAll('local_value','fresh_value')},{file:f.pkg,text:'package base; parameter int WIDTH=5; endpackage\n'}];
    const shared=await phase('unsaved-shared-completion',()=>f.provider.complete(f.project,overlays,{file:f.file,offset:overlays[0].text.indexOf('$display')}));
    assert.ok(!shared.some(s=>['local_value','fresh_value','a_only','b_only'].includes(s.name)),'Width disagreement and other test scopes must not leak.');
    const chosen=await phase('one-test-completion',()=>f.provider.complete(f.project,overlays,{file:f.tests[0].file,offset:f.tests[0].text.indexOf('$display')}));
    assert.ok(chosen.some(s=>s.name==='a_only'));assert.ok(!chosen.some(s=>s.name==='b_only'));
    if(hierarchy){const design=await phase('hierarchy-one-test',()=>f.provider.hierarchy(f.project,'a',initialOverlays,undefined));assert.equal(design.diagnostics.some(d=>d.severity==='error'),false);assert.ok(design.roots.length>0);}
    await f.clean();receipt.livePythonAfter=0;receipt.tempEntriesAfter=[];receipt.originalsPreserved=true;return receipt;
  }finally{await f.dispose();}
}

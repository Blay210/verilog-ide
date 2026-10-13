import fs from 'node:fs/promises';
import { requestFixture } from './semantic-request.mjs';
export async function semanticPositionCalls({before=false}={}){
  const f=await requestFixture({bridgeBaseline:before});
  try{
    let source=await fs.readFile(f.bridge,'utf8');source=source.replace('import os,sys,json,time','import os,sys,json,time,cProfile,pstats');
    const original='    try: return original(value)\n    finally: phase(None)';
    const replacement=`    profiler=cProfile.Profile()\n    profiler.enable()\n    try: return original(value)\n    finally:\n        profiler.disable()\n        stats=pstats.Stats(profiler).stats\n        counts={key[2]:value[1] for key,value in stats.items() if key[2] in ('realpath','<built-in method posix.lstat>')}\n        log({'calls':counts})\n        phase(None)`;
    if(!source.includes(original))throw Error('Private profiler boundary changed.');source=source.replace(original,replacement);await fs.writeFile(f.bridge,source);
    await f.provider.complete(f.project,[],{file:f.file,offset:f.text.indexOf('$display')});await f.clean();
    return {mode:before?'H7O':'H7P',scope:'Actual Python/slang; cProfile call counts only, not timed latency/native I/O.',sources:f.sources,groups:(await f.rows()).filter(row=>row.calls),livePythonAfter:0,originalsPreserved:true};
  }finally{await f.dispose();}
}

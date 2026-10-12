import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
const { ToolSetupService } = createRequire(import.meta.url)('../dist/runtime/tool-setup.js');
const home = path.resolve(process.env.RTL_DEV_HOME ?? path.join(os.homedir(), '.rtl-dev'));
const receipt = { installs: 0, checks: [] };
for (const kind of ['simulation', 'language']) {
  const service = new ToolSetupService(home, []);
  const state = await service.prepare(kind, true);
  if (state.phase === 'failed') throw Error(state.error);
  receipt.checks.push({ kind, phase: state.phase, location: state.plan?.location, components: state.plan?.components });
  // Never installs. Report/decline any missing components instead of auto-approving.
  if (state.phase === 'awaitingApproval') await service.approve(state.plan.id, false, true);
  await service.close();
}
fs.writeFileSync(new URL('../.dev/h3j-existing-tools.json', import.meta.url), JSON.stringify(receipt, null, 2));
console.log(JSON.stringify(receipt));

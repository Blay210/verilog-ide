import * as vscode from 'vscode';
import assert from 'node:assert/strict';
import path from 'node:path';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { readHistory } from '@rtl-dev/core';
import type { InternalGraph } from '@rtl-dev/semantic';

export async function run(): Promise<void> {
  await vscode.extensions.getExtension('rtl-dev-local.rtl-dev')!.activate();
  const root = vscode.workspace.workspaceFolders![0].uri.fsPath;
  const state = () => vscode.commands.executeCommand<any>('rtl.getStructure');
  await vscode.commands.executeCommand('rtl.showStructure', 'mac');
  for (const id of ['probe_tb.dut.counter', 'probe_tb.dut.adder']) {
    await vscode.commands.executeCommand('rtl.inspectStructure', id);
    const graph = await vscode.commands.executeCommand<InternalGraph>('rtl.showInternalOperations');
    assert.equal(graph?.status, 'supported', graph?.reason);
    assert.equal((await state()).operations.instanceId, id);
    const tabs = vscode.window.tabGroups.all.flatMap(g => g.tabs);
    assert.ok(tabs.some(t => t.input instanceof vscode.TabInputWebview && t.label.includes('RTL Structure')), JSON.stringify(tabs.map(t => ({ label: t.label, input: t.input }))));
    const node = graph.nodes.find(n => n.kind === 'operator')!;
    await vscode.commands.executeCommand('rtl.openInternalOperationSource', node.id);
    assert.equal(vscode.window.activeTextEditor?.document.uri.fsPath.toLowerCase(), node.source!.file.toLowerCase());
    assert.equal(vscode.window.activeTextEditor?.selection.active.line, node.source!.line);
  }
  await vscode.commands.executeCommand('rtl.structureUp');
  assert.equal((await state()).operations, undefined);
  const unsupported = await vscode.commands.executeCommand<InternalGraph>('rtl.showInternalOperations');
  assert.equal(unsupported?.status, 'unsupported'); assert.match(unsupported.reason, /leaf/);
  await vscode.commands.executeCommand('rtl.inspectStructure', 'probe_tb.dut.counter');
  await vscode.commands.executeCommand('rtl.showInternalOperations');
  const editor = await vscode.window.showTextDocument(vscode.Uri.file(path.join(root, 'design.sv')));
  await editor.edit(edit => edit.insert(new vscode.Position(0, 0), '// unsaved E1\n'));
  assert.equal((await state()).stale, true); assert.equal((await state()).operations, undefined);
  await vscode.commands.executeCommand('rtl.refreshStructure');
  assert.equal((await state()).stale, false);
  await vscode.commands.executeCommand('rtl.inspectStructure', 'probe_tb.dut.counter');
  assert.equal((await vscode.commands.executeCommand<InternalGraph>('rtl.showInternalOperations'))?.status, 'supported');
  // Existing simulation and retained-source analysis must use the same new bridge.
  await vscode.commands.executeCommand('rtl.runAll');
  const history = await readHistory(root); assert.equal(history[0]?.status, 'passed', history[0]?.message);
  await vscode.commands.executeCommand('rtl.showRecordedStructure', history[0]);
  await vscode.commands.executeCommand('rtl.inspectStructure', 'probe_tb.dut.adder');
  const recorded = await vscode.commands.executeCommand<InternalGraph>('rtl.showInternalOperations');
  assert.equal(recorded?.status, 'supported', recorded?.reason);
  const source = recorded.nodes.find(n => n.kind === 'operator')!;
  await vscode.commands.executeCommand('rtl.openInternalOperationSource', source.id);
  assert.equal(vscode.window.activeTextEditor?.document.uri.scheme, 'rtl-recorded');
  const waitFor = async (check: () => Promise<boolean>) => {
    for (let i = 0; i < 100; i++) { if (await check()) return; await new Promise(resolve => setTimeout(resolve, 100)); }
    assert.fail('Timed out waiting for E2 recorded observation');
  };
  const checkValue = async (name: string, bits: string) => {
    const current = await state();
    const signals = current.operations.nodes.filter((n: any) => n.kind === 'signal' && n.signalName !== undefined);
    const id = String(signals.findIndex((n: any) => n.signalName === name));
    assert.notEqual(id, '-1'); assert.equal(current.trace.values[id]?.reason, bits, JSON.stringify(current.trace));
    assert.equal(current.trace.bindings.find((b: any) => b.port === name)?.state, 'matched');
  };
  for (const [instance, width] of [['mac8', 16], ['mac4', 8]] as const) {
    await vscode.commands.executeCommand('rtl.inspectStructure', 'probe_tb.dut.' + instance);
    assert.equal((await vscode.commands.executeCommand<InternalGraph>('rtl.showInternalOperations'))?.status, 'supported');
    await vscode.commands.executeCommand('rtl.setStructureTime', '26000');
    await checkValue('product', (21).toString(2).padStart(width, '0'));
    await checkValue('acc', (21).toString(2).padStart(width, '0'));
    await vscode.commands.executeCommand('rtl.setStructureTime', '56000');
    await checkValue('stage', BigInt.asUintN(width, -6n).toString(2).padStart(width, '0'));
    await checkValue('acc', (36).toString(2).padStart(width, '0'));
  }
  await vscode.commands.executeCommand('rtl.openWaveform', history[0].waveform);
  await waitFor(async () => (await vscode.commands.executeCommand<any[]>('rtl.getWaveformState'))!.some(w => w.link?.runId === history[0].runId && w.link.state === 'ready'));
  await vscode.commands.executeCommand('rtl.setWaveformTime', history[0].waveform, '26000');
  await waitFor(async () => { const s = await state(); return s.trace.cursor === '26000' && Object.values(s.trace.values).some((v:any) => v.reason === '00010101'); });
  await checkValue('stage', '00010101');
  await vscode.commands.executeCommand('rtl.setStructureTime', '56000');
  await waitFor(async () => (await vscode.commands.executeCommand<any[]>('rtl.getWaveformState'))!.some(w => w.link?.runId === history[0].runId && w.link.time === '56000'));
  const structureTab = vscode.window.tabGroups.all.flatMap(g => g.tabs).find(t => t.input instanceof vscode.TabInputWebview && t.label.startsWith('Recorded RTL Structure'));
  assert.ok(structureTab); assert.equal(await vscode.window.tabGroups.close(structureTab), true);
  await vscode.commands.executeCommand('rtl.setWaveformTime', history[0].waveform, '26000');
  assert.ok((await vscode.commands.executeCommand<any[]>('rtl.getWaveformState'))!.some(w => w.link?.runId === history[0].runId && w.link.state === 'ready' && w.link.time === '26000'));
  await vscode.commands.executeCommand('rtl.showRecordedStructure', history[0]);
  await vscode.commands.executeCommand('rtl.inspectStructure', 'probe_tb.dut.mac4');
  await vscode.commands.executeCommand('rtl.showInternalOperations');
  await checkValue('stage', '00010101');
  const original = await readFile(path.join(root, 'design.sv'));
  try {
    await writeFile(path.join(root, 'design.sv'), 'invalid current source');
    await new Promise(resolve => setTimeout(resolve, 400));
    assert.equal((await state()).stale, false);
    await vscode.commands.executeCommand('rtl.setStructureTime', '26000');
    await checkValue('product', '00010101');
  } finally { await writeFile(path.join(root, 'design.sv'), original); }
  const waveBytes = await readFile(history[0].waveform!);
  try {
    await writeFile(history[0].waveform!, 'damaged E2 trace');
    await waitFor(async () => (await state()).trace.state === 'unavailable');
    const damaged = await state();
    assert.equal(damaged.stale, false); assert.equal(damaged.operations.status, 'supported');
    assert.ok(Object.values(damaged.trace.values).every((v:any) => v.text === 'Unavailable' && v.reason !== '00010101'));
  } finally { await writeFile(history[0].waveform!, waveBytes); }
  await new Promise(resolve => setTimeout(resolve, 400));
  await vscode.commands.executeCommand('rtl.refreshStructure');
  await vscode.commands.executeCommand('rtl.inspectStructure', 'probe_tb.dut.mac4');
  await vscode.commands.executeCommand('rtl.showInternalOperations');
  await vscode.commands.executeCommand('rtl.setStructureTime', '56000');
  await checkValue('stage', '11111010');
  const oldWaveTab = vscode.window.tabGroups.all.flatMap(g => g.tabs).find(t => t.input instanceof vscode.TabInputCustom && t.input.uri.fsPath.toLowerCase() === history[0].waveform!.toLowerCase());
  assert.ok(oldWaveTab); await vscode.window.tabGroups.close(oldWaveTab);
  await vscode.commands.executeCommand('rtl.openWaveform', history[0].waveform);
  await waitFor(async () => (await vscode.commands.executeCommand<any[]>('rtl.getWaveformState'))!.some(w => w.link?.runId === history[0].runId && w.link.state === 'ready'));
  const clock = (await state()).trace.bindings.find((b:any) => b.port === 'clk');
  assert.equal(clock.state, 'matched');
  assert.equal(await vscode.commands.executeCommand('rtl.chooseStructureClock', clock.signalId), clock.signalId);
  assert.equal(await vscode.commands.executeCommand('rtl.moveStructureClock', -1, 'rising'), '55000');
  await waitFor(async () => (await vscode.commands.executeCommand<any[]>('rtl.getWaveformState'))!.some(w => w.link?.runId === history[0].runId && w.link.time === '55000'));
  await checkValue('stage', '11111010');
  assert.equal(await vscode.commands.executeCommand('rtl.moveStructureClock', -1, 'rising'), '45000');
  await checkValue('acc', '00101010');
  assert.equal(await vscode.commands.executeCommand('rtl.moveStructureClock', 1, 'rising'), '55000');
  assert.equal(await vscode.commands.executeCommand('rtl.moveStructureClock', 1, 'rising'), undefined);
  assert.equal((await state()).trace.cursor, '55000');
  assert.equal(await vscode.commands.executeCommand('rtl.moveStructureClock', -1, 'falling'), '50000');
  await vscode.commands.executeCommand('rtl.setStructureTime', '0');
  assert.equal(await vscode.commands.executeCommand('rtl.moveStructureClock', -1, 'rising'), undefined);
  assert.equal((await state()).trace.cursor, '0');
  assert.equal(await vscode.commands.executeCommand('rtl.moveStructureClock', 1, 'rising'), '5000');
  await waitFor(async () => (await vscode.commands.executeCommand<any[]>('rtl.getWaveformState'))!.some(w => w.link?.runId === history[0].runId && w.link.time === '5000'));
  await mkdir(path.join(root, '.rtl'), { recursive: true });
  await writeFile(path.join(root, '.rtl/e1-host.json'), JSON.stringify({ passed: true, currentGraph: true, sourceNavigation: true, unsavedInvalidation: true, unsupported: true, simulation: history[0].status, recordedGraph: true, recordedSource: true, internalValues: true, parameterWidths: true, sharedCursor: true, peerCloseReopen: true, traceDamageRecovery: true, currentSourceIsolation: true }, null, 2));
  await writeFile(path.join(root, '.rtl/d4-host.json'), JSON.stringify({passed:true,explicitClock:true,risingFalling:true,strictEdges:true,firstLast:true,recordedValues:true},null,2));
  console.log('RTL_D4_HOST_PASS: explicit clock / strict rising-falling / first-last / observed state');
}

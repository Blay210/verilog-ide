import assert from 'node:assert/strict';
import fs from 'node:fs';
globalThis._VSCODE_PRODUCT_JSON = JSON.parse(fs.readFileSync(new URL('../upstream/product.json', import.meta.url), 'utf8'));
globalThis._VSCODE_PACKAGE_JSON = JSON.parse(fs.readFileSync(new URL('../upstream/package.json', import.meta.url), 'utf8'));
const { default: product } = await import('../upstream/out/vs/platform/product/common/product.js');
const { NativeExtensionsScannerService } = await import('../upstream/out/vs/platform/extensionManagement/common/extensionsScannerService.js');
const { AgentHostEnablementService } = await import('../upstream/out/vs/platform/agentHost/browser/agentHostEnablementService.js');
const { AbstractNativeEnvironmentService } = await import('../upstream/out/vs/platform/environment/common/environmentService.js');
// Verify the compiled scanner stops before profile/filesystem access for RTL,
// while the upstream product still reaches its normal scanner entry.
const scanUsers = NativeExtensionsScannerService.prototype.scanUserExtensions;
const scanSentinel = new Error('upstream scan entry');
const scannerContext = applicationName => ({
  productService: { applicationName },
  logService: { trace() { throw scanSentinel; } },
});
assert.deepEqual(await scanUsers.call(scannerContext('rtl-ide'), {}), []);
console.log('PASS compiled RTL user scan excluded before filesystem access');
await assert.rejects(scanUsers.call(scannerContext('code-oss'), {}), error => error === scanSentinel);
console.log('PASS compiled Code-OSS user scan remains available');
const debugGetter = Object.getOwnPropertyDescriptor(AbstractNativeEnvironmentService.prototype, 'debugExtensionHost').get;
for (const [args, applicationName, expectedPort, expectedBreak] of [
  [{}, 'rtl-ide', null, false], [{}, 'code-oss', 5870, false],
  [{ 'inspect-extensions': '9231' }, 'rtl-ide', 9231, false],
  [{ 'inspect-brk-extensions': '9232' }, 'rtl-ide', 9232, true],
]) {
  const debug = debugGetter.call({ args, isBuilt: false, productService: { applicationName } });
  assert.equal(debug.port, expectedPort);
  assert.equal(debug.break, expectedBreak);
  console.log(`PASS compiled inspector defaults/explicit request: ${applicationName} ${expectedPort}`);
}

// Exercise compiled services after compile:core, not a copied policy function.
assert.equal(product.applicationName, 'rtl-ide');
const ids = ['vscode.vscode-api-tests', 'VSCODE.VSCODE-TEST-RESOLVER', 'vscode.debug-auto-launch', 'vscode.git', 'vscode.json-language-features'];
const extensions = ids.map(id => ({ identifier: { id } }));
for (const applicationName of ['rtl-ide', 'code-oss']) {
  const context = {
    productService: { applicationName }, environmentService: {},
    scanDefaultSystemExtensions: async () => extensions.slice(0, 2),
    scanDevSystemExtensions: async () => extensions.slice(2),
    applyScanOptions: result => result,
  };
  const scanned = await NativeExtensionsScannerService.prototype.scanSystemExtensions.call(context, {});
  assert.deepEqual(scanned.map(ext => ext.identifier.id), applicationName === 'rtl-ide' ? ids.slice(3) : ids);
  console.log(`PASS compiled system scanning: ${applicationName}`);
}
const neverEvent = () => ({ dispose() {} });
for (const setting of [true, false]) {
  const configuration = { getValue: () => setting, onDidChangeConfiguration: neverEvent };
  const contextKeys = { createKey: () => ({ set() {}, reset() {}, get: () => undefined }) };
  const managed = { onDidChangeManagedSettings: neverEvent, getManagedSettingValue: () => undefined };
  const service = new AgentHostEnablementService(true, configuration, contextKeys, managed);
  assert.equal(service.enabled.get(), false);
  service.dispose();
  console.log(`PASS compiled RTL agent enablement with disabled setting ${setting}`);
}

import assert from 'node:assert/strict';
import fs from 'node:fs';
globalThis._VSCODE_PRODUCT_JSON = JSON.parse(fs.readFileSync(new URL('../upstream/product.json', import.meta.url), 'utf8'));
globalThis._VSCODE_PACKAGE_JSON = JSON.parse(fs.readFileSync(new URL('../upstream/package.json', import.meta.url), 'utf8'));
const { default: product } = await import('../upstream/out/vs/platform/product/common/product.js');
const { LanguageDetectionService, LanguageDetectionWorkerClient } = await import('../upstream/out/vs/workbench/services/languageDetection/browser/languageDetectionWorkerServiceImpl.js');
const original = product.applicationName;
let passed = 0;
try {
  for (const applicationName of ['rtl-ide', 'code-oss']) {
    product.applicationName = applicationName;
    for (const quickGuess of [undefined, 'json']) {
      let workerCalls = 0;
      const context = {
        _guessLanguageIdByUri: () => quickGuess,
        _getOrCreateLanguageDetectionWorker: () => {
          workerCalls++;
          return { workerClient: { proxy: { $detectLanguage: async () => 'javascript' } }, workerTextModelSyncClient: { ensureSyncedResources() {} } };
        },
        getLanguageId: value => value,
        _telemetryService: { publicLog2() {} },
      };
      const result = await LanguageDetectionWorkerClient.prototype.detectLanguage.call(context, { toString: () => 'file:///probe.unknown' }, undefined, false);
      assert.equal(result, quickGuess ?? (applicationName === 'rtl-ide' ? undefined : 'javascript'));
      assert.equal(workerCalls, !quickGuess && applicationName === 'code-oss' ? 1 : 0);
      console.log(`PASS compiled detection: ${applicationName} ${quickGuess ?? 'unknown'}`);
      passed++;
    }
    let settingsCalls = 0;
    const context = {
      _configurationService: { getValue: () => { settingsCalls++; return false; } },
      _languageDetectionWorkerClient: { detectLanguage: async (_uri, biases, history, langs) => {
        assert.equal(biases, undefined); assert.equal(history, false); assert.deepEqual(langs, ['json']); return 'json';
      } },
    };
    assert.equal(await LanguageDetectionService.prototype.detectLanguage.call(context, {}, ['json']), 'json');
    assert.equal(settingsCalls, applicationName === 'rtl-ide' ? 0 : 2);
    console.log(`PASS compiled history boundary: ${applicationName}`);
    passed++;
  }
} finally { product.applicationName = original; }
assert.equal(passed, 6);

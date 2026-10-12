import assert from 'node:assert/strict';
import { ExtensionManagementService } from '../upstream/out/vs/platform/extensionManagement/node/extensionManagementService.js';
import { AbstractExtensionManagementService } from '../upstream/out/vs/platform/extensionManagement/common/abstractExtensionManagementService.js';

// Invoke compiled entry points with no network/filesystem collaborators.
// Rejection must happen before any collaborator is accessed.
const context = { productService: { applicationName: 'rtl-ide' } };
const checks = [
  [ExtensionManagementService.prototype, 'install', [{}]],
  [ExtensionManagementService.prototype, 'installFromLocation', [{}, {}]],
  [ExtensionManagementService.prototype, 'installExtensionsFromProfile', [[], {}, {}]],
  [AbstractExtensionManagementService.prototype, 'installGalleryExtensions', [[]]],
  [AbstractExtensionManagementService.prototype, 'installExtensions', [[]]],
];
for (const [prototype, method, args] of checks) {
  await assert.rejects(prototype[method].apply(context, args), /External extensions are not supported in RTL IDE/);
  console.log(`PASS compiled ${method}: rejected before side effects`);
}

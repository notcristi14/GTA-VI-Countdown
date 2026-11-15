'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { scanFeatureMarkers } = require('../scripts/feature-marker-scan');

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'feature-marker-test-'));
try {
  fs.mkdirSync(path.join(root, 'src'), { recursive: true });
  fs.mkdirSync(path.join(root, 'test'), { recursive: true });
  fs.writeFileSync(path.join(root, 'src', 'feature.js'), [
    '// @feature id="countdown-pulse" title="Animated countdown pulse" group="Website · visual effects" scopes="all"',
    'function pulse() {}',
    '// @feature id="android-shortcut" title="Android shortcut" group="Android" scopes="mobile"'
  ].join('\n'));
  fs.writeFileSync(path.join(root, 'test', 'ignored.js'), '// @feature id="ignored" title="Ignored" group="Test" scopes="all"');

  const result = scanFeatureMarkers(root);
  assert.strictEqual(result.features.length, 2);
  assert.strictEqual(result.checks.every((item) => item.ok), true);
  assert.strictEqual(result.features[0].id, 'countdown-pulse');
  assert.strictEqual(result.features[0].scopes[0], 'all');
  assert.strictEqual(result.sourceFilesScanned, 1);

  fs.appendFileSync(path.join(root, 'src', 'feature.js'), '\n// @feature id="countdown-pulse" title="Duplicate" group="Website" scopes="all"');
  const duplicate = scanFeatureMarkers(root);
  assert.strictEqual(duplicate.checks.some((item) => !item.ok && item.detail.includes('duplicate feature id')), true);

  fs.appendFileSync(path.join(root, 'src', 'feature.js'), '\n// @feature id="bad_scope" title="Bad" group="Website" scopes="unknown"');
  const invalid = scanFeatureMarkers(root);
  assert.strictEqual(invalid.checks.some((item) => !item.ok && item.detail.includes('invalid scopes')), true);
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}

console.log('Feature marker scanner tests: discovery, scope filtering, duplicate and invalid metadata checks passed.');

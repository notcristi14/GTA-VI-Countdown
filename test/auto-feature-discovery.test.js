'use strict';
const assert = require('assert');
const { annotateSource } = require('../scripts/auto-feature-discovery');

const before = 'function existingThing() {}\n';
const after = [
  'function existingThing() {}',
  'async function loadNewTrailer() {}',
  'const toggleMusicPanel = () => {}',
  'function helperOnly() {}'
].join('\n');
const result = annotateSource(after, 'app.js', before);
assert.strictEqual(result.added.length, 2);
assert.deepStrictEqual(result.added.map((item) => item.id).sort(), ['load-new-trailer', 'toggle-music-panel']);
assert.match(result.content, /\/\/ @feature id="load-new-trailer" title="Load New Trailer" group="Website · automatically discovered" scopes="all"/);
assert.match(result.content, /\/\/ @feature id="toggle-music-panel"/);
assert.doesNotMatch(result.content, /@feature id="helper-only"/);

const swift = annotateSource('func refreshCountdown() {\n}\n', 'mobile/ios/VICountdown/ViewController.swift', '');
assert.strictEqual(swift.added[0].group, 'iOS');
assert.match(swift.content, /\/\/ @feature id="refresh-countdown"/);

const repeated = annotateSource(result.content, 'app.js', before);
assert.strictEqual(repeated.added.length, 0);
console.log('Automatic feature discovery tests: new feature candidates, metadata, language scope and idempotence passed.');

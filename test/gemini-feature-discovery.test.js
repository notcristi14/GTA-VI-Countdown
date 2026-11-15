'use strict';
const assert = require('assert');
const { parseModelFeatures } = require('../scripts/gemini-feature-discovery');

const candidates = [
  { functionName: 'refreshNews', file: 'app.js', defaultGroup: 'Website · automatically discovered', context: 'function refreshNews() {}' },
  { functionName: 'tinyHelper', file: 'app.js', defaultGroup: 'Website · automatically discovered', context: 'function tinyHelper() {}' }
];
const valid = {
  candidates: [{
    content: {
      parts: [{
        text: JSON.stringify({
          features: [
            { functionName: 'refreshNews', id: 'refresh-news', title: 'Refresh News', group: 'Website', scopes: ['root'] },
            { functionName: 'not-a-real-function', id: 'fake-feature', title: 'Fake', group: 'Website', scopes: ['all'] },
            { functionName: 'tinyHelper', id: 'bad id', title: 'Invalid', group: 'Website', scopes: ['root'] }
          ]
        })
      }]
    }
  }]
};
const parsed = parseModelFeatures(valid, candidates);
assert.strictEqual(parsed.length, 1);
assert.strictEqual(parsed[0].functionName, 'refreshNews');
assert.strictEqual(parsed[0].id, 'refresh-news');
assert.throws(() => parseModelFeatures({ candidates: [] }, candidates), /structured text/);
assert.throws(() => parseModelFeatures({ candidates: [{ content: { parts: [{ text: 'not json' }] } }] }, candidates), /valid JSON/);
console.log('Gemini feature discovery tests passed.');

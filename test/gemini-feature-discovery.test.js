'use strict';
const assert = require('assert');
const { parseModelFeatures, callGemini, MODEL } = require('../scripts/gemini-feature-discovery');

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
            { functionName: 'refreshNews', file: 'app.js', id: 'refresh-news', title: 'Refresh News', group: 'Website', scopes: ['root'] },
            { functionName: 'not-a-real-function', file: 'app.js', id: 'fake-feature', title: 'Fake', group: 'Website', scopes: ['all'] },
            { functionName: 'tinyHelper', file: 'app.js', id: 'bad id', title: 'Invalid', group: 'Website', scopes: ['root'] }
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
(async () => {
  const emptyResponse = {
    candidates: [{ content: { parts: [{ text: JSON.stringify({ features: [] }) }] } }]
  };
  let requestUrl = '';
  let requestOptions;
  const response = await callGemini('unit-test-key', [], async (url, options) => {
    requestUrl = url;
    requestOptions = options;
    return { ok: true, json: async () => emptyResponse };
  });
  assert.ok(requestUrl.includes('/models/' + encodeURIComponent(MODEL) + ':generateContent'));
  assert.strictEqual(requestOptions.headers['x-goog-api-key'], 'unit-test-key');
  assert.strictEqual(JSON.parse(requestOptions.body).generationConfig.maxOutputTokens, 256);
  assert.deepStrictEqual(parseModelFeatures(response, []), []);
  console.log('Gemini feature discovery tests passed, including live-API probe request construction.');
})().catch((error) => { console.error(error); process.exit(1); });

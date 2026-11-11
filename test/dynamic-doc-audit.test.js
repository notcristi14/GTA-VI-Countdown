#!/usr/bin/env node
'use strict';
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { getGitChanges, runDynamicDocumentationAudit, parseNameStatusZ } = require('../scripts/dynamic-doc-audit');
let passed = 0, failed = 0;
function test(name, fn) { try { fn(); passed++; console.log('PASS', name); } catch (e) { failed++; console.error('FAIL', name, e.stack || e); } }
function git(root, args) { return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim(); }
function makeRepo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'dyn-doc-audit-'));
  git(root, ['init', '-q']); git(root, ['config', 'user.name', 'Audit Test']); git(root, ['config', 'user.email', 'audit@example.invalid']);
  return root;
}
function put(root, name, body) { const p = path.join(root, name); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, body); }
function commit(root, msg) { git(root, ['add', '-A']); git(root, ['commit', '--allow-empty', '-qm', msg]); return git(root, ['rev-parse', 'HEAD']); }
function withRepo(fn) { const root = makeRepo(); try { fn(root); } finally { fs.rmSync(root, { recursive: true, force: true }); } }
function get(root, base, head) { return getGitChanges(root, { baseSha: base, headSha: head }); }

test('M status uses explicit base/head range', () => withRepo(r => { put(r,'a.js','1'); const b=commit(r,'b'); put(r,'a.js','2'); const h=commit(r,'h'); assert.ok(get(r,b,h).changes.some(c=>c.status==='M'&&c.path==='a.js')); }));
test('old and new M contents come from Git objects despite dirty worktree', () => withRepo(r => { put(r,'api.js',"app.get('/api/old', f)"); const b=commit(r,'b'); put(r,'api.js',"app.get('/api/new', f)"); const h=commit(r,'h'); put(r,'api.js',"app.get('/api/dirty', f)"); const x=runDynamicDocumentationAudit(r,{'README.md':'/api/old'},{baseSha:b,headSha:h}); assert.ok(x.findings.some(f=>f.id==='dyn-new-api-apinew')); assert.ok(x.findings.some(f=>f.id==='dyn-removed-api-apiold')); assert.ok(!x.findings.some(f=>f.id.includes('dirty'))); }));
test('A status is detected', () => withRepo(r => { const b=commit(r,'b'); put(r,'new.js','new'); const h=commit(r,'h'); assert.ok(get(r,b,h).changes.some(c=>c.status==='A')); }));
test('D status is detected', () => withRepo(r => { put(r,'gone.js','old'); const b=commit(r,'b'); fs.unlinkSync(path.join(r,'gone.js')); const h=commit(r,'h'); assert.ok(get(r,b,h).changes.some(c=>c.status==='D')); }));
test('R status contains both paths', () => withRepo(r => { put(r,'old.js','same content'); const b=commit(r,'b'); git(r,['mv','old.js','new.js']); const h=commit(r,'h'); const c=get(r,b,h).changes.find(c=>c.status==='R'); assert.ok(c); assert.strictEqual(c.oldPath,'old.js'); assert.strictEqual(c.path,'new.js'); }));
test('C status contains source and copied path', () => withRepo(r => { put(r,'source.js','a sufficiently long copy candidate content'); const b=commit(r,'b'); put(r,'copy.js','a sufficiently long copy candidate content'); const h=commit(r,'h'); assert.ok(get(r,b,h).changes.some(c=>c.status==='C'&&c.oldPath==='source.js'&&c.path==='copy.js')); }));
test('filenames with spaces remain intact', () => withRepo(r => { put(r,'a file.js','1'); const b=commit(r,'b'); put(r,'a file.js','2'); const h=commit(r,'h'); assert.ok(get(r,b,h).changes.some(c=>c.path==='a file.js')); }));
test('NUL parser preserves tabs and newlines in paths', () => { assert.deepStrictEqual(parseNameStatusZ('M\0tab\tline\nbreak.js\0'),[{status:'M',path:'tab\tline\nbreak.js',oldPath:null}]); });
test('initial commit is explicit and enumerates additions', () => withRepo(r => { put(r,'first.js','1'); const h=commit(r,'initial'); const x=getGitChanges(r,{headSha:h}); assert.strictEqual(x.status,'initial-commit'); assert.ok(x.changes.some(c=>c.path==='first.js'&&c.status==='A')); }));
test('shallow history without base fails closed', () => withRepo(r => { put(r,'a','1'); const b=commit(r,'b'); put(r,'a','2'); const h=commit(r,'h'); fs.writeFileSync(path.join(r,'.git','shallow'),b+'\n'); const x=getGitChanges(r,{headSha:h}); assert.match(x.error,/shallow/i); }));
test('missing base object fails closed', () => withRepo(r => { put(r,'a','1'); const h=commit(r,'h'); const x=getGitChanges(r,{baseSha:'1111111111111111111111111111111111111111',headSha:h}); assert.ok(x.error); }));
test('invalid base SHA is rejected', () => withRepo(r => { put(r,'a','1'); const h=commit(r,'h'); const x=getGitChanges(r,{baseSha:'bad-sha',headSha:h}); assert.ok(x.error); }));
test('explicit multi-commit range is fully diffed', () => withRepo(r => { put(r,'a','1'); const b=commit(r,'b'); put(r,'a','2'); commit(r,'mid'); put(r,'z','3'); const h=commit(r,'h'); const x=get(r,b,h); assert.ok(x.changes.some(c=>c.path==='a')); assert.ok(x.changes.some(c=>c.path==='z')); }));
test('empty range is complete with no changes', () => withRepo(r => { put(r,'a','1'); const b=commit(r,'b'); const h=commit(r,'empty'); const x=get(r,b,h); assert.strictEqual(x.status,'complete'); assert.strictEqual(x.changes.length,0); }));
test('unrelated histories fail closed', () => { const a=makeRepo(), b=makeRepo(); try { put(a,'a','1'); const base=commit(a,'a'); put(b,'b','2'); commit(b,'b'); const bundle=path.join(os.tmpdir(),'dyn-'+process.pid+'.bundle'); execFileSync('git',['bundle','create',bundle,'--all'],{cwd:b,stdio:'ignore'}); execFileSync('git',['fetch',bundle,'HEAD'],{cwd:a,stdio:'ignore'}); const head=git(a,['rev-parse','FETCH_HEAD']); assert.match(getGitChanges(a,{baseSha:base,headSha:head}).error,/ancestor|unrelated/i); fs.rmSync(bundle,{force:true}); } finally { fs.rmSync(a,{recursive:true,force:true}); fs.rmSync(b,{recursive:true,force:true}); } });
test('removed API route is detected', () => withRepo(r => { put(r,'server.js',"app.get('/api/retired', f)"); const b=commit(r,'b'); put(r,'server.js','module.exports = true'); const h=commit(r,'h'); const x=runDynamicDocumentationAudit(r,{'README.md':'/api/retired'},{baseSha:b,headSha:h}); assert.ok(x.findings.some(f=>f.id==='dyn-removed-api-apiretired')); }));
test('removed environment variable is detected', () => withRepo(r => { put(r,'config.js','process.env.LEGACY_SECRET'); const b=commit(r,'b'); put(r,'config.js','const x = 1'); const h=commit(r,'h'); const x=runDynamicDocumentationAudit(r,{'README.md':'LEGACY_SECRET'},{baseSha:b,headSha:h}); assert.ok(x.findings.some(f=>f.id==='dyn-removed-env-LEGACY_SECRET')); }));
test('removed dependency and npm script references are detected', () => withRepo(r => { put(r,'package.json',JSON.stringify({dependencies:{oldpkg:'^1'},scripts:{legacy:'node x'}})); const b=commit(r,'b'); put(r,'package.json',JSON.stringify({dependencies:{},scripts:{}})); const h=commit(r,'h'); const x=runDynamicDocumentationAudit(r,{'README.md':'oldpkg npm run legacy'},{baseSha:b,headSha:h}); assert.ok(x.findings.some(f=>f.id==='dyn-removed-dep-oldpkg')); assert.ok(x.findings.some(f=>f.id==='dyn-removed-script-legacy')); }));
test('removed workflow references are detected', () => withRepo(r => { put(r,'.github/workflows/legacy.yml','name: Legacy'); const b=commit(r,'b'); fs.unlinkSync(path.join(r,'.github/workflows/legacy.yml')); const h=commit(r,'h'); const x=runDynamicDocumentationAudit(r,{'README.md':'legacy.yml'},{baseSha:b,headSha:h}); assert.ok(x.findings.some(f=>f.id==='dyn-removed-workflow-legacyyml')); }));
test('file-to-symlink type changes remain visible', () => withRepo(r => { put(r,'target.txt','target'); put(r,'link.txt','regular'); const b=commit(r,'b'); fs.unlinkSync(path.join(r,'link.txt')); fs.symlinkSync('target.txt',path.join(r,'link.txt')); const h=commit(r,'h'); assert.ok(get(r,b,h).changes.some(c=>c.status==='T'&&c.path==='link.txt')); }));


test('deleted source file reports removed API routes and environment variables', () => withRepo(r => {
  put(r, 'server.js', "app.get('/api/gone', f);\nconst secret = process.env.GONE_SECRET;\n");
  const base = commit(r, 'base');
  fs.unlinkSync(path.join(r, 'server.js'));
  const head = commit(r, 'delete source');
  const result = runDynamicDocumentationAudit(r, { 'README.md': '/api/gone GONE_SECRET' }, { baseSha: base, headSha: head });
  assert.ok(result.findings.some(f => f.id === 'dyn-removed-api-apigone'));
  assert.ok(result.findings.some(f => f.id === 'dyn-removed-env-GONE_SECRET'));
}));

test('deleted package.json reports removed documented dependencies and scripts', () => withRepo(r => {
  put(r, 'package.json', JSON.stringify({ dependencies: { vanished: '^1.0.0' }, scripts: { legacy: 'node old.js' } }));
  const base = commit(r, 'base');
  fs.unlinkSync(path.join(r, 'package.json'));
  const head = commit(r, 'delete package');
  const result = runDynamicDocumentationAudit(r, { 'README.md': 'vanished npm run legacy' }, { baseSha: base, headSha: head });
  assert.ok(result.findings.some(f => f.id === 'dyn-removed-dep-vanished'));
  assert.ok(result.findings.some(f => f.id === 'dyn-removed-script-legacy'));
}));

console.log('\nDynamic documentation Git integration tests: '+passed+' passed, '+failed+' failed.');
if (failed) process.exit(1);

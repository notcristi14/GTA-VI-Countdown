'use strict';
const fs=require('fs'),path=require('path');
const SKIP_DIRS=new Set(['.git','node_modules','build','DerivedData','.gradle','coverage','.idea','.vscode','dist','out','.next','Pods']);
function isIgnoredFile(n){return n==='.DS_Store'||n==='Thumbs.db'||/\.(log|tmp|temp)$/i.test(n);}
function scanProjectStructure(root){
 const files=[],directories=[];
 function walk(dir,rel){for(const e of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){
  const p=rel?rel+'/'+e.name:e.name;
  if(e.isDirectory()){if(SKIP_DIRS.has(e.name))continue;directories.push(p);walk(path.join(dir,e.name),p);}
  else if(!isIgnoredFile(e.name))files.push(p);
 }}
 walk(root,'');files.sort();directories.sort();
 const readmes=files.filter(p=>path.basename(p)==='README.md');
 const workflows=files.filter(p=>/^\.github\/workflows\/[^/]+\.ya?ml$/i.test(p)).sort();
 return {root,files,directories,readmes,workflows,fileCount:files.length,directoryCount:directories.length};
}
function extractStructureCodeBlock(readme){
 const s=String(readme||''),h=/^##\s+📁\s+Structure\s*$/m.exec(s);if(!h)return '';
 const rest=s.slice(h.index+h[0].length),next=/^##\s+/m.exec(rest),section=next?rest.slice(0,next.index):rest;
 const tick=String.fromCharCode(96).repeat(3),start=section.indexOf(tick);if(start<0)return '';
 const end=section.indexOf(tick,start+tick.length);return end<0?'':section.slice(start,end+tick.length);
}
function auditProjectStructure(inventory,rootReadme){
 const block=extractStructureCodeBlock(rootReadme);
 const documented=new Set((block.match(/\.github\/workflows\/[A-Za-z0-9._/-]+\.ya?ml/gi)||[]).map(p=>p.replace(/[),;]+$/,'')));
 const actual=new Set(inventory.workflows),missingWorkflowDocs=inventory.workflows.filter(p=>!documented.has(p));
 const staleWorkflowDocs=[...documented].filter(p=>!actual.has(p)).sort(),findings=[];
 for(const p of missingWorkflowDocs)findings.push({id:'missing-workflow-'+p.replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').toLowerCase(),severity:'medium',documentationFile:'README.md',sourceFile:p,problem:'Workflow exists in .github/workflows but is missing from the README Structure inventory.',suggestedCorrection:'Add '+p+' to the workflow list in the root README Structure section.',kind:'missing',deterministic:true,confirmed:true,potentialRisk:false});
 for(const p of staleWorkflowDocs)findings.push({id:'stale-workflow-'+p.replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').toLowerCase(),severity:'medium',documentationFile:'README.md',sourceFile:p,problem:'README Structure references a workflow path that does not exist in the repository.',suggestedCorrection:'Remove or correct the stale workflow path '+p+' in the root README Structure section.',kind:'outdated',deterministic:true,confirmed:true,potentialRisk:false});
 return {status:block?'complete':'missing-readme-structure',inventory,documentedWorkflows:[...documented].sort(),missingWorkflowDocs,staleWorkflowDocs,workflowCoverage:inventory.workflows.length-missingWorkflowDocs.length,workflowCount:inventory.workflows.length,findings};
}
function formatProjectStructureMarkdown(audit){
 const i=audit.inventory,rows=i.workflows.map(p=>'| '+p+' | '+(audit.missingWorkflowDocs.includes(p)?'**MISSING**':'yes')+' |').join('\n');
 const stale=audit.staleWorkflowDocs.length?'\n\nStale workflow references: '+audit.staleWorkflowDocs.join(', ')+'.':'';
 return ['### Project structure inventory','',
 'Repository inventory: **'+i.fileCount+' files** across **'+i.directoryCount+' directories** · **'+i.readmes.length+' README.md files** discovered recursively.','',
 'Workflow documentation: **'+audit.workflowCoverage+'/'+audit.workflowCount+'** current workflow files listed in the root README Structure section.','',
 '| Workflow file | Listed in root README |','|---|---|',rows||'| (no workflow files found) | n/a |',stale,'',
 'The complete file and directory inventory, including binary assets, is recorded in scripts/integrity-report.json. Cache/build directories and temporary OS files are excluded.'].join('\n');
}
module.exports={SKIP_DIRS,isIgnoredFile,scanProjectStructure,extractStructureCodeBlock,auditProjectStructure,formatProjectStructureMarkdown};

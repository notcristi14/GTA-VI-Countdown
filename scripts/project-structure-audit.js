'use strict';
const fs=require('fs'),path=require('path');
const SKIP_DIRS=new Set(['.git','node_modules','build','DerivedData','.gradle','coverage','.idea','.vscode','dist','out','.next','Pods']);
function isIgnoredFile(n){return n==='.DS_Store'||n==='Thumbs.db'||/\.(log|tmp|temp)$/i.test(n);}
function scanProjectStructure(root){
 const files=[],directories=[];
 function walk(dir,rel){for(const e of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){
  const p=rel?rel+'/'+e.name:e.name;
  if(e.isDirectory()){if(SKIP_DIRS.has(e.name))continue;directories.push(p);walk(path.join(dir,e.name),p);}
  else if(e.isFile()&&!isIgnoredFile(e.name))files.push(p);
 }}
 walk(root,'');files.sort();directories.sort();
 const readmes=files.filter(p=>path.basename(p)==='README.md');
 const workflows=files.filter(p=>/^\.github\/workflows\/[^/]+\.ya?ml$/i.test(p)).sort();
 return {root,files,directories,readmes,workflows,fileCount:files.length,directoryCount:directories.length};
}
function buildTree(inventory){
 const nodes=new Map([['',{dirs:new Set(),files:new Set()}]]);
 for(const dir of inventory.directories){
  const parts=dir.split('/');
  for(let n=0;n<parts.length;n++){
   const parent=parts.slice(0,n).join('/'),name=parts[n],full=parts.slice(0,n+1).join('/');
   if(!nodes.has(parent))nodes.set(parent,{dirs:new Set(),files:new Set()});
   nodes.get(parent).dirs.add(name);
   if(!nodes.has(full))nodes.set(full,{dirs:new Set(),files:new Set()});
  }
 }
 for(const file of inventory.files){
  const parts=file.split('/'),name=parts.pop(),parent=parts.join('/');
  if(!nodes.has(parent))nodes.set(parent,{dirs:new Set(),files:new Set()});
  nodes.get(parent).files.add(name);
 }
 const lines=[];
 function render(parent,prefix){
  const node=nodes.get(parent)||{dirs:new Set(),files:new Set()};
  const entries=[
   ...[...node.dirs].map(name=>({name,dir:true})),
   ...[...node.files].map(name=>({name,dir:false}))
  ].sort((a,b)=>a.name.localeCompare(b.name)||Number(b.dir)-Number(a.dir));
  entries.forEach((entry,index)=>{
   const last=index===entries.length-1,branch=last?'└── ':'├── ';
   let displayName=entry.name,childPath=parent?parent+'/'+entry.name:entry.name;
   if(entry.dir){
    let child=nodes.get(childPath);
    // Compact directory-only chains (for example .github/workflows/) without hiding inventory entries.
    while(child&&child.files.size===0&&child.dirs.size===1){
     const next=[...child.dirs][0];
     displayName+='/'+next;
     childPath+='/'+next;
     child=nodes.get(childPath);
    }
   }
   lines.push(prefix+branch+displayName+(entry.dir?'/':''));
   if(entry.dir)render(childPath,prefix+(last?'    ':'│   '));
  });
 }
 render('','');
 return lines.join('\n');
}
function extractStructureCodeBlock(readme){
 const s=String(readme||''),h=/^##\s+📁\s+Structure\s*$/m.exec(s);if(!h)return '';
 const rest=s.slice(h.index+h[0].length),next=/^##\s+/m.exec(rest),section=next?rest.slice(0,next.index):rest;
 const tick=String.fromCharCode(96).repeat(3),start=section.indexOf(tick);if(start<0)return '';
 const end=section.indexOf(tick,start+tick.length);return end<0?'':section.slice(start,end+tick.length);
}
function replaceStructureCodeBlock(readme,tree){
 const source=String(readme||''),h=/^##\s+📁\s+Structure\s*$/m.exec(source);
 if(!h)throw new Error('Root README is missing the ## 📁 Structure heading.');
 const afterHeading=h.index+h[0].length,rest=source.slice(afterHeading),next=/^##\s+/m.exec(rest);
 const sectionEnd=next?afterHeading+next.index:source.length,section=source.slice(afterHeading,sectionEnd);
 const tick=String.fromCharCode(96).repeat(3),start=section.indexOf(tick);
 if(start<0)throw new Error('Root README Structure section is missing its fenced code block.');
 const end=section.indexOf(tick,start+tick.length);
 if(end<0)throw new Error('Root README Structure code block is not closed.');
 const replacement=tick+'\n'+tree+'\n'+tick;
 return source.slice(0,afterHeading)+section.slice(0,start)+replacement+section.slice(end+tick.length)+source.slice(sectionEnd);
}
function auditProjectStructure(inventory,rootReadme){
 const block=extractStructureCodeBlock(rootReadme);
 const expectedTree=buildTree(inventory);
 const actualTree=block?block.slice(3,-3).trim():'';
 const treeMatches=!!block&&actualTree===expectedTree;
 const documented=new Set((block.match(/\.github\/workflows\/[A-Za-z0-9._/-]+\.ya?ml/gi)||[]).map(p=>p.replace(/[),;]+$/,'').replace(/\/$/,'')));
 const lines=block.split(/\r?\n/);
 const workflowDir=lines.findIndex(line=>/\.github\/workflows\/\s*$/.test(line));
 if(workflowDir>=0){
  for(let n=workflowDir+1;n<lines.length;n++){
   if(/^[├└]──\s/.test(lines[n]))break;
   const leaf=/^\s*│\s*[├└]──\s+([A-Za-z0-9._-]+\.ya?ml)\b/.exec(lines[n]);
   if(leaf)documented.add('.github/workflows/'+leaf[1]);
  }
 }
 const actual=new Set(inventory.workflows),missingWorkflowDocs=inventory.workflows.filter(p=>!documented.has(p));
 const staleWorkflowDocs=[...documented].filter(p=>!actual.has(p)).sort(),findings=[];
 if(!treeMatches)findings.push({id:'project-tree-out-of-sync',severity:'medium',documentationFile:'README.md',sourceFile:'README.md',problem:'The ASCII project tree does not exactly match the current recursive repository inventory.',suggestedCorrection:'Regenerate the README Structure code block with buildTree(inventory).',kind:'outdated',deterministic:true,confirmed:true,potentialRisk:false});
 for(const p of missingWorkflowDocs)findings.push({id:'missing-workflow-'+p.replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').toLowerCase(),severity:'medium',documentationFile:'README.md',sourceFile:p,problem:'Workflow exists in .github/workflows but is missing from the README Structure inventory.',suggestedCorrection:'Add '+p+' to the workflow list in the root README Structure section.',kind:'missing',deterministic:true,confirmed:true,potentialRisk:false});
 for(const p of staleWorkflowDocs)findings.push({id:'stale-workflow-'+p.replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').toLowerCase(),severity:'medium',documentationFile:'README.md',sourceFile:p,problem:'README Structure references a workflow path that does not exist in the repository.',suggestedCorrection:'Remove or correct the stale workflow path '+p+' in the root README Structure section.',kind:'outdated',deterministic:true,confirmed:true,potentialRisk:false});
 return {status:block?'complete':'missing-readme-structure',inventory,expectedTree,treeMatches,documentedWorkflows:[...documented].sort(),missingWorkflowDocs,staleWorkflowDocs,workflowCoverage:inventory.workflows.length-missingWorkflowDocs.length,workflowCount:inventory.workflows.length,findings};
}
function formatProjectStructureMarkdown(audit){
 const i=audit.inventory,rows=i.workflows.map(p=>'| '+p+' | '+(audit.missingWorkflowDocs.includes(p)?'**MISSING**':'yes')+' |').join('\n');
 const stale=audit.staleWorkflowDocs.length?'\n\nStale workflow references: '+audit.staleWorkflowDocs.join(', ')+'.':'';
 return ['### Project structure inventory','',
 'Repository inventory: **'+i.fileCount+' files** across **'+i.directoryCount+' directories** · **'+i.readmes.length+' README.md files** discovered recursively.','',
 'ASCII tree synchronization: **'+(audit.treeMatches?'PASS':'PENDING')+'** · '+(audit.treeMatches?'README tree matches every included file and directory.':'README tree will be regenerated from the recursive inventory.'),'',
 'Workflow documentation: **'+audit.workflowCoverage+'/'+audit.workflowCount+'** current workflow files listed in the root README Structure section.','',
 '| Workflow file | Listed in root README |','|---|---|',rows||'| (no workflow files found) | n/a |',stale,'',
 'The ASCII tree in the root README is generated from the complete recursive file and directory inventory. Cache/build directories and temporary OS files are excluded.'].join('\n');
}
module.exports={SKIP_DIRS,isIgnoredFile,scanProjectStructure,buildTree,extractStructureCodeBlock,replaceStructureCodeBlock,auditProjectStructure,formatProjectStructureMarkdown};

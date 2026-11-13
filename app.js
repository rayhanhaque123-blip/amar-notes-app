const $=id=>document.getElementById(id);
const state={view:'all',folder:'',query:'',sort:'updated',notes:[],folders:[],active:null,saveTimer:null};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const textOf=html=>{const d=document.createElement('div');d.innerHTML=html||'';return d.textContent||''};
const toast=msg=>{const el=$('toast');el.textContent=msg;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),1900)};
const VIEWS=[['all','▤','সব নোট',n=>!n.trashed&&!n.archived],['recent','◷','সাম্প্রতিক',n=>!n.trashed&&!n.archived],['favorite','☆','প্রিয়',n=>n.favorite&&!n.trashed],['archive','▣','আর্কাইভ',n=>n.archived&&!n.trashed],['trash','♲','ট্র্যাশ',n=>n.trashed]];
function refresh(){state.notes=Store.notes();state.folders=Store.folders();render()}
function activeNotes(){let a=state.view==='folder'?state.notes.filter(n=>!n.trashed&&!n.archived&&n.folder===state.folder):state.notes.filter(VIEWS.find(v=>v[0]===state.view)[3]);const q=state.query.trim().toLowerCase();if(q)a=a.filter(n=>(n.title+' '+textOf(n.body)+' '+(n.tags||[]).join(' ')).toLowerCase().includes(q));return a.sort((x,y)=>state.sort==='title'?(x.title||'').localeCompare(y.title||''):y[state.sort]-x[state.sort])}
function render(){const nav=$('nav');nav.innerHTML=VIEWS.map(([id,ico,label,fn])=>`<button data-view="${id}" class="${state.view===id?'active':''}"><span>${ico}</span>${label}<small>${state.notes.filter(fn).length}</small></button>`).join('');
 $('folders').innerHTML=state.folders.map(f=>`<button data-folder="${esc(f)}" class="${state.view==='folder'&&state.folder===f?'active':''}"><span>▱</span>${esc(f)}</button>`).join('')||'<div style="padding:8px 11px;color:var(--muted);font-size:12px">এখনো ফোল্ডার নেই</div>';
 const v=VIEWS.find(x=>x[0]===state.view);$('viewTitle').textContent=state.view==='folder'?state.folder:v[2];$('viewSub').textContent=state.view==='trash'?'মুছে ফেলা নোট এখানে থাকবে।':'আপনার সব লেখা এক জায়গায় রাখুন।';
 const a=activeNotes();$('noteCount').textContent=`${a.length}টি নোট`;$('filterChips').innerHTML=state.query?`<span class="chip">সার্চ: ${esc(state.query)}</span>`:'';
 $('noteList').innerHTML=a.length?a.map(n=>`<article class="note-card" data-open="${n.id}"><div class="note-top"><div style="min-width:0"><h3>${esc(n.title||'শিরোনামহীন নোট')}</h3></div><span>${n.favorite?'★':''}</span></div><p>${esc(textOf(n.body).slice(0,190))}</p><div class="note-date">${new Date(n.updated).toLocaleString('bn-BD',{dateStyle:'medium',timeStyle:'short'})}</div><div class="note-foot"><span class="folder-tag">${esc(n.folder||'ব্যক্তিগত')}</span><div class="note-actions">${state.view==='trash'?`<button data-action="restore" data-id="${n.id}" title="ফিরিয়ে আনুন">↶</button><button data-action="delete" data-id="${n.id}" title="স্থায়ীভাবে মুছুন">×</button>`:`<button data-action="favorite" data-id="${n.id}" title="প্রিয়">${n.favorite?'★':'☆'}</button><button data-action="duplicate" data-id="${n.id}" title="কপি">⧉</button><button data-action="archive" data-id="${n.id}" title="আর্কাইভ">▣</button><button data-action="trash" data-id="${n.id}" title="ট্র্যাশ">♲</button>`}</div></div></article>`).join(''):'<div class="empty"><strong>এখানে কোনো নোট নেই</strong>নতুন নোট তৈরি করতে “নতুন নোট” বাটনে চাপ দিন।</div>'}
function setView(view,folder=''){state.view=view;state.folder=folder;render();closeSidebar()}
function closeSidebar(){$('sidebar').classList.remove('open');$('scrim').classList.remove('open')}
function openModal(id){$(id).classList.add('open')}function closeModal(id){$(id).classList.remove('open')}
function editor(note=null){state.active=note?{...note}:null;const n=note||{title:'',body:'',folder:state.view==='folder'?state.folder:'',tags:[]};
 $('editorModal').innerHTML=`<div class="editor-head"><input id="editTitle" maxlength="180" placeholder="নোটের শিরোনাম লিখুন…" value="${esc(n.title)}"><button id="closeEditor">✕</button></div>
 <div class="toolbar">
 <button data-cmd="bold" title="Bold"><b>B</b></button><button data-cmd="italic" title="Italic"><i>I</i></button><button data-cmd="underline" title="Underline"><u>U</u></button><button data-cmd="strikeThrough" title="Strikethrough"><s>S</s></button>
 <select id="blockType" title="Heading"><option value="p">Normal</option><option value="h1">Heading 1</option><option value="h2">Heading 2</option><option value="h3">Heading 3</option><option value="blockquote">Quote</option><option value="pre">Code</option></select>
 <select id="fontSize" title="Font size"><option value="3">16 px</option><option value="4">18 px</option><option value="5">24 px</option><option value="6">30 px</option><option value="7">36 px</option></select>
 <input type="color" id="textColor" value="#20283a" title="লেখার রং"><input type="color" id="highlightColor" value="#fff176" title="Highlight">
 <button data-cmd="insertUnorderedList" title="Bullet list">• List</button><button data-cmd="insertOrderedList" title="Numbered list">1. List</button><button id="checkList" title="Checklist">☑</button>
 <button id="addLink" title="লিংক">↗</button><button id="addImage" title="ছবি">▧</button><button id="addTable" title="টেবিল">▦</button><button id="addRule" title="Divider">―</button><button id="addDate" title="তারিখ">▣</button>
 <button id="alignLeft" title="বামে">≡</button><button id="alignCenter" title="মাঝে">☷</button><button id="alignRight" title="ডানে">≣</button><button id="undo" title="Undo">↶</button><button id="redo" title="Redo">↷</button>
 </div>
 <div id="editor" class="editor" contenteditable="true" spellcheck="true" aria-label="নোট লিখুন"></div>
 <div class="editor-meta"><input id="tags" placeholder="ট্যাগ লিখুন (কমা দিয়ে আলাদা করুন)" value="${esc((n.tags||[]).join(', '))}"><select id="noteFolder"><option value="">ফোল্ডার নেই</option>${state.folders.map(f=>`<option value="${esc(f)}" ${n.folder===f?'selected':''}>${esc(f)}</option>`).join('')}</select></div>
 <div class="editor-stats"><span id="wordCount">শব্দ: ০</span><span id="charCount">অক্ষর: ০</span><span id="fileSize">সাইজ: ০ B</span><span id="gzipSize">Gzip: হিসাব হচ্ছে…</span></div>
 <div class="editor-footer"><span class="save-status" id="saveStatus">এই ডিভাইসে অটো-সেভ হবে</span><button class="secondary" id="importFile">ফাইল খুলুন</button><button class="secondary" id="exportTxt">TXT</button><button class="secondary" id="exportWord">Word</button><button class="secondary" id="duplicateNote">কপি</button><button class="secondary" id="fullScreen">Full Screen</button><button class="secondary" id="printNote">PDF / Print</button><button class="new-note" id="saveClose">সংরক্ষণ</button></div>`;
 $('editor').innerHTML=n.body||'';
 const updateStats=()=>{
   const raw=$('editor').innerText||'', words=raw.trim()?raw.trim().split(/\\s+/u).length:0;
   const chars=raw.length, bytes=new Blob([$('editor').innerHTML]).size;
   $('wordCount').textContent='শব্দ: '+words.toLocaleString('bn-BD');
   $('charCount').textContent='অক্ষর: '+chars.toLocaleString('bn-BD');
   $('fileSize').textContent='সাইজ: '+(bytes<1024?bytes+' B':(bytes/1024).toFixed(1)+' KB');
   if('CompressionStream' in window){
     try{const stream=new Blob([$('editor').innerHTML]).stream().pipeThrough(new CompressionStream('gzip'));new Response(stream).arrayBuffer().then(b=>$('gzipSize').textContent='Gzip: '+(b.byteLength<1024?b.byteLength+' B':(b.byteLength/1024).toFixed(1)+' KB')).catch(()=>$('gzipSize').textContent='Gzip: —')}
     catch{$('gzipSize').textContent='Gzip: —'}
   } else $('gzipSize').textContent='Gzip: সমর্থিত নয়';
 };
 updateStats();
 $('closeEditor').onclick=()=>{flushSave();closeModal('modal')};
 $('saveClose').onclick=()=>{flushSave();closeModal('modal');toast('নোট সংরক্ষিত হয়েছে')};
 const save=()=>{const title=$('editTitle').value.trim(),body=$('editor').innerHTML;if(!title&&!textOf(body).trim())return;const saved=Store.save({...(state.active?{id:state.active.id}:{}),title,body,folder:$('noteFolder').value,tags:$('tags').value.split(',').map(x=>x.trim()).filter(Boolean)});state.active=saved;$('saveStatus').textContent='সংরক্ষিত ✓';state.notes=Store.notes();render()};
 const schedule=()=>{$('saveStatus').textContent='সংরক্ষণ হচ্ছে…';updateStats();clearTimeout(state.saveTimer);state.saveTimer=setTimeout(save,500)};
 window.flushSave=()=>{if(state.saveTimer){clearTimeout(state.saveTimer);state.saveTimer=null;save()}};
 ['editTitle','editor','tags','noteFolder'].forEach(id=>$(id).addEventListener('input',schedule));
 document.querySelectorAll('[data-cmd]').forEach(b=>b.onclick=()=>{focusEditor();document.execCommand(b.dataset.cmd,false,null);schedule()});
 $('blockType').onchange=e=>{focusEditor();document.execCommand('formatBlock',false,e.target.value);schedule()};
 $('fontSize').onchange=e=>{focusEditor();document.execCommand('fontSize',false,e.target.value);schedule()};
 $('textColor').oninput=e=>{focusEditor();document.execCommand('foreColor',false,e.target.value);schedule()};
 $('highlightColor').oninput=e=>{focusEditor();document.execCommand('hiliteColor',false,e.target.value);schedule()};
 $('addLink').onclick=()=>{const url=prompt('সম্পূর্ণ লিংক লিখুন (https://…)');if(url){focusEditor();document.execCommand('createLink',false,url);schedule()}};
 $('addImage').onclick=()=>{const inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.onchange=()=>{const f=inp.files[0];if(!f)return;if(f.size>2*1024*1024){toast('ছবির আকার ২ MB-এর কম রাখুন');return}const reader=new FileReader();reader.onload=()=>{focusEditor();document.execCommand('insertImage',false,reader.result);schedule()};reader.readAsDataURL(f)};inp.click()};
 $('addTable').onclick=()=>{let r=Math.min(10,Math.max(1,+prompt('সারি কতটি?',2)||2)),c=Math.min(8,Math.max(1,+prompt('কলাম কতটি?',2)||2));const html='<table>'+Array.from({length:r},()=>'<tr>'+Array.from({length:c},()=>'<td>লিখুন</td>').join('')+'</tr>').join('')+'</table><p><br></p>';focusEditor();document.execCommand('insertHTML',false,html);schedule()};
 $('checkList').onclick=()=>{focusEditor();document.execCommand('insertHTML',false,'<ul style="list-style:none"><li>☐ কাজের বিবরণ</li></ul>');schedule()};
 $('addRule').onclick=()=>{focusEditor();document.execCommand('insertHorizontalRule');schedule()};
 $('addDate').onclick=()=>{focusEditor();document.execCommand('insertText',false,new Date().toLocaleDateString('bn-BD'));schedule()};
 [['alignLeft','justifyLeft'],['alignCenter','justifyCenter'],['alignRight','justifyRight']].forEach(([id,cmd])=>$(id).onclick=()=>{focusEditor();document.execCommand(cmd);schedule()});
 $('undo').onclick=()=>{focusEditor();document.execCommand('undo');schedule()};$('redo').onclick=()=>{focusEditor();document.execCommand('redo');schedule()};
 $('printNote').onclick=()=>printCurrent();
 $('exportTxt').onclick=()=>downloadText(($('editTitle').value||'নোট')+'\\n\\n'+$('editor').innerText,($('editTitle').value||'note')+'.txt','text/plain;charset=utf-8');
 $('exportWord').onclick=()=>downloadText(`<!doctype html><html><head><meta charset="utf-8"></head><body><h1>${esc($('editTitle').value||'নোট')}</h1>${$('editor').innerHTML}</body></html>`,($('editTitle').value||'note')+'.doc','application/msword');
 $('duplicateNote').onclick=()=>{flushSave();const copy=Store.save({title:(($('editTitle').value||'নোট')+' - কপি'),body:$('editor').innerHTML,folder:$('noteFolder').value,tags:$('tags').value.split(',').map(x=>x.trim()).filter(Boolean)});state.notes=Store.notes();render();editor(copy);toast('নোটের কপি তৈরি হয়েছে')};
 $('fullScreen').onclick=()=>{const el=$('editor');if(!document.fullscreenElement)el.requestFullscreen?.().catch(()=>toast('Full Screen চালু করা যায়নি'));else document.exitFullscreen?.()};
 $('importFile').onclick=()=>importIntoEditor(schedule);
 $('editor').addEventListener('keydown',e=>{if(e.key==='/'&&$('editor').innerText.trim()===''){setTimeout(()=>{const cmd=prompt('কমান্ড লিখুন: h1, h2, bullet, number, quote, date');if(!cmd)return;focusEditor();if(cmd==='date')document.execCommand('insertText',false,new Date().toLocaleDateString('bn-BD'));else if(cmd==='bullet')document.execCommand('insertUnorderedList');else if(cmd==='number')document.execCommand('insertOrderedList');else if(['h1','h2','quote'].includes(cmd))document.execCommand('formatBlock',false,cmd==='quote'?'blockquote':cmd);schedule()},80)}});
 openModal('modal');
}
function downloadText(content,name,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name.replace(/[\\/:*?"<>|]/g,'_');a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('ফাইল ডাউনলোড শুরু হয়েছে')}
async function importIntoEditor(schedule){
 const i=document.createElement('input');i.type='file';i.accept='.txt,.html,.htm,.doc,.docx,.pdf,image/*';i.onchange=async()=>{
  const f=i.files?.[0];if(!f)return;
  try{
   if(f.type.startsWith('image/')){if(f.size>2*1024*1024)throw Error('ছবির আকার ২ MB-এর কম হতে হবে');const data=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(f)});focusEditor();document.execCommand('insertImage',false,data);schedule();return}
   if(/\\.txt$/i.test(f.name)){const t=await f.text();$('editor').innerHTML='<p>'+esc(t).replace(/\\r?\\n/g,'</p><p>')+'</p>';schedule();return}
   if(/\\.html?$/i.test(f.name)||/\\.doc$/i.test(f.name)){const t=await f.text();const d=new DOMParser().parseFromString(t,'text/html');$('editor').innerHTML=d.body.innerHTML||esc(t);schedule();return}
   if(/\\.docx$/i.test(f.name)){await loadScript('https://unpkg.com/mammoth@1.8.0/mammoth.browser.min.js');const result=await mammoth.convertToHtml({arrayBuffer:await f.arrayBuffer()});$('editor').innerHTML=result.value;schedule();return}
   if(/\\.pdf$/i.test(f.name)){await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';const pdf=await pdfjsLib.getDocument({data:await f.arrayBuffer()}).promise;let text='';for(let p=1;p<=pdf.numPages;p++){const page=await pdf.getPage(p),content=await page.getTextContent();text+=content.items.map(x=>x.str).join(' ')+'\\n\\n'}$('editor').innerHTML='<p>'+esc(text).replace(/\\n/g,'</p><p>')+'</p>';schedule();return}
   throw Error('এই ফাইল ফরম্যাট সমর্থিত নয়');
  }catch(e){alert('ফাইল খোলা যায়নি: '+e.message)}
 };i.click();
}
function loadScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(Error('লাইব্রেরি লোড হয়নি; ইন্টারনেট সংযোগ পরীক্ষা করুন'));document.head.appendChild(s)})}
function focusEditor(){$('editor').focus()}
function printCurrent(){const title=$('editTitle').value||'Smart Notes';const w=window.open('','_blank');if(!w){toast('পপ-আপ অনুমতি দিন');return}w.document.write(`<!doctype html><html lang="bn"><meta charset="utf-8"><title>${esc(title)}</title><style>body{font-family:Arial,sans-serif;line-height:1.8;padding:35px;color:#222}img{max-width:100%}table{border-collapse:collapse;width:100%}td{border:1px solid #aaa;padding:7px}</style><h1>${esc(title)}</h1>${$('editor').innerHTML}</html>`);w.document.close();w.focus();setTimeout(()=>w.print(),300)}
async function action(kind,id){const n=state.notes.find(x=>x.id===id);if(!n)return;if(kind==='favorite')Store.patch(id,{favorite:!n.favorite});if(kind==='duplicate')Store.save({title:(n.title||'নোট')+' - কপি',body:n.body,folder:n.folder,tags:n.tags||[]});if(kind==='archive')Store.patch(id,{archived:!n.archived});if(kind==='trash')Store.patch(id,{trashed:true});if(kind==='restore')Store.patch(id,{trashed:false,archived:false});if(kind==='delete'){if(confirm('এই নোট স্থায়ীভাবে মুছে ফেলবেন?'))Store.removeForever(id);else return}refresh()}
function backupDialog(){ $('backupContent').innerHTML=`<h2>ব্যাকআপ ও Restore</h2><p>আপনার নোট এই ব্রাউজারের Local Storage-এ থাকে। ফোন পরিবর্তন বা ব্রাউজারের ডেটা মুছার আগে JSON ব্যাকআপ ডাউনলোড করুন।</p><div class="backup-actions"><button id="exportBackup">⬇ সব নোটের ব্যাকআপ ডাউনলোড</button><button id="importBackup">⬆ ব্যাকআপ থেকে Restore</button><button id="closeBackup">বন্ধ করুন</button></div><p class="danger">Restore করলে বর্তমান নোটগুলো ব্যাকআপের নোট দিয়ে প্রতিস্থাপিত হবে।</p>`;
 openModal('backupModal');$('closeBackup').onclick=()=>closeModal('backupModal');$('exportBackup').onclick=()=>{const blob=new Blob([JSON.stringify(Store.exportData(),null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='smart-notes-pro-backup.json';a.click();URL.revokeObjectURL(a.href);toast('ব্যাকআপ ডাউনলোড হয়েছে')};$('importBackup').onclick=()=>{const i=document.createElement('input');i.type='file';i.accept='.json,application/json';i.onchange=async()=>{try{const d=JSON.parse(await i.files[0].text());if(!confirm('বর্তমান নোট প্রতিস্থাপন করে Restore করবেন?'))return;Store.importData(d);closeModal('backupModal');refresh();applyTheme();toast('ব্যাকআপ Restore হয়েছে')}catch(e){alert('ব্যাকআপ ফাইল পড়া যায়নি: '+e.message)}};i.click()}}
function applyTheme(){const theme=Store.settings().theme||'light';document.documentElement.dataset.theme=theme;$('themeBtn').textContent=theme==='dark'?'☀':'◐'}
$('newNote').onclick=()=>editor();$('newNote2').onclick=()=>editor();$('addFolder').onclick=()=>{const name=prompt('ফোল্ডারের নাম দিন');if(name&&name.trim()){Store.addFolder(name.trim());refresh()}};
$('search').oninput=e=>{state.query=e.target.value;render()};$('sort').onchange=e=>{state.sort=e.target.value;render()};$('themeBtn').onclick=()=>{Store.setSettings({theme:Store.settings().theme==='dark'?'light':'dark'});applyTheme()};
$('backupBtn').onclick=backupDialog;
document.addEventListener('keydown',e=>{
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('search').focus();$('search').select()}
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'&&$('modal').classList.contains('open')){e.preventDefault();window.flushSave?.();toast('নোট সংরক্ষিত হয়েছে')}
 if(e.key==='Escape'&&document.fullscreenElement)document.exitFullscreen?.()
});$('menuBtn').onclick=()=>{$('sidebar').classList.add('open');$('scrim').classList.add('open')};$('scrim').onclick=closeSidebar;
document.addEventListener('click',e=>{const t=e.target.closest('[data-view],[data-folder],[data-action],[data-open]');if(!t)return;if(t.dataset.view){setView(t.dataset.view);return}if(t.dataset.folder){setView('folder',t.dataset.folder);return}if(t.dataset.action){e.stopPropagation();action(t.dataset.action,t.dataset.id);return}if(t.dataset.open){const n=state.notes.find(x=>x.id===t.dataset.open);if(n)editor(n)}});
$('modal').onclick=e=>{if(e.target===$('modal')){window.flushSave?.();closeModal('modal')}};$('backupModal').onclick=e=>{if(e.target===$('backupModal'))closeModal('backupModal')};
applyTheme();refresh();
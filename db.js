/* Local-only storage. Data stays in this browser on this device. */
const Store=(()=>{
 const KEY='smart-notes-pro-v2',FOLDERS='smart-notes-pro-folders-v2',SETTINGS='smart-notes-pro-settings-v1';
 const read=(k,fallback)=>{try{const v=localStorage.getItem(k);return v===null?fallback:JSON.parse(v)}catch{return fallback}};
 const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
 const id=()=>crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2);
 return {
  notes:()=>read(KEY,[]),folders:()=>read(FOLDERS,[]),settings:()=>read(SETTINGS,{theme:'light'}),
  setSettings(v){write(SETTINGS,{...this.settings(),...v})},
  save(note){const a=this.notes(),now=Date.now();if(note.id){const i=a.findIndex(x=>x.id===note.id);if(i>=0)a[i]={...a[i],...note,updated:now};else a.unshift({...note,created:now,updated:now})}else a.unshift({id:id(),favorite:false,archived:false,trashed:false,created:now,updated:now,...note});write(KEY,a);return a.find(x=>x.id===(note.id||a[0].id))},
  patch(id,changes){const a=this.notes().map(n=>n.id===id?{...n,...changes,updated:Date.now()}:n);write(KEY,a)},
  removeForever(id){write(KEY,this.notes().filter(n=>n.id!==id))},
  addFolder(name){const a=this.folders();if(!a.includes(name)){a.push(name);write(FOLDERS,a)}},
  renameFolder(oldName,newName){write(FOLDERS,this.folders().map(x=>x===oldName?newName:x));write(KEY,this.notes().map(n=>n.folder===oldName?{...n,folder:newName}:n))},
  deleteFolder(name){write(FOLDERS,this.folders().filter(x=>x!==name));write(KEY,this.notes().map(n=>n.folder===name?{...n,folder:''}:n))},
  exportData(){return {format:'SmartNotesProBackup',version:2,exportedAt:new Date().toISOString(),notes:this.notes(),folders:this.folders(),settings:this.settings()}},
  importData(data){if(!data||data.format!=='SmartNotesProBackup'||!Array.isArray(data.notes)||!Array.isArray(data.folders))throw Error('ব্যাকআপ ফাইল সঠিক নয়');write(KEY,data.notes);write(FOLDERS,data.folders);write(SETTINGS,data.settings||{theme:'light'})}
 };
})();
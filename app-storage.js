/* FlashMed — armazenamento local, recuperação e rotina de salvamento.
   Carregado antes de app.js; as funções acessam o estado compartilhado apenas quando chamadas. */
function flashmedLocalPayload(source=db){let lean=Object.assign({},source,{imageAssets:{}});return JSON.parse(JSON.stringify(lean))}
function flashmedPruneRecoverySnapshots(all=false){try{let keys=Object.keys(localStorage).filter(k=>k.startsWith('flashmed_recovery_')).sort();let remove=all?keys:keys.slice(0,Math.max(0,keys.length-3));for(const k of remove)localStorage.removeItem(k);return remove.length}catch(e){return 0}}
async function flashmedEmergencySave(source=db){try{await flashmedAssetPut('__flashmed_emergency_db__',{data:flashmedLocalPayload(source),savedAt:Date.now()});return true}catch(e){console.error('FlashMed emergency save error',e);return false}}
async function flashmedEmergencyRestore(target){try{let e=await flashmedAssetGet('__flashmed_emergency_db__');if(!e||!e.data)return false;let changed=flashmedMergePersonal(target,e.data);if(changed){target.updatedAt=Math.max(target.updatedAt||0,e.data.updatedAt||0)}return changed}catch(err){console.warn('Emergency restore unavailable',err);return false}}


// Independent compact safety journal: survives failure of the oversized full database.
const FLASHMED_JOURNAL='flashmed_safety_journal_v1';
function flashmedPersonalSnapshot(source){return {cards:(source.cards||[]).map(c=>({...c,media:typeof c.media==='string'&&c.media.startsWith('data:')?'':c.media})),bankAttempts:source.bankAttempts||[],decorebas:source.decorebas||[],knowledgeNotes:source.knowledgeNotes||[],knowledgeBooks:source.knowledgeBooks||[],studyNotebooks:source.studyNotebooks||[],savedAt:Date.now()}}
function flashmedJournalSave(){let snap=flashmedPersonalSnapshot(db),old=null;try{old=JSON.parse(localStorage.getItem(FLASHMED_JOURNAL)||'null')}catch(e){}if(old)flashmedMergePersonal(snap,old);let payload=JSON.stringify(snap);try{localStorage.setItem(FLASHMED_JOURNAL,payload);return true}catch(e){flashmedPruneRecoverySnapshots(true);try{localStorage.setItem(FLASHMED_JOURNAL,payload);return true}catch(e2){console.error('FlashMed journal error',e2);return false}}}
function flashmedJournalRestore(target){try{let saved=JSON.parse(localStorage.getItem(FLASHMED_JOURNAL)||'null');return saved?flashmedMergePersonal(target,saved):false}catch(e){console.error(e);return false}}
function flashmedSaveError(){let status=document.getElementById('saveState');if(status)status.textContent='⚠️ Falha ao salvar — exporte seu backup';let banner=document.getElementById('flashmedSaveAlert');if(!banner){banner=document.createElement('div');banner.id='flashmedSaveAlert';banner.style.cssText='position:fixed;bottom:12px;left:12px;right:12px;z-index:99999;padding:16px;background:#a31836;color:white;border-radius:12px;font-weight:800;text-align:center';document.body.appendChild(banner)}banner.innerHTML='⚠️ Não foi possível salvar todos os dados. <button onclick="exportDB()" style="padding:8px;margin-left:8px">Baixar backup agora</button>'}
function flashmedSaveOK(){document.getElementById('flashmedSaveAlert')?.remove()}
function save(){
  db.updatedAt=Date.now();
  let payload;
  try{payload=JSON.stringify(flashmedLocalPayload(db))}
  catch(e){console.error('FlashMed: não foi possível preparar os dados para salvar',e);flashmedSaveError();return false}
  let fullOK=false,fallbackPending=false;
  try{localStorage.setItem(KEY,payload);fullOK=true}
  catch(firstError){
    console.warn('FlashMed: primeira gravação local falhou; liberando snapshots antigos e tentando novamente',firstError);
    flashmedPruneRecoverySnapshots(true);
    try{localStorage.setItem(KEY,payload);fullOK=true}
    catch(storageError){
      console.warn('FlashMed: localStorage continua indisponível; tentando IndexedDB e nuvem',storageError);
      fallbackPending=true;
      const st=document.getElementById('saveState');if(st)st.textContent='salvando backup local seguro…';
      flashmedEmergencySave(db).then(ok=>{
        if(ok){flashmedSaveOK();const status=document.getElementById('saveState');if(status)status.textContent=cloud?'backup local seguro • sincronizando nuvem':'backup local seguro (IndexedDB)'}
        else{flashmedSaveError();console.error('FlashMed: falharam o armazenamento principal e o backup de emergência.')}
      }).catch(err=>{console.error('FlashMed: falha inesperada no backup de emergência',err);flashmedSaveError()});
    }
  }
  if(fullOK){flashmedSaveOK();const st=document.getElementById('saveState');if(st)st.textContent=cloud?'salvo neste aparelho • sincronizando':'salvo neste aparelho'}
  if(cloud){clearTimeout(cloudTimer);cloudTimer=setTimeout(syncUp,800)}
  // If IndexedDB fallback has started, avoid showing a false "save failed" in the feature UI.
  return fullOK||fallbackPending;
}

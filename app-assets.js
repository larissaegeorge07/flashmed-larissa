/* FlashMed — armazenamento de mídias e ativos de oclusão de imagem via IndexedDB. */
// Image occlusion assets live in IndexedDB so large images do not overflow localStorage.
const FLASHMED_ASSET_DB='flashmed_assets_v1',FLASHMED_ASSET_STORE='images';
function flashmedAssetDB(){return new Promise((resolve,reject)=>{let req=indexedDB.open(FLASHMED_ASSET_DB,1);req.onupgradeneeded=()=>{let d=req.result;if(!d.objectStoreNames.contains(FLASHMED_ASSET_STORE))d.createObjectStore(FLASHMED_ASSET_STORE)};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function flashmedAssetPut(id,value){let d=await flashmedAssetDB();return new Promise((resolve,reject)=>{let tx=d.transaction(FLASHMED_ASSET_STORE,'readwrite');tx.objectStore(FLASHMED_ASSET_STORE).put(value,id);tx.oncomplete=()=>{d.close();resolve(true)};tx.onerror=()=>{d.close();reject(tx.error)}})}
async function flashmedAssetGet(id){let d=await flashmedAssetDB();return new Promise((resolve,reject)=>{let tx=d.transaction(FLASHMED_ASSET_STORE,'readonly'),q=tx.objectStore(FLASHMED_ASSET_STORE).get(id);q.onsuccess=()=>resolve(q.result||null);q.onerror=()=>reject(q.error);tx.oncomplete=()=>d.close()})}
async function flashmedAssetDelete(id){let d=await flashmedAssetDB();return new Promise((resolve,reject)=>{let tx=d.transaction(FLASHMED_ASSET_STORE,'readwrite');tx.objectStore(FLASHMED_ASSET_STORE).delete(id);tx.oncomplete=()=>{d.close();resolve(true)};tx.onerror=()=>{d.close();reject(tx.error)}})}
const OCCLUSION_CARDS_STORE_KEY='__flashmed_occlusion_cards_v1__';
async function occlusionLoadDedicatedCards(target=db){
  try{let box=await flashmedAssetGet(OCCLUSION_CARDS_STORE_KEY);let saved=box&&Array.isArray(box.cards)?box.cards:[];target.cards=target.cards||[];const deleted=new Set((target.deletedPersonalItems||db.deletedPersonalItems||[]).filter(x=>x&&x.collection==='cards').map(x=>String(x.id)));let seen=new Set(target.cards.map(c=>String(c.id))),added=0;for(const c of saved){if(deleted.has(String(c.id)))continue;if(!seen.has(String(c.id))){target.cards.push(c);seen.add(String(c.id));added++}}return added}catch(e){console.warn('Não foi possível carregar cartões de oclusão',e);return 0}
}
async function occlusionSaveDedicatedCards(cards){
  try{
    const deleted=new Set((db.deletedPersonalItems||[]).filter(x=>x&&x.collection==='cards').map(x=>String(x.id)));
    const current=(Array.isArray(cards)?cards:[]).filter(c=>!deleted.has(String(c.id))).map(c=>JSON.parse(JSON.stringify(c)));
    await flashmedAssetPut(OCCLUSION_CARDS_STORE_KEY,{cards:current,savedAt:Date.now()});
    let verify=await flashmedAssetGet(OCCLUSION_CARDS_STORE_KEY),saved=verify&&Array.isArray(verify.cards)?verify.cards:[];
    const ids=new Set(saved.map(c=>String(c.id))),written=current.filter(c=>ids.has(String(c.id))).length;
    return {ok:written===current.length&&saved.length===current.length,written,total:current.length};
  }catch(e){console.error('Falha no banco dedicado de oclusão',e);return {ok:false,written:0,total:Array.isArray(cards)?cards.length:0}}
}
async function occlusionDeleteDedicatedCard(id){
  try{let box=await flashmedAssetGet(OCCLUSION_CARDS_STORE_KEY);if(!box||!Array.isArray(box.cards))return true;box.cards=box.cards.filter(c=>String(c.id)!==String(id));box.savedAt=Date.now();await flashmedAssetPut(OCCLUSION_CARDS_STORE_KEY,box);return true}catch(e){console.warn('Falha ao remover cartão dedicado',e);return false}
}

function flashmedReferencedAssetIds(source=db){return [...new Set((source.cards||[]).map(c=>c&&c.occlusion&&c.occlusion.assetId).filter(Boolean))]}
async function occlusionHydrateAssets(source=db){source.imageAssets=source.imageAssets||{};let ids=flashmedReferencedAssetIds(source);for(const id of ids){let existing=source.imageAssets[id];if(existing&&existing.data){try{await flashmedAssetPut(id,existing)}catch(e){console.warn('Não foi possível migrar imagem de oclusão',e)}continue}try{let local=await flashmedAssetGet(id);if(local)source.imageAssets[id]=local}catch(e){console.warn('Não foi possível carregar imagem de oclusão',e)}}return source}
async function occlusionPersistRemoteAssets(source=db){source.imageAssets=source.imageAssets||{};for(const [id,a] of Object.entries(source.imageAssets)){if(a&&a.data){try{await flashmedAssetPut(id,a)}catch(e){console.warn('Não foi possível persistir imagem sincronizada',e)}}}}

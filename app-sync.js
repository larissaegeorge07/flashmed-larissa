/* FlashMed — sincronização local/nuvem e reconciliação de dados.
   Carregado antes dos módulos que definem os dados e auxiliares; funções executadas após a inicialização. */
async function syncUp(){
 if(!cloud||!currentUser)return;
 await occlusionHydrateAssets(db);
 const snapshot=JSON.parse(JSON.stringify(db));flashmedJournalRestore(snapshot);
 flashmedRecoverySnapshot('before_upload',snapshot);
 flashmedSyncQueue=flashmedSyncQueue.catch(()=>{}).then(async()=>{
  try{
   const q=await cloud.from('profiles').select('settings').eq('user_id',currentUser.id).single();
   if(q.error)throw q.error;
   const settings=Object.assign({},q.data?.settings||{});
   const remote=settings.flashmed_data;
   if(remote){flashmedRecoverySnapshot('remote_before_merge',remote);flashmedMergePersonal(snapshot,remote);mergeCardStudyHistory(snapshot,remote);flashmedMergeDeletionMarkers(snapshot,remote)}
   flashmedApplyDeletionMarkers(snapshot);
   // Apply deletion tombstones after every merge so stale copies cannot resurrect a removed weekly task.
   snapshot.deletedWeeklyTaskIds=Array.isArray(snapshot.deletedWeeklyTaskIds)?snapshot.deletedWeeklyTaskIds.map(String):[];
   if(snapshot.deletedWeeklyTaskIds.length){const deletedTasks=new Set(snapshot.deletedWeeklyTaskIds);const p=snapshot.studyPlan||(snapshot.studyPlan={});p.weeklyTasks=(p.weeklyTasks||[]).filter(t=>!deletedTasks.has(String(t.id)));p.weekSchedule=(p.weekSchedule||[]).filter(t=>!deletedTasks.has(String(t.taskId||t.id)));snapshot.agendaEvents=(snapshot.agendaEvents||[]).filter(e=>!deletedTasks.has(String(e.studyTaskId||'')));}
   const deletedOccurrenceKeys=new Set(Array.isArray(snapshot.deletedWeeklyTaskKeys)?snapshot.deletedWeeklyTaskKeys.map(String):[]);if(deletedOccurrenceKeys.size){const sig=x=>String(x?.title||'').trim().toLocaleLowerCase('pt-BR')+'|'+String(x?.date||'');const p=snapshot.studyPlan||(snapshot.studyPlan={});p.weeklyTasks=(p.weeklyTasks||[]).filter(t=>!deletedOccurrenceKeys.has(sig(t)));p.weekSchedule=(p.weekSchedule||[]).filter(t=>!deletedOccurrenceKeys.has(sig(t)));snapshot.agendaEvents=(snapshot.agendaEvents||[]).filter(e=>!deletedOccurrenceKeys.has(sig(e)));}
   // Also merge changes made locally while this upload was waiting.
   flashmedMergePersonal(snapshot,db);mergeCardStudyHistory(snapshot,db);
   // Critical: the local merge above can reintroduce stale rows. Union tombstones and filter again immediately before upload.
   flashmedApplyDeletionMarkers(snapshot,db);
   settings.flashmed_data=snapshot;
   const u=await cloud.from('profiles').update({settings,updated_at:new Date().toISOString()}).eq('user_id',currentUser.id);
   if(u.error)throw u.error;
   flashmedMergePersonal(db,snapshot);mergeCardStudyHistory(db,snapshot);
   // Keep the in-memory and local copies consistent with the deletion-safe cloud snapshot.
   flashmedApplyDeletionMarkers(db,snapshot);
   try{localStorage.setItem(KEY,JSON.stringify(flashmedLocalPayload(db)));}catch(localErr){console.warn('FlashMed: sincronizado na nuvem; espelho local excede a quota. Backup IndexedDB mantido.',localErr);flashmedEmergencySave(db);}
   cloudDot.classList.add('ok');flashmedSaveOK();saveState.textContent='salvo na nuvem';
  }catch(e){cloudDot.classList.remove('ok');saveState.textContent='erro na nuvem — dados locais preservados';console.error(e)}
 });
 return flashmedSyncQueue;
}
// Keep study attempts when a cloud refresh replaces the local card collection.
// Use a multiset merge: repeated ratings on the same day are genuine separate attempts.
function mergeCardStudyHistory(remote,local){
 if(!remote||!local||!Array.isArray(remote.cards)||!Array.isArray(local.cards))return false;
 const localById=new Map(local.cards.map(c=>[String(c.id),c]));
 let changed=false;
 for(const card of remote.cards){
  const old=localById.get(String(card.id));if(!old)continue;
  const existing=Array.isArray(card.history)?card.history:[];
  const previous=Array.isArray(old.history)?old.history:[];
  const count=new Map();
  const signature=h=>JSON.stringify([h.date||'',h.rating||'',h.at||h.timestamp||'']);
  for(const h of existing){const k=signature(h);count.set(k,(count.get(k)||0)+1)}
  for(const h of previous){
   const k=signature(h),n=count.get(k)||0;
   if(n>0){count.set(k,n-1);continue}
   existing.push(h);changed=true;
  }
  if(changed)card.history=existing;
  const good=existing.filter(h=>h.rating==='ok'||h.rating==='easy').length;
  const bad=existing.filter(h=>h.rating!=='ok'&&h.rating!=='easy').length;
  const newOk=Math.max(card.ok||0,old.ok||0,good),newBad=Math.max(card.bad||0,old.bad||0,bad);
  if(newOk!==(card.ok||0)||newBad!==(card.bad||0)){card.ok=newOk;card.bad=newBad;changed=true}
  if(previous.length>0&&(!card.due||((old.history||[]).length>=(card.history||[]).length&&old.due&&old.due>card.due))){
   if(old.due&&old.due!==card.due){card.due=old.due;card.interval=Math.max(card.interval||0,old.interval||0);changed=true}
  }
 }
 return changed;
}
async function syncDown(quiet=false){
  if(!cloud||!currentUser)return;
  const __fmSyncT0=performance.now();let __fmSyncMark=__fmSyncT0;
  const __fmSyncStep=(name)=>{const t=performance.now();flashmedPerfLog('sincronização',{step:name,stepMs:Math.round(t-__fmSyncMark),totalMs:Math.round(t-__fmSyncT0)});__fmSyncMark=t};
  try{
    const q=await cloud.from('profiles').select('settings').eq('user_id',currentUser.id).single();
    __fmSyncStep('leitura do perfil na nuvem');
    if(q.error){
      if(q.error.code==='PGRST116'){
        const initial=flashmedEmptyAccountData();
        const created=await cloud.from('profiles').insert({user_id:currentUser.id,settings:{flashmed_data:initial},updated_at:new Date().toISOString()});
        if(created.error)throw created.error;
        db=initial;localStorage.setItem(KEY,JSON.stringify(flashmedLocalPayload(db)));localStorage.setItem('flashmed_active_user_id',currentUser.id);
        return await syncDown(quiet);
      }
      throw q.error;
    }
    const remote=q.data?.settings?.flashmed_data;
    const localAccountId=localStorage.getItem('flashmed_active_user_id');
    // Never merge another account's browser cache into the authenticated user's cloud data.
    const localBeforeSync=localAccountId===currentUser.id?db:flashmedEmptyAccountData();
    if(remote){
      flashmedRecoverySnapshot('local_before_download',localBeforeSync);
      flashmedRecoverySnapshot('cloud_before_download',remote);
      const recoveredLocalPersonal=flashmedMergePersonal(remote,localBeforeSync);
      const recoveredJournal=flashmedJournalRestore(remote);
      const recoveredLocalStudy=mergeCardStudyHistory(remote,localBeforeSync);
      const recoveredEmergency=await flashmedEmergencyRestore(remote);
      const recoveredOcclusionCards=await occlusionLoadDedicatedCards(remote);
      // After authentication, Supabase is the source of truth. This is essential
      // on a new/incognito browser, whose freshly-created local DB may have a
      // newer timestamp but contains no user data.
      db=remote;
      const recoveredDeletionMarkers=flashmedApplyDeletionMarkers(db,localBeforeSync);
      // Preserve intentional deletions of weekly planning tasks across cloud refreshes.
      db.deletedWeeklyTaskIds=Array.isArray(db.deletedWeeklyTaskIds)?db.deletedWeeklyTaskIds.map(String):[];
      if(db.deletedWeeklyTaskIds.length){const deletedTasks=new Set(db.deletedWeeklyTaskIds);const p=db.studyPlan||(db.studyPlan={});p.weeklyTasks=(p.weeklyTasks||[]).filter(t=>!deletedTasks.has(String(t.id)));p.weekSchedule=(p.weekSchedule||[]).filter(t=>!deletedTasks.has(String(t.taskId||t.id)));db.agendaEvents=(db.agendaEvents||[]).filter(e=>!deletedTasks.has(String(e.studyTaskId||'')));}
      const deletedOccurrenceKeys=new Set(Array.isArray(db.deletedWeeklyTaskKeys)?db.deletedWeeklyTaskKeys.map(String):[]);if(deletedOccurrenceKeys.size){const sig=x=>String(x?.title||'').trim().toLocaleLowerCase('pt-BR')+'|'+String(x?.date||'');const p=db.studyPlan||(db.studyPlan={});p.weeklyTasks=(p.weeklyTasks||[]).filter(t=>!deletedOccurrenceKeys.has(sig(t)));p.weekSchedule=(p.weekSchedule||[]).filter(t=>!deletedOccurrenceKeys.has(sig(t)));db.agendaEvents=(db.agendaEvents||[]).filter(e=>!deletedOccurrenceKeys.has(sig(e)));}
      // Normalize preferences when loading older cloud data. This keeps
      // "Meu FlashMed" compatible with accounts created before personalization.
      db.settings=db.settings||{};
      db.settings.appearance=db.settings.appearance||'light';
      db.settings.questionFont=db.settings.questionFont||'normal';
      db.settings.density=db.settings.density||'comfortable';
      db.settings.dashboard=Object.assign(
        {missions:true,kpis:true,focus:true,exams:true,study:true},
        db.settings.dashboard||{}
      );
      db.subjects=db.subjects||[];
      db.subjectIcons=db.subjectIcons||{};
      db.knowledgeNotes=db.knowledgeNotes||[];db.knowledgeBooks=db.knowledgeBooks||[];
      db.cards=db.cards||[];
      db.questions=db.questions||[];
      db.sessions=db.sessions||[];
      db.reminders=db.reminders||[];
      db.decorebas=db.decorebas||[];
      db.imageAssets=db.imageAssets||{};
      await occlusionPersistRemoteAssets(db);
      await occlusionHydrateAssets(db);
      __fmSyncStep('recuperação e hidratação de mídias');
      // Keep built-in official question-bank content when the user's cloud data
      // predates a new app release. User data remains the source of truth for
      // personal content; only missing official seeded questions are merged in.
      db.bankQuestions=db.bankQuestions||[];
      db.bankAttempts=db.bankAttempts||[];
      db.bankAnnotations=db.bankAnnotations||{};
      let addedOfficial=false;
      for(const q of db.bankQuestions){if(String(q.id||'').startsWith('sus26-')){q.exam='SUS-BA 2026.1';q.family='SUS-BA Oficial'}}
      for(const item of [...SUS261_ALL,...SUS262,...SUS251,...SUS252,...SUS241,...SUS231,...[...(window.PEDCHAT262||[])]]){
        if(!db.bankQuestions.some(x=>x.id===item.id)){db.bankQuestions.push(item);addedOfficial=true}
      }
      const correctedOfficial=applyExactOfficialText();
      // Update this individually reviewed commentary in existing cloud question banks.
      let evidenceResolutionUpdated=false;
      const reviewedTB1=SUS26_1.find(x=>x.id==='sus26-1');
      const storedTB1=db.bankQuestions.find(x=>x.id==='sus26-1');
      if(reviewedTB1&&storedTB1&&storedTB1.resolution!==reviewedTB1.resolution){
       storedTB1.resolution=reviewedTB1.resolution;evidenceResolutionUpdated=true;
      }
      const expandedLessons=applySUS261MiniLessons();
      let expanded251=applySUS251MiniLessons();
      for(const seed of SUS251){const saved=db.bankQuestions.find(x=>x.id===seed.id);if(saved&&saved.resolution!==seed.resolution){saved.resolution=seed.resolution;expanded251=true}}
      let expanded262=false;
      for(const seed of SUS262){
        const saved=db.bankQuestions.find(x=>x.id===seed.id);
        if(saved&&saved.resolution!==seed.resolution){saved.resolution=seed.resolution;expanded262=true}
      }
      let expanded252=applySUS252MiniLessons();
      for(const seed of SUS252){
        const saved=db.bankQuestions.find(x=>x.id===seed.id);
        if(saved&&saved.resolution!==seed.resolution){saved.resolution=seed.resolution;expanded252=true}
      }
      let expanded241=applySUS241MiniLessons();
      for(const seed of SUS241){
        const saved=db.bankQuestions.find(x=>x.id===seed.id);
        if(saved&&saved.resolution!==seed.resolution){saved.resolution=seed.resolution;expanded241=true}
      }
      const definitive241Corrected=reconcileSUS241Definitive();
      __fmSyncStep('verificação e atualização do banco de questões');
      const removedOriginalTest=removeOriginalTestCard();
      const migratedBankCards=refreshBankErrorFlashcards({deferSave:true});
      const removedDuolingo=flashmedApplyDeletionMarkers(db,localBeforeSync)||recoveredDeletionMarkers;
      localStorage.setItem(KEY,JSON.stringify(flashmedLocalPayload(db)));
      if(removedDuolingo||evidenceResolutionUpdated||recoveredJournal||recoveredLocalPersonal||recoveredLocalStudy||recoveredEmergency||recoveredOcclusionCards||migratedBankCards.changed||removedOriginalTest||addedOfficial||correctedOfficial||expandedLessons||expanded251||expanded262||expanded252||expanded241||definitive241Corrected) await syncUp();
      __fmSyncStep('mesclagem e eventuais gravações');
      render();
    } else {
      db=localBeforeSync;
      await syncUp();
    }
    localStorage.setItem('flashmed_active_user_id',currentUser.id);
    cloudDot.classList.add('ok');saveState.textContent='nuvem sincronizada';if(!quiet)toast('Sincronizado ♡');
  }catch(e){console.error(e);cloudDot.classList.remove('ok');if(!quiet)toast('Não foi possível sincronizar')}
}

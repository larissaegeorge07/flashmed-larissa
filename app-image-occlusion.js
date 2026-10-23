// FlashMed — ferramenta de oclusão de imagem para criação de flashcards.
// Compartilha o escopo global clássico da aplicação.
function imageOcclusionView(){
  let opts=(db.subjects||[]).map(function(x){return '<option>'+esc(x)+'</option>'}).join('');
  setTimeout(occlusionRestoreDraft,0);
  return '<div class="panel hero"><h2>▣ Oclusão de imagem</h2><p>Envie ou cole uma imagem e marque todas as áreas de uma vez. O FlashMed cria um cartão por área: em cada cartão, só aquela área fica oculta e todo o restante da imagem permanece visível.</p><div class="row"><span class="pill">1 imagem → vários cards</span><span class="pill">mouse + toque</span><span class="pill">rascunho automático</span></div></div>'
  +'<div class="panel" style="margin-top:16px"><div class="split"><label>Matéria<select id="occSubject" class="field" onchange="occlusionScheduleDraftSave()">'+opts+'</select></label><label>Tags<input id="occTags" class="field" value="oclusão de imagem" placeholder="ex.: anatomia, obstetrícia" oninput="occlusionScheduleDraftSave()"></label></div>'
  +'<div class="occlusionDrop" id="occDrop"><b>📷 Escolha ou cole uma imagem</b><p class="muted">Use o botão abaixo ou Ctrl+V / ⌘V para colar uma captura de tela.</p><label class="btn">Escolher imagem<input type="file" accept="image/*" hidden onchange="occlusionLoadFile(this.files[0])"></label></div>'
  +'<div id="occWorkspace" class="hidden" style="margin-top:14px"><div class="row" style="justify-content:space-between"><div><b>Arraste sobre o que deseja esconder</b><div class="muted">Marque quantas áreas quiser. Cada retângulo vira um cartão separado e, na revisão, somente aquele retângulo fica oculto; os demais permanecem visíveis. O rascunho é salvo automaticamente.</div></div><div class="row"><button class="btn ghost" onclick="occlusionUndo()">↶ Desfazer</button><button class="btn ghost" onclick="occlusionClear()">Limpar marcações</button><button class="btn ghost" onclick="occlusionResetImage()">Trocar imagem</button></div></div><div style="overflow:auto;margin-top:12px;text-align:center"><div id="occStage" class="occlusionStage"><img id="occImg" alt="Imagem para oclusão"><div id="occLayer"></div></div></div><div id="occAnswers" class="occlusionList"></div><div class="occlusionSaveBar row" style="justify-content:space-between"><div><b>Rascunho protegido</b><div id="occDraftStatus" class="muted">Salvando automaticamente…</div><div id="occSaveState" class="muted"></div></div><div class="row"><span id="occCount" class="pill">0 marcações</span><button id="occSaveBtn" class="btn ok" onclick="occlusionCreateCards()">Salvar flashcards</button></div></div></div></div>';
}

const OCC_DRAFT_KEY='flashmed_occlusion_draft_v1',OCC_DRAFT_ASSET='__flashmed_occlusion_draft_image__';
let occlusionDraftTimer=null;
function occlusionDraftMeta(){let s=document.getElementById('occSubject'),t=document.getElementById('occTags');return {rects:occlusionRects,subject:s?s.value:'',tags:t?t.value:'oclusão de imagem',savedAt:Date.now()}}
function occlusionSaveDraftMeta(){if(!occlusionImageData)return;try{localStorage.setItem(OCC_DRAFT_KEY,JSON.stringify(occlusionDraftMeta()));let el=document.getElementById('occDraftStatus');if(el)el.textContent='Rascunho salvo às '+new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}catch(e){console.warn('Rascunho de oclusão',e)}}
function occlusionScheduleDraftSave(){clearTimeout(occlusionDraftTimer);occlusionDraftTimer=setTimeout(occlusionSaveDraftMeta,180)}
async function occlusionStoreDraftImage(){if(!occlusionImageData)return;try{await flashmedAssetPut(OCC_DRAFT_ASSET,{data:occlusionImageData,createdAt:Date.now()});occlusionSaveDraftMeta()}catch(e){console.warn('Imagem de rascunho não salva',e)}}
async function occlusionClearDraft(){clearTimeout(occlusionDraftTimer);try{localStorage.removeItem(OCC_DRAFT_KEY);await flashmedAssetDelete(OCC_DRAFT_ASSET)}catch(e){}}
async function occlusionRestoreDraft(){
  if(route!=='Oclusão de imagem'||occlusionImageData)return;
  let meta=null;try{meta=JSON.parse(localStorage.getItem(OCC_DRAFT_KEY)||'null')}catch(e){}if(!meta)return;
  try{let a=await flashmedAssetGet(OCC_DRAFT_ASSET);if(!a||!a.data)return;occlusionImageData=a.data;occlusionRects=Array.isArray(meta.rects)?meta.rects:[];occlusionShowWorkspace();setTimeout(()=>{let s=document.getElementById('occSubject'),t=document.getElementById('occTags');if(s&&meta.subject&&[...s.options].some(o=>o.value===meta.subject))s.value=meta.subject;if(t&&meta.tags!=null)t.value=meta.tags;let el=document.getElementById('occDraftStatus');if(el)el.textContent='Rascunho recuperado automaticamente';occlusionRenderRects()},60)}catch(e){console.warn('Não foi possível recuperar rascunho',e)}
}
function occlusionAnswerChanged(i,value){if(occlusionRects[i])occlusionRects[i].answer=value;occlusionScheduleDraftSave()}
function occlusionAnswerKey(e,i){if(e.key!=='Enter'||e.shiftKey)return;e.preventDefault();let next=document.querySelector('[data-occ-answer="'+(i+1)+'"]');if(next){next.focus();next.select()}else{occlusionCreateCards()}}

function occlusionLoadFile(file){
  if(!file||!String(file.type||'').startsWith('image/'))return toast('Escolha um arquivo de imagem');
  let fr=new FileReader();fr.onload=function(){occlusionCompressImage(fr.result)};fr.readAsDataURL(file);
}
function occlusionCompressImage(src){
  let im=new Image();im.onload=function(){
    let max=1400,scale=Math.min(1,max/Math.max(im.naturalWidth,im.naturalHeight)),w=Math.max(1,Math.round(im.naturalWidth*scale)),h=Math.max(1,Math.round(im.naturalHeight*scale));
    let c=document.createElement('canvas');c.width=w;c.height=h;let x=c.getContext('2d');x.drawImage(im,0,0,w,h);
    occlusionImageData=c.toDataURL('image/jpeg',0.82);occlusionRects=[];occlusionShowWorkspace();occlusionStoreDraftImage();
  };im.onerror=function(){toast('Não consegui abrir esta imagem')};im.src=src;
}
function occlusionShowWorkspace(){
  let d=document.getElementById('occDrop'),w=document.getElementById('occWorkspace'),im=document.getElementById('occImg');if(!w||!im)return;
  if(d)d.classList.add('hidden');w.classList.remove('hidden');im.onload=function(){occlusionSetupPointer();occlusionRenderRects()};im.src=occlusionImageData;
}
function occlusionSetupPointer(){
  let st=document.getElementById('occStage');if(!st||st.dataset.ready)return;st.dataset.ready='1';
  function pos(e){let r=st.getBoundingClientRect();return {x:Math.max(0,Math.min(r.width,e.clientX-r.left)),y:Math.max(0,Math.min(r.height,e.clientY-r.top)),w:r.width,h:r.height}}
  st.onpointerdown=function(e){if(e.button!==undefined&&e.button!==0)return;let p=pos(e);occlusionDrag={sx:p.x,sy:p.y,x:p.x,y:p.y,w:p.w,h:p.h};try{st.setPointerCapture(e.pointerId)}catch(err){}occlusionRenderRects()};
  st.onpointermove=function(e){if(!occlusionDrag)return;let p=pos(e);occlusionDrag.x=p.x;occlusionDrag.y=p.y;occlusionRenderRects()};
  st.onpointerup=function(e){if(!occlusionDrag)return;let d=occlusionDrag;occlusionDrag=null;let x=Math.min(d.sx,d.x),y=Math.min(d.sy,d.y),rw=Math.abs(d.x-d.sx),rh=Math.abs(d.y-d.sy);if(rw>=12&&rh>=12)occlusionRects.push({x:x/d.w,y:y/d.h,w:rw/d.w,h:rh/d.h,answer:''});occlusionRenderRects();occlusionScheduleDraftSave()};
  st.onpointercancel=function(){occlusionDrag=null;occlusionRenderRects()};
}
function occlusionRenderRects(){
  let st=document.getElementById('occStage'),layer=document.getElementById('occLayer'),ans=document.getElementById('occAnswers'),cnt=document.getElementById('occCount');if(!st||!layer)return;
  let html=occlusionRects.map(function(r,i){return '<div class="occlusionBox" style="left:'+(r.x*100)+'%;top:'+(r.y*100)+'%;width:'+(r.w*100)+'%;height:'+(r.h*100)+'%"><span>'+(i+1)+'</span></div>'}).join('');
  if(occlusionDrag){let d=occlusionDrag,x=Math.min(d.sx,d.x),y=Math.min(d.sy,d.y),w=Math.abs(d.x-d.sx),h=Math.abs(d.y-d.sy);html+='<div class="occlusionDrawing" style="left:'+x+'px;top:'+y+'px;width:'+w+'px;height:'+h+'px"></div>'}
  layer.innerHTML=html;
  if(ans)ans.innerHTML=occlusionRects.map(function(r,i){return '<div class="occlusionItem"><b>Área '+(i+1)+'</b><input data-occ-answer="'+i+'" class="field" style="margin:0" value="'+esc(r.answer||'')+'" placeholder="Resposta opcional (ex.: artéria cerebral média)" oninput="occlusionAnswerChanged('+i+',this.value)" onkeydown="occlusionAnswerKey(event,'+i+')"><button class="btn ghost mini" onclick="occlusionDeleteRect('+i+')">Remover</button></div>'}).join('');
  if(cnt)cnt.textContent=occlusionRects.length+' marcação'+(occlusionRects.length===1?'':'ões');
}
function occlusionDeleteRect(i){occlusionRects.splice(i,1);occlusionRenderRects();occlusionScheduleDraftSave()}
function occlusionUndo(){if(occlusionRects.length){occlusionRects.pop();occlusionRenderRects();occlusionScheduleDraftSave()}}
function occlusionClear(){occlusionRects=[];occlusionRenderRects();occlusionScheduleDraftSave()}
async function occlusionResetImage(){occlusionImageData='';occlusionRects=[];await occlusionClearDraft();let d=document.getElementById('occDrop'),w=document.getElementById('occWorkspace');if(d)d.classList.remove('hidden');if(w)w.classList.add('hidden')}
async function occlusionCreateCards(){
  let status=document.getElementById('occSaveState'),btn=document.getElementById('occSaveBtn');
  function state(msg,bad=false){if(status){status.textContent=msg;status.style.color=bad?'#a31836':''}}
  if(!occlusionImageData){state('Escolha uma imagem primeiro.',true);return toast('Escolha uma imagem primeiro')}
  if(!occlusionRects.length){state('Marque pelo menos uma área.',true);return toast('Marque pelo menos uma área na imagem')}
  if(btn){btn.disabled=true;btn.textContent='Salvando…'}
  let subjectEl=document.getElementById('occSubject'),tagsEl=document.getElementById('occTags'),subject=subjectEl?subjectEl.value:(db.subjects[0]||'Geral'),tags=tagsEl?tagsEl.value:'oclusão de imagem';
  let assetId='occ_'+Date.now()+'_'+Math.random().toString(36).slice(2,8),asset={data:occlusionImageData,createdAt:Date.now()},base=Date.now();
  state('1/3 Salvando a imagem…');
  try{await flashmedAssetPut(assetId,asset)}catch(e){console.error(e);if(btn){btn.disabled=false;btn.textContent='Salvar flashcards'}state('Erro ao salvar a imagem. O rascunho foi mantido.',true);return toast('Não consegui salvar a imagem')}
  let batchId='batch_'+base+'_'+Math.random().toString(36).slice(2,7),cards=occlusionRects.map(function(r,i){return {id:base+i,subject:subject,front:'Identifique a estrutura ocultada.',back:esc(r.answer||''),media:'',tags:tags||'oclusão de imagem',ok:0,bad:0,interval:0,due:day(),history:[],occlusion:{assetId:assetId,batchId:batchId,index:i+1,total:occlusionRects.length,rect:{x:r.x,y:r.y,w:r.w,h:r.h}}}});
  state('2/3 Salvando os cartões…');
  let result=await occlusionSaveDedicatedCards(cards);
  if(!result.ok){try{await flashmedAssetDelete(assetId)}catch(e){}if(btn){btn.disabled=false;btn.textContent='Salvar flashcards'}state('Falha no lote: '+result.written+'/'+result.total+' cartões gravados. O rascunho continua protegido.',true);return toast('Não foi possível salvar todos os cartões')}
  state('2/3 Lote confirmado: '+result.written+'/'+result.total+' cartões gravados ✓');
  db.imageAssets=db.imageAssets||{};db.imageAssets[assetId]=asset;db.cards=db.cards||[];let seen=new Set(db.cards.map(c=>String(c.id)));for(const c of cards)if(!seen.has(String(c.id)))db.cards.push(c);
  let n=cards.length;state('3/3 '+n+'/'+n+' flashcard'+(n===1?' confirmado':'s confirmados')+' ✓');
  flashmedSaveOK();
  if(saveState)saveState.textContent='flashcards de oclusão salvos';
  activeSubject=subject;
  await occlusionClearDraft();occlusionImageData='';occlusionRects=[];
  renderSubject();toast(n+' flashcard'+(n===1?' salvo':'s salvos')+' ♡');
  // Cloud sync is optional and must never block or undo the dedicated local save.
  if(cloud&&currentUser){setTimeout(async()=>{try{await syncUp()}catch(e){console.warn('Sincronização posterior da oclusão falhou; cartão local preservado',e)}},0)}
}
function imageOcclusionPasteHandler(e){
  let items=Array.from((e.clipboardData&&e.clipboardData.items)||[]),it=items.find(function(x){return String(x.type||'').startsWith('image/')});
  if(!it)return;
  if(route==='Oclusão de imagem'){e.preventDefault();occlusionLoadFile(it.getAsFile());return}
  if(route==='Caderno de Conhecimentos'&&(knowledgeEditingId==='newNote'||knowledgeEditingId!==null)){
   const target=e.target,editor=target&&target.closest&&target.closest('#knowledgeNoteTitle,#knowledgeNoteContent,#knowledgeNoteTags,#knowledgeNoteLinks,.knowledgeEditor');
   if(!editor)return;
   e.preventDefault();
   const file=it.getAsFile();if(!file)return;
   const namedFile=new File([file],'imagem-colada-'+Date.now()+'.png',{type:file.type||'image/png'});
   const maxFiles=10,maxFileSize=25*1024*1024;
   if(knowledgeDraftAttachments.length+knowledgeDraftFiles.length>=maxFiles)return toast('Adicione no máximo 10 anexos por post-it');
   if(namedFile.size>maxFileSize)return toast('A imagem colada ultrapassa 25 MB');
   knowledgeDraftFiles.push({id:knowledgeAttachmentId(),type:'localImage',file:namedFile});
   knowledgeRenderDraftAttachments();toast('Imagem adicionada ao post-it. Clique em Salvar post-it para guardar.');
  }
}
document.addEventListener('paste',imageOcclusionPasteHandler);



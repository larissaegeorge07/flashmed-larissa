/* FlashMed — Caderno de Conhecimentos, notas, anexos e compartilhamento. */
function knowledgeInitBooks(){
 db.knowledgeBooks=Array.isArray(db.knowledgeBooks)?db.knowledgeBooks:[];
 db.knowledgeNotes=Array.isArray(db.knowledgeNotes)?db.knowledgeNotes:[];
 db.knowledgeNotes.forEach(n=>{if(n.bookId===undefined){let oldName=String(n.subject||'').trim();if(oldName){let b=db.knowledgeBooks.find(x=>x.name.toLocaleLowerCase('pt-BR')===oldName.toLocaleLowerCase('pt-BR'));if(!b){b={id:'kb_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),name:oldName,createdAt:Date.now()};db.knowledgeBooks.push(b)}n.bookId=b.id}else n.bookId=''}});
}
knowledgeInitBooks();
function knowledgeBookName(id){return db.knowledgeBooks.find(b=>String(b.id)===String(id))?.name||'Sem caderno'}
function knowledgeNotesView(){
 knowledgeInitBooks();
 if(knowledgeCurrentBookId!==null&&!db.knowledgeBooks.some(b=>String(b.id)===String(knowledgeCurrentBookId)))knowledgeCurrentBookId=null;
 if(knowledgeCurrentBookId!==null)return knowledgeNotebookView(knowledgeCurrentBookId);
 const q=String(document.getElementById('knowledgeBookSearch')?.value||'').trim().toLocaleLowerCase('pt-BR');
 const books=db.knowledgeBooks.filter(b=>!q||b.name.toLocaleLowerCase('pt-BR').includes(q)).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
 return '<div class="panel hero"><h2>📚 Meus Cadernos</h2><p>Um espaço pessoal para guardar ideias, livros, medicina, projetos, links e qualquer tema que você quiser. Crie seus próprios cadernos — eles não dependem das matérias dos flashcards ou das questões.</p><div class="row"><span class="pill">'+db.knowledgeBooks.length+' caderno(s)</span><span class="pill">online • sincronizado com sua conta</span></div></div>'+
 '<div class="panel" style="margin-top:14px"><div class="row" style="align-items:flex-end"><label style="flex:2;min-width:180px">Buscar caderno<input id="knowledgeBookSearch" class="field" placeholder="Ex.: Livros, Medicina, Ideias…" value="'+esc(q)+'" oninput="knowledgeRefreshBooks()"></label><button class="btn" onclick="knowledgeNewBook()">＋ Criar caderno</button></div>'+
 '<div id="knowledgeBookResults" class="knowledgeBookGrid">'+knowledgeBookCards(books)+'</div></div>'+
 (knowledgeEditingId==='newBook'?knowledgeBookEditorHtml(null):knowledgeEditingId!==null?knowledgeBookEditorHtml(knowledgeEditingId):'');
}
function knowledgeBookCards(books){if(!books.length)return '<div class="panel" style="text-align:center;grid-column:1/-1"><h3>Nenhum caderno ainda</h3><p class="muted">Crie seu primeiro caderno com qualquer nome que faça sentido para você.</p><button class="btn" onclick="knowledgeNewBook()">＋ Criar meu primeiro caderno</button></div>';return books.map(b=>'<article class="knowledgeBookCard"><div class="knowledgeBookIcon">'+esc(b.icon||'📒')+'</div><h3>'+esc(b.name)+'</h3><div class="muted">'+db.knowledgeNotes.filter(n=>String(n.bookId||'')===String(b.id)).length+' post-it(s)</div><div class="knowledgeBookActions"><button class="btn" onclick="knowledgeOpenBook('+knowledgeJsArg(b.id)+')">Abrir caderno</button><button class="btn ghost mini" onclick="knowledgeEditBook('+knowledgeJsArg(b.id)+')">Editar</button><button class="btn ghost mini" onclick="knowledgeDeleteBook('+knowledgeJsArg(b.id)+')">Excluir</button></div></article>').join('')}
function knowledgeBookEditorHtml(id){let b=id===null?{name:'',icon:'📒'}:db.knowledgeBooks.find(x=>String(x.id)===String(id));if(!b)return '';const icons=['📒','📚','🩺','🧠','💊','🫀','🧬','🔬','📝','💡','📖','🎯','⭐','🎬','🎧','🔗','🗂️','🌱','❤️','⚕️','🧪','🩻','👩‍⚕️','🏥','📌','🧾'];return '<div class="panel knowledgeEditor"><h3>'+(id===null?'Criar caderno':'Editar caderno')+'</h3><label>Nome do caderno<input id="knowledgeBookName" class="field" maxlength="80" placeholder="Ex.: Medicina, Livros, Ideias…" value="'+esc(b.name||'')+'"></label><div class="knowledgeIconPicker"><span>Escolha um ícone para este caderno</span><div class="knowledgeIconOptions">'+icons.map(ic=>'<button type="button" class="knowledgeIconOption '+((b.icon||'📒')===ic?'active':'')+'" data-knowledge-icon="'+ic+'" aria-label="Ícone '+ic+'" onclick="knowledgeChooseBookIcon(this)">'+ic+'</button>').join('')+'</div><input type="hidden" id="knowledgeBookIconChoice" value="'+esc(b.icon||'📒')+'"></div><div class="knowledgeActions"><button class="btn ok" onclick="knowledgeSaveBook('+ (id===null?'null':knowledgeJsArg(id)) +')">Salvar caderno</button><button class="btn ghost" onclick="knowledgeCancelBook()">Cancelar</button></div></div>'}
function knowledgeRefreshBooks(){const q=document.getElementById('knowledgeBookSearch')?.value||'',el=document.getElementById('knowledgeBookResults');if(el){const n=q.trim().toLocaleLowerCase('pt-BR');el.innerHTML=knowledgeBookCards(db.knowledgeBooks.filter(b=>!n||b.name.toLocaleLowerCase('pt-BR').includes(n)).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR')))}}
function knowledgeNewBook(){knowledgeEditingId='newBook';knowledgeNotesViewRender();document.getElementById('knowledgeBookName')?.focus()}
function knowledgeEditBook(id){knowledgeEditingId=id;knowledgeNotesViewRender();document.getElementById('knowledgeBookName')?.focus()}
function knowledgeCancelBook(){knowledgeEditingId=null;knowledgeNotesViewRender()}
function knowledgeChooseBookIcon(btn){if(!btn)return;const input=document.getElementById('knowledgeBookIconChoice');if(input)input.value=btn.dataset.knowledgeIcon||'📒';document.querySelectorAll('.knowledgeIconOption').forEach(el=>el.classList.toggle('active',el===btn))}
function knowledgeSaveBook(id){const el=document.getElementById('knowledgeBookName'),name=el?el.value.trim():'',icon=document.getElementById('knowledgeBookIconChoice')?.value||'📒';if(!name)return toast('Digite um nome para o caderno');if(db.knowledgeBooks.some(b=>b.name.toLocaleLowerCase('pt-BR')===name.toLocaleLowerCase('pt-BR')&&String(b.id)!==String(id)))return toast('Você já tem um caderno com esse nome');if(id===null){db.knowledgeBooks.push({id:'kb_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),name,icon,createdAt:Date.now()})}else{const b=db.knowledgeBooks.find(x=>String(x.id)===String(id));if(!b)return toast('Caderno não encontrado');b.name=name;b.icon=icon;b.updatedAt=Date.now()}knowledgeEditingId=null;const ok=save();knowledgeNotesViewRender();toast(ok?'Caderno salvo':'Não foi possível salvar; verifique o armazenamento')}
function knowledgeDeleteBook(id){const b=db.knowledgeBooks.find(x=>String(x.id)===String(id));if(!b||!confirm('Excluir o caderno “'+b.name+'”? As anotações serão movidas para “Sem caderno”.'))return;let loose=db.knowledgeBooks.find(x=>x.name==='Sem caderno'&&String(x.id)!==String(id));const hasNotes=db.knowledgeNotes.some(n=>String(n.bookId||'')===String(id));if(hasNotes&&!loose){loose={id:'kb_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),name:'Sem caderno',createdAt:Date.now()};db.knowledgeBooks.push(loose)}db.knowledgeNotes.forEach(n=>{if(String(n.bookId||'')===String(id)){n.bookId=hasNotes?loose.id:'';n.updatedAt=Date.now()}});db.knowledgeBooks=db.knowledgeBooks.filter(x=>String(x.id)!==String(id));knowledgeEditingId=null;save();knowledgeNotesViewRender();toast('Caderno excluído; as anotações foram preservadas')}
function knowledgeOpenBook(id){knowledgeCurrentBookId=id;knowledgeEditingId=null;knowledgeNotesViewRender()}
function knowledgeBackToBooks(){knowledgeCurrentBookId=null;knowledgeEditingId=null;knowledgeNotesViewRender()}
function knowledgeNotebookView(id){const book=db.knowledgeBooks.find(b=>String(b.id)===String(id));if(!book)return '';const q=String(document.getElementById('knowledgeNoteSearch')?.value||'').trim().toLocaleLowerCase('pt-BR');const notes=db.knowledgeNotes.filter(n=>String(n.bookId||'')===String(id)&&(!q||[n.title,n.content,(n.tags||[]).join(' ')].join(' ').toLocaleLowerCase('pt-BR').includes(q))).sort((a,b)=>(b.updatedAt||b.createdAt||0)-(a.updatedAt||a.createdAt||0));return '<button class="btn ghost knowledgeBack" onclick="knowledgeBackToBooks()">← Todos os cadernos</button><div class="panel hero"><div class="knowledgeNotebookTitle"><span class="knowledgeNotebookIcon">'+esc(book.icon||'📒')+'</span><h2>'+esc(book.name)+'</h2></div><p>Este é o seu espaço para reunir anotações e ideias sobre este tema.</p><div class="row"><span class="pill">'+db.knowledgeNotes.filter(n=>String(n.bookId||'')===String(id)).length+' anotação(ões)</span><button class="btn" onclick="knowledgeNewNote()">＋ Novo post-it</button><button class="btn ghost" onclick="knowledgeShareSelected()">🔗 Compartilhar selecionadas</button></div></div><div class="panel" style="margin-top:14px"><label>Buscar nesta página<input id="knowledgeNoteSearch" class="field" placeholder="Buscar nas suas anotações…" value="'+esc(q)+'" oninput="knowledgeRefreshNotes()"></label><div id="knowledgeNoteResults" class="knowledgeNotesGrid">'+knowledgeNoteCards(notes)+'</div></div>'+(knowledgeEditingId==='newNote'?knowledgeNoteEditorHtml(null,id):knowledgeEditingId!==null?knowledgeNoteEditorHtml(knowledgeEditingId,id):'')}
function knowledgeParseAttachmentUrls(raw){
 const seen=new Set(),out=[];
 for(const line of String(raw||'').split(/\r?\n/)){
  const value=line.trim();if(!value)continue;
  try{
   const u=new URL(value);
   if(!['http:','https:'].includes(u.protocol))continue;
   const url=u.href;if(seen.has(url))continue;seen.add(url);
   const path=(u.pathname||'').toLowerCase();
   let type='link';
   if(/\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(path))type='image';
   else if(/\.(mp3|m4a|aac|wav|ogg|oga|opus)(\?|$)/i.test(path))type='audio';
   else if(/\.(mp4|webm|mov|m4v|ogv)(\?|$)/i.test(path))type='video';
   else if(/(^|\.)youtube\.com$|(^|\.)youtu\.be$|(^|\.)vimeo\.com$/i.test(u.hostname))type='video';
   out.push({url,type,label:u.hostname.replace(/^www\./i,'')});
  }catch(e){}
 }
 return out;
}
function knowledgeAttachmentHtml(items){
 if(!Array.isArray(items)||!items.length)return '';
 return '<div class="knowledgeAttachments"><div class="knowledgeAttachmentHeading">📎 Anexos</div>'+items.map(a=>{
  const label=knowledgeAttachmentLabel(a);
  if(a.storage==='cloudImage'&&a.dataUrl&&String(a.dataUrl).startsWith('data:image/')){
   const url=esc(a.dataUrl);
   return '<div class="knowledgeAttachmentMedia"><a class="knowledgeAttachmentImage" href="'+url+'" target="_blank" rel="noopener noreferrer"><img loading="lazy" src="'+url+'" alt="'+label+'"><span>'+label+'</span></a></div>';
  }
  if(a.storage==='local'&&a.id){
   const id=esc(a.id),type=a.type||'';
   if(type==='localImage')return '<div class="knowledgeAttachmentMedia"><a class="knowledgeAttachmentImage" href="#" data-knowledge-media-id="'+id+'" target="_blank" rel="noopener noreferrer"><img loading="lazy" data-knowledge-media-id="'+id+'" alt="'+label+'"><span>'+label+'</span></a></div>';
   if(type==='localAudio')return '<div class="knowledgeAttachmentMedia"><div class="knowledgeAttachmentLabel">🎧 '+label+'</div><audio controls preload="none" data-knowledge-media-id="'+id+'"></audio></div>';
   if(type==='localVideo')return '<div class="knowledgeAttachmentMedia"><div class="knowledgeAttachmentLabel">🎬 '+label+'</div><video controls preload="none" data-knowledge-media-id="'+id+'"></video></div>';
   if(type==='localPdf')return '<a class="knowledgeAttachmentLink" href="#" data-knowledge-media-id="'+id+'" target="_blank" rel="noopener noreferrer"><span>📄</span><span><strong>'+label+'</strong><small>PDF • abrir documento</small></span><span>↗</span></a>';
  }
  let u;try{u=new URL(String(a.url||''));if(!['http:','https:'].includes(u.protocol))return ''}catch(e){return ''}
  const url=esc(u.href),name=esc(a.label||u.hostname.replace(/^www\./i,'')),type=a.type||'link';
  if(type==='image')return '<a class="knowledgeAttachmentImage" href="'+url+'" target="_blank" rel="noopener noreferrer"><img loading="lazy" src="'+url+'" alt="'+name+'"><span>'+name+'</span></a>';
  if(type==='audio')return '<div class="knowledgeAttachmentMedia"><div class="knowledgeAttachmentLabel">🎧 '+name+'</div><audio controls preload="none" src="'+url+'"></audio><a href="'+url+'" target="_blank" rel="noopener noreferrer">Abrir áudio</a></div>';
  if(type==='video'){
   let embed='';
   if(/(^|\.)youtu\.be$/i.test(u.hostname)){const vid=u.pathname.split('/').filter(Boolean)[0];if(vid)embed='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(vid)}
   else if(/(^|\.)youtube\.com$/i.test(u.hostname)){const vid=u.searchParams.get('v')||u.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/)?.[1];if(vid)embed='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(vid)}
   else if(/(^|\.)vimeo\.com$/i.test(u.hostname)){const vid=u.pathname.split('/').filter(Boolean)[0];if(vid&&/^\d+$/.test(vid))embed='https://player.vimeo.com/video/'+vid}
   if(embed)return '<div class="knowledgeAttachmentMedia"><div class="knowledgeAttachmentLabel">🎬 '+name+'</div><div class="knowledgeVideoFrame"><iframe src="'+esc(embed)+'" title="'+name+'" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div><a href="'+url+'" target="_blank" rel="noopener noreferrer">Abrir vídeo original</a></div>';
   return '<div class="knowledgeAttachmentMedia"><div class="knowledgeAttachmentLabel">🎬 '+name+'</div><video controls preload="none" src="'+url+'"></video><a href="'+url+'" target="_blank" rel="noopener noreferrer">Abrir vídeo</a></div>';
  }
  return '<a class="knowledgeAttachmentLink" href="'+url+'" target="_blank" rel="noopener noreferrer"><span>🔗</span><span><strong>'+name+'</strong><small>'+url+'</small></span><span>↗</span></a>';
 }).join('')+'</div>';
}
let knowledgeDraftAttachments=[];
let knowledgeDraftFiles=[];
const KNOWLEDGE_MEDIA_PREFIX='knowledge_media_';
function knowledgeAttachmentId(){return KNOWLEDGE_MEDIA_PREFIX+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,9)}
function knowledgeGuessFileType(file){
 const t=String(file.type||'').toLowerCase();
 if(t.startsWith('image/'))return 'localImage';
 if(t.startsWith('audio/'))return 'localAudio';
 if(t.startsWith('video/'))return 'localVideo';
 if(t==='application/pdf'||String(file.name||'').toLowerCase().endsWith('.pdf'))return 'localPdf';
 return '';
}
function knowledgeFileLabel(name){return String(name||'Arquivo').replace(/[<>]/g,'').slice(0,160)}
function knowledgeAttachmentLabel(a){return esc(a.label||a.name||'Arquivo')}
function knowledgeRenderDraftAttachments(){
 const el=document.getElementById('knowledgeDraftAttachmentList');if(!el)return;
 const all=[...knowledgeDraftAttachments,...knowledgeDraftFiles.map(x=>({id:x.id,type:x.type,label:x.file.name,pending:true}))];
 el.innerHTML=all.length?all.map(a=>'<div class="knowledgeDraftAttachment"><span>'+({localImage:'🖼️',localAudio:'🎧',localVideo:'🎬',localPdf:'📄',image:'🖼️',audio:'🎧',video:'🎬',link:'🔗'}[a.type]||'📎')+'</span><span class="knowledgeDraftAttachmentName">'+esc(a.label||a.name||'Arquivo')+(a.pending?' · pronto para anexar':'')+'</span><button type="button" class="btn ghost mini" onclick="knowledgeRemoveDraftAttachment('+knowledgeJsArg(a.id)+')">Remover</button></div>').join(''):'<p class="muted" style="font-size:12px;margin:4px 0">Nenhum arquivo selecionado.</p>';
}
function knowledgeRemoveDraftAttachment(id){
 knowledgeDraftAttachments=knowledgeDraftAttachments.filter(a=>String(a.id)!==String(id));
 knowledgeDraftFiles=knowledgeDraftFiles.filter(a=>String(a.id)!==String(id));
 knowledgeRenderDraftAttachments();
}
async function knowledgeHandleFileSelection(input){
 const files=Array.from(input&&input.files||[]);if(!files.length)return;
 const maxFileSize=25*1024*1024,maxFiles=10;
 if(knowledgeDraftAttachments.length+knowledgeDraftFiles.length+files.length>maxFiles){toast('Adicione no máximo 10 anexos por post-it');input.value='';return}
 const rejected=[];
 for(const file of files){
  const type=knowledgeGuessFileType(file);
  if(!type){rejected.push(file.name+' (formato não compatível)');continue}
  if(file.size>maxFileSize){rejected.push(file.name+' (maior que 25 MB)');continue}
  const id=knowledgeAttachmentId();
  knowledgeDraftFiles.push({id,type,file});
 }
 input.value='';knowledgeRenderDraftAttachments();
 if(rejected.length)toast('Alguns arquivos foram ignorados: '+rejected.slice(0,2).join(', '));
}
const knowledgeMediaObjectUrls=new Map();
async function knowledgeHydrateLocalAttachments(root){
 const base=root||document,els=Array.from(base.querySelectorAll('[data-knowledge-media-id]'));
 for(const el of els){
  if(el.dataset.mediaReady==='1')continue;
  const id=el.getAttribute('data-knowledge-media-id');if(!id)continue;
  try{
   let url=knowledgeMediaObjectUrls.get(id);
   if(!url){
    const record=await flashmedAssetGet(id);
    const blob=record&&(record.blob instanceof Blob?record.blob:record.data instanceof Blob?record.data:null);
    if(!blob){
     if(el.tagName==='IMG'){
      el.alt='Imagem não encontrada neste aparelho';el.style.display='none';
      const wrap=el.closest('.knowledgeAttachmentImage');
      if(wrap&&!wrap.querySelector('.knowledgeMediaMissing')){const msg=document.createElement('span');msg.className='knowledgeMediaMissing';msg.textContent='Imagem indisponível neste aparelho. Anexe novamente neste dispositivo.';wrap.appendChild(msg)}
     }else if(el.tagName==='AUDIO'||el.tagName==='VIDEO'){
      const msg=document.createElement('p');msg.className='muted';msg.textContent='Arquivo não encontrado neste aparelho. Anexe novamente neste dispositivo.';el.insertAdjacentElement('afterend',msg)
     }
     el.dataset.mediaReady='1';continue;
    }
    url=URL.createObjectURL(blob);knowledgeMediaObjectUrls.set(id,url);
   }
   if(el.tagName==='IMG'){
    el.src=url;
    el.onerror=()=>{el.style.display='none';const wrap=el.closest('.knowledgeAttachmentImage');if(wrap&&!wrap.querySelector('.knowledgeMediaMissing')){const msg=document.createElement('span');msg.className='knowledgeMediaMissing';msg.textContent='Não foi possível exibir esta imagem.';wrap.appendChild(msg)}};
   }else if(el.tagName==='AUDIO'||el.tagName==='VIDEO')el.src=url;
   else if(el.tagName==='A')el.href=url;
   el.dataset.mediaReady='1';
  }catch(e){console.warn('Não foi possível carregar anexo local',e);el.dataset.mediaReady='1'}
 }
}
async function knowledgeImageToCloudDataUrl(file){
 const source=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result||''));reader.onerror=()=>reject(reader.error||new Error('Falha ao ler imagem'));reader.readAsDataURL(file)});
 const img=await new Promise((resolve,reject)=>{const el=new Image();el.onload=()=>resolve(el);el.onerror=()=>reject(new Error('Não foi possível abrir a imagem'));el.src=source});
 const maxSide=1000,scale=Math.min(1,maxSide/Math.max(img.naturalWidth||img.width,img.naturalHeight||img.height));
 const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round((img.naturalWidth||img.width)*scale));canvas.height=Math.max(1,Math.round((img.naturalHeight||img.height)*scale));
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas indisponível');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
 let quality=.7,data=canvas.toDataURL('image/jpeg',quality);
 while(data.length>190000&&quality>.35){quality-=.07;data=canvas.toDataURL('image/jpeg',quality)}
 if(data.length>240000)throw new Error('Imagem muito grande para sincronizar; recorte o print e tente novamente');
 return data;
}
async function knowledgeStorePendingFiles(){
 for(const item of knowledgeDraftFiles){
  if(item.type==='localImage'){
   const dataUrl=await knowledgeImageToCloudDataUrl(item.file);
   knowledgeDraftAttachments.push({id:item.id,type:'image',label:knowledgeFileLabel(item.file.name),mime:'image/jpeg',size:dataUrl.length,storage:'cloudImage',dataUrl});
  }else{
   await flashmedAssetPut(item.id,{blob:item.file,type:item.type,name:item.file.name,mime:item.file.type,size:item.file.size,storedAt:Date.now()});
   knowledgeDraftAttachments.push({id:item.id,type:item.type,label:knowledgeFileLabel(item.file.name),mime:item.file.type,size:item.file.size,storage:'local'});
  }
 }
 knowledgeDraftFiles=[];
}

async function fmShareEncode(value){
 const raw=new TextEncoder().encode(JSON.stringify(value));let bytes=raw,prefix='j.';
 if('CompressionStream'in window){try{const stream=new Blob([raw]).stream().pipeThrough(new CompressionStream('gzip'));bytes=new Uint8Array(await new Response(stream).arrayBuffer());prefix='g.'}catch(e){}}
 let bin='';for(let i=0;i<bytes.length;i+=0x8000)bin+=String.fromCharCode(...bytes.subarray(i,i+0x8000));
 return prefix+btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
async function fmShareDecode(token){
 if(!token||token.length>1500000)throw new Error('Link inválido ou grande demais.');
 const prefix=token.slice(0,2),b64=token.slice(2).replace(/-/g,'+').replace(/_/g,'/'),bin=atob(b64+'='.repeat((4-b64.length%4)%4)),bytes=Uint8Array.from(bin,c=>c.charCodeAt(0));
 let raw=bytes;if(prefix==='g.'){if(!('DecompressionStream'in window))throw new Error('Este navegador não consegue abrir este link. Atualize o navegador.');raw=new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer())}else if(prefix!=='j.')throw new Error('Formato de compartilhamento inválido.');
 return JSON.parse(new TextDecoder().decode(raw));
}
async function knowledgeShareSelected(){
 const checks=Array.from(document.querySelectorAll('[data-share-note-check]:checked')),ids=new Set(checks.map(x=>x.getAttribute('data-share-note-id')));
 const selected=(db.knowledgeNotes||[]).filter(n=>ids.has(String(n.id)));
 if(!selected.length)return toast('Marque pelo menos um post-it para compartilhar.');
 const notes=selected.map(n=>({title:String(n.title||''),content:String(n.content||''),color:['yellow','pink','green','blue','lilac'].includes(n.color)?n.color:'yellow',tags:Array.isArray(n.tags)?n.tags.map(String):[],bookName:knowledgeBookName(n.bookId),attachments:(n.attachments||[]).filter(a=>(a.storage==='cloudImage'&&String(a.dataUrl||'').startsWith('data:image/'))||(['http:','https:'].includes((()=>{try{return new URL(a.url).protocol}catch(e){return ''}})()))).map(a=>a.storage==='cloudImage'?{type:'image',label:String(a.label||'Imagem'),storage:'cloudImage',dataUrl:a.dataUrl}:{type:a.type||'link',label:String(a.label||''),url:a.url})}));
 try{
  const token=await fmShareEncode({version:1,createdAt:Date.now(),notes});
  const url=new URL('compartilhado.html',location.href);url.hash='d='+token;
  if(url.href.length>1500000)throw new Error('Este compartilhamento ficou grande demais para um link. Tente selecionar menos post-its ou remover algumas imagens.');
  try{await navigator.clipboard.writeText(url.href);toast('Link copiado! Compartilhe somente com quem deve ter acesso.')}catch(e){prompt('Copie este link para compartilhar:',url.href)}
 }catch(e){console.error(e);toast(e.message||'Não foi possível criar o link.')}
}
async function flashmedHandleSharedImport(){
 const match=location.hash.match(/^#flashmed-import=(.+)$/);if(!match||!currentUser)return;
 try{
  const payload=await fmShareDecode(match[1]);if(payload.version!==1||!Array.isArray(payload.notes)||!payload.notes.length)throw new Error('O link não contém anotações válidas.');
  knowledgeInitBooks();let added=0;
  for(const source of payload.notes){
   const name=String(source.bookName||'Compartilhado').slice(0,80)||'Compartilhado';
   let book=db.knowledgeBooks.find(b=>b.name==='Importado: '+name&&b.sharedImport===true);
   if(!book){book={id:'kb_shared_'+Date.now()+'_'+Math.random().toString(36).slice(2,8),name:'Importado: '+name,icon:'📥',createdAt:Date.now(),sharedImport:true};db.knowledgeBooks.push(book)}
   const attachments=(Array.isArray(source.attachments)?source.attachments:[]).filter(a=>(a.storage==='cloudImage'&&String(a.dataUrl||'').startsWith('data:image/'))||(['http:','https:'].includes((()=>{try{return new URL(a.url).protocol}catch(e){return ''}})()))).map(a=>a.storage==='cloudImage'?{id:'shared_img_'+Math.random().toString(36).slice(2,10),type:'image',label:String(a.label||'Imagem'),mime:'image/jpeg',size:String(a.dataUrl||'').length,storage:'cloudImage',dataUrl:a.dataUrl}:{id:'shared_link_'+Math.random().toString(36).slice(2,10),type:a.type||'link',label:String(a.label||''),url:a.url});
   db.knowledgeNotes.unshift({id:'kn_shared_'+Date.now()+'_'+Math.random().toString(36).slice(2,8),bookId:book.id,title:String(source.title||'Anotação compartilhada').slice(0,180),content:String(source.content||''),color:['yellow','pink','green','blue','lilac'].includes(source.color)?source.color:'yellow',tags:Array.isArray(source.tags)?source.tags.map(x=>String(x).slice(0,60)).slice(0,30):[],attachments,createdAt:Date.now(),updatedAt:Date.now()});added++;
  }
  history.replaceState(null,'',location.pathname+location.search);save();route='Caderno de Conhecimentos';knowledgeCurrentBookId=null;knowledgeEditingId=null;renderNav();render();fmQuickRemindersRender();fmQuickRemindersMakeMovable();toast(added+' anotação(ões) copiadas para sua conta!');
 }catch(e){console.error(e);alert('Não foi possível importar as anotações: '+(e.message||'link inválido'))}
}

function knowledgeNoteCards(notes){
 const colors=[['yellow','Amarelo'],['pink','Rosa'],['green','Verde'],['blue','Azul'],['lilac','Lilás']];
 if(!notes.length)return '<div class="panel" style="text-align:center;grid-column:1/-1"><p class="muted">Ainda não há post-its aqui. Use “Novo post-it” para começar.</p></div>';
 return notes.map(n=>{
  const color=colors.some(c=>c[0]===n.color)?n.color:'yellow';
  const palette=colors.map(c=>'<button type="button" class="knowledgeSwatch '+(color===c[0]?'active':'')+'" style="--swatch:'+c[0]+'" title="'+c[1]+'" aria-label="Mudar para '+c[1]+'" onclick="knowledgeChangeNoteColor('+knowledgeJsArg(n.id)+','+knowledgeJsArg(c[0])+')"></button>').join('');
  return '<article class="knowledgeNoteCard note-'+color+'"><div class="knowledgeNoteTop"><label style="display:flex;align-items:center;gap:5px;font-size:11px;font-weight:800"><input type="checkbox" data-share-note-check data-share-note-id="'+esc(n.id)+'" aria-label="Selecionar para compartilhar"> Compartilhar</label><div class="knowledgeNotePalette" aria-label="Cor do post-it">'+palette+'</div></div><h3>'+esc(n.title||'Anotação sem título')+'</h3><div class="knowledgeContent">'+esc(n.content||'')+'</div>'+knowledgeAttachmentHtml(n.attachments||[])+'<div class="knowledgeTags">'+(n.tags||[]).map(t=>'<span class="tag">#'+esc(t)+'</span>').join('')+'</div><div class="knowledgeActions"><button class="btn ghost mini" onclick="knowledgeEditNote('+knowledgeJsArg(n.id)+')">✏️ Editar</button><button class="btn ghost mini" onclick="knowledgeDeleteNote('+knowledgeJsArg(n.id)+')">Excluir</button></div></article>';
 }).join('')
}
function knowledgeNoteEditorHtml(id,bookId){
 let n=id===null?{title:'',content:'',tags:[],color:'yellow',attachments:[]}:db.knowledgeNotes.find(x=>String(x.id)===String(id));
 if(!n)return '';
 const color=['yellow','pink','green','blue','lilac'].includes(n.color)?n.color:'yellow';
 const links=(n.attachments||[]).filter(a=>a.storage!=='local'&&a.storage!=='cloudImage').map(a=>a.url).filter(Boolean).join('\n');
 return '<div class="panel knowledgeEditor"><h3>'+(id===null?'Novo post-it':'Editar post-it')+'</h3><label>Título<input id="knowledgeNoteTitle" class="field" maxlength="180" placeholder="Uma ideia, lembrete ou referência…" value="'+esc(n.title||'')+'"></label><label>Anotação<textarea id="knowledgeNoteContent" class="field" rows="5" placeholder="Escreva livremente aqui…">'+esc(n.content||'')+'</textarea></label><label>Cor do post-it<select id="knowledgeNoteColor" class="field"><option value="yellow" '+(color==='yellow'?'selected':'')+'>🟨 Amarelo</option><option value="pink" '+(color==='pink'?'selected':'')+'>🩷 Rosa</option><option value="green" '+(color==='green'?'selected':'')+'>🟩 Verde</option><option value="blue" '+(color==='blue'?'selected':'')+'>🟦 Azul</option><option value="lilac" '+(color==='lilac'?'selected':'')+'>🟪 Lilás</option></select></label><label>📁 Inserir foto, áudio ou vídeo<input id="knowledgeNoteFiles" class="field knowledgeFileInput" type="file" accept="image/*,audio/*,video/*,application/pdf,.pdf" multiple onchange="knowledgeHandleFileSelection(this)"></label><div class="knowledgeDraftAttachments"><div id="knowledgeDraftAttachmentList"></div><p class="muted knowledgeAttachmentHint">Você pode anexar fotos, áudios, vídeos e PDFs do aparelho. Limite: 25 MB por arquivo e 10 anexos por post-it.</p><p class="muted knowledgeAttachmentHint">Imagens compactadas ficam salvas junto ao post-it na nuvem e acompanham sua conta. PDFs, áudios e vídeos anexados como arquivo ficam neste aparelho.</p></div><label>🔗 Ou cole links públicos (um por linha)<textarea id="knowledgeNoteLinks" class="field" rows="2" placeholder="https://…">'+esc(links)+'</textarea></label><label>Tags opcionais<input id="knowledgeNoteTags" class="field" placeholder="Separe por vírgulas" value="'+esc((n.tags||[]).join(', '))+'"></label><div class="knowledgeActions"><button class="btn ok" onclick="knowledgeSaveNote('+(id===null?'null':knowledgeJsArg(id))+','+knowledgeJsArg(bookId)+')">Salvar post-it</button><button class="btn ghost" onclick="knowledgeCancelNote()">Cancelar</button></div></div>'
}
function knowledgeRefreshNotes(){const q=(document.getElementById('knowledgeNoteSearch')?.value||'').trim().toLocaleLowerCase('pt-BR'),el=document.getElementById('knowledgeNoteResults');if(el){el.innerHTML=knowledgeNoteCards(db.knowledgeNotes.filter(n=>String(n.bookId||'')===String(knowledgeCurrentBookId)&&(!q||[n.title,n.content,(n.tags||[]).join(' ')].join(' ').toLocaleLowerCase('pt-BR').includes(q))).sort((a,b)=>(b.updatedAt||b.createdAt||0)-(a.updatedAt||a.createdAt||0)));knowledgeHydrateLocalAttachments(el)}}
function knowledgeNewNote(){knowledgeDraftAttachments=[];knowledgeDraftFiles=[];knowledgeEditingId='newNote';knowledgeNotesViewRender();knowledgeRenderDraftAttachments();document.getElementById('knowledgeNoteTitle')?.focus()}
function knowledgeEditNote(id){const n=db.knowledgeNotes.find(x=>String(x.id)===String(id));knowledgeDraftAttachments=(n?.attachments||[]).filter(a=>a.storage==='local'||a.storage==='cloudImage').map(a=>({...a}));knowledgeDraftFiles=[];knowledgeEditingId=id;knowledgeNotesViewRender();knowledgeRenderDraftAttachments();document.getElementById('knowledgeNoteTitle')?.focus()}
function knowledgeCancelNote(){knowledgeDraftAttachments=[];knowledgeDraftFiles=[];knowledgeEditingId=null;knowledgeNotesViewRender()}
function knowledgeChangeNoteColor(id,color){
 const allowed=['yellow','pink','green','blue','lilac'];
 if(!allowed.includes(color))return;
 const note=db.knowledgeNotes.find(n=>String(n.id)===String(id));
 if(!note)return;
 note.color=color;note.updatedAt=Date.now();
 const ok=save();knowledgeRefreshNotes();
 if(!ok)toast('Não foi possível sincronizar a cor do post-it');
}
async function knowledgeSaveNote(id,bookId){
 const titleEl=document.getElementById('knowledgeNoteTitle'),contentEl=document.getElementById('knowledgeNoteContent'),tagsEl=document.getElementById('knowledgeNoteTags'),colorEl=document.getElementById('knowledgeNoteColor'),linksEl=document.getElementById('knowledgeNoteLinks');
 const title=titleEl?titleEl.value.trim():'',content=contentEl?contentEl.value.trim():'';
 if(!title&&!content&&!(linksEl&&linksEl.value.trim())&&!knowledgeDraftAttachments.length&&!knowledgeDraftFiles.length)return toast('Escreva algo ou adicione um arquivo/link');
 const now=Date.now(),ix=db.knowledgeNotes.findIndex(n=>String(n.id)===String(id)),existing=ix>=0?db.knowledgeNotes[ix]:null;
 const chosenColor=colorEl?colorEl.value:(existing?.color||'yellow');
 const color=['yellow','pink','green','blue','lilac'].includes(chosenColor)?chosenColor:'yellow';
 const attachments=knowledgeParseAttachmentUrls(linksEl?linksEl.value:'');
 const rawLines=(linksEl?linksEl.value:'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 if(rawLines.length!==attachments.length)return toast('Confira os links: use uma URL completa começando com https://');
 try{await knowledgeStorePendingFiles()}catch(e){console.error(e);return toast('Não foi possível guardar os arquivos neste aparelho')}
 const note={id:id===null?'kn_'+now+'_'+Math.random().toString(36).slice(2,7):id,bookId,title:title||'Anotação sem título',content,color,attachments:[...knowledgeDraftAttachments.filter(a=>a.storage==='local'||a.storage==='cloudImage'),...attachments],tags:tagsEl?tagsEl.value.split(',').map(x=>x.trim()).filter(Boolean):[],createdAt:now,updatedAt:now};
 if(ix>=0){note.createdAt=existing.createdAt||now;db.knowledgeNotes[ix]=note}else db.knowledgeNotes.unshift(note);
 knowledgeDraftAttachments=[];knowledgeDraftFiles=[];knowledgeEditingId=null;const ok=save();knowledgeNotesViewRender();toast(ok?'Post-it salvo':'Não foi possível salvar o post-it')
}
function knowledgeDeleteNote(id){const n=db.knowledgeNotes.find(x=>String(x.id)===String(id));if(!n||!confirm('Excluir esta anotação?'))return;db.knowledgeNotes=db.knowledgeNotes.filter(x=>String(x.id)!==String(id));save();knowledgeNotesViewRender();toast('Anotação excluída')}
function knowledgeNotesViewRender(){const el=document.getElementById('view');if(el){el.innerHTML=flashmedPageBanner('Caderno de Conhecimentos')+knowledgeNotesView();knowledgeHydrateLocalAttachments(el);if(knowledgeEditingId==='newNote'||knowledgeEditingId!==null)knowledgeRenderDraftAttachments()}}

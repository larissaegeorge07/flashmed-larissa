/* FlashMed — melhorias incrementais de Meus Cadernos: páginas, listas, imagens com notas e PDF. */
(function(){
  const routeName='Meus Cadernos';
  let currentNotebookId=null, currentPageIndex=0, savedRange=null, printNode=null;
  const pageIndexByNotebook={};
  const $=id=>document.getElementById(id);
  function notebooks(){db.studyNotebooks=Array.isArray(db.studyNotebooks)?db.studyNotebooks:[];return db.studyNotebooks}
  function activeNotebook(){return notebooks().find(n=>String(n.id)===String(currentNotebookId))}
  function ensurePages(n){
    let migrated=false;
    const legacy=typeof n.content==='string'?n.content:'';
    if(!Array.isArray(n.pages)||!n.pages.length){n.pages=[{title:'Página 1',content:legacy,updatedAt:n.updatedAt||Date.now()}];migrated=true;}
    n.pages=n.pages.map((p,i)=>typeof p==='string'?{title:'Página '+(i+1),content:p,updatedAt:Date.now()}:({title:p.title||'Página '+(i+1),content:typeof p.content==='string'?p.content:'',updatedAt:p.updatedAt||Date.now()}));
    // Migration guard: if an earlier version left a blank first page while the old single-page
    // content still exists, restore it. If both versions differ, preserve the old text as a
    // separate recovery page rather than overwriting either copy.
    const hasLegacy=!!legacy.trim(), matches=n.pages.some(p=>p.content===legacy);
    if(hasLegacy&&!matches){
      if(!n.pages[0].content.trim())n.pages[0].content=legacy;
      else n.pages.push({title:'Conteúdo recuperado',content:legacy,updatedAt:Date.now(),recoveredLegacy:true});
      migrated=true;
    }
    currentPageIndex=Math.max(0,Math.min(currentPageIndex,n.pages.length-1));
    if(migrated)n._fmPagesMigrationPending=true;
    return n.pages;
  }
  function savePage(){
    const n=activeNotebook(), ed=$('fmNotebookEditor');
    if(!n||!ed)return;
    const pages=ensurePages(n);
    pages[currentPageIndex].content=ed.innerHTML;
    pages[currentPageIndex].updatedAt=Date.now();
    n.content=pages[0].content;
    n.updatedAt=Date.now();
  }
  function prepareNotebookSave(n,ed){
    if(!n||!ed)return false;
    if(String(currentNotebookId)!==String(n.id))currentNotebookId=n.id;
    const pages=ensurePages(n);
    pages[currentPageIndex].content=ed.innerHTML;
    pages[currentPageIndex].updatedAt=Date.now();
    n.content=pages[0].content; // legacy compatibility field always mirrors page 1
    n.updatedAt=Date.now();
    return true;
  }
  window.fmNotebookPrepareSave=prepareNotebookSave;
  let persistTimer=null;
  const originalSave=window.fmNotebookSaveNow;
  if(originalSave)window.fmNotebookSaveNow=function(){
    const n=activeNotebook(),ed=$('fmNotebookEditor'),title=$('fmNotebookTitle');
    if(n&&title)n.title=(title.value||'').trim()||'Anotações sem título';
    if(n&&ed)prepareNotebookSave(n,ed);
    const ok=window.save?window.save():false;
    const state=$('fmNotebookSaveState');
    if(state)state.textContent=ok?(typeof cloud!=='undefined'&&cloud&&typeof currentUser!=='undefined'&&currentUser?'Salvando na nuvem…':'Salvo neste aparelho; aguardando sincronização'):'Falha ao salvar';
    if(ok&&typeof cloud!=='undefined'&&cloud&&typeof currentUser!=='undefined'&&currentUser&&typeof window.syncUp==='function'){
      window.syncUp().then(()=>{if(state&&document.body.contains(state))state.textContent=(document.getElementById('cloudDot')&&document.getElementById('cloudDot').classList.contains('ok')&&$('saveState')?.textContent==='salvo na nuvem')?'Salvo na nuvem':'Não foi possível confirmar a nuvem'}).catch(()=>{if(state)state.textContent='Falha na nuvem — mantenha esta página aberta e tente novamente'});
    }
    return ok;
  };
  if(window.fmNotebookScheduleSave)window.fmNotebookScheduleSave=function(){
    const state=$('fmNotebookSaveState');if(state)state.textContent=(typeof cloud!=='undefined'&&cloud&&typeof currentUser!=='undefined'&&currentUser)?'Salvando na nuvem…':'Salvando…';
    clearTimeout(persistTimer);persistTimer=setTimeout(()=>window.fmNotebookSaveNow&&window.fmNotebookSaveNow(),500);
  };
  const originalNew=window.fmNotebookNew;
  if(originalNew)window.fmNotebookNew=function(title){originalNew.apply(this,arguments);const n=notebooks()[0];if(n){currentNotebookId=n.id;currentPageIndex=0;pageIndexByNotebook[String(n.id)]=0;window.render()}};
  const originalOpen=window.fmNotebookOpen;
  if(originalOpen)window.fmNotebookOpen=function(id){currentNotebookId=id;currentPageIndex=pageIndexByNotebook[String(id)]||0;return originalOpen.apply(this,arguments)};
  const originalBack=window.fmNotebookBack;
  if(originalBack)window.fmNotebookBack=function(){if(window.fmNotebookSaveNow)window.fmNotebookSaveNow();currentNotebookId=null;currentPageIndex=0;return originalBack.apply(this,arguments)};
  const originalDelete=window.fmNotebookDelete;
  if(originalDelete)window.fmNotebookDelete=function(id){if(String(id)===String(currentNotebookId)){currentNotebookId=null;currentPageIndex=0}return originalDelete.apply(this,arguments)};
  const originalCommand=window.fmNotebookCommand;
  if(originalCommand)window.fmNotebookCommand=function(cmd,val){
    if((cmd==='foreColor'||cmd==='hiliteColor'||cmd==='backColor')&&savedRange){
      const ed=$('fmNotebookEditor'),sel=window.getSelection();
      if(ed&&sel){ed.focus();sel.removeAllRanges();try{sel.addRange(savedRange)}catch(e){}}
    }
    const result=originalCommand.apply(this,arguments);
    savePage();return result;
  };
  function rememberSelection(){const ed=$('fmNotebookEditor'),sel=window.getSelection();if(ed&&sel&&sel.rangeCount&&ed.contains(sel.anchorNode))savedRange=sel.getRangeAt(0).cloneRange()}
  function addImageNotes(ed){
    ed.querySelectorAll('img').forEach(img=>{
      if(img.closest('.fmNotebookImageNote'))return;
      const wrap=document.createElement('div');wrap.className='fmNotebookImageNote';wrap.setAttribute('contenteditable','true');
      const media=document.createElement('div');media.className='fmNotebookImageMedia';
      const note=document.createElement('div');note.className='fmNotebookImageComment';note.setAttribute('contenteditable','true');note.setAttribute('data-placeholder','Post-it: o que preciso lembrar desta imagem?');
      const parent=img.parentNode;if(!parent)return;
      parent.insertBefore(wrap,img);media.appendChild(img);wrap.appendChild(media);wrap.appendChild(note);
      img.style.width='100%';img.style.maxWidth='100%';img.style.height='auto';img.style.resize='none';img.style.cursor='default';img.style.display='block';
      img.removeAttribute('width');img.removeAttribute('height');
      if(!wrap.dataset.ready)wrap.dataset.ready='1';
    });
  }
  function pageControls(n){
    const footer=document.querySelector('.fmNotebookFooter');
    if(!footer||footer.querySelector('.fmNotebookPagination'))return;
    const pages=ensurePages(n),nav=document.createElement('div');nav.className='fmNotebookPagination';
    const prev=document.createElement('button');prev.type='button';prev.className='btn ghost';prev.textContent='← Folha anterior';prev.disabled=currentPageIndex===0;prev.onclick=()=>switchPage(-1);
    const label=document.createElement('span');label.className='fmNotebookPageCount';label.textContent='Página '+(currentPageIndex+1)+' de '+pages.length;
    const next=document.createElement('button');next.type='button';next.className='btn ghost';next.textContent='Próxima folha →';next.disabled=currentPageIndex>=pages.length-1;next.onclick=()=>switchPage(1);
    const add=document.createElement('button');add.type='button';add.className='btn';add.textContent='＋ Nova página';add.onclick=addPage;
    nav.append(prev,label,next,add);footer.prepend(nav);
    const saveButton=footer.querySelector('button[onclick="fmNotebookSaveNow()"]');
    if(saveButton){const pdf=document.createElement('button');pdf.type='button';pdf.className='btn ghost';pdf.textContent='⇩ Salvar em PDF';pdf.onclick=exportPdf;saveButton.insertAdjacentElement('beforebegin',pdf)}
  }
  function switchPage(delta){
    const n=activeNotebook();if(!n)return;
    savePage();const pages=ensurePages(n);currentPageIndex=Math.max(0,Math.min(pages.length-1,currentPageIndex+delta));pageIndexByNotebook[String(n.id)]=currentPageIndex;
    if(window.fmNotebookSaveNow)window.fmNotebookSaveNow();window.render();
  }
  function addPage(){
    const n=activeNotebook();if(!n)return;
    savePage();const pages=ensurePages(n);pages.push({title:'Página '+(pages.length+1),content:'',updatedAt:Date.now()});
    currentPageIndex=pages.length-1;pageIndexByNotebook[String(n.id)]=currentPageIndex;n.content=pages[0].content;n.updatedAt=Date.now();
    if(window.fmNotebookSaveNow)window.fmNotebookSaveNow();else if(window.save)window.save();
    window.render();
  }
  function applyListType(type){
    const ed=$('fmNotebookEditor');if(!ed)return;ed.focus();const selRestore=window.getSelection();if(savedRange&&selRestore){selRestore.removeAllRanges();try{selRestore.addRange(savedRange)}catch(e){}}
    const sel=window.getSelection();let node=sel&&sel.anchorNode;while(node&&node!==ed&&node.nodeName!=='OL')node=node.parentNode;
    if(node&&node.nodeName==='OL'){node.style.listStyleType=type;window.fmNotebookScheduleSave?.();return}
    window.fmNotebookCommand?.('insertOrderedList');
    const sel2=window.getSelection();let n=sel2&&sel2.anchorNode;while(n&&n!==ed&&n.nodeName!=='OL')n=n.parentNode;
    if(n&&n.nodeName==='OL')n.style.listStyleType=type;
    window.fmNotebookScheduleSave?.();
  }
  function exportPdf(){
    const n=activeNotebook();if(!n)return;
    savePage();if(window.fmNotebookSaveNow)window.fmNotebookSaveNow();
    const pages=ensurePages(n);
    if(printNode)printNode.remove();
    printNode=document.createElement('div');printNode.id='fmNotebookPrintArea';printNode.innerHTML='<h1></h1>';
    const h=printNode.querySelector('h1');h.textContent=n.title||'Minhas anotações';
    pages.forEach((p,i)=>{const section=document.createElement('section');section.className='fmNotebookPrintPage';const heading=document.createElement('h2');heading.textContent=p.title||'Página '+(i+1);const body=document.createElement('div');body.className='fmNotebookPrintBody';body.innerHTML=p.content||'';section.append(heading,body);printNode.appendChild(section)});
    document.body.appendChild(printNode);document.body.classList.add('fmNotebookPrinting');
    const cleanup=()=>{document.body.classList.remove('fmNotebookPrinting');if(printNode){printNode.remove();printNode=null}window.removeEventListener('afterprint',cleanup)};
    window.addEventListener('afterprint',cleanup);
    setTimeout(()=>{window.print();setTimeout(cleanup,1200)},100);
  }
  function enhance(){
    if(typeof route!=='undefined'&&route!==routeName)return;
    const ed=$('fmNotebookEditor');if(!ed)return;
    if(!currentNotebookId){
      const back=document.querySelector('.fmNotebookTop button');
      const openId=back&&back.dataset.notebookId;
      if(openId)currentNotebookId=openId;
      else{
        const title=$('fmNotebookTitle')?.value;
        const n=notebooks().find(x=>x.title===title);
        if(n)currentNotebookId=n.id;
      }
    }
    const n=activeNotebook();if(!n)return;
    ensurePages(n);
    if(n._fmPagesMigrationPending){delete n._fmPagesMigrationPending;setTimeout(()=>{if(window.save)window.save();if(typeof cloud!=='undefined'&&cloud&&typeof currentUser!=='undefined'&&currentUser&&window.syncUp)window.syncUp()},0)}
    if(pageIndexByNotebook[String(n.id)]===undefined)pageIndexByNotebook[String(n.id)]=currentPageIndex;
    currentPageIndex=Math.max(0,Math.min(pageIndexByNotebook[String(n.id)]||0,n.pages.length-1));
    const wanted=n.pages[currentPageIndex].content||'';
    if(ed.dataset.fmPage!==String(currentPageIndex)+'_'+String(n.id)){
      ed.innerHTML=wanted;ed.dataset.fmPage=String(currentPageIndex)+'_'+String(n.id);
    }
    addImageNotes(ed);pageControls(n);
    const toolbar=document.querySelector('.fmNotebookToolbar');
    if(toolbar&&!toolbar.querySelector('.fmNotebookListStyle')){
      const select=document.createElement('select');select.className='fmNotebookListStyle';select.title='Tipo de lista com letras';select.setAttribute('aria-label','Tipo de lista com letras');
      [['A. Lista','upper-alpha'],['a. Lista','lower-alpha'],['I. Lista','upper-roman'],['i. Lista','lower-roman']].forEach(([label,value])=>{const o=document.createElement('option');o.value=value;o.textContent=label;select.appendChild(o)});
      select.onpointerdown=rememberSelection;select.onmousedown=rememberSelection;select.onchange=()=>applyListType(select.value);const listButton=Array.from(toolbar.querySelectorAll('button')).find(b=>(b.textContent||'').includes('Lista numerada'));
      if(listButton)listButton.insertAdjacentElement('afterend',select);else toolbar.appendChild(select);
    }
    if(!ed.dataset.fmEnhListeners){
      ed.addEventListener('input',()=>{savePage();addImageNotes(ed);pageControls(n);if(window.fmNotebookScheduleSave)window.fmNotebookScheduleSave()});
      ed.addEventListener('click',rememberSelection);ed.addEventListener('keyup',rememberSelection);
      ed.addEventListener('paste',()=>setTimeout(()=>{addImageNotes(ed);savePage()},100));
      document.querySelectorAll('.fmNotebookColor input').forEach(input=>{input.addEventListener('pointerdown',rememberSelection);input.addEventListener('mousedown',rememberSelection);input.addEventListener('focus',rememberSelection)});
      ed.dataset.fmEnhListeners='1';
      const observer=new MutationObserver(()=>{addImageNotes(ed);savePage()});observer.observe(ed,{childList:true,subtree:true});
    }
  }
  const style=document.createElement('style');
  style.textContent='.fmNotebookPagination{display:flex;align-items:center;gap:8px;flex-wrap:wrap;width:100%;padding:10px 0 14px;border-bottom:1px solid var(--line);margin-bottom:10px}.fmNotebookPageCount{font-weight:800;color:var(--deep);padding:0 5px}.fmNotebookPagination button:disabled{opacity:.4;cursor:not-allowed}.fmNotebookListStyle{font-size:13px;border:1px solid var(--line);border-radius:8px;padding:7px 8px;background:#fff;color:var(--ink);min-height:34px;max-width:125px}.fmNotebookImageNote{display:flex;align-items:stretch;gap:10px;position:relative;width:min(100%,680px);min-width:220px;min-height:130px;max-height:650px;margin:12px 0;padding:8px;border:1px solid #e5d5e6;border-radius:12px;background:#fffdf7;resize:both;overflow:auto;box-shadow:0 2px 8px #3e214010;vertical-align:top}.fmNotebookImageMedia{flex:0 1 62%;min-width:80px;display:flex;align-items:center;justify-content:center;overflow:hidden}.fmNotebookImageMedia img{max-height:100%;object-fit:contain}.fmNotebookImageComment{flex:1;min-width:85px;min-height:95px;padding:9px;border-left:1px dashed #d8c4d8;outline:none;font-size:13px;line-height:1.45;white-space:pre-wrap;overflow-wrap:anywhere;background:linear-gradient(#fffdf7 27px, #f0e6ef 28px);background-size:100% 28px}.fmNotebookImageComment:empty:before{content:attr(data-placeholder);color:#9e8b9e}.fmNotebookImageNote:focus-within{border-color:#bd8bc0}.fmNotebookPaper .fmNotebookImageNote img{width:100%;height:auto;max-width:100%}#fmNotebookPrintArea{display:none}@media print{body.fmNotebookPrinting>*:not(#fmNotebookPrintArea){display:none!important}body.fmNotebookPrinting #fmNotebookPrintArea{display:block!important;color:#222;background:#fff;font-family:Arial,sans-serif;font-size:11pt;padding:0 8mm}#fmNotebookPrintArea h1{font-size:20pt;margin:0 0 18px}#fmNotebookPrintArea h2{font-size:14pt;border-bottom:1px solid #ddd;padding-bottom:6px;margin:0 0 14px}.fmNotebookPrintPage{break-after:page;page-break-after:always;min-height:240mm}.fmNotebookPrintPage:last-child{break-after:auto;page-break-after:auto}#fmNotebookPrintArea img{max-width:100%!important;height:auto!important}#fmNotebookPrintArea .fmNotebookImageNote{resize:none;max-width:100%;break-inside:avoid;box-shadow:none;border:1px solid #ddd}#fmNotebookPrintArea .fmNotebookImageComment{background:none!important;border-left:1px solid #ddd}}@media(max-width:600px){.fmNotebookImageNote{min-width:0;min-height:115px;gap:6px;padding:5px}.fmNotebookImageComment{min-width:75px;font-size:12px;padding:6px}.fmNotebookPagination{gap:5px}.fmNotebookPagination button{font-size:12px;padding:8px}}';
  document.head.appendChild(style);
  const baseRender=window.render;
  window.render=function(){const result=baseRender.apply(this,arguments);setTimeout(enhance,0);return result};
  window.fmNotebookAddPage=addPage;window.fmNotebookExportPdf=exportPdf;
  document.addEventListener('selectionchange',rememberSelection);
})();
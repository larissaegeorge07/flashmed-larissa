/* FlashMed — Meus Cadernos: anotações digitadas com editor rico. */
(function(){
  const routeName='Meus Cadernos';
  let activeNotebookId=null, notebookSaveTimer=null;
  function fmNotebooks(){db.studyNotebooks=Array.isArray(db.studyNotebooks)?db.studyNotebooks:[];return db.studyNotebooks}
  function fmNotebookEsc(s){return esc(String(s??''))}
  function fmNotebookSaveNow(){
    const n=fmNotebooks().find(x=>String(x.id)===String(activeNotebookId));
    const ed=document.getElementById('fmNotebookEditor');
    const title=document.getElementById('fmNotebookTitle');
    if(!n||!ed)return;
    n.title=(title?.value||'').trim()||'Anotações sem título';
    n.content=ed.innerHTML;
    n.updatedAt=Date.now();
    const ok=save();
    const state=document.getElementById('fmNotebookSaveState');
    if(state)state.textContent=ok?'Salvo automaticamente':'Não foi possível salvar';
  }
  function fmNotebookScheduleSave(){const state=document.getElementById('fmNotebookSaveState');if(state)state.textContent='Salvando…';clearTimeout(notebookSaveTimer);notebookSaveTimer=setTimeout(fmNotebookSaveNow,450)}
  function fmNotebookNew(){
    const n={id:'typed_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),title:'Nova anotação',content:'',orientation:'portrait',createdAt:Date.now(),updatedAt:Date.now()};
    fmNotebooks().unshift(n);activeNotebookId=n.id;save();render();setTimeout(()=>document.getElementById('fmNotebookTitle')?.focus(),50)
  }
  function fmNotebookOpen(id){activeNotebookId=id;render()}
  function fmNotebookBack(){fmNotebookSaveNow();activeNotebookId=null;render()}
  function fmNotebookDelete(id){const n=fmNotebooks().find(x=>String(x.id)===String(id));if(!n||!confirm('Excluir “'+(n.title||'Anotação')+'”?'))return;db.studyNotebooks=db.studyNotebooks.filter(x=>String(x.id)!==String(id));activeNotebookId=null;save();render()}
  function fmNotebookCommand(cmd,val=null){const ed=document.getElementById('fmNotebookEditor');if(!ed)return;ed.focus();try{document.execCommand(cmd,false,val)}catch(e){}fmNotebookScheduleSave()}
  function fmNotebookInsertImage(file){
    if(!file||!file.type.startsWith('image/'))return;
    const reader=new FileReader();reader.onload=()=>{const ed=document.getElementById('fmNotebookEditor');if(!ed)return;ed.focus();const img=document.createElement('img');img.src=reader.result;img.alt=file.name||'Imagem inserida';img.style.maxWidth='100%';img.style.width='min(420px, 100%)';img.style.height='auto';img.style.resize='both';img.style.overflow='auto';img.style.display='inline-block';img.style.cursor='nwse-resize';const sel=getSelection();let range;if(sel&&sel.rangeCount&&ed.contains(sel.anchorNode))range=sel.getRangeAt(0);else{range=document.createRange();range.selectNodeContents(ed);range.collapse(false)}range.deleteContents();range.insertNode(img);range.setStartAfter(img);range.collapse(true);sel?.removeAllRanges();sel?.addRange(range);fmNotebookScheduleSave()};reader.readAsDataURL(file)
  }
  function fmNotebookEditorHtml(n){
    const orient=n.orientation||'portrait';
    return `<section class="panel fmNotebookWorkspace">
      <div class="row fmNotebookTop"><button class="btn ghost" onclick="fmNotebookBack()">← Meus cadernos</button><span class="pill">📒 Anotações de aula</span><span id="fmNotebookSaveState" class="muted">Salvo automaticamente</span></div>
      <input id="fmNotebookTitle" class="field fmNotebookTitle" maxlength="140" value="${fmNotebookEsc(n.title||'Nova anotação')}" placeholder="Título da aula (ex.: Radiologia — tórax)" oninput="fmNotebookScheduleSave()">
      <div class="fmNotebookToolbar" role="toolbar" aria-label="Formatação do texto">
        <select aria-label="Fonte" title="Tipo de fonte" onchange="fmNotebookCommand('fontName',this.value)"><option value="Arial">Arial</option><option value="Georgia">Georgia</option><option value="Verdana">Verdana</option><option value="Tahoma">Tahoma</option><option value="'Times New Roman'">Times New Roman</option></select>
        <select aria-label="Tamanho da fonte" title="Tamanho da fonte" onchange="fmNotebookCommand('fontSize',this.value)"><option value="2">Pequeno</option><option value="3" selected>Normal</option><option value="4">Grande</option><option value="5">Muito grande</option><option value="6">Título</option></select>
        <button type="button" title="Negrito" onclick="fmNotebookCommand('bold')"><b>B</b></button><button type="button" title="Itálico" onclick="fmNotebookCommand('italic')"><i>I</i></button><button type="button" title="Sublinhar" onclick="fmNotebookCommand('underline')"><u>U</u></button>
        <span class="fmNotebookToolSep"></span>
        <label title="Cor do texto" class="fmNotebookColor">A <input type="color" value="#35202d" aria-label="Cor do texto" onchange="fmNotebookCommand('foreColor',this.value)"></label>
        <label title="Cor de destaque" class="fmNotebookColor">🖍 <input type="color" value="#fff0a8" aria-label="Cor de destaque" onchange="fmNotebookCommand('hiliteColor',this.value)"></label>
        <span class="fmNotebookToolSep"></span>
        <button type="button" title="Alinhar à esquerda" onclick="fmNotebookCommand('justifyLeft')">☰←</button><button type="button" title="Centralizar" onclick="fmNotebookCommand('justifyCenter')">≡</button><button type="button" title="Alinhar à direita" onclick="fmNotebookCommand('justifyRight')">→☰</button><button type="button" title="Justificar" onclick="fmNotebookCommand('justifyFull')">☷</button>
        <button type="button" title="Lista com marcadores" onclick="fmNotebookCommand('insertUnorderedList')">• Lista</button><button type="button" title="Lista numerada" onclick="fmNotebookCommand('insertOrderedList')">1. Lista</button>
        <span class="fmNotebookToolSep"></span>
        <button type="button" title="Inserir imagem do computador" onclick="document.getElementById('fmNotebookImageInput').click()">＋ Imagem</button><input id="fmNotebookImageInput" type="file" accept="image/*" hidden onchange="fmNotebookInsertImage(this.files[0]);this.value=''">
        <select aria-label="Orientação da página" title="Orientação da página" value="${orient}" onchange="fmNotebookSetOrientation(this.value)"><option value="portrait" ${orient==='portrait'?'selected':''}>Página vertical</option><option value="landscape" ${orient==='landscape'?'selected':''}>Página horizontal</option></select>
        <button type="button" title="Desfazer" onclick="fmNotebookCommand('undo')">↶</button><button type="button" title="Refazer" onclick="fmNotebookCommand('redo')">↷</button>
      </div>
      <div id="fmNotebookEditor" class="fmNotebookPaper ${orient==='landscape'?'isLandscape':''}" contenteditable="true" spellcheck="true" data-placeholder="Comece a anotar sua aula aqui…\n\nVocê pode colar texto e imagens (Ctrl+V), formatar trechos e redimensionar imagens diretamente pelas bordas." oninput="fmNotebookScheduleSave()" onpaste="fmNotebookHandlePaste(event)" onkeydown="fmNotebookHandleKeys(event)" >${n.content||''}</div>
      <div class="fmNotebookFooter"><span>💡 Dica: cole imagens com Ctrl+V. Clique na imagem e arraste a alça no canto inferior direito para redimensionar.</span><button class="btn ghost" onclick="fmNotebookSaveNow()">Salvar agora</button></div>
    </section>`
  }
  function fmNotebookSetOrientation(v){const ed=document.getElementById('fmNotebookEditor');if(!ed)return;ed.classList.toggle('isLandscape',v==='landscape');const n=fmNotebooks().find(x=>String(x.id)===String(activeNotebookId));if(n)n.orientation=v;fmNotebookScheduleSave()}
  function fmNotebookHandlePaste(e){
    const items=Array.from(e.clipboardData?.items||[]);const imgItem=items.find(i=>i.type&&i.type.startsWith('image/'));
    if(!imgItem)return;
    const file=imgItem.getAsFile();if(!file)return;e.preventDefault();fmNotebookInsertImage(file)
  }
  function fmNotebookHandleKeys(e){if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();fmNotebookSaveNow()}}
  function fmNotebookListHtml(){
    const notes=fmNotebooks().slice().sort((a,b)=>(b.updatedAt||b.createdAt||0)-(a.updatedAt||a.createdAt||0));
    return `<section class="fmNotebookIntro"><div><span class="fmNotebookKicker">FLASHMED • SEU ESPAÇO DE ANOTAÇÕES</span><h2>Meus Cadernos</h2><p>Faça anotações digitadas das aulas, organize os conteúdos e inclua imagens no meio do texto.</p></div><button class="btn" onclick="fmNotebookNew()">＋ Nova anotação</button></section>
      <div class="fmNotebookQuick"><span>✍️ Texto formatado</span><span>🖼️ Imagens no texto</span><span>☁️ Salvamento automático</span></div>
      <section class="fmNotebookList">${notes.length?notes.map(n=>`<article class="fmNotebookCard"><div class="fmNotebookCardIcon">📒</div><div class="fmNotebookCardText"><h3>${fmNotebookEsc(n.title||'Anotação sem título')}</h3><p>${n.updatedAt?'Atualizado em '+new Date(n.updatedAt).toLocaleString('pt-BR',{dateStyle:'short',timeStyle:'short'}):'Ainda não editado'}</p><div class="fmNotebookPreview">${(n.content||'').replace(/<img[^>]*>/gi,'[imagem]').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').slice(0,150)||'Comece a registrar o conteúdo da aula…'}</div></div><div class="fmNotebookCardActions"><button class="btn" onclick="fmNotebookOpen('${String(n.id).replace(/'/g,'\\\\\'')}')">Abrir caderno</button><button class="btn ghost" onclick="fmNotebookDelete('${String(n.id).replace(/'/g,'\\\\\'')}')">Excluir</button></div></article>`).join(''):`<article class="fmNotebookEmpty"><div>📚</div><h3>Seu primeiro caderno começa aqui</h3><p>Crie uma anotação agora para sua aula de Radiologia das 18h.</p><button class="btn" onclick="fmNotebookNew()">Criar anotação de Radiologia</button></article>`}</section>`
  }
  function fmNotebookView(){if(activeNotebookId!==null){let n=fmNotebooks().find(x=>String(x.id)===String(activeNotebookId));if(!n)activeNotebookId=null;else return fmNotebookEditorHtml(n)}return fmNotebookListHtml()}
  const fmNotebookStyle=document.createElement('style');
  fmNotebookStyle.textContent=`
  .fmNotebookIntro{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:26px 28px;border:1px solid var(--line);border-radius:24px;background:linear-gradient(120deg,#fffafd,#f8efff);box-shadow:var(--shadow);margin:14px 0}.fmNotebookKicker{font-size:10px;font-weight:900;letter-spacing:.15em;color:#8a5681}.fmNotebookIntro h2{font-size:clamp(27px,3vw,38px);margin:8px 0}.fmNotebookIntro p{color:var(--muted);max-width:650px;margin:0;line-height:1.6}.fmNotebookQuick{display:flex;gap:9px;flex-wrap:wrap;margin:14px 0 18px}.fmNotebookQuick span{border:1px solid var(--line);border-radius:999px;background:#fff;padding:8px 12px;color:var(--deep);font-size:12px;font-weight:700}.fmNotebookList{display:grid;gap:12px}.fmNotebookCard{display:flex;align-items:flex-start;gap:15px;padding:18px;background:#fff;border:1px solid var(--line);border-radius:18px;box-shadow:var(--shadow)}.fmNotebookCardIcon{font-size:30px;background:#f7eefa;border-radius:14px;padding:12px}.fmNotebookCardText{flex:1;min-width:0}.fmNotebookCard h3{margin:2px 0 4px}.fmNotebookCard p{font-size:12px;color:var(--muted);margin:0 0 8px}.fmNotebookPreview{font-size:13px;color:var(--muted);white-space:normal;overflow-wrap:anywhere}.fmNotebookCardActions{display:flex;gap:7px;flex-wrap:wrap}.fmNotebookEmpty{text-align:center;background:#fff;border:1px dashed #d8b6d5;border-radius:22px;padding:38px 18px}.fmNotebookEmpty>div{font-size:40px}.fmNotebookWorkspace{padding:18px;overflow:hidden}.fmNotebookTop{margin-bottom:8px}.fmNotebookTitle{font-size:22px;font-weight:850;margin-top:8px}.fmNotebookToolbar{display:flex;align-items:center;gap:5px;flex-wrap:wrap;padding:9px;background:#fbf5fc;border:1px solid var(--line);border-radius:13px 13px 0 0}.fmNotebookToolbar button,.fmNotebookToolbar select{font-size:13px;border:1px solid var(--line);border-radius:8px;padding:7px 8px;background:#fff;color:var(--ink);cursor:pointer;min-height:34px}.fmNotebookToolbar button:hover{background:#f3e5f5}.fmNotebookToolbar select{max-width:150px}.fmNotebookToolSep{width:1px;height:25px;background:var(--line);margin:0 3px}.fmNotebookColor{display:inline-flex;align-items:center;gap:4px;background:white;border:1px solid var(--line);padding:4px 6px;border-radius:8px;font-weight:800}.fmNotebookColor input{width:22px;height:22px;padding:0;border:0;background:transparent}.fmNotebookPaper{min-height:62vh;padding:36px clamp(18px,5vw,64px);background-color:#fff;line-height:1.75;font-size:16px;outline:none;border:1px solid var(--line);border-top:0;border-radius:0 0 13px 13px;overflow:auto;overflow-wrap:anywhere;box-shadow:inset 0 0 0 1px #ffffff;white-space:normal}.fmNotebookPaper:empty:before{content:attr(data-placeholder);white-space:pre-line;color:#b7a3b4}.fmNotebookPaper.isLandscape{min-height:52vh;padding-left:28px;padding-right:28px}.fmNotebookPaper img{display:inline-block;max-width:100%;height:auto;resize:both;overflow:auto;vertical-align:middle;cursor:nwse-resize;object-fit:contain}.fmNotebookFooter{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding-top:12px;color:var(--muted);font-size:12px}.fmNotebookPaper ul,.fmNotebookPaper ol{padding-left:28px}.fmNotebookPaper table{border-collapse:collapse;max-width:100%}.fmNotebookPaper td,.fmNotebookPaper th{border:1px solid var(--line);padding:5px}@media(max-width:720px){.fmNotebookIntro{align-items:flex-start;flex-direction:column;padding:20px}.fmNotebookCard{flex-wrap:wrap}.fmNotebookCardText{flex-basis:calc(100% - 65px)}.fmNotebookCardActions{width:100%}.fmNotebookWorkspace{padding:10px}.fmNotebookPaper{min-height:65vh;padding:22px 16px}.fmNotebookToolbar select{max-width:120px}.fmNotebookToolSep{display:none}.fmNotebookFooter{align-items:flex-start}.fmNotebookTop{align-items:flex-start}}`;
  document.head.appendChild(fmNotebookStyle);
  // Export callbacks for the inline controls, matching the app's existing classic-script architecture.
  Object.assign(window,{fmNotebookNew,fmNotebookOpen,fmNotebookBack,fmNotebookDelete,fmNotebookCommand,fmNotebookInsertImage,fmNotebookScheduleSave,fmNotebookSaveNow,fmNotebookSetOrientation,fmNotebookHandlePaste,fmNotebookHandleKeys});
  const originalRender=window.render;
  window.render=function(){
    if(route===routeName){document.getElementById('title').textContent=routeName;document.getElementById('date').textContent='Suas anotações de aulas';document.getElementById('view').innerHTML=fmNotebookView();return}
    if(typeof originalRender==='function')return originalRender.apply(this,arguments);
  };
})();
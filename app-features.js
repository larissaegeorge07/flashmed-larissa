// --- Jogos FlashMed ---
const FLASH_GAMES={
 pharma:[
  {q:'Qual classe bloqueia a enzima conversora de angiotensina?',a:'IECA',tip:'Ex.: enalapril, captopril.'},
  {q:'Qual efeito adverso clássico dos IECAs costuma cair em prova?',a:'Tosse seca',tip:'Relacionada ao aumento de bradicinina.'},
  {q:'Qual é o antídoto da intoxicação por opioides?',a:'Naloxona',tip:'Antagonista opioide.'},
  {q:'Qual classe inclui losartana e valsartana?',a:'BRA',tip:'Bloqueadores do receptor AT1 da angiotensina II.'},
  {q:'Qual fármaco é o antídoto da toxicidade pelo sulfato de magnésio?',a:'Gluconato de cálcio',tip:'Decoreba obstétrica importante.'}
 ],
 who:[
  {q:'Prurido anal noturno, principalmente em criança. Quem sou eu?',a:'Enterobius vermicularis',tip:'Oxiuríase.'},
  {q:'Anemia ferropriva + hábito de andar descalço. Quem sou eu?',a:'Ancilostomídeos',tip:'Ancylostoma/Necator.'},
  {q:'Água doce + caramujo + hipertensão portal. Quem sou eu?',a:'Schistosoma mansoni',tip:'Esquistossomose.'},
  {q:'Diarreia gordurosa após água contaminada. Quem sou eu?',a:'Giardia duodenalis',tip:'Giardíase.'}
 ],
 rapid:[
  {q:'Gestante 35 semanas, PA 170×115 + cefaleia/escotomas. Prioridade?',a:'Estabilização materna + tratar HAS grave + MgSO₄',tip:'Pré-eclâmpsia com sinais de gravidade.'},
  {q:'Lactente com bronquiolite típica e hipoxemia. Base do tratamento?',a:'Suporte e oxigênio quando indicado',tip:'Broncodilatador/corticoide não são rotina.'},
  {q:'Suspeita de torção testicular. Próxima conduta?',a:'Exploração cirúrgica imediata',tip:'Não atrasar por exames quando a suspeita é alta.'}
 ]};
let gameState={type:null,index:0,reveal:false,score:0,round:1,max:10,answered:false};
const GAME_META={pharma:['💊','Desafio Farmacológico','Classes, efeitos adversos, antídotos e raciocínio de prescrição.'],who:['🕵️','Quem sou eu?','Descubra o diagnóstico, agente ou parasito pelas pistas.'],rapid:['⚡','Conduta relâmpago','Escolha mentalmente a próxima decisão antes do tempo acabar.'],memory:['🧠','Memória Médica','Encontre os pares: medicamento-classe, doença-achado e agente-doença.']};
const MEMORY_PAIRS=[
 ['Captopril','IECA'],['Losartana','BRA'],['Naloxona','Opioides'],['Flumazenil','Benzodiazepínicos'],
 ['Koplik','Sarampo'],['Gottron','Dermatomiosite'],['Morangueiro','Escarlatina'],['Kernicterus','Bilirrubina indireta'],
 ['Enterobius','Prurido anal noturno'],['Giardia','Esteatorreia'],['Schistosoma','Hipertensão portal'],['VSR','Bronquiolite']
];
function gameDayNumber(){return Math.max(0,Math.floor((new Date(day()+'T12:00:00')-new Date('2026-09-27T12:00:00'))/86400000))}
function dailyGameInfo(){let n=gameDayNumber(),unlocked=(n+1)*10;return {day:n+1,unlocked}}
let memoryState={cards:[],open:[],matched:new Set(),moves:0};
function gamesView(){return `<div class='panel' style='padding:0;overflow:hidden'><iframe id='flashmedGamesFrame' title='FlashMed Games' src='games.html?embedded=1&build=20260929-missions-v11' style='width:100%;height:calc(100vh - 155px);min-height:760px;border:0;display:block;background:#fff6fb' loading='eager'></iframe></div>`}

function shuffleGame(a){let x=a.slice();for(let i=x.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x}
function startMemoryGame(){let pairs=shuffleGame(MEMORY_PAIRS).slice(0,6),cards=[];pairs.forEach((p,i)=>{cards.push({id:i+'a',pair:i,text:p[0]},{id:i+'b',pair:i,text:p[1]})});memoryState={cards:shuffleGame(cards),open:[],matched:new Set(),moves:0};renderMemoryGame()}
function renderMemoryGame(){title.textContent='Jogos';let s=memoryState;view.innerHTML=`<div class=panel><div class=row style='justify-content:space-between'><div class=row><button class='btn ghost' onclick="go('Jogos')">← Jogos</button><span class=pill>🧠 Memória Médica</span></div><span class=pill>🎯 ${s.moves} jogadas</span></div><p class=muted>Encontre os 6 pares relacionados. Não são cartas idênticas: você precisa lembrar a associação médica.</p><div class=memoryBoard>${s.cards.map((c,i)=>{let shown=s.open.includes(i)||s.matched.has(c.pair);return `<button class="memoryCard ${shown?'':'covered'} ${s.matched.has(c.pair)?'matched':''}" onclick="flipMemory(${i})" ${s.matched.has(c.pair)?'disabled':''}>${shown?esc(c.text):'✦'}</button>`}).join('')}</div>${s.matched.size===6?`<div class='panel hero' style='margin-top:16px;text-align:center'><h2>🎉 Você encontrou todos!</h2><p>${s.moves} jogadas</p><button class=btn onclick='startMemoryGame()'>Jogar novamente</button></div>`:''}</div>`}
function flipMemory(i){let s=memoryState;if(s.open.includes(i)||s.matched.has(s.cards[i].pair)||s.open.length>=2)return;s.open.push(i);renderMemoryGame();if(s.open.length===2){s.moves++;let [a,b]=s.open;if(s.cards[a].pair===s.cards[b].pair){s.matched.add(s.cards[a].pair);s.open=[];setTimeout(renderMemoryGame,350)}else setTimeout(()=>{s.open=[];renderMemoryGame()},850)}}
function startGame(type){let a=FLASH_GAMES[type];gameState={type,index:Math.floor(Math.random()*a.length),reveal:false,score:0,round:1,max:10,answered:false};renderGame()}
function renderGame(){let a=FLASH_GAMES[gameState.type],q=a[gameState.index%a.length],m=GAME_META[gameState.type],pct=Math.round((gameState.round-1)/gameState.max*100);title.textContent='Jogos';view.innerHTML=`<div class=panel><div class=row style='justify-content:space-between'><div class=row><button class='btn ghost' onclick="go('Jogos')">← Jogos</button><span class=pill>${m[0]} ${m[1]}</span></div><span class=pill>⭐ ${gameState.score} ponto(s)</span></div><div class=gameProgress style='margin-top:14px'><i style='width:${pct}%'></i></div><p class=muted>Rodada ${gameState.round} de ${gameState.max}</p><div class=flash style='margin-top:10px'><div><div class=gameIcon>${m[0]}</div><h2>${esc(q.q)}</h2>${gameState.reveal?`<div class=gameAnswer>${esc(q.a)}</div><p class=muted>${esc(q.tip)}</p>`:`<p class=muted>Pense na resposta antes de revelar.</p>`}</div></div><div class=row style='justify-content:center;margin-top:14px'>${!gameState.reveal?`<button class=btn onclick='gameState.reveal=true;renderGame()'>Revelar resposta</button>`:`<button class='btn ghost' onclick='gradeGame(false)'>❌ Errei</button><button class=btn onclick='gradeGame(true)'>✅ Acertei</button>`}</div></div>`}
function gradeGame(ok){if(ok)gameState.score++;if(gameState.round>=gameState.max)return finishGame();gameState.round++;let a=FLASH_GAMES[gameState.type];gameState.index=(gameState.index+1+Math.floor(Math.random()*Math.max(1,a.length-1)))%a.length;gameState.reveal=false;renderGame()}
function finishGame(){let m=GAME_META[gameState.type],pct=Math.round(gameState.score/gameState.max*100);view.innerHTML=`<div class='panel hero' style='text-align:center'><div class=gameIcon>${m[0]}</div><h2>Partida concluída!</h2><div style='font-size:48px;font-weight:950'>${gameState.score}/${gameState.max}</div><p>${pct}% de acertos</p><div class=row style='justify-content:center'><button class=btn onclick="startGame('${gameState.type}')">Jogar novamente</button><button class='btn ghost' onclick="go('Jogos')">Outros jogos</button></div></div>`}

// --- Casos Clínicos • beta seguro: módulo isolado, sem tocar no Banco de Questões ---
const CLINICAL_CASES=[
{id:'cc1',area:'Atenção Primária',level:'Postinho',title:'Consulta de demanda espontânea',patient:'Mulher, 27 anos, procura a UBS por ardor ao urinar e aumento da frequência urinária há 2 dias. Nega febre, vômitos, dor lombar, corrimento vaginal e gestação. Sem comorbidades conhecidas.',tasks:['Qual sua hipótese principal e quais diagnósticos diferenciais você consideraria?','Que perguntas/exame físico ainda faria?','Solicitaria exames? Justifique.','Escreva sua conduta e uma prescrição como faria na UBS.','Quais orientações e sinais de alarme explicaria à paciente?'],model:'Quadro compatível com cistite aguda não complicada. Confirmar ausência de sinais de pielonefrite, gestação, anormalidade urológica e causas ginecológicas. Em mulher jovem típica, o diagnóstico pode ser clínico; EAS pode auxiliar conforme contexto e urocultura fica reservada a situações selecionadas. A prescrição deve considerar protocolo local, alergias, gestação e resistência antimicrobiana. Orientar hidratação conforme tolerância, adesão, retorno se febre, dor lombar, vômitos, piora ou ausência de resposta.'},
{id:'cc2',area:'Pediatria',level:'Pronto atendimento',title:'Criança com dificuldade para respirar',patient:'Lactente de 5 meses, previamente saudável, com coriza e tosse há 3 dias. Hoje a mãe percebeu respiração mais rápida e dificuldade para mamar. Ao exame: alerta, FR 58 irpm, tiragem subcostal leve, sibilos e estertores difusos, SatO₂ 94% em ar ambiente.',tasks:['Qual sua hipótese principal?','Como classificaria a gravidade?','O que faria nos primeiros minutos?','Prescreveria broncodilatador, corticoide ou antibiótico? Explique.','Quais critérios fariam você observar/internar?'],model:'O padrão sugere bronquiolite viral. Avalie oxigenação, esforço respiratório, hidratação/alimentação, apneia e fatores de risco. O manejo é predominantemente de suporte; oxigênio é indicado conforme hipoxemia e protocolo, além de higiene/aspiração nasal e suporte hídrico quando necessário. Broncodilatadores, corticoides e antibióticos não são rotina em bronquiolite típica. A decisão de alta, observação ou internação depende da evolução clínica, saturação, esforço, ingestão, apneia e vulnerabilidades.'},
{id:'cc3',area:'Ginecologia e Obstetrícia',level:'Urgência',title:'Gestante com cefaleia',patient:'Gestante de 35 semanas chega à maternidade com cefaleia intensa e escotomas. PA 168×112 mmHg em duas medidas. Refere dor em hipocôndrio direito. BCF presente.',tasks:['Qual o diagnóstico sindrômico mais provável?','Quais exames solicita imediatamente?','Quais são suas prioridades terapêuticas?','Escreva uma prescrição inicial simulada.','O que define o momento da resolução da gestação?'],model:'O quadro deve ser tratado como pré-eclâmpsia com sinais de gravidade até avaliação completa. Prioridades: estabilização materna, controle da hipertensão grave, prevenção de eclâmpsia com sulfato de magnésio quando indicado, avaliação laboratorial de órgão-alvo e avaliação fetal. A resolução depende da estabilidade materno-fetal, idade gestacional e presença de critérios que contraindiquem conduta expectante; em cenário grave, segurança materna é central.'}
];
let clinicalCaseIndex=0,clinicalReveal=false;
function clinicalCasesView(){let q=CLINICAL_CASES[clinicalCaseIndex%CLINICAL_CASES.length];return `<div class=panel><div class=row style='justify-content:space-between'><div><h2>🩺 Casos Clínicos <span class=muted>• beta</span></h2><div class=goldLine></div><p class=muted>Treino de raciocínio e conduta para a prática. Não substitui protocolo institucional nem supervisão clínica.</p></div><span class=chip>${esc(q.area)} • ${esc(q.level)}</span></div><div class=qbox><h3>${esc(q.title)}</h3><p>${esc(q.patient)}</p></div><h3>🎯 Sua vez</h3>${q.tasks.map((t,i)=>`<label style='display:block;margin:12px 0'><b>${i+1}. ${esc(t)}</b><textarea id='cc-${i}' class=field rows=3 style='margin-top:7px' placeholder='Escreva como se estivesse atendendo...'></textarea></label>`).join('')}<div class=row><button class=btn onclick='clinicalReveal=true;render()'>Conferir raciocínio</button><button class='btn ghost' onclick='nextClinicalCase()'>Outro caso</button></div>${clinicalReveal?`<div class=qbox style='margin-top:16px'><h3>🧠 Discussão do caso</h3><p>${esc(q.model)}</p><p class=muted><b>Autoavaliação:</b> compare diagnóstico, sequência da conduta, segurança, prescrição e orientações. O objetivo é raciocinar — não decorar uma receita única.</p></div>`:''}</div>`}
function nextClinicalCase(){clinicalCaseIndex=(clinicalCaseIndex+1)%CLINICAL_CASES.length;clinicalReveal=false;render()}

// Page banners use the same lightweight gradient treatment as the Games hero.
function flashmedPageBanner(currentRoute){
 if(currentRoute==='Jogos')return '';
 const pages={
 'Dashboard':['✨ SEU ESPAÇO DE ESTUDO','Seu painel de estudos!','Acompanhe suas metas, revisões e evolução em um só lugar.'],
 'Banco de Questões':['📝 TREINE SEU RACIOCÍNIO','Banco de Questões','Pratique com as provas e acompanhe seu desempenho.'],
 'Caderno de Conhecimentos':['📚 GUARDE O QUE IMPORTA','Caderno de Conhecimentos','Organize seus aprendizados em um mural ou lista, com busca por conteúdo, matéria e tags.'],
 'Revisão':['🔁 HORA DE REVISAR','Revisão inteligente','Reforce o que aprendeu e mantenha seu conhecimento em dia.'],
 'Matérias':['🃏 APRENDA E MEMORIZE','Seus flashcards','Organize suas matérias e transforme conteúdo em memória.'],
 'Adicionar flashcard':['✨ CRIE E APRENDA','Novo flashcard','Guarde o que é importante para suas próximas revisões.'],
 'Questões erradas':['📌 APRENDA COM OS ERROS','Questões erradas','Transforme cada dificuldade em uma nova oportunidade de aprender.'],
 'Métricas':['📊 SUA EVOLUÇÃO','Seu desempenho','Visualize seu progresso e descubra o que revisar.'],
 'Decorebas':['💡 MEMORIZAÇÃO RÁPIDA','Caderno de decorebas','As informações essenciais sempre à mão.'],
 'Casos Clínicos':['🩺 RACIOCÍNIO CLÍNICO','Casos clínicos','Treine suas decisões com situações da prática médica.'],
 'Aleatório':['🎲 REVISÃO SURPRESA','Revisão aleatória','Desafie sua memória com flashcards variados.'],
 'Meu FlashMed':['🎀 DO SEU JEITO','Meu FlashMed','Personalize seu ambiente de estudos.']
 };
 const info=pages[currentRoute]||['✨ FLASHMED',currentRoute,'Seu espaço de estudos.'];
 return `<section class="fmPageHero" aria-label="${esc(info[1])}"><span class="fmHeroSpark fmHeroSparkOne" aria-hidden="true">✦</span><span class="fmHeroSpark fmHeroSparkTwo" aria-hidden="true">✧</span><span class="fmHeroSpark fmHeroSparkThree" aria-hidden="true">✦</span><span class="fmHeroEyebrow">${esc(info[0])}</span><h2>${esc(info[1])}</h2><p>${esc(info[2])}</p></section>`;
}

// Atualiza os calendários automaticamente quando chega domingo às 18h.
setInterval(()=>{
 const nextOffset=plannerDefaultWeekOffset();
 if(nextOffset===plannerAutoWeekSignature)return;
 plannerAutoWeekSignature=nextOffset;
 if(!plannerWeekManuallyNavigated)plannerWeekOffset=nextOffset;
 const dashboardWeek=view.querySelector('.fmWeekPanel');
 if(dashboardWeek&&route==='Dashboard')dashboardWeek.outerHTML=fmDashboardWeekHtml();
 const weeklyHost=document.getElementById('spWeeklySchedule');
 if(weeklyHost&&!plannerWeekManuallyNavigated)weeklyHost.innerHTML=plannerWeeklyScheduleHtml((db.studyPlan||{}).weekSchedule||[]);
},60000);


/* Biblioteca de Leituras: arquivos binários em Supabase Storage privado; metadados sincronizados na conta. */
const FLASHMED_PDF_BUCKET='flashmed-pdfs';
let pdfLibraryFilter='',pdfLibraryReaderId=null,pdfLibraryObjectUrl=null,pdfLibraryDocxHtml='';
function pdfLibraryInit(){db.pdfLibrary=Array.isArray(db.pdfLibrary)?db.pdfLibrary:[]}
function pdfLibraryView(){
 pdfLibraryInit();
 const q=String(pdfLibraryFilter||'').toLocaleLowerCase('pt-BR');
 const docs=db.pdfLibrary.filter(d=>!q||[d.title,d.fileName,d.category,d.notes].join(' ').toLocaleLowerCase('pt-BR').includes(q)).sort((a,b)=>(b.updatedAt||b.createdAt||0)-(a.updatedAt||a.createdAt||0));
 const categories=['Geral','Obstetrícia','Ginecologia','Pediatria','Clínica Médica','Medicina Preventiva','Outros'];
 return '<div class="panel hero"><div class="row" style="align-items:center"><div style="flex:1"><h2>📚 Biblioteca de Leituras</h2><p>Guarde seus PDFs e documentos Word na sua conta, abra-os em uma página de leitura e retome de onde parou. Os arquivos ficam privados.</p></div><span class="pill">'+docs.length+' arquivo(s)</span></div><div class="muted" style="font-size:12px">PDF até 25 MB · Word (.docx) até 25 MB · busca, categorias e progresso de leitura</div></div>'+
 '<div class="panel" style="margin-top:14px"><h3>＋ Adicionar material</h3><div class="grid2"><label>Título<input id="pdfLibTitle" class="field" placeholder="Ex.: Protocolo de pré-eclâmpsia"></label><label>Categoria<select id="pdfLibCategory" class="field">'+categories.map(c=>'<option>'+c+'</option>').join('')+'</select></label></div><label>Arquivo PDF ou Word (.docx)<input id="pdfLibFile" class="field" type="file" accept=".pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"></label><label>Observação (opcional)<input id="pdfLibNotes" class="field" placeholder="Ex.: revisar capítulo 3"></label><button class="btn" onclick="pdfLibraryUpload()">Enviar para minha biblioteca ☁️</button><p class="muted" style="font-size:12px;margin-bottom:0">Antes do primeiro envio, configure o armazenamento privado no Supabase usando o <a href="https://github.com/larissaegeorge07/flashmed-larissa/blob/main/supabase-pdf-library-setup.sql" target="_blank" rel="noopener">script de configuração</a>. Os arquivos não são publicados como links públicos.</p></div>'+
 '<div class="panel" style="margin-top:14px"><label>Buscar na biblioteca<input class="field" placeholder="Título, categoria ou observação…" value="'+esc(pdfLibraryFilter)+'" oninput="pdfLibraryFilter=this.value;pdfLibraryRefreshResults()"></label><div id="pdfLibraryResults" class="knowledgeBookGrid">'+pdfLibraryCards(docs)+'</div></div>'+
 (pdfLibraryReaderId?pdfLibraryReaderView(pdfLibraryReaderId):'');
}
function pdfLibraryCards(docs){
 if(!docs.length)return '<div class="panel" style="grid-column:1/-1;text-align:center"><h3>Sua biblioteca começa aqui</h3><p class="muted">Adicione os PDFs e arquivos Word que você usa nos estudos.</p></div>';
 return docs.map(d=>'<article class="panel" style="padding:16px"><div class="row" style="align-items:flex-start"><div style="font-size:28px">'+(d.kind==='docx'?'📝':'📄')+'</div><div style="flex:1;min-width:0"><h3 style="margin:0 0 5px;overflow-wrap:anywhere">'+esc(d.title||d.fileName)+'</h3><div class="muted" style="font-size:12px">'+esc(d.category||'Geral')+' · '+(d.kind==='docx'?'Word':'PDF')+' · '+esc(d.fileName||'')+'</div>'+(d.notes?'<p style="font-size:13px">'+esc(d.notes)+'</p>':'')+(d.lastPage?'<span class="pill">Retomar na página '+Number(d.lastPage)+'</span>':'')+'</div></div><div class="row" style="margin-top:12px"><button class="btn" onclick="pdfLibraryOpen('+esc(JSON.stringify(String(d.id)))+')">📖 Ler</button><button class="btn ghost" onclick="pdfLibraryEditMeta('+esc(JSON.stringify(String(d.id)))+')">Editar detalhes</button><button class="btn ghost" onclick="pdfLibraryDelete('+esc(JSON.stringify(String(d.id)))+')">Excluir</button></div></article>').join('');
}
function pdfLibraryRefreshResults(){const el=document.getElementById('pdfLibraryResults');if(el){const q=String(pdfLibraryFilter||'').toLocaleLowerCase('pt-BR');el.innerHTML=pdfLibraryCards(db.pdfLibrary.filter(d=>!q||[d.title,d.fileName,d.category,d.notes].join(' ').toLocaleLowerCase('pt-BR').includes(q)).sort((a,b)=>(b.updatedAt||b.createdAt||0)-(a.updatedAt||a.createdAt||0))) }}
async function pdfLibraryUpload(){
 pdfLibraryInit();const input=document.getElementById('pdfLibFile'),file=input?.files?.[0];if(!file)return toast('Escolha um PDF ou arquivo Word primeiro');
 if(file.size>25*1024*1024)return toast('O limite por arquivo é 25 MB');
 const lower=file.name.toLowerCase(),kind=lower.endsWith('.pdf')||file.type==='application/pdf'?'pdf':lower.endsWith('.docx')||file.type==='application/vnd.openxmlformats-officedocument.wordprocessingml.document'?'docx':'';
 if(!kind)return toast('Formato não suportado. Use PDF ou Word .docx');
 if(!cloud||!currentUser)return toast('Entre na sua conta para salvar materiais na nuvem');
 const title=document.getElementById('pdfLibTitle').value.trim()||file.name.replace(/\.(pdf|docx)$/i,'');
 const category=document.getElementById('pdfLibCategory').value,notes=document.getElementById('pdfLibNotes').value.trim();
 const id='pdf_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,9),path=currentUser.id+'/'+id+'/'+file.name.replace(/[^\w.() -]/g,'_');
 const btn=document.querySelector('button[onclick="pdfLibraryUpload()"]');if(btn){btn.disabled=true;btn.textContent='Enviando com segurança…'}
 try{
  const {data,error}=await cloud.storage.from(FLASHMED_PDF_BUCKET).upload(path,file,{contentType:kind==='pdf'?'application/pdf':'application/vnd.openxmlformats-officedocument.wordprocessingml.document',upsert:false});
  if(error)throw error;
  db.pdfLibrary.unshift({id,title,fileName:file.name,kind,category,notes,storagePath:data.path,ownerId:currentUser.id,createdAt:Date.now(),updatedAt:Date.now(),lastPage:1,favorite:false});
  if(!save())throw new Error('O arquivo foi enviado, mas os metadados não puderam ser salvos localmente. Não reenvie; atualize a página e confira a biblioteca.');
  pdfLibraryFilter='';render();toast('Material adicionado à sua biblioteca!');
 }catch(e){console.error('Biblioteca FlashMed',e);toast(/Bucket not found|not found/i.test(e.message||'')?'O armazenamento ainda precisa ser configurado no Supabase. Veja as instruções abaixo.':('Falha no envio: '+(e.message||'verifique a conexão')).slice(0,170))}
 finally{if(btn){btn.disabled=false;btn.textContent='Enviar para minha biblioteca ☁️'}}
}
async function pdfLibraryOpen(id){
 pdfLibraryInit();const d=db.pdfLibrary.find(x=>String(x.id)===String(id));if(!d)return;
 pdfLibraryReaderId=String(id);pdfLibraryDocxHtml='';render();
 const host=document.getElementById('pdfLibraryReaderContent');if(!host)return;
 host.innerHTML='<div class="panel"><p>Preparando leitura segura…</p></div>';
 try{
  const {data,error}=await cloud.storage.from(FLASHMED_PDF_BUCKET).createSignedUrl(d.storagePath,300);
  if(error)throw error;
  if(d.kind==='pdf'){
   host.innerHTML='<div class="panel" style="padding:6px"><iframe title="'+esc(d.title)+'" src="'+esc(data.signedUrl)+'#page='+Math.max(1,Number(d.lastPage)||1)+'&toolbar=1&navpanes=1" style="width:100%;height:min(78vh,1000px);border:0;border-radius:10px;background:#eee"></iframe><p class="muted" style="padding:8px 12px;font-size:12px">Use as ferramentas do leitor do navegador para zoom, busca e impressão. Para retomar depois, atualize a página salva abaixo.</p><label>Última página lida<input id="pdfLibLastPage" type="number" min="1" value="'+Math.max(1,Number(d.lastPage)||1)+'" class="field" style="max-width:140px" onchange="pdfLibrarySaveProgress('+esc(JSON.stringify(String(d.id)))+')"></label></div>';
  }else{
   const response=await fetch(data.signedUrl);if(!response.ok)throw new Error('Não foi possível abrir o documento Word');const blob=await response.arrayBuffer();
   if(!window.mammoth){await new Promise((resolve,reject)=>{const sc=document.createElement('script');sc.src='https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js';sc.onload=resolve;sc.onerror=reject;document.head.appendChild(sc)})}
   const converted=await mammoth.convertToHtml({arrayBuffer:blob});pdfLibraryDocxHtml=converted.value;
   host.innerHTML='<div class="panel" id="pdfLibDocxPaper" style="max-width:900px;margin:0 auto;background:#fff;color:#222;padding:clamp(18px,5vw,55px);line-height:1.7">'+pdfLibraryDocxHtml+'</div><div class="panel"><p class="muted">Documento Word exibido em modo de leitura. Para criar uma cópia PDF, use “Imprimir / Salvar em PDF”.</p><button class="btn" onclick="pdfLibraryPrintDocx()">Imprimir / Salvar em PDF</button></div>';
  }
 }catch(e){console.error(e);host.innerHTML='<div class="panel"><h3>Não foi possível abrir este arquivo</h3><p>'+esc(e.message||'Verifique se o armazenamento está configurado e se você está conectado à conta.')+'</p><button class="btn ghost" onclick="pdfLibraryBack()">Voltar à biblioteca</button></div>'}
}
function pdfLibraryReaderView(id){const d=db.pdfLibrary.find(x=>String(x.id)===String(id));if(!d)return '';return '<div class="panel" style="margin-top:14px"><div class="row"><button class="btn ghost" onclick="pdfLibraryBack()">← Biblioteca</button><h2 style="margin:0;flex:1">'+esc(d.title)+'</h2><button class="btn ghost" onclick="pdfLibraryOpen('+esc(JSON.stringify(String(d.id)))+')">Reabrir</button></div><div id="pdfLibraryReaderContent" style="margin-top:12px"><p class="muted">Carregando leitor…</p></div></div>'}
function pdfLibraryBack(){pdfLibraryReaderId=null;pdfLibraryDocxHtml='';if(pdfLibraryObjectUrl){URL.revokeObjectURL(pdfLibraryObjectUrl);pdfLibraryObjectUrl=null}render()}
function pdfLibrarySaveProgress(id){const d=db.pdfLibrary.find(x=>String(x.id)===String(id));const p=Math.max(1,Number(document.getElementById('pdfLibLastPage')?.value)||1);if(d){d.lastPage=p;d.updatedAt=Date.now();save();toast('Progresso de leitura salvo')}}
function pdfLibraryPrintDocx(){const paper=document.getElementById('pdfLibDocxPaper');if(!paper)return;const w=window.open('','_blank');if(!w)return toast('Permita pop-ups para imprimir o documento');w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Documento Word</title><style>body{font:12pt/1.6 Arial,sans-serif;max-width:850px;margin:30px auto;color:#222}img{max-width:100%}@media print{body{margin:15mm}}</style></head><body>'+paper.innerHTML+'</body></html>');w.document.close();w.focus();setTimeout(()=>w.print(),400)}
function pdfLibraryEditMeta(id){const d=db.pdfLibrary.find(x=>String(x.id)===String(id));if(!d)return;const title=prompt('Título do material:',d.title||'');if(title===null)return;const notes=prompt('Observações:',d.notes||'');if(notes===null)return;d.title=title.trim()||d.fileName;d.notes=notes.trim();d.updatedAt=Date.now();save();render()}
async function pdfLibraryDelete(id){const d=db.pdfLibrary.find(x=>String(x.id)===String(id));if(!d||!confirm('Excluir "'+d.title+'" da biblioteca e da nuvem?'))return;try{const {error}=await cloud.storage.from(FLASHMED_PDF_BUCKET).remove([d.storagePath]);if(error)throw error;flashmedRecordDeletedItem('pdfLibrary',id);db.pdfLibrary=db.pdfLibrary.filter(x=>String(x.id)!==String(id));if(pdfLibraryReaderId===String(id))pdfLibraryReaderId=null;save();render();toast('Material excluído')}catch(e){toast('Não foi possível excluir o arquivo: '+(e.message||''))}}

function render(){
 flashmedApplyPermanentTitleDeletions(db);applyPersonalization();title.textContent=route==='Matérias'?'Flashcards':route;title.setAttribute('data-route',route);date.textContent=now().toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'});view.innerHTML=(route==='Dashboard'?'':flashmedPageBanner(route))+(route==='Dashboard'?dashboardEditorial():route==='Flashcards e Revisão'?flashcardsRevisionHub():route==='Todos os flashcards'?allFlashcardsView():route==='Planejamento e Agenda'?studyAgendaHub():route==='Matérias'?subjects():route==='Adicionar flashcard'?addCardView():route==='Revisão'?review('due'):route==='Planejador de Estudos'?studyPlannerView():route==='Agenda Geral'?agendaGeneralView():route==='Tutor de Estudos com IA'?studyTutorPlaceholder():route==='Aleatório'?review('random'):route==='Banco de Questões'?bankView():route==='Questões erradas'?questions():route==='Importar do ChatGPT'?importChat():route==='Flashcards IA'?importChat():route==='Caderno de Conhecimentos'?knowledgeNotesView():route==='Caderno de Estudos'?studyNotebookView():route==='Biblioteca de Leituras'?pdfLibraryView():route==='Oclusão de imagem'?imageOcclusionView():route==='Métricas'?metrics():route==='Meu FlashMed'?myFlashMed():route==='Decorebas'?decorebasView():route==='Jogos'?gamesView():route==='Casos Clínicos'?clinicalCasesView():route==='Receituário'?receituarioView():route==='Cronômetro'?timerView():route==='Lembretes'?reminders():cloudView());if(route==='Planejamento e Agenda'||route==='Planejador de Estudos'){fmQuickRemindersRender();fmQuickRemindersMakeMovable()}if(route==='Caderno de Estudos'&&studyNotebookCurrentId!==null)studyNotebookCreateCanvas();if(route==='Dashboard')flashmedLoadAdminMemberCount()}
setInterval(()=>{clock.textContent=now().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});if(route==='Cronômetro'&&timer.on){let e=document.querySelector('#timerText');if(e)e.textContent=fmt(timer.elapsed+Date.now()-timer.start)}db.reminders.forEach(r=>{if(!r.done&&new Date(r.when)<=now()){r.done=true;save();alert('⏰ '+r.text)}})},1000);renderNav();render();
function flashmedEmptyAccountData(){
 return {owner:'FlashMed',subjects:[],subjectIcons:{},cards:[],questions:[],sessions:[],reminders:[],agendaEvents:[],settings:{goal:60},updatedAt:Date.now(),knowledgeNotes:[],knowledgeBooks:[],bankQuestions:[],bankAttempts:[],bankAnnotations:{},bankSavedInk:{},bankReviewState:{},bankReviewSchedule:{},decorebas:[],imageAssets:{}};
}
function flashmedResetLocalForAccount(userId){
 db=flashmedEmptyAccountData();
 for(const key of [KEY,'flashmed_safety_journal_v1']){try{localStorage.removeItem(key)}catch(e){}}
 for(const key of Object.keys(localStorage)){if(key.startsWith('flashmed_recovery_')){try{localStorage.removeItem(key)}catch(e){}}}
 localStorage.setItem('flashmed_active_user_id',userId);
 localStorage.setItem(KEY,JSON.stringify(flashmedLocalPayload(db)));
}
function flashmedRepairCardSubjects(){
 const cards=Array.isArray(db.cards)?db.cards:[];
 db.subjects=Array.isArray(db.subjects)?db.subjects:[];
 db.subjectIcons=db.subjectIcons||{};
 // Add subject labels only; never create, clone, or delete flashcards here.
 const ensure=(name,icon)=>{if(!db.subjects.includes(name))db.subjects.push(name);if(!db.subjectIcons[name])db.subjectIcons[name]=icon};
 ensure('Obstetrícia','🤰');ensure('Ginecologia','🌸');
 let moved=0;
 const obst=/pré.?eclâmpsia|eclâmpsia|hellp|gestaç|gestante|obst[eé]tr|pré.?natal|trabalho de parto|placenta|puerp[eé]rio|hemorragia pós.?parto|sangramento da primeira metade|sangramento da segunda metade|isoimunizaç|incompatibilidade rh|idade gestacional|gravidez ect[oó]pica|mola hidatiforme|hipertens[aã]o na gestaç|protein[uú]ria|amniorrexe|rpm[oó]|ruptura prematura de membranas|partograma|cardiotocografia|dist[oó]cia|apresentaç[aã]o fetal|sofrimento fetal|restriç[aã]o de crescimento fetal|crescimento intrauterino|prematuridade|pós.?datismo|indução do parto|pré.?termo|eclâmpsia/i;
 const gyn=/ginecolog|sangramento uterino anormal|mioma|leiomioma|endometriose|adenomiose|ov[aá]rio polic[ií]stico|s[oí]ndrome dos ov[aá]rios polic[ií]sticos|massa anexial|c[aâ]ncer do colo|c[aâ]ncer de colo uterino|c[aâ]ncer de ov[aá]rio|c[aâ]ncer de endom[eé]trio|neoplasia endometrial|climat[eé]rio|menopausa|terapia de reposiç[aã]o hormonal|contraceptiv|anticoncepc|dispositivo intrauterino|\bdiu\b|papanicolau|colpocitologia|vulvovagin|corrimento vaginal|candid[ií]ase vaginal|vaginose bacteriana|cervicite|cisto de bartholin|mastalgia|mastopatia|mam[aá]ria|histerectomia|prolapso genital|incontin[eê]ncia urin[aá]ria|infertilidade|esterilidade|amenorreia|dismenorreia|dispareunia|vaginismo|vulvod[ií]nia|sangramento p[oó]s.?coital|sangramento p[oó]s.?menopausa|menorragia|metrorragia|oligomenorreia|polimenorreia|puberdade precoce|puberdade tardia|insufici[eê]ncia ovariana|reserva ovariana|s[ií]ndrome pr[eé].?menstrual|tens[aã]o pr[eé].?menstrual|doen[cç]a inflamat[oó]ria p[eé]lvica|dip\b|abscesso tubo.?ovariano|tor[cç][aã]o anexial|tor[cç][aã]o ovariana|cisto ovariano|cisto de ov[aá]rio|leiomiomatose|hiperplasia endometrial|neoplasia intraepitelial cervical|nic\b|les[aã]o intraepitelial|hpv|histeroscopia|colposcopia|vulva|disfun[cç][aã]o sexual feminina|incontin[eê]ncia de esfor[cç]o/i;
 const ped=/pediatr|neonat|rec[eé]m.?nascido|lactente|crian[cç]a|adolescente|bronquiolite|reanim[aã]ção neonatal|apgar|aleitamento|vacina[cç][aã]o infantil|puericultura|fontanela|desidrata[cç][aã]o infantil|crise febril|convuls[aã]o febril|s[ií]ndrome de west|dravet|impetigo|icter[ií]cia neonatal/i;
 for(const c of cards){
  if(!c||!/pediatria/i.test(String(c.subject||'')))continue;
  const t=[c.front,c.back,c.tags,c.topic,c.title].filter(Boolean).join(' ').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&');
  let target='';
  if(obst.test(t))target='Obstetrícia';
  else if(gyn.test(t))target='Ginecologia';
  else if(ped.test(t))target='Pediatria';
  if(target&&target!=='Pediatria'){c.subject=target;moved++}
 }
 if(moved){db.updatedAt=Date.now();save()}
 return moved;
}

// Lightweight performance diagnostics: timings and aggregate sizes only; never logs personal content.
const FM_DIAGNOSTICS_KEY='flashmed_perf_diagnostics_v1';
function flashmedPerfLog(event,detail={}){
 try{const row={at:new Date().toISOString(),event,...detail};console.info('[FlashMed diagnóstico]',row)}catch(_){}
}
function flashmedPerfSizeSummary(source=db){
 const byteSize=value=>{try{return new Blob([JSON.stringify(value)]).size}catch(_){return 0}};
 const arr=(key)=>Array.isArray(source[key])?source[key]:[];
 const categories={
  flashcards:{count:arr('cards').length,bytes:byteSize(arr('cards'))},
  questionBank:{count:arr('bankQuestions').length,bytes:byteSize(arr('bankQuestions'))},
  questionAttempts:{count:arr('bankAttempts').length,bytes:byteSize(arr('bankAttempts'))},
  agenda:{count:arr('agendaEvents').length,bytes:byteSize(arr('agendaEvents'))},
  weeklyTasks:{count:Array.isArray(source.studyPlan?.weeklyTasks)?source.studyPlan.weeklyTasks.length:0,bytes:byteSize(source.studyPlan?.weeklyTasks||[])},
  weeklySchedule:{count:Array.isArray(source.studyPlan?.weekSchedule)?source.studyPlan.weekSchedule.length:0,bytes:byteSize(source.studyPlan?.weekSchedule||[])},
  notes:{count:arr('knowledgeNotes').length,bytes:byteSize(arr('knowledgeNotes'))},
  notebooks:{count:arr('studyNotebooks').length,bytes:byteSize(arr('studyNotebooks'))},
  books:{count:arr('knowledgeBooks').length,bytes:byteSize(arr('knowledgeBooks'))},
  pdfLibraryMetadata:{count:arr('pdfLibrary').length,bytes:byteSize(arr('pdfLibrary'))},
  reminders:{count:arr('reminders').length,bytes:byteSize(arr('reminders'))},
  decorebas:{count:arr('decorebas').length,bytes:byteSize(arr('decorebas'))},
  fullPayloadWithoutImageAssets:{count:1,bytes:byteSize(flashmedLocalPayload(source))}
 };
 flashmedPerfLog('tamanho agregado dos dados',categories);
 try{
  const journal=localStorage.getItem('flashmed_safety_journal_v1');
  flashmedPerfLog('armazenamento local agregado',{journalBytes:journal?new Blob([journal]).size:0});
 }catch(_){}
 return categories;
}

async function bootAuth(){
 const __fmBootT0=performance.now();let __fmBootMark=__fmBootT0;
 const __fmBootStep=(name)=>{const t=performance.now();flashmedPerfLog('inicialização',{step:name,stepMs:Math.round(t-__fmBootMark),totalMs:Math.round(t-__fmBootT0)});__fmBootMark=t};
 cloud=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
 let session=null;
 try{const z=await cloud.auth.getSession();session=z.data?.session||null}catch(e){console.error('FlashMed session check',e)}
 __fmBootStep('verificação de sessão');
 if(session&&session.user){
  currentUser=session.user;
  authGate.classList.add('hidden');appRoot.classList.remove('authHidden');cloudDot.classList.add('ok');
  try{
   flashmedPruneRecoverySnapshots(false);
   await occlusionLoadDedicatedCards(db);await flashmedEmergencyRestore(db);await occlusionHydrateAssets(db);
   __fmBootStep('recuperação local e mídias');
   await syncDown(true);
   __fmBootStep('sincronização e preparação dos dados');
   await occlusionHydrateAssets(db);flashmedRepairCardSubjects();refreshBankErrorFlashcards();renderNav();render();
   __fmBootStep('primeira renderização após sincronização');
   flashmedPerfSizeSummary(db);
   await flashmedHandleSharedImport();
   __fmBootStep('fluxo pós-carregamento');
  }catch(e){
   console.error('FlashMed pós-login: falha ao carregar dados',e);
   authGate.classList.add('hidden');appRoot.classList.remove('authHidden');
   const view=document.getElementById('view');
   if(view&&!view.innerHTML.trim())view.innerHTML='<section class="panel"><h2>Você entrou no FlashMed</h2><p>O acesso foi confirmado, mas uma parte dos dados não carregou. Atualize a página para tentar novamente. Seus dados na nuvem não foram apagados.</p></section>';
   const status=document.getElementById('saveState');if(status)status.textContent='falha ao carregar alguns dados';
  }
 }else{
  try{flashmedPruneRecoverySnapshots(false);await occlusionLoadDedicatedCards(db);await flashmedEmergencyRestore(db);await occlusionHydrateAssets(db)}catch(e){console.warn('FlashMed recuperação local',e)}
  authGate.classList.remove('hidden');appRoot.classList.add('authHidden');
 }
}
loginBtn.onclick=async function(){
 authError.textContent='';
 const email=loginEmail.value.trim(),password=loginPassword.value;
 if(!email){authError.textContent='Informe seu e-mail.';loginEmail.focus();return}
 if(!password){authError.textContent='Informe sua senha.';loginPassword.focus();return}
 loginBtn.disabled=true;loginBtn.textContent='Entrando…';signupBtn.disabled=true;
 try{
  if(!cloud)throw new Error('O serviço de autenticação não foi inicializado. Atualize a página e tente novamente.');
  const z=await cloud.auth.signInWithPassword({email,password});
  if(z.error){
   console.error('FlashMed login',z.error);
   authError.textContent=/invalid login credentials/i.test(z.error.message||'')?'E-mail ou senha incorretos.':(z.error.message||'Não foi possível entrar. Tente novamente.');
   return;
  }
  if(!z.data?.user)throw new Error('O login não retornou uma sessão. Tente novamente.');
  currentUser=z.data.user;authGate.classList.add('hidden');appRoot.classList.remove('authHidden');cloudDot.classList.add('ok');
  try{
   await syncDown(true);await occlusionHydrateAssets(db);flashmedRepairCardSubjects();refreshBankErrorFlashcards();renderNav();render();await flashmedHandleSharedImport();
  }catch(postLoginError){
   console.error('FlashMed: login confirmado, mas houve falha ao carregar dados',postLoginError);
   authGate.classList.add('hidden');appRoot.classList.remove('authHidden');
   const view=document.getElementById('view');
   if(view&&!view.innerHTML.trim())view.innerHTML='<section class="panel"><h2>Login realizado</h2><p>Seu acesso foi confirmado. Uma parte dos dados não carregou; atualize a página para tentar novamente. Seus dados na nuvem não foram apagados.</p></section>';
   authError.textContent='';
  }
 }catch(e){
  console.error('FlashMed login',e);
  authError.textContent='Não foi possível entrar: '+(e?.message||'verifique a conexão e tente novamente.');
 }finally{
  loginBtn.disabled=false;loginBtn.textContent='Entrar';signupBtn.disabled=false;
 }
};
signupBtn.onclick=async function(){
 authError.textContent='';
 const email=loginEmail.value.trim(),password=loginPassword.value;
 if(!email){authError.textContent='Informe seu e-mail.';loginEmail.focus();return}
 if(password.length<6){authError.textContent='A senha precisa ter pelo menos 6 caracteres.';loginPassword.focus();return}
 signupBtn.disabled=true;signupBtn.textContent='Criando conta…';loginBtn.disabled=true;
 try{
  const z=await cloud.auth.signUp({email,password,options:{emailRedirectTo:location.href.split('#')[0]}});
  if(z.error){authError.textContent=z.error.message||'Não foi possível criar a conta.';return}
  if(!z.data.session||!z.data.user){
   authError.textContent='Cadastro iniciado! Confira seu e-mail para confirmar a conta. Depois, volte aqui e entre com seu e-mail e senha.';
   return;
  }
  currentUser=z.data.user;
  // A new account starts empty: never seed it with the previous browser user's personal data.
  flashmedResetLocalForAccount(currentUser.id);
  authGate.classList.add('hidden');appRoot.classList.remove('authHidden');cloudDot.classList.add('ok');
  await syncDown(true);
  if(!cloudDot.classList.contains('ok')){
   await cloud.auth.signOut();currentUser=null;authGate.classList.remove('hidden');appRoot.classList.add('authHidden');
   authError.textContent='A conta foi criada, mas o perfil ainda não foi preparado. Aplique a configuração de cadastro do Supabase antes de entrar novamente.';
   return;
  }
  await occlusionHydrateAssets(db);refreshBankErrorFlashcards();renderNav();render();await flashmedHandleSharedImport();
 }catch(e){console.error('FlashMed signup',e);authError.textContent='Não foi possível concluir o cadastro. Tente novamente.'}
 finally{signupBtn.disabled=false;signupBtn.textContent='Criar minha conta';loginBtn.disabled=false}
};
window.addEventListener('error',function(e){
 try{
  const box=document.getElementById('authError');
  if(box){box.textContent='Erro ao carregar o FlashMed: '+(e.message||'falha no JavaScript')+'. Atualize a página; se persistir, envie esta mensagem.';}
  const gate=document.getElementById('authGate');
  if(gate)gate.classList.remove('hidden');
 }catch(_){}
});
window.addEventListener('unhandledrejection',function(e){
 try{
  const box=document.getElementById('authError');
  if(box)box.textContent='Falha ao iniciar o FlashMed: '+(e.reason?.message||String(e.reason||'erro inesperado'));
  const gate=document.getElementById('authGate');
  if(gate)gate.classList.remove('hidden');
 }catch(_){}
});
bootAuth().catch(function(e){
 console.error('FlashMed bootAuth',e);
 const box=document.getElementById('authError');
 if(box)box.textContent='Não foi possível inicializar o acesso: '+(e?.message||'erro inesperado');
 const gate=document.getElementById('authGate');
 if(gate)gate.classList.remove('hidden');
});
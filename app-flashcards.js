/* FlashMed — inventário, métricas e central de revisão de flashcards. */
function flashcardInventoryStats(){
 const cards=Array.isArray(db.cards)?db.cards:[];
 const reviewed=c=>Number(c.ok||0)+Number(c.bad||0)>0||(Array.isArray(c.history)&&c.history.length>0);
 const total=cards.length,pending=cards.filter(due).length,studied=cards.filter(reviewed).length,unseen=total-studied,images=cards.filter(c=>!!(c.media||c.image||c.occlusion)).length;
 const subjectRows=(db.subjects||[]).map(subject=>({subject,count:cards.filter(c=>c.subject===subject).length})).filter(x=>x.count);
 const unclassified=cards.filter(c=>!c.subject||(db.subjects||[]).indexOf(c.subject)<0).length;
 return {total,pending,studied,unseen,images,subjectRows,unclassified};
}
function flashcardsInventoryHtml(){
 const st=flashcardInventoryStats();
 return '<section class="fmFlashInventory"><div class="fmFlashInventoryHead"><div><span class="fmEditorialKicker">SEU ACERVO</span><h3>Visão geral dos flashcards</h3><p>Contagem dos cartões cadastrados nesta conta.</p></div><span class="fmFlashTotal"><b>'+st.total+'</b><small>no total</small></span></div><div class="fmFlashInventoryBar" role="img" aria-label="'+st.studied+' estudados de '+st.total+'"><i style="width:'+(st.total?Math.round(st.studied/st.total*100):0)+'%"></i></div><div class="fmFlashInventoryStats"><div><b>'+st.pending+'</b><span>Pendentes para revisão</span></div><div><b>'+st.unseen+'</b><span>Ainda não estudados</span></div><div><b>'+st.studied+'</b><span>Já estudados</span></div><div><b>'+st.images+'</b><span>Com imagem/oclusão</span></div></div><div class="fmFlashSubjectCounts"><b>Por matéria</b>'+st.subjectRows.map(x=>'<span><i>'+esc(x.subject)+'</i><strong>'+x.count+'</strong></span>').join('')+(st.unclassified?'<span class="fmFlashUnclassified"><i>Sem matéria reconhecida</i><strong>'+st.unclassified+'</strong></span>':'')+'</div><p class="fmFlashInventoryNote">“Pendentes” considera a data de revisão de cada cartão. A contagem reflete os dados atualmente carregados; cartões ausentes da conta não podem ser contados aqui.</p></section>';
}
function flashcardsRevisionHub(){return '<section class="fmHubIntro"><span class="fmEditorialKicker">ESTUDAR</span><h2>Flashcards e revisão</h2><p>Consulte seu acervo completo ou revise apenas os cartões pendentes.</p></section>'+flashcardsInventoryHtml()+'<section class="panel" style="margin-top:14px"><div class="row" style="gap:10px;flex-wrap:wrap"><button class="btn" onclick="go(\'Todos os flashcards\')">▤ Ver todos os flashcards</button><button class="btn ghost" onclick="go(\'Revisão\')">↻ Revisões pendentes</button><button class="btn ghost" onclick="go(\'Matérias\')">📚 Organizar por matéria</button></div></section><section class="fmHubSection"><h3>Revisões de hoje</h3>'+review('due')+'</section><section class="fmHubSection"><h3>Suas matérias e flashcards</h3>'+subjects()+'</section>'}
let allFlashcardsSearch='',allFlashcardsSubject='Todas';

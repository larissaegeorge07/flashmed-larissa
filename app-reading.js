/* FlashMed — leitura, audiobooks, Kindle, avaliações e anotações. */
function fmReadingData(kind){
 const settings=db.settings||(db.settings={}),key=kind==='audio'?'fmAudiobooks':'fmKindleBooks';
 if(!settings[key])settings[key]=kind==='audio'?{current:'',history:[{title:'Melhor do que nos filmes',date:'2026-10-12',rating:0,note:''}]}:{current:'',history:[]};
 const data=settings[key];if(!Array.isArray(data.history))data.history=[];if(!data.ratings)data.ratings={};if(!data.notes)data.notes={};return data;
}
function fmReadingStars(kind,title,rating){
 return '<span class="fmReadingStars" aria-label="Avaliação de 1 a 5 estrelas">'+[1,2,3,4,5].map(n=>'<button type="button" title="'+n+' estrela'+(n>1?'s':'')+'" aria-label="Avaliar com '+n+' estrela'+(n>1?'s':'')+'" class="'+(n<=rating?'selected':'')+'" data-kind="'+esc(kind)+'" data-title="'+esc(title)+'" data-rating="'+n+'" onclick="fmRateReadingFromButton(this)">'+(n<=rating?'★':'☆')+'</button>').join('')+'</span>';
}
function fmRateReadingFromButton(button){if(!button)return;const kind=button.dataset.kind,title=button.dataset.title,rating=Number(button.dataset.rating);if(!['audio','kindle'].includes(kind)||!title||!Number.isInteger(rating)||rating<1||rating>5)return;fmRateReading(kind,title,rating)}
function fmSaveReadingNoteFromField(field){if(!field)return;const kind=field.dataset.kind,title=field.dataset.title;if(!['audio','kindle'].includes(kind)||!title)return;fmSaveReadingNote(kind,title,field.value)}
function fmReadingPanelHtml(kind){
 const audio=kind==='audio',data=fmReadingData(kind),history=data.history;
 const current=String(data.current||''),rating=Number(data.ratings[current]||0),note=String(data.notes[current]||'');
 const rows=history.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||'')).map(x=>'<div class="fmAudioHistoryItem"><span class="fmAudioHistoryDot">'+(audio?'♫':'▤')+'</span><span><b>'+esc(x.title)+'</b><small>'+esc(x.date?agendaFormatDate(x.date,{day:'2-digit',month:'short',year:'numeric'}):'Concluído')+'</small>'+fmReadingStars(kind,x.title,Number(data.ratings[x.title]||x.rating||0))+'<textarea class="fmReadingHistoryNote" maxlength="300" rows="1" placeholder="Minha opinião (opcional)" data-kind="'+esc(kind)+'" data-title="'+esc(x.title)+'" onblur="fmSaveReadingNoteFromField(this)">'+esc(data.notes[x.title]||x.note||'')+'</textarea></span></div>').join('');
 return '<section class="panel fmAudiobookPanel fmReadingPanel"><div class="fmAudioHead"><span class="fmAudioIcon">'+(audio?'♫':'▤')+'</span><div><span class="fmEditorialKicker">'+(audio?'MEU MOMENTO DE ESCUTA':'MINHAS LEITURAS')+'</span><h3>'+(audio?'Audiobook da semana':'Livro do Kindle')+'</h3></div></div><form class="fmAudioForm" data-kind="'+esc(kind)+'" onsubmit="event.preventDefault();fmSaveReadingFromButton(this.dataset.kind);return false"><input id="fmReading_'+kind+'" class="field" maxlength="140" value="'+esc(current)+'" placeholder="'+(audio?'Qual audiobook você está ouvindo?':'Qual livro você está lendo?')+'"><button class="btn" type="button" onclick="fmSaveReadingFromButton(this.parentElement.dataset.kind)">Salvar</button></form>'+(current?'<div class="fmReadingSavedState"><span class="fmReadingSavedDot"></span><span><small>EM ANDAMENTO</small><b>'+esc(current)+'</b></span></div><div class="fmReadingReview"><span class="fmReadingReviewLabel">Minha avaliação</span>'+fmReadingStars(kind,current,rating)+'<textarea class="fmReadingNote" rows="2" maxlength="300" placeholder="O que achei? (opcional)" data-kind="'+esc(kind)+'" data-title="'+esc(current)+'" onblur="fmSaveReadingNoteFromField(this)">'+esc(note)+'</textarea></div>':'<p class="fmAudioHint">Adicione um título para avaliá-lo com estrelas e escrever uma nota breve.</p>')+'<details class="fmAudioHistory"><summary>Histórico ('+history.length+')</summary>'+(rows||'<p class="muted">Os títulos anteriores aparecerão aqui.</p>')+'</details></section>';
}
function fmAudiobookPanelHtml(){return fmReadingPanelHtml('audio')}
function fmKindlePanelHtml(){return fmReadingPanelHtml('kindle')}
function fmSaveReadingFromButton(kind){if(!['audio','kindle'].includes(kind))return;fmSaveReading(kind)}
function fmSaveReadingFromForm(form){if(!form)return false;fmSaveReadingFromButton(form.dataset.kind);return false}
function fmSaveReading(kind){
 if(!['audio','kindle'].includes(kind))return;
 const input=document.getElementById('fmReading_'+kind),title=String(input?.value||'').trim();
 if(!title){toast('Digite o título antes de salvar.');input?.focus();return}
 const data=fmReadingData(kind),previous=String(data.current||'').trim();
 if(previous&&previous.toLocaleLowerCase('pt-BR')!==title.toLocaleLowerCase('pt-BR')&&!data.history.some(x=>String(x.title||'').toLocaleLowerCase('pt-BR')===previous.toLocaleLowerCase('pt-BR')))data.history.push({title:previous,date:agendaDateKey(new Date()),rating:Number(data.ratings[previous]||0),note:String(data.notes[previous]||'')});
 data.current=title;
 const ok=save();
 if(cloud)syncUp();
 render();
 toast(ok?'Título salvo! Você pode avaliar no fim da semana.':'Título atualizado, mas o armazenamento local apresentou uma falha. Confira o espaço disponível.');
}
function fmSaveAudiobook(){fmSaveReading('audio')}
function fmRateReading(kind,title,rating){const data=fmReadingData(kind);data.ratings[title]=rating;save();render();if(cloud)syncUp()}
function fmSaveReadingNote(kind,title,note){const data=fmReadingData(kind),value=String(note||'').slice(0,300);if(data.notes[title]===value)return;data.notes[title]=value;save();if(cloud)syncUp()}

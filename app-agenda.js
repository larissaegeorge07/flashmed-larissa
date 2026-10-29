/* FlashMed — Agenda Geral: calendário, compromissos e criação rápida. */
let agendaState={mode:'month',month:(()=>{const d=new Date();return new Date(d.getFullYear(),d.getMonth(),1)})(),selected:agendaDateKey(new Date()),draft:null};
function agendaDateKey(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function agendaDateFromKey(k){if(!k||!/^\d{4}-\d{2}-\d{2}$/.test(k))return null;const [y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d,12,0,0,0)}
function agendaFormatDate(k,opts={weekday:'long',day:'2-digit',month:'long'}){const d=agendaDateFromKey(k);return d?d.toLocaleDateString('pt-BR',opts):''}
function agendaNormalizeActivityTitle(value){return String(value||'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]+/g,' ').trim()}
function agendaIsUnwantedCalendarActivity(item){const title=agendaNormalizeActivityTitle(item?.title);return /\\batividade fisica\\b/.test(title)||/\\borganizar o quarto\\b/.test(title)||/\\bfazer exercicio(s)?\\b/.test(title)||/\\bexercicio fisico\\b/.test(title)}
function agendaCleanupUnwantedActivities(){
 const p=db.studyPlan||(db.studyPlan={}),events=Array.isArray(db.agendaEvents)?db.agendaEvents:[],tasks=Array.isArray(p.weeklyTasks)?p.weeklyTasks:[],slots=Array.isArray(p.weekSchedule)?p.weekSchedule:[],pending=Array.isArray(p.weekPendingTasks)?p.weekPendingTasks:[];
 const removedEvents=events.filter(agendaIsUnwantedCalendarActivity),removedTasks=tasks.filter(agendaIsUnwantedCalendarActivity),removedSlots=slots.filter(agendaIsUnwantedCalendarActivity),removedPending=pending.filter(agendaIsUnwantedCalendarActivity);
 if(!removedEvents.length&&!removedTasks.length&&!removedSlots.length&&!removedPending.length)return false;
 const ids=new Set(removedEvents.map(e=>String(e.id)).filter(Boolean)),taskIds=new Set([...removedTasks.map(t=>String(t.id)),...removedSlots.map(t=>String(t.taskId||t.id)),...removedEvents.map(e=>String(e.studyTaskId||''))].filter(Boolean));
 db.deletedAgendaEventIds=Array.isArray(db.deletedAgendaEventIds)?db.deletedAgendaEventIds.map(String):[];
 ids.forEach(id=>{if(!db.deletedAgendaEventIds.includes(id))db.deletedAgendaEventIds.push(id)});
 db.deletedWeeklyTaskIds=Array.isArray(db.deletedWeeklyTaskIds)?db.deletedWeeklyTaskIds.map(String):[];
 taskIds.forEach(id=>{if(!db.deletedWeeklyTaskIds.includes(id))db.deletedWeeklyTaskIds.push(id)});
 db.deletedWeeklyTaskKeys=Array.isArray(db.deletedWeeklyTaskKeys)?db.deletedWeeklyTaskKeys.map(String):[];
 const signatures=[...removedEvents,...removedTasks,...removedSlots,...removedPending].map(x=>agendaNormalizeActivityTitle(x.title)+'|'+String(x.date||'')).filter(x=>!x.startsWith('|'));
 signatures.forEach(key=>{if(!db.deletedWeeklyTaskKeys.includes(key))db.deletedWeeklyTaskKeys.push(key)});
 db.agendaEvents=events.filter(e=>!agendaIsUnwantedCalendarActivity(e));
 p.weeklyTasks=tasks.filter(t=>!agendaIsUnwantedCalendarActivity(t));
 p.weekSchedule=slots.filter(t=>!agendaIsUnwantedCalendarActivity(t));
 p.weekPendingTasks=pending.filter(t=>!agendaIsUnwantedCalendarActivity(t));
 p.updatedAt=Date.now();save();if(cloud&&currentUser)syncUp();return true
}
function agendaEvents(){
 agendaCleanupUnwantedActivities();
 const deleted=new Set(Array.isArray(db.deletedAgendaEventIds)?db.deletedAgendaEventIds.map(String):[]);
 const crem={id:"fm-cremeb-crm-docs-20261103",title:"Ida ao CREMEB — entrega de documentação para o CRM",date:"2026-11-03",time:"",category:"Compromisso importante",priority:"alta",duration:0,important:true};
 const current=Array.isArray(db.agendaEvents)?db.agendaEvents:[];
 const all=current.some(e=>String(e.id)===crem.id)?current:current.concat([crem]);
 return all.filter(e=>!deleted.has(String(e.id))&&!agendaIsUnwantedCalendarActivity(e))
}
function agendaParseQuickText(raw){
 const text=String(raw||'').trim();if(!text)return {title:'',date:'',time:''};
 let work=text,date='',time='';
 const nowDate=new Date();nowDate.setHours(12,0,0,0);
 const explicit=work.match(/\b(?:dia\s*)?(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{2,4}))?\b/);
 if(explicit){let y=explicit[3]?Number(explicit[3]):nowDate.getFullYear();if(y<100)y+=2000;const d=Number(explicit[1]),m=Number(explicit[2]);const candidate=new Date(y,m-1,d,12);if(candidate.getFullYear()===y&&candidate.getMonth()===m-1&&candidate.getDate()===d){date=agendaDateKey(candidate);work=work.replace(explicit[0],' ')}}
 if(!date){
  const rel=work.match(/\b(depois de amanh[ãa]|amanh[ãa]|hoje)(?=\s|$|[,.;])/i);
  if(rel){const d=new Date(nowDate);const word=rel[1].toLocaleLowerCase('pt-BR');d.setDate(d.getDate()+(word.startsWith('depois')?2:word.startsWith('amanh')?1:0));date=agendaDateKey(d);work=work.replace(rel[0],' ')}
 }
 if(!date){
  const normalized=work.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR');
  const weekday=normalized.match(/\b(domingo|segunda(?:-feira)?|terca(?:-feira)?|quarta(?:-feira)?|quinta(?:-feira)?|sexta(?:-feira)?|sabado)\b/);
  const originalWeekday=work.match(/\b(domingo|segunda(?:-feira)?|terça(?:-feira)?|terca(?:-feira)?|quarta(?:-feira)?|quinta(?:-feira)?|sexta(?:-feira)?|sábado|sabado)\b/i);
  if(weekday){const names=['domingo','segunda','terca','quarta','quinta','sexta','sabado'];let word=weekday[1].split('-')[0],target=names.indexOf(word),delta=(target-nowDate.getDay()+7)%7;const d=new Date(nowDate);d.setDate(d.getDate()+delta);date=agendaDateKey(d);if(originalWeekday)work=work.replace(originalWeekday[0],' ')}
 }
 const tm=work.match(/\b(?:às?\s*)?([01]?\d|2[0-3])(?:h|:([0-5]\d))\b/i);
 if(tm){time=String(Number(tm[1])).padStart(2,'0')+':'+(tm[2]||'00');work=work.replace(tm[0],' ')}
 work=work.replace(/\b(as|dia|na|no|em)\b|às/gi,' ').replace(/[,\-–—]+/g,' ').replace(/\s+/g,' ').trim();
 return {title:work,date,time};
}

function agendaDraftHtml(d){
 return '<div class="panel" style="margin-top:12px;background:var(--rose2)"><h3 style="margin-top:0">Confira antes de adicionar</h3><p class="muted">Revise os dados reconhecidos. A data precisa ser confirmada; o horário pode ficar em branco para um compromisso sem hora definida.</p><div class="agendaDraftGrid"><label class="agendaTitleField">O que você vai fazer?<input id="agendaDraftTitle" class="field" maxlength="160" value="'+esc(d.title||'')+'" placeholder="Ex.: Ir à feira e comprar frutas"></label><label>Data<input id="agendaDraftDate" class="field" type="date" value="'+esc(d.date||'')+'"></label><label>Horário<input id="agendaDraftTime" class="field" type="time" value="'+esc(d.time||'')+'"></label><label>Duração (min, opcional)<input id="agendaDraftDuration" class="field" type="number" min="15" max="720" step="15" placeholder="Ex.: 60" value="'+esc(d.duration||'')+'"></label><label>Prioridade<select id="agendaDraftPriority" class="field"><option value="alta" '+(d.priority==='alta'?'selected':'')+'>🔴 Alta prioridade</option><option value="normal" '+((!d.priority||d.priority==='normal')?'selected':'')+'>🟣 Normal</option><option value="baixa" '+(d.priority==='baixa'?'selected':'')+'>🟢 Pode ser feito depois</option></select></label><label>Tipo<select id="agendaDraftCategory" class="field"><option '+(d.category==='Pessoal'?'selected':'')+'>Pessoal</option><option '+(d.category==='Estudos'?'selected':'')+'>Estudos</option><option '+(d.category==='Estágio/rotação'?'selected':'')+'>Estágio/rotação</option><option '+(d.category==='Saúde'?'selected':'')+'>Saúde</option><option '+(d.category==='Data importante'?'selected':'')+'>Data importante</option><option '+(d.category==='Viagem'?'selected':'')+'>Viagem</option></select></label></div><div class="row" style="margin-top:12px"><button class="btn" onclick="agendaSaveDraft()">Confirmar e adicionar</button><button class="btn ghost" onclick="agendaCancelDraft()">Cancelar</button></div><p id="agendaDraftMessage" class="muted"></p></div>';
}
function agendaSaveDraft(){
 const title=document.getElementById('agendaDraftTitle')?.value.trim()||'',date=document.getElementById('agendaDraftDate')?.value||'',time=document.getElementById('agendaDraftTime')?.value||'',durationRaw=document.getElementById('agendaDraftDuration')?.value||'',duration=durationRaw?Number(durationRaw):null,priority=document.getElementById('agendaDraftPriority')?.value||'normal',category=document.getElementById('agendaDraftCategory')?.value||'Pessoal';
 const msg=document.getElementById('agendaDraftMessage');
 if(!title){if(msg)msg.textContent='Escreva uma descrição para o compromisso.';return}
 if(!agendaDateFromKey(date)){if(msg)msg.textContent='Confirme a data antes de salvar.';return}
 if(time&&!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)){if(msg)msg.textContent='Confira o horário informado.';return}if(durationRaw&&(!Number.isFinite(duration)||duration<15||duration>720)){if(msg)msg.textContent='A duração deve ser de 15 a 720 minutos.';return}
 if(!Array.isArray(db.agendaEvents))db.agendaEvents=[];
 const id='ag_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8);
 db.agendaEvents.push({id,title,date,time,duration:duration||null,category,priority,createdAt:new Date().toISOString(),updatedAt:Date.now()});
 agendaState.selected=date;const d=agendaDateFromKey(date);agendaState.month=new Date(d.getFullYear(),d.getMonth(),1);agendaState.draft=null;
 const ok=save();toast(ok?'Compromisso adicionado à agenda ♡':'Confira o salvamento da agenda');
 render();
}
function agendaCancelDraft(){agendaState.draft=null;const box=document.getElementById('agendaDraftBox');if(box)box.innerHTML=''}
function agendaDeleteEvent(id){const key=String(id),e=agendaEvents().find(x=>String(x.id)===key);if(!e)return;if(!confirm('Excluir este compromisso da agenda?'))return;db.agendaEvents=(db.agendaEvents||[]).filter(x=>String(x.id)!==key);db.deletedAgendaEventIds=Array.isArray(db.deletedAgendaEventIds)?db.deletedAgendaEventIds:[];if(!db.deletedAgendaEventIds.map(String).includes(key))db.deletedAgendaEventIds.push(key);if(e.studyTaskId){const taskId=String(e.studyTaskId),p=db.studyPlan||(db.studyPlan={});p.weeklyTasks=(p.weeklyTasks||[]).filter(t=>String(t.id)!==taskId);p.weekSchedule=(p.weekSchedule||[]).filter(t=>String(t.taskId||t.id)!==taskId);p.updatedAt=Date.now()}const ok=save();render();if(ok&&cloud)syncUp();}
function agendaShift(delta){if(agendaState.mode==='month'){agendaState.month=new Date(agendaState.month.getFullYear(),agendaState.month.getMonth()+delta,1)}else{const d=agendaDateFromKey(agendaState.selected)||new Date();d.setDate(d.getDate()+delta*7);agendaState.selected=agendaDateKey(d);agendaState.month=new Date(d.getFullYear(),d.getMonth(),1)}render()}
function agendaSetMode(mode){agendaState.mode=mode;render()}
function agendaSelectDate(key){agendaState.selected=key;const d=agendaDateFromKey(key);if(d)agendaState.month=new Date(d.getFullYear(),d.getMonth(),1);render()}
function agendaEventListHtml(events){
 if(!events.length)return '<p class="muted">Nenhum compromisso para esta data. Use a anotação rápida acima para adicionar um.</p>';
 return events.slice().sort((a,b)=>(a.time||'99:99').localeCompare(b.time||'99:99')).map(e=>'<div class="agendaEventRow priority-'+(e.priority==='alta'?'high':e.priority==='baixa'?'low':'normal')+'"><div class="agendaEventTime">'+esc(e.time||'Sem horário')+'</div><div class="agendaEventBody"><b>'+esc(e.title)+'</b><div class="agendaEventMeta">'+esc(e.category||'Pessoal')+' · '+esc(agendaFormatDate(e.date,{day:'2-digit',month:'short'}))+'</div></div><button class="agendaDelete" title="Excluir compromisso" aria-label="Excluir '+esc(e.title)+'" onclick="agendaDeleteEvent('+JSON.stringify(e.id).replace(/"/g,'&quot;')+')">×</button></div>').join('');
}
function agendaGeneralView(){
 const all=agendaEvents().filter(e=>e&&e.id&&e.date).sort((a,b)=>(a.date+(a.time||'')).localeCompare(b.date+(b.time||'')));
 const m=agendaState.month,monthLabel=m.toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
 const dow=['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
 let calendar='';
 if(agendaState.mode==='month'){
  const first=new Date(m.getFullYear(),m.getMonth(),1,12),start=new Date(first);start.setDate(first.getDate()-((first.getDay()+6)%7));
  const today=agendaDateKey(new Date());
  calendar='<div class="agendaCalendar">'+dow.map(x=>'<div class="agendaDow">'+x+'</div>').join('');
  for(let i=0;i<42;i++){const d=new Date(start);d.setDate(start.getDate()+i);const key=agendaDateKey(d),items=all.filter(e=>e.date===key);calendar+='<button class="agendaDay '+(d.getMonth()!==m.getMonth()?'outside ':'')+(key===today?'today ':'')+(key===agendaState.selected?'selected':'')+'" onclick="agendaSelectDate(\''+key+'\')" aria-label="'+esc(agendaFormatDate(key))+'"><span class="agendaDayNum">'+d.getDate()+'</span>'+items.slice(0,2).map(e=>'<span class="agendaEventDot priority-'+(e.priority==='alta'?'high':e.priority==='baixa'?'low':'normal')+'">'+esc((e.time?e.time+' ':'')+e.title)+'</span>').join('')+(items.length>2?'<span class="agendaEventDot">+'+(items.length-2)+' mais</span>':'')+'</button>'}
  calendar+='</div>';
 }else{
  const base=agendaDateFromKey(agendaState.selected)||new Date(),start=new Date(base);start.setDate(base.getDate()-((base.getDay()+6)%7));
  calendar='<div class="agendaCalendar">'+dow.map(x=>'<div class="agendaDow">'+x+'</div>').join('');
  for(let i=0;i<7;i++){const d=new Date(start);d.setDate(start.getDate()+i);const key=agendaDateKey(d),items=all.filter(e=>e.date===key);calendar+='<button class="agendaDay '+(key===agendaState.selected?'selected ':'')+(key===agendaDateKey(new Date())?'today':'')+'" onclick="agendaSelectDate(\''+key+'\')"><span class="agendaDayNum">'+d.toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'2-digit'})+'</span>'+items.slice(0,4).map(e=>'<span class="agendaEventDot priority-'+(e.priority==='alta'?'high':e.priority==='baixa'?'low':'normal')+'">'+esc((e.time?e.time+' ':'')+e.title)+'</span>').join('')+'</button>'}
  calendar+='</div>';
 }
 const selected=agendaState.selected,selectedEvents=all.filter(e=>e.date===selected);
 const upcoming=all.filter(e=>e.date>=agendaDateKey(new Date())).slice(0,5);
 return '<div class="panel" style="margin-top:14px"><div class="agendaToolbar"><div><h3 style="margin:0">Calendário</h3><p class="muted" style="margin:5px 0 0;text-transform:capitalize">'+esc(monthLabel)+'</p></div><div class="row" style="gap:5px"><button class="btn ghost" onclick="agendaShift(-1)" aria-label="Período anterior">‹</button><button class="btn ghost" onclick="agendaShift(1)" aria-label="Próximo período">›</button><div class="agendaToggle"><button class="'+(agendaState.mode==='week'?'on':'')+'" onclick="agendaSetMode(\'week\')">Semana</button><button class="'+(agendaState.mode==='month'?'on':'')+'" onclick="agendaSetMode(\'month\')">Mês</button></div></div></div>'+calendar+'<div style="margin-top:18px"><h3 style="text-transform:capitalize">'+esc(agendaFormatDate(selected))+'</h3>'+agendaEventListHtml(selectedEvents)+'</div></div><div class="panel" style="margin-top:14px"><h3>Próximos compromissos</h3>'+agendaEventListHtml(upcoming)+'</div>';
}

// FlashMed — widgets complementares do dashboard e central de agenda de estudos.
// Compartilha o escopo global clássico da aplicação.
function studyAgendaHub(){return '<section class="fmHubIntro"><span class="fmEditorialKicker">PLANEJAMENTO</span><h2>Seu plano e sua agenda</h2><p>Organize as tarefas de estudo e os compromissos pessoais em um só lugar.</p></section><section class="fmHubSection"><h3>Planejamento de estudos</h3>'+studyPlannerView()+'</section><section class="fmHubSection"><h3>Agenda geral</h3>'+agendaGeneralView()+'</section>'}

function fmDashboardWeekHtml(){
 const today=new Date(),start=new Date(today);start.setHours(12,0,0,0);start.setDate(today.getDate()-((today.getDay()+6)%7)+plannerDefaultWeekOffset(today)*7);
 const schedule=Array.isArray(db.studyPlan?.weekSchedule)?db.studyPlan.weekSchedule:[],events=plannerDeduplicateEvents(agendaEvents().filter(e=>e&&e.date&&!e.studyTaskId)),days=['SEG','TER','QUA','QUI','SEX','SÁB','DOM'];let cells='';
 for(let i=0;i<7;i++){
  const d=new Date(start);d.setDate(start.getDate()+i);const key=agendaDateKey(d),isToday=key===agendaDateKey(today);
  const tasks=schedule.filter(x=>x.date===key).sort((x,y)=>(x.startTime||'99:99').localeCompare(y.startTime||'99:99')),ev=events.filter(x=>x.date===key).sort((x,y)=>(x.time||'99:99').localeCompare(y.time||'99:99'));
  const total=tasks.length+ev.length;
  cells+='<div class="fmWeekDay'+(isToday?' isToday':'')+'"><div class="fmWeekDayHead"><span>'+days[i]+'</span><b>'+d.getDate()+'</b></div><div class="fmWeekDayItems">'+tasks.map(t=>'<span class="fmWeekPill study'+(t.done?' fmWeekPillDone':'')+'" style="border-left:3px solid '+(/^#[0-9a-f]{6}$/i.test(t.color||'')?t.color:'#a58abf')+'"><span class="fmWeekPillTitle">'+esc(t.startTime?t.startTime+' ':'')+esc(t.title)+'</span></span>').join('')+ev.map(e=>'<span class="fmWeekPill '+(/prova|avalia|semin.rio|exame/i.test(e.title||'')?'academic':'')+(e.done?' fmWeekPillDone':'')+'"><span class="fmWeekPillTitle">'+esc(e.time?e.time+' ':'')+esc(e.title)+'</span></span>').join('')+(!total?'<span class="fmWeekEmpty">Livre</span>':'')+'</div></div>';
 }
 return '<section class="panel fmWeekPanel"><div class="fmWeekTop"><div><span class="fmEditorialKicker">VISÃO DA SEMANA</span><h3>Calendário da semana</h3><p class="muted">Todas as atividades da semana, com horários quando informados.</p></div><button class="btn ghost" onclick="go(\'Planejador de Estudos\')">Editar semana ↗</button></div><div class="fmWeekGrid">'+cells+'</div></section>';
}
const fmGoSeminars=[
 {date:'2026-10-19',area:'Obstetrícia',title:'Hemorragia pós-parto',names:'Gabriella Almeida e Maria José'},
 {date:'2026-10-21',area:'Ginecologia',title:'Sangramento uterino anormal',names:'Nilo e Lindinês'},
 {date:'2026-10-26',area:'Obstetrícia',title:'Diabetes gestacional',names:'Brenno e Italo'},
 {date:'2026-10-28',area:'Ginecologia',title:'Métodos contraceptivos',names:'Matheus, Arthur e Vinicius'},
 {date:'2026-11-02',area:'Obstetrícia',title:'Síndromes hipertensivas na gestação',names:'Henrique, Luis Guilherme e Alice'},
 {date:'2026-11-04',area:'Ginecologia',title:'HPV e câncer do colo uterino',names:'Brenno, Evailson e Italo'},
 {date:'2026-11-09',area:'Obstetrícia',title:'Rotura prematura das membranas ovulares e trabalho de parto prematuro',names:'Luana, Eduarda e Cleiton'},
 {date:'2026-11-11',area:'Ginecologia',title:'Infecções sexualmente transmissíveis',names:'Henrique, Guilherme e Luana'},
 {date:'2026-11-16',area:'Obstetrícia',title:'Sangramento da primeira metade da gestação',names:'Gabriela Souza e Larissa',mine:true},
 {date:'2026-11-18',area:'Ginecologia',title:'Climatério e TRH',names:'Alice, Eduarda e Cleiton'},
 {date:'2026-11-23',area:'Obstetrícia',title:'Sangramento da segunda metade da gestação',names:'Matheus e Vinicius'},
 {date:'2026-11-25',area:'Ginecologia',title:'Endometriose',names:'Gabriela Souza e Larissa',mine:true},
 {date:'2026-11-30',area:'Obstetrícia',title:'TORCHS (sífilis, toxoplasmose e CMV)',names:'Arthur e Evailson'},
 {date:'2026-12-02',area:'Ginecologia',title:'Massas anexiais e câncer de ovário',names:'Gabriella Almeida e Maria'},
 {date:'2026-12-07',area:'Obstetrícia',title:'Isoimunização ABO/Rh',names:'Nilo e Lindi'},
 {date:'2026-12-09',area:'Ginecologia',title:'Alterações funcionais benignas das mamas',names:'Aula do Prof. Thiago'}
];
function fmToggleSeminarDone(date,checked){
 db.fmSeminarsDone=db.fmSeminarsDone||{};
 db.fmSeminarsDone[date]=!!checked;
 save();
 const node=document.getElementById('fmSeminarChecklist');
 if(node)node.innerHTML=fmDashboardSeminarsHtml();
}
function fmDashboardSeminarsHtml(){
 const done=db.fmSeminarsDone||{};
 const row=x=>'<label class="fmSeminarRow'+(done[x.date]?' isDone':'')+'"><input type="checkbox" '+(done[x.date]?'checked':'')+' onchange="fmToggleSeminarDone(\''+x.date+'\',this.checked)"><span class="fmSeminarDate">'+esc(agendaDateFromKey(x.date)?.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})||'')+'</span><span class="fmSeminarName"><b>'+esc(x.title)+'</b><small>'+esc(x.names)+(x.mine?' · SEU SEMINÁRIO':'')+'</small></span></label>';
 const obst=fmGoSeminars.filter(x=>x.area==='Obstetrícia');
 const gineco=fmGoSeminars.filter(x=>x.area==='Ginecologia');
 const completed=fmGoSeminars.filter(x=>done[x.date]).length;
 return '<section class="panel fmSeminarPanel"><div class="fmWeekTop"><div><span class="fmEditorialKicker">ACOMPANHAMENTO</span><h3>Checklist de seminários</h3><p class="muted">Marque cada apresentação quando ela acontecer.</p></div><span class="tag">'+completed+'/'+fmGoSeminars.length+' concluídos</span></div><div class="fmSeminarSections"><section class="fmSeminarGroup fmSeminarObst"><h4>🤰 Obstetrícia <span>'+obst.filter(x=>done[x.date]).length+'/'+obst.length+'</span></h4><div class="fmSeminarList">'+obst.map(row).join('')+'</div></section><section class="fmSeminarGroup fmSeminarGyn"><h4>🌸 Ginecologia <span>'+gineco.filter(x=>done[x.date]).length+'/'+gineco.length+'</span></h4><div class="fmSeminarList">'+gineco.map(row).join('')+'</div></section></div></section>';
}

function fmHideHighPriorityFromButton(button){if(!button)return;fmHideHighPriorityItem(button.dataset.source,button.dataset.itemId)}
function fmHideHighPriorityItem(source,id){
 const tasks=db.studyPlan?.weeklyTasks||[],events=db.agendaEvents||[];
 if(source==='task'){
  const t=tasks.find(x=>String(x.id)===String(id));if(!t)return;
  t.hideFromHighPriority=!t.hideFromHighPriority;
  events.filter(e=>String(e.studyTaskId)===String(id)).forEach(e=>e.hideFromHighPriority=!!t.hideFromHighPriority);
 }else{
  const e=events.find(x=>String(x.id)===String(id));if(!e)return;
  e.hideFromHighPriority=!e.hideFromHighPriority;
  if(e.studyTaskId){const t=tasks.find(x=>String(x.id)===String(e.studyTaskId));if(t)t.hideFromHighPriority=!!e.hideFromHighPriority;}
 }
 save();if(cloud)syncUp();render();
}
function fmDashboardUpcomingHtml(){
 const today=agendaDateKey(new Date());
 const planned=(db.studyPlan?.weeklyTasks||[]).filter(t=>t&&t.date>=today&&t.priority==='alta'&&!t.done&&!t.hideFromHighPriority).map(t=>({date:t.date,title:t.title,detail:(t.time||'')+' · tarefa',id:t.id,source:'task'}));
 const events=agendaEvents().filter(e=>e&&e.date>=today&&e.priority==='alta'&&!e.done&&!e.hideFromHighPriority).map(e=>({date:e.date,title:e.title,detail:(e.time||'')+(e.location?' · '+e.location:''),id:e.id,source:'agenda'}));
 const all=[...planned,...events].filter((e,i,arr)=>arr.findIndex(x=>x.date===e.date&&x.title.toLowerCase()===e.title.toLowerCase())===i).sort((a,b)=>a.date.localeCompare(b.date)||(a.detail||'').localeCompare(b.detail||'')).slice(0,8);
 const list=all.map(e=>'<div class="fmUpcomingItem"><span class="fmUpcomingDate"><b>'+esc(agendaDateFromKey(e.date)?.toLocaleDateString('pt-BR',{day:'2-digit'})||'—')+'</b><small>'+esc(agendaDateFromKey(e.date)?.toLocaleDateString('pt-BR',{month:'short'})||'')+'</small></span><span class="fmUpcomingText"><b>'+esc(e.title)+'</b><small>'+esc(agendaDateFromKey(e.date)?.toLocaleDateString('pt-BR',{weekday:'short'})||'')+(e.detail?' · '+esc(e.detail):'')+'</small></span><button type="button" class="fmHidePriorityBtn" title="Retirar dos lembretes importantes" data-source="'+esc(e.source)+'" data-item-id="'+esc(e.id)+'" onclick="fmHideHighPriorityFromButton(this)">Ocultar</button></div>').join('');
 return '<section class="panel fmUpcomingPanel fmHighPriorityPanel"><div class="fmWeekTop"><div><span class="fmEditorialKicker">LEMBRETES IMPORTANTES</span><h3>Alta prioridade</h3><p class="muted">Somente tarefas e compromissos marcados como alta prioridade. Você pode ocultar um item sem alterar sua prioridade.</p></div></div>'+(list||'<p class="muted">Nenhuma tarefa ou compromisso de alta prioridade próximo.</p>')+'</section>';
}
function fmDashboardTripsHtml(){
 const holidays=[
  {date:'2026-10-30',name:'Feriado do servidor'},
  {date:'2026-11-02',name:'Finados'},
  {date:'2026-11-20',name:'Consciência Negra'}
 ];
 const today=agendaDateKey(new Date()),trips=[];
 holidays.forEach(h=>{
  const d=agendaDateFromKey(h.date);if(!d||h.date<today)return;
  // Para feriado na sexta-feira, sugere deslocamento na quinta anterior.
  if(d.getDay()===5){const t=new Date(d);t.setDate(t.getDate()-1);const key=agendaDateKey(t);if(key>=today)trips.push({date:key,title:'Viagem provável para aproveitar '+h.name,detail:'Estimativa: véspera de feriado na sexta-feira.'})}
 });
 const explicit=agendaEvents().filter(e=>e&&e.date>=today&&/viagem|viajar|jequi[eé]|deslocamento/i.test(e.title||'')).map(e=>({date:e.date,title:e.title,detail:e.time||''}));
 const all=[...explicit,...trips].sort((a,b)=>a.date.localeCompare(b.date)).slice(0,4);
 return '<section class="panel fmTripsPanel"><div class="fmWeekTop"><div><span class="fmEditorialKicker">DESLOCAMENTOS</span><h3>Minhas viagens</h3><p class="muted">Previsões considerando feriados e a possibilidade de folga na sexta.</p></div><span class="fmTripMark">↗</span></div>'+(all.length?all.map(t=>'<div class="fmUpcomingItem"><span class="fmUpcomingDate"><b>'+esc(agendaDateFromKey(t.date)?.toLocaleDateString('pt-BR',{day:'2-digit'})||'—')+'</b><small>'+esc(agendaDateFromKey(t.date)?.toLocaleDateString('pt-BR',{month:'short'})||'')+'</small></span><span class="fmUpcomingText"><b>'+esc(t.title)+'</b><small>'+esc(t.detail)+' · previsão, confirme sua folga</small></span></div>').join(''):'<p class="muted">Ainda não há viagens futuras cadastradas nem feriados de sexta próximos para sugerir deslocamento.</p>')+'<p class="fmTripNote">As viagens sugeridas são estimativas, não reservas confirmadas. Quando você cadastrar uma folga ou viagem, ela ficará registrada na agenda.</p></section>';
}



function fmDashboardAttentionHtml(){
 const settings=db.settings||(db.settings={}),notice=settings.fmImportantNotice||{enabled:false,title:'Aviso importante',message:''},enabled=!!notice.enabled,title=String(notice.title||'Aviso importante'),message=String(notice.message||''),visible=enabled&&message.trim();
 return (visible?'<section class="fmAttentionNotice" role="status"><span class="fmAttentionIcon">!</span><div><span class="fmEditorialKicker">ATENÇÃO</span><h3>'+esc(title)+'</h3><p>'+esc(message).replace(/\n/g,'<br>')+'</p></div></section>':'')+'<details class="panel fmAttentionSettings"><summary>⚙️ Configurar aviso importante da tela inicial</summary><div class="fmAttentionForm"><label class="fmAttentionEnable"><input id="fmAttentionEnabled" type="checkbox" '+(enabled?'checked':'')+'> Mostrar aviso ao abrir o FlashMed</label><label>Título<input id="fmAttentionTitle" class="field" maxlength="90" value="'+esc(title)+'" placeholder="Ex.: Entregar documentação do CRM"></label><label>Mensagem<textarea id="fmAttentionMessage" class="field" rows="2" maxlength="500" placeholder="O que você precisa lembrar?">'+esc(message)+'</textarea></label><div class="row"><button class="btn" onclick="fmSaveDashboardAttention()">Salvar aviso</button><button class="btn ghost" onclick="fmDisableDashboardAttention()">Desativar aviso</button></div><p class="muted" id="fmAttentionStatus"></p></div></details>';
}
function fmSaveDashboardAttention(){
 const title=document.getElementById('fmAttentionTitle')?.value.trim()||'Aviso importante',message=document.getElementById('fmAttentionMessage')?.value.trim()||'',enabled=!!document.getElementById('fmAttentionEnabled')?.checked;
 db.settings=db.settings||{};db.settings.fmImportantNotice={enabled,title,message,updatedAt:Date.now()};const ok=save();toast(ok?'Aviso importante salvo.':'Não foi possível confirmar o salvamento.');render();
}
function fmDisableDashboardAttention(){db.settings=db.settings||{};const old=db.settings.fmImportantNotice||{};db.settings.fmImportantNotice={...old,enabled:false,updatedAt:Date.now()};save();render()}

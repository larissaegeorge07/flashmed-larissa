// FlashMed — widgets de plano diário, sequência de estudos e calendário de atividade.
// Compartilha o escopo global clássico da aplicação.
function studyTutorPlaceholder(){return '<div class="panel hero"><div class="row" style="align-items:center;gap:12px"><span style="font-size:32px">🤖</span><div><h2 style="margin:0">Tutor de Estudos com IA</h2><p style="margin:5px 0 0">Conversa de estudo dentro do FlashMed.</p></div></div></div><div class="panel" style="margin-top:14px"><h3>Estamos preparando o tutor com segurança</h3><p>O tutor será conectado por um serviço de backend, sem chaves secretas no código público. Essa tela ainda não envia mensagens para uma IA.</p><p class="muted">Próxima etapa: configurar uma integração segura e depois conectar o tutor ao seu plano de estudos, preservando login e sincronização.</p></div>'}
function dashboardTodayPlanPanel(){
 const d=new Date(),today=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
 const items=(Array.isArray(db.studyPlan?.weekSchedule)?db.studyPlan.weekSchedule:[]).filter(x=>x.date===today);
 const minutes=items.reduce((n,x)=>n+(Number(x.minutes)||0),0),done=items.filter(x=>x.done).length;
 const quote=typeof plannerQuoteOfDay==='function'?plannerQuoteOfDay():'Um passo pequeno também é progresso. ♡';
 const schedule=items.length?items.map(x=>`<label class="plannerCheck" style="display:flex;align-items:flex-start;gap:10px;padding:11px 0;border-bottom:1px solid var(--line)"><input type="checkbox" ${x.done?'checked':''} onchange="toggleWeeklyTask('${x.id}',this.checked)" style="margin-top:4px;flex-shrink:0"><span style="flex:1"><b style="${x.done?'text-decoration:line-through;opacity:.65':''}">${esc(x.title)}</b><span class="muted" style="display:block;margin-top:3px">${Number(x.minutes)||0} min</span></span><span class="tag">${x.done?'Concluída':'Planejada'}</span></label>`).join(''):`<p class="muted">Seu dia ainda está livre de tarefas no cronograma. Se quiser, monte ou ajuste sua semana por aqui.</p><button class="btn ghost" onclick="go('Planejador de Estudos')">Organizar minha semana</button>`;
 return `<div class="cols" style="margin-top:14px;align-items:stretch"><section class="panel" style="background:linear-gradient(135deg,var(--card),var(--rose2))"><div class="muted">♡ UMA LEMBRANÇA PARA HOJE</div><p style="font-size:18px;line-height:1.55;font-family:Georgia,serif;margin:12px 0 4px">${esc(quote)}</p></section><section class="panel"><div class="row" style="justify-content:space-between;align-items:flex-start"><div><h3 style="margin:0">🗓️ Seu cronograma de hoje</h3><p class="muted" style="margin:5px 0 0">${items.length?done+' de '+items.length+' tarefas concluídas':'Um passo de cada vez'}</p></div><span class="tag">${minutes} min</span></div>${items.length?`<div class="bar" style="margin:12px 0 4px"><i style="width:${Math.round(done/Math.max(1,items.length)*100)}%"></i></div>`:''}<div style="margin-top:8px">${schedule}</div>${items.length?`<button class="btn ghost" style="margin-top:12px" onclick="go('Planejador de Estudos')">Ver semana completa</button>`:''}</section></div>`;
}

let fmCalendarMonthOffset=0;
function flashmedStreakStats(){
 const active=new Set();
 const addDate=value=>{const date=String(value||'').slice(0,10);if(/^\d{4}-\d{2}-\d{2}$/.test(date))active.add(date)};
 // A ofensiva do FlashMed representa uso real do site, não apenas estudo acadêmico.
 // Trinta minutos acumulados com a página visível tornam o dia ativo.
 Object.entries(db.siteUsage||{}).forEach(([date,ms])=>{if((Number(ms)||0)>=FM_SITE_STREAK_MINUTES*60000)addDate(date)});
 // Mantém compatibilidade com registros antigos e outras atividades já salvas.
 (db.sessions||[]).forEach(session=>{if((Number(session.minutes)||0)>=1)addDate(session.date)});
 (db.bankAttempts||[]).forEach(attempt=>addDate(attempt.date));
 (db.studyPlan?.weekSchedule||[]).forEach(task=>{if(task.done&&task.completedAt)addDate(task.completedAt)});
 const today=day(),yesterday=new Date(Date.parse(today+'T00:00:00Z')-86400000).toISOString().slice(0,10);
 const lastActive=active.has(today)?today:(active.has(yesterday)?yesterday:null);
 let current=0;
 if(lastActive){let cursor=lastActive;while(active.has(cursor)){current++;cursor=new Date(Date.parse(cursor+'T00:00:00Z')-86400000).toISOString().slice(0,10)}}
 let best=0,run=0,previous=null;
 [...active].sort().forEach(date=>{
  run=previous&&Date.parse(date+'T00:00:00Z')-Date.parse(previous+'T00:00:00Z')===86400000?run+1:1;
  if(run>best)best=run;previous=date;
 });
 return {current,best,studiedToday:active.has(today),activeDays:active.size,activeDates:[...active]};
}

function fmStudyDateKey(date){return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0')}
function fmStudyCalendarShift(delta){fmCalendarMonthOffset=Math.min(0,fmCalendarMonthOffset+delta);render()}


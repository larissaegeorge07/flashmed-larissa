/* FlashMed — lembretes rápidos do planejamento. Dependências globais fornecidas pelo app principal. */
function fmQuickRemindersInit(){
 if(!Array.isArray(db.quickReminders))db.quickReminders=[];
 if(!db.quickReminders.some(x=>x&&x.id==='fm-go-theory-2026'))db.quickReminders.unshift({id:'fm-go-theory-2026',title:'Prova teórica de GO (confirmar com os professores)',date:'2026-12-17',notes:'Data prevista no cronograma do rodízio.',createdAt:Date.now()});
}
function fmQuickReminderAdd(event){
 event.preventDefault();fmQuickRemindersInit();
 const title=document.getElementById('fmQuickTitle')?.value.trim(),date=document.getElementById('fmQuickDate')?.value;
 if(!title||!date)return;
 db.quickReminders.push({id:'qrem_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7),title,date,createdAt:Date.now()});
 if(typeof save==='function')save();
 const form=document.querySelector('.fmQuickForm');if(form)form.reset();
 fmQuickRemindersRender();toast('Lembrete adicionado ♡');
}
function fmQuickReminderDelete(id){
 if(!confirm('Excluir este lembrete?'))return;
 db.quickReminders=(db.quickReminders||[]).filter(x=>String(x.id)!==String(id));
 if(typeof save==='function')save();fmQuickRemindersRender();
}
function fmQuickRemindersRender(){
 const host=document.getElementById('fmQuickReminderList');if(!host)return;fmQuickRemindersInit();
 const today=new Date();today.setHours(0,0,0,0);
 const rows=db.quickReminders.slice().sort((a,b)=>String(a.date).localeCompare(String(b.date)));
 if(!rows.length){host.innerHTML='<p class="muted">Seus lembretes aparecerão aqui.</p>';return}
 host.innerHTML=rows.map(r=>{
  const d=new Date(String(r.date||'')+'T00:00:00'),valid=!isNaN(d.getTime()),delta=valid?Math.ceil((d-today)/86400000):null;
  const countdown=delta===null?'Data não definida':delta<0?'Evento passado há '+Math.abs(delta)+' dia(s)':delta===0?'É hoje! 🎉':delta===1?'Amanhã!': 'Faltam '+delta+' dias';
  return '<article class="fmQuickReminder '+(delta===0?'isToday':'')+'"><div class="fmQuickReminderText"><strong>'+esc(r.title||'Evento')+'</strong><small>'+(valid?esc(d.toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'short',year:'numeric'})):'')+'</small>'+(r.notes?'<small>'+esc(r.notes)+'</small>':'')+'</div><span class="fmQuickCountdown">'+esc(countdown)+'</span><button class="fmQuickDelete" type="button" onclick="fmQuickReminderDelete('+JSON.stringify(String(r.id))+')" aria-label="Excluir lembrete" title="Excluir lembrete">×</button></article>';
 }).join('');
}
function fmQuickRemindersMakeMovable(){
 const box=document.getElementById('fmQuickReminders');if(!box||box.dataset.dragReady)return;box.dataset.dragReady='1';
 const grip=box.querySelector('.fmQuickDrag');if(!grip)return;
 let sx=0,sy=0,left=0,top=0,moving=false;
 grip.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;moving=true;sx=e.clientX;sy=e.clientY;const r=box.getBoundingClientRect();left=r.left;top=r.top;box.style.position='fixed';box.style.left=left+'px';box.style.top=top+'px';box.style.right='auto';box.style.width=Math.min(r.width,window.innerWidth-20)+'px';box.style.zIndex='100';grip.setPointerCapture(e.pointerId);e.preventDefault()});
 grip.addEventListener('pointermove',e=>{if(!moving)return;box.style.left=Math.max(8,Math.min(window.innerWidth-box.offsetWidth-8,left+e.clientX-sx))+'px';box.style.top=Math.max(8,Math.min(window.innerHeight-box.offsetHeight-8,top+e.clientY-sy))+'px'});
 grip.addEventListener('pointerup',()=>{if(!moving)return;moving=false;try{localStorage.setItem('fmQuickRemindersPosition',JSON.stringify({left:box.style.left,top:box.style.top,width:box.style.width}))}catch(e){}});
 try{const p=JSON.parse(localStorage.getItem('fmQuickRemindersPosition')||'null');if(p){box.style.position='fixed';box.style.left=p.left;box.style.top=p.top;box.style.right='auto';box.style.width=p.width;box.style.zIndex='100'}}catch(e){}
}


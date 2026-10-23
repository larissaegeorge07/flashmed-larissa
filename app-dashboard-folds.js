/* FlashMed — controles de expansão dos blocos do Dashboard. */
// Dashboard disclosure state is intentionally local UI state, not synced study data.
const dashboardFoldState={focus:false,exams:false,flashcards:false,openQuestions:false};
function dashboardDisclosure(key,heading,content,extra=''){
 const opened=!!dashboardFoldState[key];
 return `<section class="panel dashboardFold ${extra}" data-dashboard-fold="${key}"><button type="button" class="dashboardFoldToggle" aria-expanded="${opened}" aria-controls="dashboard-fold-${key}" onclick="toggleDashboardFold('${key}')"><span class="dashboardFoldTitle">${heading}</span><span class="dashboardFoldChevron" aria-hidden="true">${opened?'⌃':'⌄'}</span></button><div class="dashboardFoldContent" id="dashboard-fold-${key}" ${opened?'':'hidden'}>${content}</div></section>`;
}
function toggleDashboardFold(key){
 if(!Object.prototype.hasOwnProperty.call(dashboardFoldState,key))return;
 dashboardFoldState[key]=!dashboardFoldState[key];
 const section=document.querySelector('[data-dashboard-fold="'+key+'"]');
 if(!section)return;
 const button=section.querySelector('.dashboardFoldToggle'),content=section.querySelector('.dashboardFoldContent'),chevron=section.querySelector('.dashboardFoldChevron');
 if(!button||!content)return;
 button.setAttribute('aria-expanded',String(dashboardFoldState[key]));
 content.hidden=!dashboardFoldState[key];
 if(chevron)chevron.textContent=dashboardFoldState[key]?'⌃':'⌄';
}

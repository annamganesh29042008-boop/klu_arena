(()=>{
const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch{return f}};
const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const esc=v=>String(v).replace(/[&<>\'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]));
const regTable=document.getElementById('registrationTable');
const reg=read('kluArenaRegistration',null);
if(reg&&reg.captain){
 const statusStore=read('kluArenaOrganizerRegistrations',{});
 const key=`${reg.captain.id}-${reg.submittedAt}`;
 const status=statusStore[key]||'Pending';
 const row=document.createElement('div'); row.dataset.registration=key;
 row.innerHTML=`<b>${esc(reg.team)}</b><span>${esc(reg.tournament)}</span><span>${new Date(reg.submittedAt).toLocaleDateString('en-IN')}</span><strong class="${status.toLowerCase()}">${status}</strong>`;
 const actions=document.createElement('div'); actions.className='registration-actions';
 ['Approve','Reject'].forEach(action=>{const b=document.createElement('button');b.className='btn btn-outline btn-sm';b.textContent=action;b.type='button';b.onclick=()=>{statusStore[key]=action;save('kluArenaOrganizerRegistrations',statusStore);row.querySelector('strong').textContent=action;row.querySelector('strong').className=action.toLowerCase(); if(window.showToast)showToast(`Registration ${action.toLowerCase()}.`);};actions.appendChild(b)});
 row.appendChild(actions); regTable.appendChild(row);
 document.getElementById('statTeams').textContent=String(124+read('kluArenaOrganizerTournaments',[]).length+1);
}
const history=document.getElementById('resultHistory');
const results=read('kluArenaOrganizerResults',[]);
if(results.length){history.querySelector('p')?.remove();results.forEach(r=>{const item=document.createElement('div');item.className='result-item';item.innerHTML=`${esc(r.match)} → <b>${esc(r.winner)}</b> won ${esc(r.score)}`;history.appendChild(item)})}
const update=document.getElementById('updateResult');
if(update)update.addEventListener('click',()=>{const winner=document.getElementById('winner').value.trim(),score=document.getElementById('score').value.trim();if(!winner||!score)return;const arr=read('kluArenaOrganizerResults',[]);arr.push({match:document.getElementById('matchSelect').value,winner,score,time:new Date().toISOString()});save('kluArenaOrganizerResults',arr.slice(-20));});
const statMatches=document.getElementById('statMatches');if(statMatches)statMatches.textContent=String(36+results.length);
})();
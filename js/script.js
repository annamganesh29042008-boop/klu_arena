const qs = (s) => document.querySelector(s);
const qsa = (s) => document.querySelectorAll(s);

function showToast(message){
  const toast = qs('#toast');
  if(!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

const menuToggle = qs('#menuToggle');
const mainNav = qs('#mainNav');
if(menuToggle && mainNav){
  menuToggle.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });
}

qs('#searchBtn')?.addEventListener('click', () => {
  const term = window.prompt('Search KLU Arena tournaments:');
  if(term && term.trim()) window.location.href = 'tournaments.html?search=' + encodeURIComponent(term.trim());
});
qs('#notificationBtn')?.addEventListener('click', () => showToast('3 updates: registration deadline, match reminder and leaderboard update.'));

qsa('.bookmark').forEach(btn => btn.addEventListener('click', () => {
  btn.classList.toggle('saved');
  btn.textContent = btn.classList.contains('saved') ? '♥' : '♡';
  showToast(btn.classList.contains('saved') ? 'Tournament saved.' : 'Tournament removed from saved list.');
}));

qsa('a[href="#"]').forEach(link => link.addEventListener('click', e => e.preventDefault()));

const searchParam = new URLSearchParams(window.location.search).get('search');
const tournamentSearch = qs('#searchInput');
if(searchParam && tournamentSearch){
  tournamentSearch.value = searchParam;
  tournamentSearch.dispatchEvent(new Event('input', {bubbles:true}));
}

qsa('[data-current-year]').forEach(el => el.textContent = new Date().getFullYear());

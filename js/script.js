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

function getArenaUser(){
  try {
    const sessionUser = sessionStorage.getItem('kluArenaUser');
    const persistentUser = localStorage.getItem('kluArenaUser');
    return JSON.parse(sessionUser || persistentUser || 'null');
  } catch { return null; }
}

function arenaIsLoggedIn(){
  return sessionStorage.getItem('kluArenaLoggedIn') === 'true' || localStorage.getItem('kluArenaLoggedIn') === 'true';
}

function escapeHtml(value){
  return String(value).replace(/[&<>\'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
}

function updateAuthNavigation(){
  const actions = qs('.nav-actions');
  if(!actions || !arenaIsLoggedIn()) return;

  if(!document.querySelector('#arenaAccountStyles')){
    const style = document.createElement('style');
    style.id = 'arenaAccountStyles';
    style.textContent = '.account-menu{display:flex;align-items:center;gap:10px}.account-welcome{font-size:10px;color:#aaa;white-space:nowrap}.account-welcome strong{color:#fff}.account-menu .btn{padding:9px 13px;font-size:10px}@media(max-width:900px){.account-welcome{display:none}}';
    document.head.appendChild(style);
  }

  const user = getArenaUser();
  actions.querySelector('a[href="login.html"]')?.remove();
  actions.querySelector('a[href="signup.html"]')?.remove();

  if(!actions.querySelector('#accountMenu')){
    const account = document.createElement('div');
    account.id = 'accountMenu';
    account.className = 'account-menu';
    account.innerHTML = `<span class="account-welcome">Welcome, <strong>${escapeHtml(user?.name || 'Player')}</strong></span><button class="btn btn-outline" id="logoutBtn" type="button">Logout</button>`;
    actions.appendChild(account);
    account.querySelector('#logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('kluArenaLoggedIn');
      localStorage.removeItem('kluArenaUser');
      localStorage.removeItem('kluArenaLoginId');
      sessionStorage.removeItem('kluArenaLoggedIn');
      sessionStorage.removeItem('kluArenaUser');
      showToast('Logged out successfully.');
      setTimeout(() => location.href = 'index.html', 400);
    });
  }
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
updateAuthNavigation();

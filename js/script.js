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

function createSearchOverlay(){
  if(qs('#searchOverlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'searchOverlay';
  overlay.className = 'search-overlay';
  overlay.innerHTML = `
    <div class="search-backdrop" data-search-close></div>
    <section class="search-panel" role="dialog" aria-modal="true" aria-labelledby="searchTitle">
      <div class="search-panel-top">
        <div>
          <p class="kicker">KLU ARENA SEARCH</p>
          <h2 id="searchTitle">FIND YOUR <span>ARENA.</span></h2>
        </div>
        <button class="search-close" type="button" aria-label="Close search" data-search-close>×</button>
      </div>
      <form id="siteSearchForm" class="site-search-form">
        <span class="search-input-icon">⌕</span>
        <input id="siteSearchInput" type="search" autocomplete="off" placeholder="Search tournaments, sports, esports or teams..." aria-label="Search KLU Arena">
        <button type="submit">SEARCH <span>→</span></button>
      </form>
      <div class="search-quick">
        <p>QUICK SEARCH</p>
        <div class="search-tags">
          <button type="button" data-search-term="Cricket">Cricket</button>
          <button type="button" data-search-term="Football">Football</button>
          <button type="button" data-search-term="Badminton">Badminton</button>
          <button type="button" data-search-term="Valorant">Valorant</button>
          <button type="button" data-search-term="BGMI">BGMI</button>
          <button type="button" data-search-term="CS2">CS2</button>
          <button type="button" data-search-term="Free Fire">Free Fire</button>
          <button type="button" data-search-term="Table Tennis">Table Tennis</button>
        </div>
      </div>
      <div class="search-hint">Press <kbd>Enter</kbd> to search • Press <kbd>Esc</kbd> to close</div>
    </section>
  `;
  document.body.appendChild(overlay);

  const input = qs('#siteSearchInput');
  const close = () => {
    overlay.classList.remove('open');
    document.body.classList.remove('search-open');
    setTimeout(() => input?.blur(), 150);
  };
  const open = (term = '') => {
    overlay.classList.add('open');
    document.body.classList.add('search-open');
    input.value = term;
    setTimeout(() => input.focus(), 80);
  };

  qsa('[data-search-close]').forEach(el => el.addEventListener('click', close));
  qsa('[data-search-term]').forEach(btn => btn.addEventListener('click', () => {
    input.value = btn.dataset.searchTerm || '';
    input.focus();
    qs('#siteSearchForm').requestSubmit();
  }));

  qs('#siteSearchForm').addEventListener('submit', e => {
    e.preventDefault();
    const term = input.value.trim();
    if(!term){
      input.focus();
      return;
    }
    close();
    window.location.href = 'tournaments.html?search=' + encodeURIComponent(term);
  });

  document.addEventListener('keydown', e => {
    if(e.key === 'Escape' && overlay.classList.contains('open')) close();
  });

  window.openArenaSearch = open;
}

const menuToggle = qs('#menuToggle');
const mainNav = qs('#mainNav');
if(menuToggle && mainNav){
  menuToggle.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });
}

createSearchOverlay();
qs('#searchBtn')?.addEventListener('click', () => window.openArenaSearch?.());

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

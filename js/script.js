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
  return String(value).replace(/[&<>\'\"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[ch]));
}

function updateNotificationIndicator(){
  const buttons = qsa('.notification-btn');
  if(!buttons.length) return;

  if(!document.querySelector('#arenaNotificationStyles')){
    const style = document.createElement('style');
    style.id = 'arenaNotificationStyles';
    style.textContent = '.notification-btn span{display:none!important;position:absolute;right:3px;top:3px;width:7px;height:7px;padding:0!important;background:var(--red);border-radius:50%;font-size:0!important;line-height:0!important;box-shadow:0 0 9px rgba(229,9,20,.8)}.notification-btn.has-notifications span{display:block!important}';
    document.head.appendChild(style);
  }

  const loggedIn = arenaIsLoggedIn();
  const seen = localStorage.getItem('kluArenaAnnouncementsSeen') === 'true';
  buttons.forEach(btn => {
    btn.classList.toggle('has-notifications', loggedIn && !seen);
    btn.setAttribute('aria-label', loggedIn && !seen ? 'New announcements' : 'Announcements');
    btn.setAttribute('title', loggedIn && !seen ? 'New announcements' : 'Announcements');
  });
}

function updateAuthNavigation(){
  const actions = qs('.nav-actions');
  if(!actions || !arenaIsLoggedIn()) { updateNotificationIndicator(); return; }

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
      localStorage.removeItem('kluArenaAnnouncementsSeen');
      sessionStorage.removeItem('kluArenaLoggedIn');
      sessionStorage.removeItem('kluArenaUser');
      showToast('Logged out successfully.');
      setTimeout(() => location.href = 'index.html', 400);
    });
  }
  updateNotificationIndicator();
}

function createSearchOverlay(){
  if(qs('#searchOverlay')) return;

  if(!qs('#arenaSearchStyles')){
    const style = document.createElement('style');
    style.id = 'arenaSearchStyles';
    style.textContent = `
      body.search-open{overflow:hidden}
      .search-overlay{position:fixed;inset:0;z-index:999;display:flex;align-items:flex-start;justify-content:center;padding:110px 20px 30px;visibility:hidden;opacity:0;transition:opacity .22s ease,visibility .22s ease}
      .search-overlay.open{visibility:visible;opacity:1}
      .search-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.78);backdrop-filter:blur(8px)}
      .search-panel{position:relative;width:min(760px,100%);background:linear-gradient(145deg,#151012,#09090a 72%);border:1px solid #5a1a20;border-radius:12px;padding:30px;box-shadow:0 30px 100px rgba(0,0,0,.7),0 0 50px rgba(229,9,20,.08);transform:translateY(-16px) scale(.98);transition:transform .22s ease}
      .search-overlay.open .search-panel{transform:translateY(0) scale(1)}
      .search-panel-top{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;margin-bottom:22px}
      .search-panel-top .kicker{margin:0 0 4px}
      .search-panel h2{margin:0;font:900 38px/.95 var(--font-head);font-style:italic;color:#fff}
      .search-panel h2 span{color:var(--red)}
      .search-close{width:38px;height:38px;border:1px solid #3a2527;border-radius:7px;background:#0b0b0c;color:#aaa;font-size:27px;line-height:1;cursor:pointer;transition:.2s}
      .search-close:hover{color:#fff;border-color:#e50914;background:#16090b}
      .site-search-form{display:grid;grid-template-columns:1fr auto;gap:10px;padding:7px;background:#070708;border:1px solid #3b3032;border-radius:8px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.02)}
      .site-search-form:focus-within{border-color:#e50914;box-shadow:0 0 0 3px rgba(229,9,20,.1)}
      .site-search-form input{min-width:0;border:0;outline:0;background:transparent;color:#fff;padding:13px 12px;font-size:14px}
      .site-search-form input::placeholder{color:#66666d}
      .site-search-form input::-webkit-search-cancel-button{filter:invert(1);opacity:.5}
      .site-search-form button{border:0;border-radius:5px;background:linear-gradient(180deg,var(--red2),#c6000a);color:#fff;padding:0 22px;font-size:11px;font-weight:800;letter-spacing:1px;cursor:pointer}
      .site-search-form button:hover{filter:brightness(1.1)}
      .search-quick{margin-top:24px}
      .search-quick>p{margin:0 0 10px;color:#66666d;font-size:9px;font-weight:800;letter-spacing:1.7px}
      .search-tags{display:flex;flex-wrap:wrap;gap:8px}
      .search-tags button{border:1px solid #302a2c;background:#0e0e10;color:#bdbdc2;border-radius:5px;padding:9px 13px;font-size:10px;font-weight:700;cursor:pointer;transition:.2s}
      .search-tags button:hover{color:#fff;border-color:#9b2028;background:#180b0d;transform:translateY(-1px)}
      .search-hint{margin-top:22px;padding-top:16px;border-top:1px solid #242124;color:#69696f;font-size:9px;text-align:right}
      .search-hint kbd{display:inline-block;padding:3px 6px;border:1px solid #343438;border-bottom-color:#4a4a4e;border-radius:3px;background:#111113;color:#aaa;font:600 9px var(--font-body)}
      @media(max-width:600px){.search-overlay{padding:80px 12px 20px}.search-panel{padding:22px 17px}.search-panel h2{font-size:31px}.site-search-form{grid-template-columns:1fr}.site-search-form button{min-height:43px}.search-hint{text-align:left}}
    `;
    document.head.appendChild(style);
  }

  const overlay = document.createElement('div');
  overlay.id = 'searchOverlay';
  overlay.className = 'search-overlay';
  overlay.innerHTML = `
    <div class="search-backdrop" data-search-close></div>
    <section class="search-panel" role="dialog" aria-modal="true" aria-labelledby="searchTitle">
      <div class="search-panel-top">
        <div><p class="kicker">KLU ARENA SEARCH</p><h2 id="searchTitle">FIND YOUR <span>ARENA.</span></h2></div>
        <button class="search-close" type="button" aria-label="Close search" data-search-close>×</button>
      </div>
      <form id="siteSearchForm" class="site-search-form">
        <input id="siteSearchInput" type="search" autocomplete="off" placeholder="Search tournaments, sports, esports or teams..." aria-label="Search KLU Arena">
        <button type="submit">SEARCH <span>→</span></button>
      </form>
      <div class="search-quick"><p>QUICK SEARCH</p><div class="search-tags">
        <button type="button" data-search-term="Cricket">Cricket</button><button type="button" data-search-term="Football">Football</button><button type="button" data-search-term="Badminton">Badminton</button><button type="button" data-search-term="Valorant">Valorant</button><button type="button" data-search-term="BGMI">BGMI</button><button type="button" data-search-term="CS2">CS2</button><button type="button" data-search-term="Free Fire">Free Fire</button><button type="button" data-search-term="Table Tennis">Table Tennis</button>
      </div></div>
      <div class="search-hint">Press <kbd>Enter</kbd> to search • Press <kbd>Esc</kbd> to close</div>
    </section>`;
  document.body.appendChild(overlay);

  const input = qs('#siteSearchInput');
  const close = () => { overlay.classList.remove('open'); document.body.classList.remove('search-open'); setTimeout(() => input?.blur(), 150); };
  const open = (term = '') => { overlay.classList.add('open'); document.body.classList.add('search-open'); input.value = term; setTimeout(() => input.focus(), 80); };
  qsa('[data-search-close]').forEach(el => el.addEventListener('click', close));
  qsa('[data-search-term]').forEach(btn => btn.addEventListener('click', () => { input.value = btn.dataset.searchTerm || ''; qs('#siteSearchForm').requestSubmit(); }));
  qs('#siteSearchForm').addEventListener('submit', e => { e.preventDefault(); const term = input.value.trim(); if(!term){ input.focus(); return; } close(); window.location.href = 'tournaments.html?search=' + encodeURIComponent(term); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && overlay.classList.contains('open')) close(); });
  window.openArenaSearch = open;
}

function ensurePlayersNavigation(){
  const nav = qs('#mainNav');
  if(!nav || nav.querySelector('a[href="players.html"]')) return;

  const link = document.createElement('a');
  link.href = 'players.html';
  link.textContent = 'Players';

  const current = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if(current === 'players.html' || current === 'player-profile.html') link.classList.add('active');

  const organizers = nav.querySelector('a[href="organizer.html"]');
  if(organizers) organizers.before(link);
  else nav.appendChild(link);
}

ensurePlayersNavigation();
const menuToggle = qs('#menuToggle');
const mainNav = qs('#mainNav');
if(menuToggle && mainNav){ menuToggle.addEventListener('click', () => { const open = mainNav.classList.toggle('open'); menuToggle.setAttribute('aria-expanded', String(open)); }); }
createSearchOverlay();
qs('#searchBtn')?.addEventListener('click', () => window.openArenaSearch?.());
qsa('.notification-btn').forEach(btn => btn.addEventListener('click', () => {
  if(arenaIsLoggedIn()) localStorage.setItem('kluArenaAnnouncementsSeen', 'true');
  updateNotificationIndicator();
  window.location.href = 'announcements.html';
}));
qsa('.bookmark').forEach(btn => btn.addEventListener('click', () => { btn.classList.toggle('saved'); btn.textContent = btn.classList.contains('saved') ? '♥' : '♡'; showToast(btn.classList.contains('saved') ? 'Tournament saved.' : 'Tournament removed from saved list.'); }));
qsa('a[href="#"]').forEach(link => link.addEventListener('click', e => e.preventDefault()));
const searchParam = new URLSearchParams(window.location.search).get('search');
const tournamentSearch = qs('#searchInput');
if(searchParam && tournamentSearch){ tournamentSearch.value = searchParam; tournamentSearch.dispatchEvent(new Event('input', {bubbles:true})); }
qsa('[data-current-year]').forEach(el => el.textContent = new Date().getFullYear());
updateAuthNavigation();
updateNotificationIndicator();

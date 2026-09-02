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

qs('#searchBtn')?.addEventListener('click', () => showToast('Search is ready — use the Tournaments page filters.'));
qs('#notificationBtn')?.addEventListener('click', () => showToast('You have 3 tournament notifications.'));

qsa('.bookmark').forEach(btn => btn.addEventListener('click', () => {
  btn.classList.toggle('saved');
  btn.textContent = btn.classList.contains('saved') ? '♥' : '♡';
  showToast(btn.classList.contains('saved') ? 'Tournament saved.' : 'Tournament removed from saved list.');
}));

qsa('a[href="#"]').forEach(link => link.addEventListener('click', e => e.preventDefault()));

// Keep the footer year current on every page using this shared script.
qsa('[data-current-year]').forEach(el => el.textContent = new Date().getFullYear());

(() => {
  const loggedIn = typeof arenaIsLoggedIn === 'function' && arenaIsLoggedIn();
  const privateContent = document.querySelector('.private-content');
  const locked = document.querySelector('#lockedState');
  if (!loggedIn) {
    document.body.classList.add('dashboard-locked');
    if (privateContent) privateContent.setAttribute('aria-hidden', 'true');
    return;
  }

  const user = typeof getArenaUser === 'function' ? getArenaUser() : null;
  if (!user) return;

  const $ = id => document.getElementById(id);
  $('userName').textContent = user.name || 'Player';
  $('userId').textContent = user.studentId ? `KLU ID: ${user.studentId}` : 'KLU ID not available';
  $('userEmail').textContent = user.email || 'Email not available';
  $('avatar').textContent = String(user.name || 'P').trim().charAt(0).toUpperCase();

  let teams = [];
  let registrations = [];
  try { teams = JSON.parse(localStorage.getItem('kluArenaTeams') || '[]'); } catch {}
  try { registrations = JSON.parse(localStorage.getItem('kluArenaRegistration') || 'null'); registrations = registrations ? [registrations] : []; } catch {}

  const myTeams = teams.filter(t => String(t.captainId || '') === String(user.studentId || ''));
  const memberIds = new Set();
  myTeams.forEach(t => (t.members || []).forEach(m => memberIds.add(String(m.studentId || m.id || m))));

  $('teamCount').textContent = myTeams.length;
  $('registrationCount').textContent = registrations.length;
  $('rosterCount').textContent = memberIds.size;
  $('rankStatus').textContent = myTeams.length ? 'ACTIVE' : 'UNRANKED';

  const teamList = $('teamList');
  if (!myTeams.length) {
    teamList.innerHTML = '<div class="empty">No teams created yet. Your first squad is one click away.</div>';
  } else {
    teamList.innerHTML = myTeams.map(team => {
      const slug = team.slug || String(team.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const count = Array.isArray(team.members) ? team.members.length : 0;
      return `<div class="item"><div class="item-main"><strong>${escapeHtml(team.name || 'Unnamed Team')}</strong><span>${escapeHtml(team.game || team.category || 'Competition')} • ${count} verified member${count === 1 ? '' : 's'}</span></div><a class="mini-link" href="team-profile.html?team=${encodeURIComponent(slug)}">OPEN →</a></div>`;
    }).join('');
  }

  const registrationList = $('registrationList');
  if (!registrations.length) {
    registrationList.innerHTML = '<div class="empty">No tournament registrations found on this device.</div>';
  } else {
    registrationList.innerHTML = registrations.map(reg => {
      const title = reg.tournamentName || reg.tournament || 'Tournament Registration';
      const members = Array.isArray(reg.members) ? reg.members.length : 0;
      return `<div class="item"><div class="item-main"><strong>${escapeHtml(title)}</strong><span>${members} roster member${members === 1 ? '' : 's'} • Captain verified</span></div><span class="pill">REGISTERED</span></div>`;
    }).join('');
  }
})();

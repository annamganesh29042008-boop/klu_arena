const players = window.KLUPlayers || [];
const key = new URLSearchParams(location.search).get('player') || 'shadowx';
const p = players.find(x => x.username === key);
const byId = id => document.getElementById(id);

if (p) {
  document.title = `${p.name} | KLU Arena`;
  byId('pageTitle').textContent = p.name.toUpperCase();
  byId('avatar').textContent = p.name.slice(0, 2).toUpperCase();
  byId('name').textContent = p.name;
  byId('handle').textContent = `@${p.username} • 🇮🇳 India • ${p.game}`;
  byId('rating').textContent = Number(p.rating).toLocaleString();
  byId('rank').textContent = p.rank ? p.rank.toUpperCase() : 'PLAYER';
  byId('matches').textContent = p.matches;
  byId('wins').textContent = p.wins;
  byId('losses').textContent = Math.max(0, Number(p.matches) - Number(p.wins));
  byId('winRate').textContent = `${p.winRate}%`;
  byId('fire').style.display = p.onFire ? 'inline-block' : 'none';

  byId('gamePerformance').innerHTML = (p.performance || []).map(g => `<div class="game-row"><strong>${g[0]}</strong><span>${g[1]} matches • ${g[2]}% win rate</span></div>`).join('');
  byId('tournamentHistory').innerHTML = (p.history || []).map(h => `<div class="history-row"><strong>${h[0]}</strong><span>${h[1]}</span></div>`).join('');
} else {
  document.title = 'Player Not Found | KLU Arena';
  byId('pageTitle').textContent = 'PLAYER NOT FOUND';
  byId('profileContent').style.display = 'none';
  byId('profileError').classList.add('show');
}

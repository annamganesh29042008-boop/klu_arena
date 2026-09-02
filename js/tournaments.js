const tabs = document.querySelectorAll('.tab');
const cards = document.querySelectorAll('.browse-card');
const gameFilter = document.querySelector('#gameFilter');
const statusFilter = document.querySelector('#statusFilter');
const searchInput = document.querySelector('#searchInput');
const resetFilters = document.querySelector('#resetFilters');

let activeCategory = 'all';

function applyFilters(){
  const game = gameFilter.value;
  const status = statusFilter.value;
  const query = searchInput.value.trim().toLowerCase();
  cards.forEach(card => {
    const matchesCategory = activeCategory === 'all' || card.dataset.category === activeCategory;
    const matchesGame = game === 'all' || card.dataset.game === game;
    const matchesStatus = status === 'all' || card.dataset.status === status;
    const matchesText = !query || card.innerText.toLowerCase().includes(query);
    card.style.display = matchesCategory && matchesGame && matchesStatus && matchesText ? '' : 'none';
  });
}

tabs.forEach(tab => tab.addEventListener('click', () => {
  tabs.forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  activeCategory = tab.dataset.category;
  applyFilters();
}));
[gameFilter,statusFilter,searchInput].forEach(el => el?.addEventListener('input', applyFilters));
resetFilters?.addEventListener('click', () => {
  activeCategory = 'all';
  tabs.forEach(t => t.classList.toggle('active', t.dataset.category === 'all'));
  gameFilter.value = 'all';
  statusFilter.value = 'all';
  searchInput.value = '';
  applyFilters();
});

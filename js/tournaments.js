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

function addTournamentPhotos(){
  const photos = {
    Cricket: 'https://images.unsplash.com/photo-1677785643764-179393bc3842?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=1400',
    Football: 'https://images.unsplash.com/photo-1772707681004-ebbce15554d4?auto=format&fit=crop&fm=jpg&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.1.0&q=60&w=1400'
  };

  cards.forEach(card => {
    const image = card.querySelector('.browse-image');
    const game = card.dataset.game;
    if(!image || !photos[game]) return;

    image.style.backgroundImage = `linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.28)), url("${photos[game]}")`;
    image.style.backgroundSize = 'cover';
    image.style.backgroundPosition = 'center';
    const icon = image.querySelector('.image-icon');
    if(icon) icon.style.display = 'none';

    if(game === 'Cricket'){
      image.classList.add('cricket-photo');
      if(!image.querySelector('.jersey-number')){
        const number = document.createElement('span');
        number.className = 'jersey-number';
        number.textContent = '18';
        number.setAttribute('aria-label', 'KLU cricket jersey number 18');
        image.appendChild(number);
      }
    }
  });

  if(!document.querySelector('#tournamentPhotoStyles')){
    const style = document.createElement('style');
    style.id = 'tournamentPhotoStyles';
    style.textContent = `
      .browse-image.cricket-photo:after{background:linear-gradient(180deg,rgba(0,0,0,.03),rgba(0,0,0,.38))}
      .jersey-number{position:absolute;left:50%;top:47%;transform:translate(-50%,-50%) rotate(-5deg);z-index:4;color:#fff;font:900 38px/1 var(--font-head);font-style:italic;letter-spacing:-1px;text-shadow:0 2px 5px rgba(0,0,0,.85),0 0 2px #0b3150;pointer-events:none}
    `;
    document.head.appendChild(style);
  }
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

addTournamentPhotos();

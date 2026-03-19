// ── Données ──
const MOVIES = [
  { id: 1,  title: "The Dark Knight",         genres: ["Action","Crime","Drama"],           emoji: "🦇" },
  { id: 2,  title: "Inception",               genres: ["Action","Sci-Fi","Thriller"],        emoji: "🌀" },
  { id: 3,  title: "Interstellar",            genres: ["Adventure","Drama","Sci-Fi"],        emoji: "🚀" },
  { id: 4,  title: "The Matrix",              genres: ["Action","Sci-Fi"],                   emoji: "💊" },
  { id: 5,  title: "Pulp Fiction",            genres: ["Crime","Drama","Thriller"],          emoji: "🔫" },
  { id: 6,  title: "The Godfather",           genres: ["Crime","Drama"],                     emoji: "🌹" },
  { id: 7,  title: "Fight Club",              genres: ["Drama","Thriller"],                  emoji: "🥊" },
  { id: 8,  title: "Forrest Gump",            genres: ["Drama","Romance"],                   emoji: "🏃" },
  { id: 9,  title: "The Shawshank Redemption",genres: ["Crime","Drama"],                     emoji: "⛓️" },
  { id: 10, title: "Goodfellas",              genres: ["Biography","Crime","Drama"],         emoji: "🤵" },
  { id: 11, title: "Avengers Endgame",        genres: ["Action","Adventure","Sci-Fi"],       emoji: "⚡" },
  { id: 12, title: "Spider-Man No Way Home",  genres: ["Action","Adventure","Sci-Fi"],       emoji: "🕷️" },
  { id: 13, title: "The Lion King",           genres: ["Animation","Adventure","Drama"],     emoji: "🦁" },
  { id: 14, title: "Toy Story",               genres: ["Animation","Adventure","Comedy"],    emoji: "🤠" },
  { id: 15, title: "Finding Nemo",            genres: ["Animation","Adventure","Comedy"],    emoji: "🐠" },
  { id: 16, title: "The Silence of the Lambs",genres: ["Crime","Horror","Thriller"],         emoji: "🦋" },
  { id: 17, title: "Se7en",                   genres: ["Crime","Drama","Mystery"],           emoji: "🔍" },
  { id: 18, title: "Parasite",                genres: ["Comedy","Drama","Thriller"],         emoji: "🏠" },
  { id: 19, title: "Joker",                   genres: ["Crime","Drama","Thriller"],          emoji: "🃏" },
  { id: 20, title: "1917",                    genres: ["Drama","War"],                       emoji: "🪖" },
  { id: 21, title: "Titanic",                 genres: ["Drama","Romance"],                   emoji: "🚢" },
  { id: 22, title: "La La Land",              genres: ["Comedy","Drama","Music","Romance"],  emoji: "🎷" },
  { id: 23, title: "Whiplash",                genres: ["Drama","Music"],                     emoji: "🥁" },
  { id: 24, title: "Black Swan",              genres: ["Drama","Horror","Thriller"],         emoji: "🩰" },
  { id: 25, title: "The Prestige",            genres: ["Drama","Mystery","Sci-Fi","Thriller"],emoji: "🎩" },
];

const MAX_SELECTION = 10;
let selected = new Set();
let activeGenre = null;

// ── Similarité Jaccard ──
function jaccard(a, b) {
  const setA = new Set(a), setB = new Set(b);
  const inter = [...setA].filter(g => setB.has(g)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : inter / union;
}

function recommend(profileIds) {
  const profile = MOVIES.filter(m => profileIds.has(m.id));
  const candidates = MOVIES.filter(m => !profileIds.has(m.id));
  return candidates
    .map(m => ({
      ...m,
      score: +(profile.reduce((sum, p) => sum + jaccard(m.genres, p.genres), 0) / profile.length).toFixed(2)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

// ── Rendu catalogue ──
function renderCatalogue() {
  const query = document.getElementById('search-input').value.toLowerCase();
  const grid = document.getElementById('movie-grid');
  grid.innerHTML = '';

  const filtered = MOVIES.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(query);
    const matchGenre = !activeGenre || m.genres.includes(activeGenre);
    return matchSearch && matchGenre;
  });

  filtered.forEach(m => {
    const card = document.createElement('div');
    card.className = 'movie-card' + (selected.has(m.id) ? ' selected' : '');
    card.innerHTML = `
      <div class="movie-emoji">${m.emoji}</div>
      <div class="movie-title">${m.title}</div>
      <div class="movie-genres">${m.genres.map(g => `<span class="genre-tag">${g}</span>`).join('')}</div>
    `;
    card.addEventListener('click', () => toggleSelect(m.id));
    grid.appendChild(card);
  });
}

// ── Rendu filtres genres ──
function renderGenreFilters() {
  const all = [...new Set(MOVIES.flatMap(m => m.genres))].sort();
  const container = document.getElementById('genre-filters');
  container.innerHTML = '';

  const allChip = document.createElement('span');
  allChip.className = 'genre-chip' + (!activeGenre ? ' active' : '');
  allChip.textContent = 'Tous';
  allChip.addEventListener('click', () => { activeGenre = null; renderGenreFilters(); renderCatalogue(); });
  container.appendChild(allChip);

  all.forEach(g => {
    const chip = document.createElement('span');
    chip.className = 'genre-chip' + (activeGenre === g ? ' active' : '');
    chip.textContent = g;
    chip.addEventListener('click', () => { activeGenre = g; renderGenreFilters(); renderCatalogue(); });
    container.appendChild(chip);
  });
}

// ── Toggle sélection ──
function toggleSelect(id) {
  if (selected.has(id)) {
    selected.delete(id);
  } else {
    if (selected.size >= MAX_SELECTION) {
      showToast(`Limite de ${MAX_SELECTION} films atteinte.`);
      return;
    }
    selected.add(id);
  }
  updateUI();
}

function updateUI() {
  document.getElementById('selected-count').textContent = `(${selected.size} / ${MAX_SELECTION} sélectionnés)`;
  document.getElementById('recommend-btn').disabled = selected.size === 0;
  renderCatalogue();
}

// ── Recommandations ──
document.getElementById('recommend-btn').addEventListener('click', () => {
  const results = recommend(selected);
  const grid = document.getElementById('results-grid');
  const section = document.getElementById('results-section');
  grid.innerHTML = '';

  if (results.length === 0) {
    grid.innerHTML = '<p style="color:var(--muted)">Catalogue insuffisant pour générer des suggestions.</p>';
  } else {
    results.forEach(m => {
      const card = document.createElement('div');
      card.className = 'result-card';
      card.innerHTML = `
        <div class="movie-emoji">${m.emoji}</div>
        <div class="movie-title">${m.title}</div>
        <div class="movie-genres">${m.genres.map(g => `<span class="genre-tag">${g}</span>`).join('')}</div>
        <div class="score-badge">⭐ Score ${m.score}</div>
      `;
      grid.appendChild(card);
    });
  }

  section.hidden = false;
  section.scrollIntoView({ behavior: 'smooth' });
});

// ── Reset ──
document.getElementById('reset-btn').addEventListener('click', () => {
  selected.clear();
  document.getElementById('results-section').hidden = true;
  updateUI();
});

// ── Recherche ──
document.getElementById('search-input').addEventListener('input', renderCatalogue);

// ── Toast ──
function showToast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  Object.assign(t.style, {
    position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
    background: '#e50914', color: '#fff', padding: '0.7rem 1.4rem',
    borderRadius: '8px', fontWeight: '600', zIndex: 999, fontSize: '0.9rem'
  });
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

// ── Init ──
renderGenreFilters();
renderCatalogue();

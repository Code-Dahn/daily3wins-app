const form = document.getElementById('wins-form');
const list = document.getElementById('past-entries');
const themeSelector = document.getElementById('theme-selector');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const savedTheme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');

// Set initial theme
document.body.setAttribute('data-theme', savedTheme);
themeSelector.value = savedTheme;

themeSelector.addEventListener('change', () => {
  const selectedTheme = themeSelector.value;
  document.body.setAttribute('data-theme', selectedTheme);
  localStorage.setItem('theme', selectedTheme);
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const wins = {
    date: new Date().toLocaleDateString(),
    physical: form.physical.value,
    mental: form.mental.value,
    spiritual: form.spiritual.value,
  };

  const saved = JSON.parse(localStorage.getItem('wins') || '[]');
  saved.unshift(wins);
  localStorage.setItem('wins', JSON.stringify(saved));
  form.reset();
  renderWins();
});

function renderWins() {
  const saved = JSON.parse(localStorage.getItem('wins') || '[]');
  
  // Create entry rows
  const entries = saved
    .map((win, idx) => `
      <div class="entry-card" onclick="toggleEntry(this)">
        <div class="entry-checkbox" onclick="event.stopPropagation()">
          <input type="checkbox" data-idx="${idx}">
        </div>
        <div class="entry-date">${win.date}</div>
        <div class="entry-preview">
          <span class="entry-preview-text">🏋️ ${win.physical}</span>
          <i class="fas fa-chevron-down expand-icon"></i>
        </div>
        <div class="entry-details">
          <div class="entry-detail-item">
            <span class="entry-label">Physical Win:</span>
            <div class="entry-content">
              <span class="entry-value">🏋️ ${win.physical}</span>
            </div>
          </div>
          <div class="entry-detail-item">
            <span class="entry-label">Mental Win:</span>
            <div class="entry-content">
              <span class="entry-value">🧠 ${win.mental}</span>
            </div>
          </div>
          <div class="entry-detail-item">
            <span class="entry-label">Spiritual Win:</span>
            <div class="entry-content">
              <span class="entry-value">🕊️ ${win.spiritual}</span>
            </div>
          </div>
        </div>
      </div>
    `)
    .join('');
    
  list.innerHTML = entries;
}

// Update toggle function for expanding/collapsing entries
function toggleEntry(card) {
  const details = card.querySelector('.entry-details');
  const icon = card.querySelector('.expand-icon');
  
  if (details.style.display === 'block') {
    details.style.display = 'none';
    icon.classList.remove('fa-chevron-up');
    icon.classList.add('fa-chevron-down');
  } else {
    details.style.display = 'block';
    icon.classList.remove('fa-chevron-down');
    icon.classList.add('fa-chevron-up');
  }
}

document.getElementById('delete-selected').addEventListener('click', () => {
  const checkboxes = document.querySelectorAll('.entry-checkbox input[type="checkbox"]:checked');
  if (checkboxes.length === 0) return;
  if (!confirm('Delete selected entries?')) return;
  let saved = JSON.parse(localStorage.getItem('wins') || '[]');
  // Get indices to delete, sort descending so we can safely splice
  const indices = Array.from(checkboxes).map(cb => Number(cb.dataset.idx)).sort((a, b) => b - a);
  for (const idx of indices) {
    saved.splice(idx, 1);
  }
  localStorage.setItem('wins', JSON.stringify(saved));
  renderWins();
});

renderWins();

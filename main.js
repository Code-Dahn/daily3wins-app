const form = document.getElementById('wins-form');
const list = document.getElementById('past-entries');

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
  list.innerHTML = saved
    .map(win => `<li><strong>${win.date}</strong><br>🏋️ ${win.physical}<br>🧠 ${win.mental}<br>🕊️ ${win.spiritual}</li>`)
    .join('');
}

renderWins();
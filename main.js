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

// Calendar functionality
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

function updateCalendar() {
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const startingDay = firstDay.getDay();
  const monthLength = lastDay.getDate();
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                     'July', 'August', 'September', 'October', 'November', 'December'];
  
  document.querySelector('.calendar-header h3').textContent = 
    `${monthNames[currentMonth]} ${currentYear}`;
  
  const datesGrid = document.querySelector('.calendar-dates');
  datesGrid.innerHTML = '';
  
  // Previous month's days
  const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
  for (let i = startingDay - 1; i >= 0; i--) {
    const dateElement = document.createElement('div');
    dateElement.className = 'calendar-date other-month';
    dateElement.textContent = prevMonthLastDay - i;
    datesGrid.appendChild(dateElement);
  }
  
  // Current month's days
  for (let i = 1; i <= monthLength; i++) {
    const dateElement = document.createElement('div');
    dateElement.className = 'calendar-date';
    dateElement.textContent = i;
    
    // Check if this date has an entry
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const entries = localStorage.getItem(dateStr);
    
    if (entries) {
      dateElement.classList.add('has-entry');
      const entryCount = JSON.parse(entries).length;
      if (entryCount >= 3) {
        dateElement.setAttribute('data-level', '4');
      } else if (entryCount === 2) {
        dateElement.setAttribute('data-level', '3');
      } else {
        dateElement.setAttribute('data-level', '2');
      }
    }
    
    // Highlight today
    if (i === currentDate.getDate() && 
        currentMonth === currentDate.getMonth() && 
        currentYear === currentDate.getFullYear()) {
      dateElement.classList.add('today');
    }
    
    // Add tooltip with entry details
    if (entries) {
      const entryCount = JSON.parse(entries).length;
      dateElement.setAttribute('title', `${dateStr}: ${entryCount} wins completed`);
    }
    
    dateElement.addEventListener('click', () => {
      // TODO: Show entries for this date
    });
    
    datesGrid.appendChild(dateElement);
  }
  
  // Next month's days
  const totalDays = 42; // 6 rows of 7 days
  const remainingDays = totalDays - (startingDay + monthLength);
  for (let i = 1; i <= remainingDays; i++) {
    const dateElement = document.createElement('div');
    dateElement.className = 'calendar-date other-month';
    dateElement.textContent = i;
    datesGrid.appendChild(dateElement);
  }
}

function updateStreakCounter() {
  let streak = 0;
  let currentStreakDate = new Date();
  currentStreakDate.setHours(0, 0, 0, 0);
  
  while (true) {
    const dateStr = currentStreakDate.toISOString().split('T')[0];
    if (localStorage.getItem(dateStr)) {
      streak++;
      currentStreakDate.setDate(currentStreakDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  document.querySelector('.streak-counter').innerHTML = `
    <i class="fas fa-fire"></i>
    <span>${streak}</span>
    <span class="streak-label">day streak</span>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    document.getElementById('theme-selector').value = savedTheme;

    // Initialize calendar
    updateCalendar();
    updateStreakCounter();

    // Add event listeners
    document.getElementById('wins-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const date = new Date().toISOString().split('T')[0];
        const physicalWin = document.getElementById('physical').value;
        const mentalWin = document.getElementById('mental').value;
        const spiritualWin = document.getElementById('spiritual').value;

        if (!physicalWin || !mentalWin || !spiritualWin) {
            alert('Please fill in all three wins!');
            return;
        }

        const wins = {
            date,
            physical: physicalWin,
            mental: mentalWin,
            spiritual: spiritualWin
        };

        let savedWins = JSON.parse(localStorage.getItem('wins') || '[]');
        savedWins.push(wins);
        localStorage.setItem('wins', JSON.stringify(savedWins));

        document.getElementById('wins-form').reset();
        renderWins();
        updateCalendar();
        updateStreakCounter();
    });

    document.getElementById('theme-selector').addEventListener('change', (e) => {
        const theme = e.target.value;
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    });

    document.querySelector('.prev-month').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        updateCalendar();
    });

    document.querySelector('.next-month').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        updateCalendar();
    });

    document.getElementById('delete-selected').addEventListener('click', () => {
        const checkboxes = document.querySelectorAll('.entry-checkbox input[type="checkbox"]:checked');
        if (checkboxes.length === 0) {
            alert('Please select entries to delete');
            return;
        }

        if (confirm(`Are you sure you want to delete ${checkboxes.length} entries?`)) {
            let savedWins = JSON.parse(localStorage.getItem('wins') || '[]');
            checkboxes.forEach(checkbox => {
                const date = checkbox.closest('.entry').dataset.date;
                savedWins = savedWins.filter(win => win.date !== date);
            });
            localStorage.setItem('wins', JSON.stringify(savedWins));
            renderWins();
            updateCalendar();
            updateStreakCounter();
        }
    });

    renderWins();
});

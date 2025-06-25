// Global state
let currentDate = new Date();

// Functions
function renderWins() {
    const list = document.getElementById('past-entries');
    if (!list) return;

    const saved = JSON.parse(localStorage.getItem('wins') || '[]');
    
    const entries = saved
        .map((win, idx) => {
            const date = new Date(win.date + 'T00:00:00'); // Use T00:00:00 to avoid timezone issues
            const displayDate = date.toLocaleDateString('en-US', { 
                month: '2-digit', 
                day: '2-digit', 
                year: 'numeric' 
            });

            return `
          <div class="entry-card" data-idx="${idx}">
            <div class="entry-checkbox">
              <input type="checkbox" data-idx="${idx}">
            </div>
            <div class="entry-date">${displayDate}</div>
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
        `;
        })
        .join('');
        
    list.innerHTML = entries;
    addEntryEventListeners();
}

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

function updateCalendar() {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startingDay = firstDay.getDay();
    const monthLength = lastDay.getDate();
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    
    const calendarHeader = document.querySelector('.calendar-header h3');
    if (calendarHeader) {
        calendarHeader.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
    
    const datesGrid = document.querySelector('.calendar-dates');
    if (!datesGrid) return;
    datesGrid.innerHTML = '';
    
    const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
        const dateElement = document.createElement('div');
        dateElement.className = 'calendar-date other-month';
        dateElement.textContent = prevMonthLastDay - i;
        datesGrid.appendChild(dateElement);
    }
    
    for (let i = 1; i <= monthLength; i++) {
        const dateElement = document.createElement('div');
        dateElement.className = 'calendar-date';
        dateElement.textContent = i;
        
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const entries = JSON.parse(localStorage.getItem('wins') || '[]').filter(win => win.date === dateStr);
        
        if (entries.length > 0) {
            dateElement.classList.add('has-entry');
            if (entries.length >= 3) {
                dateElement.setAttribute('data-level', '4');
            } else if (entries.length === 2) {
                dateElement.setAttribute('data-level', '3');
            } else {
                dateElement.setAttribute('data-level', '2');
            }
            dateElement.setAttribute('title', `${dateStr}: ${entries.length} wins completed`);
        }
        
        const today = new Date();
        if (i === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear()) {
            dateElement.classList.add('today');
        }
        
        datesGrid.appendChild(dateElement);
    }
    
    const totalDays = 42;
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
    let checkDate = new Date();
    const savedWins = JSON.parse(localStorage.getItem('wins') || '[]');
    const entryDates = new Set(savedWins.map(win => win.date));

    while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (entryDates.has(dateStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }
    
    const streakCounter = document.querySelector('.streak-counter');
    if(streakCounter) {
        streakCounter.innerHTML = `
            <i class="fas fa-fire"></i>
            <span>${streak}</span>
            <span class="streak-label">day streak</span>
        `;
    }
}


// Event Handlers
function handleFormSubmit(e) {
    e.preventDefault();
    const date = new Date().toISOString().split('T')[0];
    const physicalWin = document.getElementById('physical').value;
    const mentalWin = document.getElementById('mental').value;
    const spiritualWin = document.getElementById('spiritual').value;

    const wins = { date, physical: physicalWin, mental: mentalWin, spiritual: spiritualWin };

    let savedWins = JSON.parse(localStorage.getItem('wins') || '[]');
    savedWins.push(wins);
    localStorage.setItem('wins', JSON.stringify(savedWins));

    document.getElementById('wins-form').reset();
    renderWins();
    updateCalendar();
    updateStreakCounter();
}

function handleThemeChange(e) {
    const theme = e.target.value;
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

function handlePrevMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalendar();
}

function handleNextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateCalendar();
}

function handleDeleteSelected() {
    const checkboxes = document.querySelectorAll('.entry-checkbox input[type="checkbox"]:checked');
    if (checkboxes.length === 0) {
        alert('Please select entries to delete');
        return;
    }
    if (confirm(`Are you sure you want to delete ${checkboxes.length} entries?`)) {
        let savedWins = JSON.parse(localStorage.getItem('wins') || '[]');
        const indicesToDelete = Array.from(checkboxes).map(cb => parseInt(cb.dataset.idx, 10));
        
        savedWins = savedWins.filter((win, index) => !indicesToDelete.includes(index));

        localStorage.setItem('wins', JSON.stringify(savedWins));
        renderWins();
        updateCalendar();
        updateStreakCounter();
    }
}

function addEntryEventListeners() {
    document.querySelectorAll('.entry-card').forEach(card => {
        let isSwiping = false;
        card.addEventListener('touchmove', () => { isSwiping = true; });
        card.addEventListener('touchstart', () => { isSwiping = false; });
        card.addEventListener('click', () => {
            if (!isSwiping) {
                toggleEntry(card);
            }
        });
    });

    document.querySelectorAll('.entry-checkbox').forEach(box => {
        box.addEventListener('click', (e) => e.stopPropagation());
    });
}


// Main execution
document.addEventListener('DOMContentLoaded', () => {
    // DOM Element selectors
    const form = document.getElementById('wins-form');
    const themeSelector = document.getElementById('theme-selector');
    const prevMonthBtn = document.querySelector('.prev-month');
    const nextMonthBtn = document.querySelector('.next-month');
    const deleteSelectedBtn = document.getElementById('delete-selected');

    // Initial Setup
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');
    document.body.setAttribute('data-theme', savedTheme);
    if(themeSelector) {
        themeSelector.value = savedTheme;
    }

    // Initial Render
    renderWins();
    updateCalendar();
    updateStreakCounter();

    // Event Listeners
    if(form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    if(themeSelector) {
        themeSelector.addEventListener('change', handleThemeChange);
    }
    if(prevMonthBtn) {
        prevMonthBtn.addEventListener('click', handlePrevMonth);
    }
    if(nextMonthBtn) {
        nextMonthBtn.addEventListener('click', handleNextMonth);
    }
    if(deleteSelectedBtn) {
        deleteSelectedBtn.addEventListener('click', handleDeleteSelected);
    }
});

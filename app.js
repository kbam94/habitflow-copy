const state = {
    habits: JSON.parse(localStorage.getItem('habitflow_data')) || [],
    editingId: null
};

const elements = {
    habitList: document.getElementById('habit-list'),
    addBtn: document.getElementById('add-habit-btn'),
    modal: document.getElementById('modal-overlay'),
    modalTitle: document.getElementById('modal-title'),
    habitInput: document.getElementById('habit-input'),
    saveBtn: document.getElementById('save-btn'),
    cancelBtn: document.getElementById('cancel-btn'),
    progressBar: document.getElementById('overall-progress-fill'),
    progressText: document.getElementById('progress-text')
};

function saveToStorage() {
    localStorage.setItem('habitflow_data', JSON.stringify(state.habits));
    render();
}

function getDates() {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
}

function getDayName(dateStr) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const d = new Date(dateStr);
    return days[d.getDay()];
}

function toggleHabit(habitId, date) {
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;

    if (habit.completedDates.includes(date)) {
        habit.completedDates = habit.completedDates.filter(d => d !== date);
    } else {
        habit.completedDates.push(date);
    }
    saveToStorage();
}

function openModal(id = null) {
    state.editingId = id;
    if (id) {
        const habit = state.habits.find(h => h.id === id);
        elements.modalTitle.innerText = 'Edit Habit';
        elements.habitInput.value = habit.name;
    } else {
        elements.modalTitle.innerText = 'Add Habit';
        elements.habitInput.value = '';
    }
    elements.modal.classList.remove('hidden');
    elements.habitInput.focus();
}

function closeModal() {
    elements.modal.classList.add('hidden');
    state.editingId = null;
}

function deleteHabit(id) {
        if(confirm('Delete this habit?')) {
            state.habits = state.habits.filter(h => h.id !== id);
            saveToStorage();
        }
}

function handleSave() {
    const name = elements.habitInput.value.trim();
    if (!name) return;

    if (state.editingId) {
        const habit = state.habits.find(h => h.id === state.editingId);
        habit.name = name;
    } else {
        state.habits.push({
            id: Date.now(),
            name: name,
            completedDates: [],
            createdAt: new Date().toISOString()
        });
    }
    closeModal();
    saveToStorage();
}

function render() {
    const dates = getDates();
    const today = dates[6];
    
    // Progress Calculation
    const totalHabits = state.habits.length;
    const completedToday = state.habits.filter(h => h.completedDates.includes(today)).length;
    const percent = totalHabits === 0 ? 0 : Math.round((completedToday / totalHabits) * 100);
    
    elements.progressBar.style.width = `${percent}%`;
    elements.progressText.innerText = `${percent}%`;

    elements.habitList.innerHTML = '';

    if (state.habits.length === 0) {
        elements.habitList.innerHTML = `<div style="text-align:center; color:var(--text-muted); margin-top:40px;">No habits yet. Tap + to start!</div>`;
        return;
    }

    state.habits.forEach(habit => {
        const card = document.createElement('div');
        card.className = 'habit-card';
        
        let historyHtml = '';
        dates.forEach(date => {
            const isCompleted = habit.completedDates.includes(date);
            historyHtml += `
                <div class="day-cell">
                    <span class="day-label">${getDayName(date)}</span>
                    <div class="check-circle ${isCompleted ? 'completed' : ''}" 
                         onclick="toggleHabit(${habit.id}, '${date}')">
                    </div>
                </div>
            `;
        });

        card.innerHTML = `
            <div class="habit-header">
                <span class="habit-name">${habit.name}</span>
                <div class="habit-actions">
                    <button class="btn-icon" onclick="openModal(${habit.id})">✎</button>
                    <button class="btn-icon" onclick="deleteHabit(${habit.id})">✕</button>
                </div>
            </div>
            <div class="history-grid">
                ${historyHtml}
            </div>
        `;
        elements.habitList.appendChild(card);
    });
}

// Event Listeners
elements.addBtn.addEventListener('click', () => openModal());
elements.cancelBtn.addEventListener('click', closeModal);
elements.saveBtn.addEventListener('click', handleSave);

// Initial Render
render();
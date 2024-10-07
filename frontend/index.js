import { backend } from 'declarations/backend';

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

let currentYear, currentMonth;

const calendar = document.getElementById('calendar');
const dayDetail = document.getElementById('day-detail');
const detailDate = document.getElementById('detail-date');
const detailWeather = document.getElementById('detail-weather');
const notesList = document.getElementById('notes-list');
const noteInput = document.getElementById('note-input');
const addNoteBtn = document.getElementById('add-note-btn');
const closeDetailBtn = document.getElementById('close-detail');
const locationInput = document.getElementById('location');
const updateWeatherBtn = document.getElementById('update-weather');

function renderCalendar(year, month) {
    currentYear = year;
    currentMonth = month;
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = daysInMonth(year, month);

    calendar.innerHTML = `
        <h2>${monthNames[month]} ${year}</h2>
        <div class="weekdays">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
        </div>
        <div class="days"></div>
    `;

    const daysContainer = calendar.querySelector('.days');

    for (let i = 0; i < firstDay; i++) {
        daysContainer.appendChild(document.createElement('div'));
    }

    for (let day = 1; day <= totalDays; day++) {
        const dayElement = document.createElement('div');
        dayElement.textContent = day;
        dayElement.classList.add('day');

        const currentDate = new Date();
        if (year < currentDate.getFullYear() || 
            (year === currentDate.getFullYear() && month < currentDate.getMonth()) ||
            (year === currentDate.getFullYear() && month === currentDate.getMonth() && day < currentDate.getDate())) {
            dayElement.classList.add('past');
        } else {
            dayElement.addEventListener('click', () => showDayDetail(year, month, day));
            updateIncompleteNoteCount(year, month, day, dayElement);
        }

        daysContainer.appendChild(dayElement);
    }
}

async function updateIncompleteNoteCount(year, month, day, dayElement) {
    const date = `${year}-${month + 1}-${day}`;
    const count = await backend.getIncompleteNoteCount(date);
    const countElement = document.createElement('span');
    countElement.textContent = count;
    countElement.classList.add('note-count');
    dayElement.appendChild(countElement);
}

async function showDayDetail(year, month, day) {
    const date = `${year}-${month + 1}-${day}`;
    detailDate.textContent = `${monthNames[month]} ${day}, ${year}`;
    dayDetail.classList.remove('hidden');

    const weather = await backend.getWeather(date);
    detailWeather.textContent = weather ? `Weather: ${weather}` : 'No weather data available';

    const notes = await backend.getNotes(date);
    renderNotes(notes);

    addNoteBtn.onclick = () => addNote(date);
}

function renderNotes(notes) {
    notesList.innerHTML = '';
    notes.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.classList.add('note');
        noteElement.innerHTML = `
            <input type="checkbox" ${note.isCompleted ? 'checked' : ''}>
            <span>${note.content}</span>
        `;
        const checkbox = noteElement.querySelector('input');
        checkbox.addEventListener('change', () => updateNoteStatus(note.id, checkbox.checked));
        notesList.appendChild(noteElement);
    });
}

async function addNote(date) {
    const content = noteInput.value.trim();
    if (content) {
        await backend.addNote(date, content);
        noteInput.value = '';
        const notes = await backend.getNotes(date);
        renderNotes(notes);
        renderCalendar(currentYear, currentMonth);
    }
}

async function updateNoteStatus(noteId, isCompleted) {
    const date = `${currentYear}-${currentMonth + 1}-${detailDate.textContent.split(',')[0].split(' ')[1]}`;
    await backend.updateNoteStatus(date, noteId, isCompleted);
    const notes = await backend.getNotes(date);
    renderNotes(notes);
    renderCalendar(currentYear, currentMonth);
}

closeDetailBtn.addEventListener('click', () => {
    dayDetail.classList.add('hidden');
});

updateWeatherBtn.addEventListener('click', async () => {
    const location = locationInput.value.trim();
    if (location) {
        const result = await backend.getWeatherForecast(location);
        if (result.ok) {
            const weatherData = JSON.parse(result.ok);
            const weather = `${weatherData.weather[0].main}, ${weatherData.main.temp}°C`;
            const date = `${currentYear}-${currentMonth + 1}-${new Date().getDate()}`;
            await backend.setWeather(date, weather);
            alert(`Weather updated for ${location}: ${weather}`);
            renderCalendar(currentYear, currentMonth);
        } else {
            alert(`Failed to fetch weather: ${result.err}`);
        }
    }
});

const currentDate = new Date();
renderCalendar(currentDate.getFullYear(), currentDate.getMonth());

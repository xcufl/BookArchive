let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

function generateCalendar(month, year) {
    const calendarGrid = document.getElementById('calendar-grid');
    const monthYearLabel = document.getElementById('cal-month-year');
    
    calendarGrid.innerHTML = '';
    monthYearLabel.innerText = `${monthNames[month]} ${year}`;

    const daysShort = ['M', 'S', 'S', 'R', 'K', 'J', 'S'];
    daysShort.forEach(d => {
        const div = document.createElement('div');
        div.style.fontWeight = 'bold';
        div.innerText = d;
        calendarGrid.appendChild(div);
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        calendarGrid.appendChild(document.createElement('div'));
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.innerText = day;

        const monthStr = (month + 1).toString().padStart(2, '0');
        const dayStr = day.toString().padStart(2, '0');
        const dateStr = `${year}-${monthStr}-${dayStr}`;

        dayDiv.onclick = () => {
            document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('active'));
            dayDiv.classList.add('active');
            
            loadTasks(dateStr);
        };

        db.collection('tasks').where('deadline', '==', dateStr).get().then(snap => {
            if (!snap.empty) {
                dayDiv.classList.add('has-task');
            }
        });

        calendarGrid.appendChild(dayDiv);
    }
}

function changeMonth(dir) {
    currentMonth += dir;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    generateCalendar(currentMonth, currentYear);
}

generateCalendar(currentMonth, currentYear);

const bookedSlots = {
  '2024-06-26': ['12:00-14:00', '15:00-18:00'],
  // Add more pre-booked slots as needed
};

const today = new Date();
const todayDate = {
  year: today.getFullYear(),
  month: today.getMonth(),
  day: today.getDate()
};

function togglePage(currentPageId, nextPageId) {
  document.getElementById(currentPageId).classList.add('hidden');
  document.getElementById(nextPageId).classList.remove('hidden');
}

function goBack() {
  showCalendar();
}

function showCalendar() {
  togglePage('timeSlotPage', 'calendarPage');
}

function showTimeSlotPage(date) {
  togglePage('calendarPage', 'timeSlotPage');
  displayBookedSlots(date);
  resetTimeInputs();
}

function displayBookedSlots(date) {
  const timeSlotsDiv = document.getElementById('timeSlots');
  timeSlotsDiv.innerHTML = '';
  if (bookedSlots[date]) {
      bookedSlots[date].forEach(slot => {
          const slotDiv = document.createElement('div');
          slotDiv.textContent = slot;
          slotDiv.classList.add('booked');
          timeSlotsDiv.appendChild(slotDiv);
      });
  } else {
      timeSlotsDiv.innerHTML = '<p>No booked slots for this day.</p>';
  }
}

function resetTimeInputs() {
  document.getElementById('startTime').value = '';
  document.getElementById('endTime').value = '';
}

function bookSlot() {
  const date = selectedDate;
  const startTime = document.getElementById('startTime').value;
  const endTime = document.getElementById('endTime').value;
  const bookingMessage = document.getElementById('bookingMessage');

  if (!startTime || !endTime) {
      bookingMessage.textContent = 'Please select valid start and end times.';
      return;
  }

  if (isSlotBooked(date, startTime, endTime)) {
      bookingMessage.textContent = 'This time slot is already booked. Please select another time.';
      return;
  }

  if (!bookedSlots[date]) {
      bookedSlots[date] = [];
  }

  bookedSlots[date].push(`${startTime}-${endTime}`);
  bookingMessage.textContent = 'Slot booked successfully.';
  displayBookedSlots(date);
}

function isSlotBooked(date, startTime, endTime) {
  if (!bookedSlots[date]) return false;

  const newSlotStart = convertTimeToMinutes(startTime);
  const newSlotEnd = convertTimeToMinutes(endTime);

  return bookedSlots[date].some(slot => {
      const [slotStart, slotEnd] = slot.split('-').map(convertTimeToMinutes);
      return newSlotStart < slotEnd && newSlotEnd > slotStart;
  });
}

function convertTimeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function renderCalendar() {
  const year = document.getElementById('yearSelect').value;
  const month = document.getElementById('monthSelect').value;
  const calendarDiv = document.getElementById('calendar');

  calendarDiv.innerHTML = '';

  const daysInMonth = new Date(year, parseInt(month) + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
      const dayDiv = document.createElement('div');
      dayDiv.textContent = day;

      if (isPastDate(year, month, day)) {
          dayDiv.classList.add('past');
          dayDiv.onclick = () => {
              alert('Use future day');
          };
      } else if (isToday(year, month, day)) {
          dayDiv.classList.add('today');
          dayDiv.onclick = () => {
              selectedDate = `${year}-${parseInt(month) + 1}-${day}`;
              showTimeSlotPage(selectedDate);
          };
      } else {
          dayDiv.classList.add('future');
          dayDiv.onclick = () => {
              selectedDate = `${year}-${parseInt(month) + 1}-${day}`;
              showTimeSlotPage(selectedDate);
          };
      }

      calendarDiv.appendChild(dayDiv);
  }
}

function isPastDate(year, month, day) {
  if (year < todayDate.year) return true;
  if (year > todayDate.year) return false;
  if (month < todayDate.month) return true;
  if (month > todayDate.month) return false;
  return day < todayDate.day;
}

function isToday(year, month, day) {
  return year == todayDate.year && month == todayDate.month && day == todayDate.day;
}

function populateYearSelect() {
  const yearSelect = document.getElementById('yearSelect');
  const currentYear = todayDate.year;
  for (let year = currentYear; year <= currentYear + 10; year++) {
      const option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
  }
}

let selectedDate;

window.onload = () => {
  populateYearSelect();
  document.getElementById('yearSelect').value = todayDate.year;
  document.getElementById('monthSelect').value = todayDate.month;
  renderCalendar();
};

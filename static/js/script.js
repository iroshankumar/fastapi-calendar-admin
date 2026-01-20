/*************************************************
 * ADMIN CONFIG (HOLIDAYS + COLORS)
 *************************************************/
let HOLIDAYS = {};
let COLORS = {};

async function loadAdminConfig() {
  const res = await fetch("/api/holidays");
  const data = await res.json();

  HOLIDAYS = data.holidays || {};
  COLORS = data.colors || {};
}

/*************************************************
 * BASIC DOM REFERENCES
 *************************************************/
const calendarDiv = document.getElementById("calendar");
const yearSelect = document.getElementById("yearSelect");
const yearTitle = document.getElementById("yearTitle");

/*************************************************
 * YEAR DROPDOWN
 *************************************************/
for (let year = CURRENT_YEAR; year <= MAX_YEAR; year++) {
  const option = document.createElement("option");
  option.value = year;
  option.textContent = year;
  yearSelect.appendChild(option);
}

yearSelect.value = CURRENT_YEAR;

/*************************************************
 * CALENDAR RENDERING
 *************************************************/
async function loadCalendar(year) {
  calendarDiv.innerHTML = "";
  yearTitle.textContent = year;

  const response = await fetch(`/api/calendar/${year}`);
  const data = await response.json();

  Object.entries(data.months).forEach(([_, weeks], monthIndex) => {
    const monthDiv = document.createElement("div");
    monthDiv.className = "month";

    const title = document.createElement("h2");
    title.textContent = data.month_names[monthIndex];
    monthDiv.appendChild(title);

    const table = document.createElement("table");

    /* ---------- HEADER ---------- */
    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");

    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(day => {
      const th = document.createElement("th");
      th.textContent = day;
      headRow.appendChild(th);
    });

    thead.appendChild(headRow);
    table.appendChild(thead);

    /* ---------- BODY ---------- */
    const tbody = document.createElement("tbody");

    weeks.forEach(week => {
      const row = document.createElement("tr");

      week.forEach((day, index) => {
        const td = document.createElement("td");

        if (day !== 0) {
          td.textContent = day;

          // Weekend coloring (admin controlled)
          if (index === 0) {
            td.classList.add("sunday");
            if (COLORS.sunday) td.style.backgroundColor = COLORS.sunday;
          }

          if (index === 6) {
            td.classList.add("saturday");
            if (COLORS.saturday) td.style.backgroundColor = COLORS.saturday;
          }

          // Holiday logic (VISUAL ONLY)
          const dateKey = `${year}-${monthIndex + 1}-${day}`;

          if (HOLIDAYS[dateKey]) {
            td.classList.add("holiday");
            td.setAttribute("data-holiday", HOLIDAYS[dateKey]);
            if (COLORS.holiday) td.style.backgroundColor = COLORS.holiday;
          }
        }

        row.appendChild(td);
      });

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    monthDiv.appendChild(table);
    calendarDiv.appendChild(monthDiv);
  });
}

/*************************************************
 * INITIAL LOAD (IMPORTANT)
 *************************************************/
(async () => {
  await loadAdminConfig();   // 🔑 load admin data FIRST
  loadCalendar(CURRENT_YEAR);
})();

/*************************************************
 * YEAR CHANGE
 *************************************************/
yearSelect.addEventListener("change", async () => {
  await loadAdminConfig();
  loadCalendar(parseInt(yearSelect.value));
});

/*************************************************
 * LEAVE / WORKING DAY CALCULATOR
 *************************************************/
const calculateBtn = document.getElementById("calculateBtn");
const leaveResult = document.getElementById("leaveResult");

calculateBtn.addEventListener("click", async () => {
  const year = parseInt(yearSelect.value);

  const response = await fetch(`/api/calendar/${year}`);
  const data = await response.json();

  let totalSaturdays = 0;
  let totalSundays = 0;
  let totalWorkingDays = 0;

  const workingDays = Array.from(
    document.querySelectorAll('#leaveCalculator input[type="checkbox"]:checked')
  ).map(cb => parseInt(cb.value));

  Object.values(data.months).forEach(weeks => {
    weeks.forEach(week => {
      week.forEach((day, index) => {
        if (day !== 0) {
          if (index === 6) totalSaturdays++;
          if (index === 0) totalSundays++;
          if (workingDays.includes(index)) totalWorkingDays++;
        }
      });
    });
  });

  const sickLeave = parseFloat(document.getElementById("sickLeave").value) || 0;
  const casualLeave = parseFloat(document.getElementById("casualLeave").value) || 0;
  const holidays = parseFloat(document.getElementById("holidays").value) || 0;
  const shortLeaveHours = parseFloat(document.getElementById("shortLeave").value) || 0;

  const shortLeaveDays = shortLeaveHours / 8;

  const netWorkingDays =
    totalWorkingDays -
    sickLeave -
    casualLeave -
    holidays -
    shortLeaveDays;

  leaveResult.innerHTML = `
    Total Saturdays: ${totalSaturdays}<br>
    Total Sundays: ${totalSundays}<br>
    Total Working Days (selected): ${totalWorkingDays}<br>
    <hr>
    Net Working Days: ${netWorkingDays.toFixed(2)}
  `;
});

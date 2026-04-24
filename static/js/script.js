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

function getISTDateObject() {
  const now = new Date();
  const utcMillis = now.getTime() + now.getTimezoneOffset() * 60000;
  const istOffset = 5.5 * 60 * 60000;
  return new Date(utcMillis + istOffset);
}

function formatISTDate(now) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(now);
}

function updateCurrentDateIST() {
  const currentDateSpan = document.getElementById("currentDateIST");
  if (currentDateSpan) {
    currentDateSpan.textContent = formatISTDate(new Date());
  }
}

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

  Object.entries(data.months).forEach(([monthKey, weeks]) => {
    const month = parseInt(monthKey, 10);
    const monthDiv = document.createElement("div");
    monthDiv.className = "month";

    const title = document.createElement("h2");
    title.textContent = data.month_names[month - 1];
    monthDiv.appendChild(title);

    const table = document.createElement("table");

    let firstSaturdayDay = null;
    for (const week of weeks) {
      if (week[6] !== 0) {
        firstSaturdayDay = week[6];
        break;
      }
    }

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
          const dateKey = `${year}-${month}-${day}`;

          if (HOLIDAYS[dateKey]) {
            td.classList.add("holiday");
            td.setAttribute("data-holiday", HOLIDAYS[dateKey]);
            if (COLORS.holiday) td.style.backgroundColor = COLORS.holiday;
          }

          // First Saturday skin color override
          if (index === 6 && day === firstSaturdayDay) {
            td.classList.add("first-saturday");
            td.style.setProperty("background-color", "#F4D6B3", "important");
            td.style.color = "#000";
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
  updateCurrentDateIST();
})();

/*************************************************
 * YEAR CHANGE
 *************************************************/
yearSelect.addEventListener("change", async () => {
  await loadAdminConfig();
  loadCalendar(parseInt(yearSelect.value));
  updateCurrentDateIST();
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
  const extraWorkingDays = parseFloat(document.getElementById("extraWorkingDays").value) || 0;
  const calculateBalance = document.getElementById("balanceDaysToggle").checked;

  const shortLeaveDays = shortLeaveHours / 8;

  const netWorkingDays =
    totalWorkingDays +
    extraWorkingDays -
    sickLeave -
    casualLeave -
    holidays -
    shortLeaveDays;

  let balanceWorkingDays = 0;
  if (calculateBalance) {
    const now = new Date();
    const utcMillis = now.getTime() + now.getTimezoneOffset() * 60000;
    const istMillis = utcMillis + 5.5 * 60 * 60000;
    const currentIst = new Date(istMillis);
    const yearEnd = new Date(Date.UTC(currentIst.getUTCFullYear(), 11, 31));
    let currentDate = new Date(Date.UTC(
      currentIst.getUTCFullYear(),
      currentIst.getUTCMonth(),
      currentIst.getUTCDate()
    ));

    while (currentDate <= yearEnd) {
      const weekday = currentDate.getUTCDay();
      if (workingDays.includes(weekday)) {
        balanceWorkingDays++;
      }
      currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  leaveResult.innerHTML = `
    Total Saturdays: ${totalSaturdays}<br>
    Total Sundays: ${totalSundays}<br>
    Total Working Days (selected): ${totalWorkingDays}<br>
    Extra Working Days: ${extraWorkingDays}<br>
    ${calculateBalance ? `Balance Working Days to year end: ${balanceWorkingDays}<br>` : ""}
    <hr>
    Net Working Days: ${netWorkingDays.toFixed(2)}
  `;
});

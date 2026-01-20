let data = {};

async function loadData() {
  const res = await fetch("/api/holidays");
  data = await res.json();

  sundayColor.value = data.colors.sunday;
  saturdayColor.value = data.colors.saturday;
  holidayColor.value = data.colors.holiday;

  renderHolidays();
}

// function renderHolidays() {
//   const list = document.getElementById("holidayList");
//   list.innerHTML = "";

//   Object.entries(data.holidays).forEach(([date, name]) => {
//     const li = document.createElement("li");
//     li.innerHTML = `
//       ${date} - ${name}
//       <button onclick="deleteHoliday('${date}')">❌</button>
//     `;
//     list.appendChild(li);
//   });
// }

// function renderHolidays() {
//   const list = document.getElementById("holidayList");
//   list.innerHTML = "";

//   Object.entries(data.holidays).forEach(([date, name]) => {
//     const li = document.createElement("li");

//     li.innerHTML = `
//       ${date} - ${name}
//       <button onclick="deleteHoliday('${date}')">❌</button>
//     `;

//     list.appendChild(li);
//   });
// }



function renderHolidays() {
  const list = document.getElementById("holidayList");
  list.innerHTML = "";

  Object.entries(data.holidays).forEach(([date, name]) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span>${date} — ${name}</span>
      <button onclick="deleteHoliday('${date}')">✖</button>
    `;

    list.appendChild(li);
  });
}





function addHoliday() {
  const date = holidayDate.value;
  const name = holidayName.value;
  if (!date || !name) return;

  const [y, m, d] = date.split("-");
  data.holidays[`${y}-${parseInt(m)}-${parseInt(d)}`] = name;

  holidayDate.value = "";
  holidayName.value = "";
  renderHolidays();
}

function deleteHoliday(date) {
  delete data.holidays[date];
  renderHolidays();
}

async function saveAll() {
  data.colors.sunday = sundayColor.value;
  data.colors.saturday = saturdayColor.value;
  data.colors.holiday = holidayColor.value;

  await fetch("/api/holidays", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(data)
  });

  alert("Saved successfully");
}

loadData();

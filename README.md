Perfect 👍
Below is a **clean, professional, interview-ready `README.md`** for your project.
You can **copy–paste this directly** into a `README.md` file at the project root.

---

````md
# 📅 Calendar & Leave Management System (FastAPI)

A full-stack calendar application built using **FastAPI**, **Python Calendar library**, and **Vanilla JavaScript**, featuring a **secure admin panel** to manage holidays, colors, and calendar configuration dynamically.

---

## 🚀 Features

### 👤 User Side
- View full year calendar (current year → next 10 years)
- Automatically highlights:
  - Saturdays
  - Sundays
  - Holidays
- Hover on holidays to see holiday name
- Working Day & Leave Calculator:
  - Select working weekdays
  - Add sick leave, casual leave, holidays
  - Add yearly short leave (in hours)
  - Calculates net working days
- Accurate leap-year handling (Python calendar)

---

### 🔐 Admin Panel
- Secure admin login (session-based authentication)
- Add / remove holidays dynamically
- Manage colors for:
  - Sunday
  - Saturday
  - Holiday
- Changes reflect instantly on user calendar
- Logout functionality
- Configuration stored centrally (JSON)

---

## 🛠 Tech Stack

### Backend
- **FastAPI**
- **Python 3.13**
- `calendar` module
- Session middleware (Starlette)

### Frontend
- HTML + CSS
- Vanilla JavaScript
- Fetch API

### Security
- Session-based authentication
- Protected admin routes
- Server-side access control

---

## 📂 Project Structure

```bash
project/
├── app.py
├── data/
│   └── holidays.json
├── static/
│   ├── css/
│   │   ├── style.css
│   │   ├── admin.css
│   │   └── login.css
│   └── js/
│       ├── script.js
│       └── admin.js
├── templates/
│   ├── index.html
│   ├── admin.html
│   └── login.html
├── requirements.txt
└── README.md
````

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone <repo-url>
cd project
```

### 2️⃣ Create Virtual Environment

```bash
python -m venv myvenv
source myvenv/bin/activate   # macOS/Linux
myvenv\Scripts\activate      # Windows
```

### 3️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

### 4️⃣ Run Server

```bash
python -m uvicorn app:app --reload
```

---

## 🌐 Application URLs

| Feature       | URL                                                          |
| ------------- | ------------------------------------------------------------ |
| User Calendar | [http://127.0.0.1:8000](http://127.0.0.1:8000)               |
| Admin Login   | [http://127.0.0.1:8000/login](http://127.0.0.1:8000/login)   |
| Admin Panel   | [http://127.0.0.1:8000/admin](http://127.0.0.1:8000/admin)   |
| Logout        | [http://127.0.0.1:8000/logout](http://127.0.0.1:8000/logout) |

---

## 🔑 Admin Credentials (Demo)

```text
Username: admin
Password: admin123
```

> ⚠️ Change credentials & enable hashing before production use.

---

## 📊 Leave Calculator Logic

* Working days counted based on selected weekdays
* Weekends and holidays are **visual only**
* Short leave:

  * 8 hours = 1 working day
* Final calculation:

```text
Net Working Days =
  Total Working Days
  - Sick Leave
  - Casual Leave
  - Holidays
  - Short Leave (converted to days)
```

---

## 🧠 Design Principles

* Backend is the **single source of truth**
* UI changes do not affect business logic
* Admin controls configuration without code changes
* Clear separation of:

  * UI
  * Logic
  * Configuration
  * Security

---

## 🔮 Future Enhancements

* Password hashing (bcrypt)
* Role-based access
* Database support (PostgreSQL / SQLite)
* Company-wise calendars
* Export reports (PDF / Excel)
* Admin audit logs
* Deployment (Render / AWS / Railway)

---

## 👨‍💻 Author

Built with ❤️ using FastAPI
This project demonstrates **real-world backend & full-stack concepts**, suitable for interviews and production learning.

---

## 📜 License

This project is open-source and free to use for learning purposes.

```

---

If you want, next I can:
- Add **screenshots section** to README
- Add **API documentation**
- Prepare **deployment README**
- Make it **GitHub-ready**

Just tell me 🚀
```

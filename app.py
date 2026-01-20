# from fastapi import FastAPI, Request
# from fastapi.staticfiles import StaticFiles
# from fastapi.templating import Jinja2Templates

# app = FastAPI()

# # Serve static files
# app.mount("/static", StaticFiles(directory="static"), name="static")

# # Templates
# templates = Jinja2Templates(directory="templates")

# @app.get("/")
# async def home(request: Request):
#     return templates.TemplateResponse(
#         "index.html",
#         {"request": request}
#     )









# from fastapi import FastAPI, Request
# from fastapi.staticfiles import StaticFiles
# from fastapi.templating import Jinja2Templates
# from fastapi.responses import HTMLResponse

# app = FastAPI()

# app.mount("/static", StaticFiles(directory="static"), name="static")

# templates = Jinja2Templates(directory="templates")


# @app.get("/", response_class=HTMLResponse)
# async def home(request: Request):
#     return templates.TemplateResponse(
#         "index.html",
#         {"request": request}
#     )




# from fastapi import Form
# from fastapi.responses import RedirectResponse
# from starlette.middleware.sessions import SessionMiddleware

# from fastapi import FastAPI, Request, HTTPException
# from fastapi.responses import HTMLResponse, JSONResponse
# from fastapi.staticfiles import StaticFiles
# from fastapi.templating import Jinja2Templates
# import calendar
# from datetime import datetime
# import json
# from pathlib import Path


# app = FastAPI()

# app.mount("/static", StaticFiles(directory="static"), name="static")
# templates = Jinja2Templates(directory="templates")

# CURRENT_YEAR = datetime.now().year
# MAX_YEAR = CURRENT_YEAR + 10


# @app.get("/", response_class=HTMLResponse)
# async def home(request: Request):
#     return templates.TemplateResponse(
#         "index.html",
#         {
#             "request": request,
#             "current_year": CURRENT_YEAR,
#             "max_year": MAX_YEAR
#         }
#     )


# @app.get("/api/calendar/{year}")
# async def get_calendar(year: int):
#     if year < CURRENT_YEAR or year > MAX_YEAR:
#         raise HTTPException(status_code=400, detail="Year out of range")

#     cal = calendar.Calendar(firstweekday=6)  # Sunday start
#     months = {}

#     for month in range(1, 13):
#         months[month] = cal.monthdayscalendar(year, month)

#     return JSONResponse({
#         "year": year,
#         "months": months,
#         "month_names": list(calendar.month_name)[1:],
#         "weekdays": list(calendar.day_abbr)
#     })


# DATA_FILE = Path("data/holidays.json")


# def read_data():
#     with open(DATA_FILE, "r") as f:
#         return json.load(f)


# def write_data(data):
#     with open(DATA_FILE, "w") as f:
#         json.dump(data, f, indent=2)


# @app.get("/api/holidays")
# async def get_holidays():
#     return read_data()


# @app.post("/api/holidays")
# async def save_holidays(payload: dict):
#     write_data(payload)
#     return {"status": "saved"}


# @app.get("/admin", response_class=HTMLResponse)
# async def admin_page(request: Request):
#     return templates.TemplateResponse("admin.html", {"request": request})




from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.middleware.sessions import SessionMiddleware
import calendar
from datetime import datetime
import json
from pathlib import Path

app = FastAPI()

app.add_middleware(
    SessionMiddleware,
    secret_key="super-secret-admin-key"
)

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

DATA_FILE = Path("data/holidays.json")

CURRENT_YEAR = datetime.now().year
MAX_YEAR = CURRENT_YEAR + 10

# ---------------- ADMIN CREDENTIALS ----------------
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"

# ---------------- UTIL ----------------
def read_data():
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def write_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)

# ---------------- USER CALENDAR ----------------
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse(
        "index.html",
        {"request": request, "current_year": CURRENT_YEAR, "max_year": MAX_YEAR}
    )

@app.get("/api/calendar/{year}")
async def get_calendar(year: int):
    cal = calendar.Calendar(firstweekday=6)
    months = {m: cal.monthdayscalendar(year, m) for m in range(1, 13)}

    return {
        "year": year,
        "months": months,
        "month_names": list(calendar.month_name)[1:],
        "weekdays": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    }

# ---------------- LOGIN ----------------
@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.post("/login")
async def login(
    request: Request,
    username: str = Form(...),
    password: str = Form(...)
):
    if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
        request.session["admin"] = True
        return RedirectResponse("/admin", status_code=302)

    return templates.TemplateResponse(
        "login.html",
        {"request": request, "error": "Invalid username or password"}
    )

@app.get("/logout")
async def logout(request: Request):
    request.session.clear()
    return RedirectResponse("/login", status_code=302)

# ---------------- ADMIN PANEL ----------------
@app.get("/admin", response_class=HTMLResponse)
async def admin_page(request: Request):
    if not request.session.get("admin"):
        return RedirectResponse("/login", status_code=302)

    return templates.TemplateResponse("admin.html", {"request": request})

# ---------------- ADMIN APIs ----------------
@app.get("/api/holidays")
async def get_holidays(request: Request):
    if not request.session.get("admin"):
        return JSONResponse({"error": "Unauthorized"}, status_code=401)
    return read_data()

@app.post("/api/holidays")
async def save_holidays(request: Request, payload: dict):
    if not request.session.get("admin"):
        return JSONResponse({"error": "Unauthorized"}, status_code=401)
    write_data(payload)
    return {"status": "saved"}

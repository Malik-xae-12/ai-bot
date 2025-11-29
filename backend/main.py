import os
import pyodbc
import requests
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    message: str

# ENV
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
DB_CONN = os.getenv("DB_CONNECTION_STRING")

# --------------------------------------
# DB EXECUTION
# --------------------------------------
def run_sql(sql: str):
    try:
        conn = pyodbc.connect(DB_CONN)
        cursor = conn.cursor()

        cursor.execute(sql)
        cols = [c[0] for c in cursor.description]
        rows = cursor.fetchall()

        results = [dict(zip(cols, r)) for r in rows]

        cursor.close()
        conn.close()

        return results

    except Exception as e:
        return {"error": str(e)}

# --------------------------------------
# DETECT IF QUESTION IS DB RELATED
# --------------------------------------
def is_db_question(question: str):
    keywords = [
        "project", "task", "stage", "user", "role",
        "projects", "tasks", "stages", "users", "roles",
        "database", "db", "query", "sql",
        "list", "show", "fetch", "assigned", "status"
    ]
    q = question.lower()
    return any(word in q for word in keywords)

# --------------------------------------
# NORMAL CHAT MODE
# --------------------------------------
def normal_chat(question: str):
    identity_prompt = """
You are Malik's personal AI assistant.

Your personality:
- Friendly
- Helpful
- Clear communication
- Short and natural answers
- Warm greetings
- Introduce yourself clearly if asked "who are you?"

Examples:
User: hi
AI: Hi! 😊 How can I help you today?

User: who are you?
AI: I'm your personal AI assistant here to help you with database queries and anything else you need.
"""

    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        "gemini-2.5-flash:generateContent?key=" + GEMINI_API_KEY
    )

    body = {
        "contents": [
            {"role": "user", "parts": [{"text": identity_prompt}]},
            {"role": "user", "parts": [{"text": question}]}
        ]
    }

    res = requests.post(url, json=body).json()

    try:
        return res["candidates"][0]["content"]["parts"][0]["text"]
    except:
        return "Sorry, I couldn’t respond."

# --------------------------------------
# GENERATE SQL FROM ENGLISH
# --------------------------------------
def generate_sql(question: str):

    prompt = f"""
You are an expert SQL generator for Microsoft SQL Server.
Your ONLY job is converting English questions into SQL SELECT queries.

DATABASE SCHEMA:

TABLE Roles(RoleID INT, RoleName VARCHAR)
TABLE Users(UserID INT, FullName VARCHAR, Email VARCHAR, RoleID INT)
TABLE Projects(ProjectID INT, ProjectName VARCHAR, Description VARCHAR, StartDate DATE, EndDate DATE, CreatedBy INT)
TABLE Stages(StageID INT, ProjectID INT, StageName VARCHAR, StageOrder INT)
TABLE Tasks(TaskID INT, StageID INT, TaskName VARCHAR, Description VARCHAR, AssignedTo INT, Status VARCHAR, DueDate DATE)

Relationships:
Projects.CreatedBy = Users.UserID
Stages.ProjectID = Projects.ProjectID
Tasks.StageID = Stages.StageID
Tasks.AssignedTo = Users.UserID

RULES:
- RETURN ONLY SQL (no explanation).
- ONLY SELECT queries.
- NEVER use INSERT, UPDATE, DELETE, DROP.
- Use correct JOINs when needed.

User question: {question}

Return only SQL:
"""

    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        "gemini-2.5-flash:generateContent?key=" + GEMINI_API_KEY
    )

    body = {
        "contents": [
            {"role": "user", "parts": [{"text": prompt}]}
        ]
    }

    res = requests.post(url, json=body).json()

    try:
        sql = res["candidates"][0]["content"]["parts"][0]["text"]
        return sql.replace("```sql", "").replace("```", "").strip()
    except Exception:
        print("DEBUG: Failed SQL response:", res)
        return None

# --------------------------------------
# SUMMARIZE DB RESULTS
# --------------------------------------
def summarize(question: str, data):
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        "gemini-2.5-flash:generateContent?key=" + GEMINI_API_KEY
    )

    prompt = f"""
Summarize the database results in simple English.

Question: {question}
Database Results: {data}

Give a short, clear explanation.
"""

    body = {"contents": [{"parts": [{"text": prompt}]}]}

    res = requests.post(url, json=body).json()

    try:
        return res["candidates"][0]["content"]["parts"][0]["text"]
    except:
        return "I could not summarize the results."

# --------------------------------------
# MAIN ENDPOINT
# --------------------------------------
@app.post("/ask")
def ask_ai(q: Query):

    print("\n---------------------------")
    print("USER QUESTION:", q.message)

    # 1️⃣ DETECT MODE
    if not is_db_question(q.message):
        print("MODE: NORMAL CHAT")
        answer = normal_chat(q.message)
        return {
            "sql": None,
            "data": None,
            "answer": answer
        }

    print("MODE: DATABASE QUERY")

    # 2️⃣ SQL GENERATION
    sql = generate_sql(q.message)
    print("GENERATED SQL:", sql)

    if not sql:
        return {"error": "SQL generation failed"}

    # 3️⃣ SQL EXECUTION
    db_result = run_sql(sql)
    print("DB RESULT:", db_result)

    # 4️⃣ SUMMARIZE
    summary = summarize(q.message, db_result)
    print("SUMMARY:", summary)

    return {
        "sql": sql,
        "data": db_result,
        "answer": summary
    }

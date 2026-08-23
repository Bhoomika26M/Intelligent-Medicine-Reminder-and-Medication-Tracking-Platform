"""
TinyDB setup.
All data is stored in JSON files inside the data/ folder so it persists after restart.
"""
import os
from tinydb import TinyDB, Query

# Keep all JSON files in backend/data/
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(DATA_DIR, exist_ok=True)

# One JSON file per collection (easy to inspect during a demo)
db = TinyDB(os.path.join(DATA_DIR, "pillsync.json"))

users_table = db.table("users")
medicines_table = db.table("medicines")
history_table = db.table("history")
reminders_table = db.table("reminders")

User = Query()
Medicine = Query()
History = Query()
Reminder = Query()

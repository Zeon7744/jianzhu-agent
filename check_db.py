import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "src", "data", "db", "jianjian.db")
conn = sqlite3.connect(DB_PATH)
tables = [r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
print("Tables:", tables)
for t in tables:
    try:
        cnt = conn.execute(f"SELECT COUNT(*) FROM [{t}]").fetchone()[0]
        print(f"  {t}: {cnt} rows")
    except:
        pass
conn.close()

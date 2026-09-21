import sqlite3
conn = sqlite3.connect(r"D:\项目\开发部\开发git\02\建筑行业检测及信息咨询公司agent\src\data\db\jianjian.db")
cur = conn.cursor()
cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
for t in cur.fetchall():
    cur.execute(f"SELECT COUNT(*) FROM [{t[0]}]")
    print(f"  {t[0]}: {cur.fetchone()[0]} rows")
conn.close()

import sys, json
sys.stdout.reconfigure(encoding='utf-8')
import sqlite3
import urllib.request

base = r"D:\项目\开发部\开发git\02\建筑行业检测及信息咨询公司agent"
db_path = base + r"\src\data\db\jianjian.db"
API = "http://localhost:8000"

print("=" * 60)
print("  建检智管 - 系统完整性检查")
print("=" * 60)

# 1. Database check
print("\n【数据库】")
conn = sqlite3.connect(db_path)
c = conn.cursor()
for t in ['projects','inspections','staff','transactions','equipment','customers','knowledge','agent_logs']:
    c.execute(f'SELECT COUNT(*) FROM [{t}]')
    cnt = c.fetchone()[0]
    status = "OK" if cnt > 0 else "EMPTY"
    print(f"  {t:15s} : {cnt:4d} rows  [{status}]")
conn.close()

# 2. API endpoints check
print("\n【后端 API】")
endpoints = [
    "/api/health",
    "/api/projects",
    "/api/inspections",
    "/api/staff",
    "/api/transactions",
    "/api/equipment",
    "/api/customers",
    "/api/knowledge",
    "/api/agent-logs",
    "/api/stats/dashboard",
    "/api/finance/stats",
]
for ep in endpoints:
    try:
        req = urllib.request.Request(API + ep)
        resp = urllib.request.urlopen(req, timeout=5)
        data = json.loads(resp.read().decode())
        cnt = len(data) if isinstance(data, list) else "dict"
        print(f"  {ep:30s} : {resp.status}  ({cnt})")
    except Exception as e:
        print(f"  {ep:30s} : ERROR - {e}")

# 3. Frontend check
print("\n【前端】")
try:
    req = urllib.request.Request("http://localhost:3000")
    resp = urllib.request.urlopen(req, timeout=5)
    print(f"  http://localhost:3000 : {resp.status} OK")
except Exception as e:
    print(f"  Frontend : ERROR - {e}")

# 4. Data quality check
print("\n【数据质量】")
conn = sqlite3.connect(db_path)
c = conn.cursor()
# Check staff has certs
c.execute("SELECT COUNT(*) FROM staff WHERE certs='[]' OR certs IS NULL")
no_certs = c.fetchone()[0]
c.execute("SELECT COUNT(*) FROM staff WHERE certs != '[]' AND certs IS NOT NULL")
with_certs = c.fetchone()[0]
print(f"  员工持证: {with_certs}人, 未持证: {no_certs}人")

# Check equipment cert status
c.execute("SELECT COUNT(*) FROM equipment WHERE status='warning'")
warn = c.fetchone()[0]
print(f"  设备预警: {warn}台")

# Check project risks
c.execute("SELECT COUNT(*) FROM projects WHERE risk='high'")
high_risk = c.fetchone()[0]
print(f"  高风险项目: {high_risk}个")

# Check knowledge categories
c.execute("SELECT category, COUNT(*) FROM knowledge GROUP BY category")
cats = c.fetchall()
print(f"  知识分类: {len(cats)}类")
for cat, cnt in cats:
    print(f"    - {cat}: {cnt}篇")

conn.close()

print("\n" + "=" * 60)
print("  检查完成!")
print("=" * 60)

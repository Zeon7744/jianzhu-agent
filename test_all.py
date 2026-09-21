# -*- coding: utf-8 -*-
"""系统完整性检查 - 跨平台版本 (Windows/Linux/macOS)"""
import sys
import json
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')
import sqlite3
import urllib.request

# 跨平台路径
BASE = Path(__file__).parent
DB_PATH = str(BASE / "src" / "data" / "db" / "jianjian.db")
API_BASE = "http://localhost:8000"

print("=" * 60)
print("  建检智管 - 系统完整性检查")
print("=" * 60)

# 【数据库】
print("\n【数据库】")
try:
    conn = sqlite3.connect(DB_PATH)
    tables = [
        'projects', 'inspections', 'staff', 'transactions', 'equipment',
        'customers', 'knowledge', 'agent_logs', 'contracts', 'reports',
        'suppliers', 'materials', 'procurement', 'quality_checks',
        'safety_records', 'budget_items', 'policies', 'qualifications',
        'training_records', 'business_processes', 'process_steps', 'org_departments'
    ]
    for t in tables:
        try:
            cnt = conn.execute(f'SELECT COUNT(*) FROM [{t}]').fetchone()[0]
            status = 'OK' if cnt > 0 else 'EMPTY'
            print(f"  {t:25s}: {cnt:4d} rows  [{status}]")
        except:
            print(f"  {t:25s}: TABLE NOT FOUND")
    conn.close()
except Exception as e:
    print(f"  [ERROR] Database: {e}")

# 【后端 API】
print("\n【后端 API】")
apis = [
    '/api/health', '/api/projects', '/api/inspections', '/api/staff',
    '/api/transactions', '/api/equipment', '/api/customers',
    '/api/knowledge', '/api/agent-logs', '/api/stats/dashboard',
    '/api/finance/stats', '/api/policies', '/api/qualifications',
    '/api/org/departments',
]
for api in apis:
    try:
        r = urllib.request.urlopen(API_BASE + api, timeout=3)
        data = json.loads(r.read())
        if isinstance(data, list):
            print(f"  {api:35s}: {r.status}  ({len(data)})")
        elif isinstance(data, dict):
            print(f"  {api:35s}: {r.status}  (dict)")
    except Exception as e:
        print(f"  {api:35s}: ERROR - {e}")

# 【前端】
print("\n【前端】")
try:
    r = urllib.request.urlopen("http://localhost:3000", timeout=3)
    print(f"  http://localhost:3000 : {r.status} OK")
except Exception as e:
    print(f"  http://localhost:3000 : ERROR - {e}")

# 【数据质量】
print("\n【数据质量】")
try:
    conn = sqlite3.connect(DB_PATH)
    # 员工持证情况
    total_staff = conn.execute("SELECT COUNT(*) FROM staff WHERE status='active'").fetchone()[0]
    cert_staff = conn.execute("SELECT COUNT(*) FROM staff WHERE certs IS NOT NULL AND certs != '[]' AND status='active'").fetchone()[0]
    no_cert = total_staff - cert_staff
    print(f"  员工持证: {cert_staff}人, 未持证: {no_cert}人")

    # 设备预警
    warn_equip = conn.execute("SELECT COUNT(*) FROM equipment WHERE status='warning'").fetchone()[0]
    print(f"  设备预警: {warn_equip}台")

    # 高风险项目
    high_risk = conn.execute("SELECT COUNT(*) FROM projects WHERE risk='high' AND status='active'").fetchone()[0]
    print(f"  高风险项目: {high_risk}个")

    # 知识分类
    cats = conn.execute("SELECT category, COUNT(*) as cnt FROM knowledge GROUP BY category ORDER BY cnt DESC LIMIT 5").fetchall()
    print(f"  知识分类: {len(cats)}类 (TOP5)")
    for row in cats:
        print(f"    - {row[0]}: {row[1]}篇")

    # 资质到期
    expiring = conn.execute("SELECT COUNT(*) FROM qualifications WHERE expiry_date <= date('now', '+90 days') AND status='active'").fetchone()[0]
    print(f"  资质即将到期(90天内): {expiring}项")
    conn.close()
except Exception as e:
    print(f"  [WARN] Data quality check: {e}")

print("\n" + "=" * 60)
print("  检查完成!")
print("=" * 60)

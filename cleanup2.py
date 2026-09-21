import os, sys
sys.stdout.reconfigure(encoding='utf-8')
base = r"D:\项目\开发部\开发git\02\建筑行业检测及信息咨询公司agent"
temps = [
    "src/backend/init_rbac.py",
    "src/backend/update_rbac.py",
    "src/backend/check_rbac.py",
    "src/frontend/update_dashboard.py",
    "src/frontend/update_finance.py",
    "src/frontend/update_agents.py",
    "src/frontend/update_compliance.py",
]
for t in temps:
    p = os.path.join(base, t)
    if os.path.exists(p):
        os.remove(p)
        print(f"Removed: {t}")
print("Cleanup done")

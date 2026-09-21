import os, sys
sys.stdout.reconfigure(encoding='utf-8')

base = r"D:\项目\开发部\开发git\02\建筑行业检测及信息咨询公司agent"
temp_files = [
    "src\\backend\\fix.py",
    "src\\backend\\fix2.py",
    "src\\backend\\fix3.py",
    "src\\backend\\debug_fix.py",
    "src\\backend\\dump_line.py",
    "src\\backend\\fix_get.py",
    "src\\backend\\fix_get2.py",
    "src\\backend\\check_routes.py",
    "src\\backend\\update_backend.py",
    "src\\backend\\expand_data.py",
    "src\\frontend\\update_dashboard.py",
    "src\\frontend\\update_finance.py",
    "src\\frontend\\update_agents.py",
    "src\\frontend\\update_compliance.py",
    "src\\frontend\\check_apis.py",
    "src\\frontend\\check_app.py",
    "analyze.py",
]

for f in temp_files:
    fp = os.path.join(base, f)
    if os.path.exists(fp):
        os.remove(fp)
        print(f"  Removed: {f}")

print("Cleanup complete!")

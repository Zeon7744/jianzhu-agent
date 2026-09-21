# Fix dashboard_stats: sqlite3.Row doesn't support .get()
path = r"D:\项目\开发部\开发git\02\建筑行业检测及信息咨询公司agent\src\backend\app.py"

with open(path, encoding="utf-8") as f:
    lines = f.readlines()

# Line 463: t.get('date') -> t['date'] (Row supports index access but not .get())
# Line 464: same fix
for i in range(len(lines)):
    if "t.get('date')" in lines[i]:
        lines[i] = lines[i].replace("t.get('date')", "t['date']")
        print(f"Fixed line {i+1}: {repr(lines[i].strip())}")

with open(path, "w", encoding="utf-8") as f:
    f.writelines(lines)

import ast
ast.parse(open(path, encoding="utf-8").read())
print("Syntax OK!")

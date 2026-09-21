import re

path = r'D:\项目\开发部\开发git\02\建筑行业检测及信息咨询公司agent\expand_enterprise_v2.py'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

# Remove the ALTER TABLE line
c = c.replace('c.execute("ALTER TABLE org_departments ADD COLUMN updated_at TEXT")\nprint("Added updated_at to org_departments")\n\n', '')

# Fix dept tuples - add today as 9th value
c = re.sub(
    r"('DEPT\d+', '[^']+', '[^']*', '[^']*', \d+, '[^']+', today\))",
    r"\1, today)",
    c
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(c)
print('Fixed')

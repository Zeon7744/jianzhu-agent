# -*- coding: utf-8 -*-
"""Add quality, safety, budget APIs to FastAPI backend"""
import sys
sys.stdout.reconfigure(encoding='utf-8')

path = r"D:\项目\开发部\开发git\02\建筑行业检测及信息咨询公司agent\src\backend\app.py"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Check if endpoints already exist
if '/api/quality-checks' in content:
    print("Endpoints already exist, skipping")
    sys.exit(0)

# Find where to insert - after the /api/procurement endpoint
insert_after = '''@app.get('/api/procurement')
def list_procurement(material_id: str = Query(None), status: str = Query(None)):
    conn = get_db()
    wheres, ps = [], []
    if material_id:
        wheres.append('material_id=?')
        ps.append(material_id)
    if status:
        wheres.append('status=?')
        ps.append(status)
    sql = 'SELECT * FROM procurement'
    if wheres:
        sql += ' WHERE ' + ' AND '.join(wheres)
    sql += ' ORDER BY order_date DESC'
    rows = conn.execute(sql, ps).fetchall()
    conn.close()
    return [dict(r) for r in rows]'''

new_endpoints = '''

# ==================== 质检管理API ====================
@app.get('/api/quality-checks')
def list_quality_checks(project_id: str = Query(None), result: str = Query(None)):
    conn = get_db()
    wheres, ps = [], []
    if project_id:
        wheres.append('project_id=?')
        ps.append(project_id)
    if result:
        wheres.append('result=?')
        ps.append(result)
    sql = 'SELECT * FROM quality_checks'
    if wheres:
        sql += ' WHERE ' + ' AND '.join(wheres)
    sql += ' ORDER BY plan_date DESC'
    rows = conn.execute(sql, ps).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post('/api/quality-checks')
def create_quality_check(data: dict):
    conn = get_db()
    now = datetime.now().isoformat()
    cid = f"QC{datetime.now().strftime('%Y%m%d')}{len(conn.execute('SELECT * FROM quality_checks').fetchall()) + 1:03d}"
    data['id'] = cid
    data['created_at'] = data['updated_at'] = now
    data.setdefault('result', '待检')
    data.setdefault('status', 'pending')
    data.setdefault('notes', '')
    keys = list(data.keys())
    placeholders = ','.join(['?'] * len(keys))
    conn.execute(f"INSERT INTO quality_checks ({','.join(keys)}) VALUES ({placeholders})", list(data.values()))
    conn.commit()
    conn.close()
    return {'id': cid, 'message': '质检记录创建成功'}

@app.put('/api/quality-checks/{check_id}')
def update_quality_check(check_id: str, data: dict):
    conn = get_db()
    data['updated_at'] = datetime.now().isoformat()
    sets = ','.join([f'{k}=?' for k in data.keys()])
    conn.execute(f'UPDATE quality_checks SET {sets} WHERE id=?', list(data.values()) + [check_id])
    conn.commit()
    conn.close()
    return {'message': '质检记录更新成功'}

# ==================== 安全管理API ====================
@app.get('/api/safety-records')
def list_safety_records(project_id: str = Query(None), level: str = Query(None)):
    conn = get_db()
    wheres, ps = [], []
    if project_id:
        wheres.append('project_id=?')
        ps.append(project_id)
    if level:
        wheres.append('level=?')
        ps.append(level)
    sql = 'SELECT * FROM safety_records'
    if wheres:
        sql += ' WHERE ' + ' AND '.join(wheres)
    sql += ' ORDER BY created_at DESC'
    rows = conn.execute(sql, ps).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post('/api/safety-records')
def create_safety_record(data: dict):
    conn = get_db()
    now = datetime.now().isoformat()
    sid = f"SA{datetime.now().strftime('%Y%m%d')}{len(conn.execute('SELECT * FROM safety_records').fetchall()) + 1:03d}"
    data['id'] = sid
    data['created_at'] = now
    data.setdefault('status', 'open')
    data.setdefault('resolution', '')
    keys = list(data.keys())
    placeholders = ','.join(['?'] * len(keys))
    conn.execute(f"INSERT INTO safety_records ({','.join(keys)}) VALUES ({placeholders})", list(data.values()))
    conn.commit()
    conn.close()
    return {'id': sid, 'message': '安全记录创建成功'}

# ==================== 预算管理API ====================
@app.get('/api/budget-items')
def list_budget_items(project_id: str = Query(None)):
    conn = get_db()
    sql = 'SELECT * FROM budget_items'
    if project_id:
        sql += f' WHERE project_id=?'
        rows = conn.execute(sql, [project_id]).fetchall()
    else:
        rows = conn.execute(sql).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post('/api/budget-items')
def create_budget_item(data: dict):
    conn = get_db()
    now = datetime.now().isoformat()
    bid = f"BD{len(conn.execute('SELECT * FROM budget_items').fetchall()) + 1:03d}"
    data['id'] = bid
    data['created_at'] = now
    data.setdefault('budget', 0)
    data.setdefault('actual', 0)
    data.setdefault('unit', '元')
    data.setdefault('quantity', 0)
    keys = list(data.keys())
    placeholders = ','.join(['?'] * len(keys))
    conn.execute(f"INSERT INTO budget_items ({','.join(keys)}) VALUES ({placeholders})", list(data.values()))
    conn.commit()
    conn.close()
    return {'id': bid, 'message': '预算项目创建成功'}'''

if insert_after in content:
    content = content.replace(insert_after, insert_after + new_endpoints)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Added quality/safety/budget API endpoints")
else:
    print("Insert point not found, trying alternative...")
    # Find the procurement endpoint and insert after it
    idx = content.find("@app.get('/api/procurement')")
    if idx >= 0:
        # Find the end of this function (next @app or end of file)
        end_idx = content.find("\n@app.", idx + 1)
        if end_idx < 0:
            end_idx = len(content)
        insert_point = content[:end_idx]
        rest = content[end_idx:]
        content = insert_point + new_endpoints + rest
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print("Added endpoints via alternative method")
    else:
        print("ERROR: Could not find insertion point")

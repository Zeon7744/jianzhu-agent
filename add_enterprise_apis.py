# -*- coding: utf-8 -*-
"""Append enterprise management APIs to app.py"""

APP_PATH = r'D:\项目\开发部\开发git\02\建筑行业检测及信息咨询公司agent\src\backend\app.py'

API_BLOCK = r'''
# ==================== 企业制度管理 API ====================
@app.get('/api/policies')
def get_policies(category: str = Query(None), status: str = Query(None)):
    conn = get_db()
    query = 'SELECT * FROM policies WHERE 1=1'
    params = []
    if category:
        query += ' AND category = ?'
        params.append(category)
    if status:
        query += ' AND status = ?'
        params.append(status)
    query += ' ORDER BY created_at DESC'
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post('/api/policies')
def create_policy(body: dict):
    today = date.today().isoformat()
    conn = get_db()
    pid = body.get('id', f'POL{len(conn.execute("SELECT * FROM policies").fetchall()) + 1:03d}')
    try:
        conn.execute(
            'INSERT INTO policies (id, title, category, level, department, version, effective_date, expiry_date, author, approver, status, content, attachments, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
            (pid, body.get('title'), body.get('category'), body.get('level', 'department'), body.get('department'), body.get('version', 'v1.0'),
             body.get('effective_date'), body.get('expiry_date'), body.get('author'), body.get('approver'), body.get('status', 'active'),
             body.get('content', ''), body.get('attachments', '[]'), today, today)
        )
        conn.commit(); conn.close()
        return {'id': pid, 'message': '制度创建成功'}
    except Exception as e:
        conn.close(); raise HTTPException(status_code=400, detail=str(e))

@app.put('/api/policies/{policy_id}')
def update_policy(policy_id: str, body: dict):
    today = date.today().isoformat()
    conn = get_db()
    try:
        conn.execute(
            'UPDATE policies SET title=?, category=?, level=?, department=?, version=?, effective_date=?, expiry_date=?, author=?, approver=?, status=?, content=?, attachments=?, updated_at=? WHERE id=?',
            (body.get('title'), body.get('category'), body.get('level', 'department'), body.get('department'), body.get('version', 'v1.0'),
             body.get('effective_date'), body.get('expiry_date'), body.get('author'), body.get('approver'), body.get('status', 'active'),
             body.get('content', ''), body.get('attachments', '[]'), today, policy_id)
        )
        conn.commit(); conn.close()
        return {'message': '制度更新成功'}
    except Exception as e:
        conn.close(); raise HTTPException(status_code=400, detail=str(e))

@app.delete('/api/policies/{policy_id}')
def delete_policy(policy_id: str):
    conn = get_db()
    conn.execute('DELETE FROM policies WHERE id=?', (policy_id,))
    conn.commit(); conn.close()
    return {'message': '制度已删除'}

@app.get('/api/stats/policies')
def policy_stats():
    conn = get_db()
    total = conn.execute('SELECT COUNT(*) FROM policies').fetchone()[0]
    active = conn.execute("SELECT COUNT(*) FROM policies WHERE status='active'").fetchone()[0]
    expired = conn.execute("SELECT COUNT(*) FROM policies WHERE status='expired'").fetchone()[0]
    expiring_rows = conn.execute("SELECT COUNT(*) FROM policies WHERE status='active' AND expiry_date IS NOT NULL AND expiry_date <= date('now', '+90 days')").fetchone()[0]
    conn.close()
    return {'total': total, 'active': active, 'expired': expired, 'expiring_soon': expiring_rows}

# ==================== 资质管理 API ====================
@app.get('/api/qualifications')
def get_qualifications():
    conn = get_db()
    rows = conn.execute('SELECT * FROM qualifications ORDER BY created_at DESC').fetchall()
    result = []
    for r in rows:
        d = dict(r)
        if d.get('expiry_date'):
            delta = (datetime.strptime(d['expiry_date'], '%Y-%m-%d') - datetime.now()).days
            d['days_left'] = delta
            d['is_expired'] = delta < 0
            d['is_expiring'] = 0 <= delta <= 180
        else:
            d['days_left'] = None
            d['is_expired'] = False
            d['is_expiring'] = False
        result.append(d)
    conn.close()
    return result

@app.post('/api/qualifications')
def create_qualification(body: dict):
    today = date.today().isoformat()
    conn = get_db()
    qid = body.get('id', f'QC{len(conn.execute("SELECT * FROM qualifications").fetchall()) + 1:03d}')
    try:
        conn.execute(
            'INSERT INTO qualifications (id, name, type, cert_no, issuer, issue_date, expiry_date, status, scope, renewal_note, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
            (qid, body.get('name'), body.get('type'), body.get('cert_no'), body.get('issuer'), body.get('issue_date'), body.get('expiry_date'),
             body.get('status', 'active'), body.get('scope', ''), body.get('renewal_note', ''), today)
        )
        conn.commit(); conn.close()
        return {'id': qid, 'message': '资质创建成功'}
    except Exception as e:
        conn.close(); raise HTTPException(status_code=400, detail=str(e))

@app.put('/api/qualifications/{qc_id}')
def update_qualification(qc_id: str, body: dict):
    conn = get_db()
    try:
        conn.execute(
            'UPDATE qualifications SET name=?, type=?, cert_no=?, issuer=?, issue_date=?, expiry_date=?, status=?, scope=?, renewal_note=? WHERE id=?',
            (body.get('name'), body.get('type'), body.get('cert_no'), body.get('issuer'), body.get('issue_date'), body.get('expiry_date'),
             body.get('status', 'active'), body.get('scope', ''), body.get('renewal_note', ''), qc_id)
        )
        conn.commit(); conn.close()
        return {'message': '资质更新成功'}
    except Exception as e:
        conn.close(); raise HTTPException(status_code=400, detail=str(e))

@app.delete('/api/qualifications/{qc_id}')
def delete_qualification(qc_id: str):
    conn = get_db()
    conn.execute('DELETE FROM qualifications WHERE id=?', (qc_id,))
    conn.commit(); conn.close()
    return {'message': '资质已删除'}

@app.get('/api/stats/qualifications')
def qualification_stats():
    conn = get_db()
    total = conn.execute('SELECT COUNT(*) FROM qualifications').fetchone()[0]
    active = conn.execute("SELECT COUNT(*) FROM qualifications WHERE status='active'").fetchone()[0]
    exp30 = conn.execute("SELECT COUNT(*) FROM qualifications WHERE status='active' AND expiry_date IS NOT NULL AND expiry_date <= date('now', '+30 days')").fetchone()[0]
    exp180 = conn.execute("SELECT COUNT(*) FROM qualifications WHERE status='active' AND expiry_date IS NOT NULL AND expiry_date <= date('now', '+180 days')").fetchone()[0]
    expired = conn.execute("SELECT COUNT(*) FROM qualifications WHERE expiry_date < date('now')").fetchone()[0]
    conn.close()
    return {'total': total, 'active': active, 'expiring_30': exp30, 'expiring_180': exp180, 'expired': expired}

# ==================== 培训记录 API ====================
@app.get('/api/training-records')
def get_training_records(staff_id: str = Query(None)):
    conn = get_db()
    query = 'SELECT * FROM training_records WHERE 1=1'
    params = []
    if staff_id:
        query += ' AND staff_id = ?'
        params.append(staff_id)
    query += ' ORDER BY created_at DESC'
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post('/api/training-records')
def create_training_record(body: dict):
    today = date.today().isoformat()
    conn = get_db()
    tid = body.get('id', f'TR{len(conn.execute("SELECT * FROM training_records").fetchall()) + 1:03d}')
    try:
        conn.execute(
            'INSERT INTO training_records (id, staff_id, staff_name, course_name, trainer, start_date, end_date, hours, result, cert_obtained, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
            (tid, body.get('staff_id'), body.get('staff_name'), body.get('course_name'), body.get('trainer'), body.get('start_date'), body.get('end_date'),
             body.get('hours', 0), body.get('result', '合格'), body.get('cert_obtained', ''), today)
        )
        conn.commit(); conn.close()
        return {'id': tid, 'message': '培训记录创建成功'}
    except Exception as e:
        conn.close(); raise HTTPException(status_code=400, detail=str(e))

# ==================== 业务流程 API ====================
@app.get('/api/business-processes')
def get_business_processes(category: str = Query(None)):
    conn = get_db()
    query = 'SELECT * FROM business_processes WHERE 1=1'
    params = []
    if category:
        query += ' AND category = ?'
        params.append(category)
    query += ' ORDER BY created_at DESC'
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.get('/api/process-steps/{process_id}')
def get_process_steps(process_id: str):
    conn = get_db()
    rows = conn.execute('SELECT * FROM process_steps WHERE process_id=? ORDER BY step_num', (process_id,)).fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        if d.get('check_items'):
            try: d['check_items'] = json.loads(d['check_items'])
            except: pass
        result.append(d)
    return result

# ==================== 组织架构 API ====================
@app.get('/api/org/departments')
def get_org_departments():
    conn = get_db()
    rows = conn.execute('SELECT * FROM org_departments ORDER BY id').fetchall()
    conn.close()
    return [dict(r) for r in rows]

# ==================== 培训统计 API ====================
@app.get('/api/stats/training')
def training_stats():
    conn = get_db()
    total = conn.execute('SELECT COUNT(*) FROM training_records').fetchone()[0]
    passed = conn.execute("SELECT COUNT(*) FROM training_records WHERE result='合格'").fetchone()[0]
    by_dept = {}
    for r in conn.execute('SELECT s.dept, COUNT(*) as cnt FROM training_records t JOIN staff s ON t.staff_id = s.id GROUP BY s.dept'):
        by_dept[r['dept']] = r['cnt']
    conn.close()
    return {'total': total, 'passed': passed, 'pass_rate': round(passed/total*100,1) if total else 0, 'by_dept': by_dept}
'''

with open(APP_PATH, 'a', encoding='utf-8') as f:
    f.write(API_BLOCK)

print(f"Appended {len(API_BLOCK)} chars to app.py")
print(f"New total: {(open(APP_PATH, 'r', encoding='utf-8').read()).count(chr(10))} lines")

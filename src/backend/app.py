from fastapi import FastAPI, HTTPException, Query, Body, Header
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import sqlite3
import json
import os
from datetime import datetime, date
import secrets
from typing import List, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "db", "jianjian.db")


def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    tables = [
        ("users", "id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL, name TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'staff', dept TEXT, position TEXT, email TEXT, phone TEXT, avatar TEXT DEFAULT 'user', status TEXT DEFAULT 'active', last_login TEXT, created_at TEXT"),
        ("role_permissions", "id INTEGER PRIMARY KEY AUTOINCREMENT, role TEXT NOT NULL, module TEXT NOT NULL, can_view INTEGER DEFAULT 1, can_create INTEGER DEFAULT 0, can_update INTEGER DEFAULT 0, can_delete INTEGER DEFAULT 0, UNIQUE(role, module)"),
        ("projects", "id TEXT PRIMARY KEY, name TEXT, client TEXT, type TEXT, lead TEXT, status TEXT DEFAULT 'pending', progress INTEGER DEFAULT 0, risk TEXT DEFAULT 'low', start_date TEXT, end_date TEXT, budget REAL DEFAULT 0, paid REAL DEFAULT 0, description TEXT, created_at TEXT, updated_at TEXT"),
        ("inspections", "id TEXT PRIMARY KEY, name TEXT, project_id TEXT, client TEXT, method TEXT, status TEXT DEFAULT 'pending', progress INTEGER DEFAULT 0, examiner TEXT, result TEXT, plan_date TEXT, created_at TEXT, updated_at TEXT"),
        ("staff", "id TEXT PRIMARY KEY, name TEXT, dept TEXT, position TEXT, phone TEXT, email TEXT, certs TEXT DEFAULT '[]', join_date TEXT, status TEXT DEFAULT 'active', avatar TEXT DEFAULT 'user'"),
        ("transactions", "id TEXT PRIMARY KEY, type TEXT, name TEXT, amount REAL, date TEXT, account TEXT, source TEXT, status TEXT DEFAULT 'pending', created_at TEXT"),
        ("equipment", "id TEXT PRIMARY KEY, name TEXT, model TEXT, status TEXT DEFAULT 'normal', location TEXT, cert_status TEXT, cert_due TEXT, last_maint TEXT, next_maint TEXT, value REAL DEFAULT 0, created_at TEXT"),
        ("customers", "id TEXT PRIMARY KEY, name TEXT, type TEXT, contact TEXT, phone TEXT, email TEXT, projects INTEGER DEFAULT 0, amount REAL DEFAULT 0, rating INTEGER DEFAULT 3, last_contact TEXT, status TEXT DEFAULT 'active'"),
        ("knowledge", "id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, category TEXT, tags TEXT DEFAULT '[]', content TEXT, hits INTEGER DEFAULT 0, author TEXT, updated TEXT, created TEXT"),
        ("agent_logs", "id INTEGER PRIMARY KEY AUTOINCREMENT, agent TEXT, action TEXT, content TEXT, result TEXT, created_at TEXT"),
    ]
    for tbl_name, schema in tables:
        c.execute(f'CREATE TABLE IF NOT EXISTS {tbl_name} ({schema})')

    today = date.today().isoformat()
    if not c.execute('SELECT COUNT(*) FROM projects').fetchone()[0]:
        for p in [
            ('XM2026001','XX大厦主体结构检测','XX地产集团','结构检测','李工','active',75,'medium','2026-08-01','2026-10-15',85,51,'主体结构检测',today,today),
            ('XM2026002','YY桥梁荷载试验','市交通局','桥梁检测','王工','report',90,'low','2026-07-15','2026-09-30',120,120,'桥梁荷载试验',today,today),
            ('XM2026003','ZZ小区房屋安全鉴定','ZZ街道办','安全鉴定','赵工','active',45,'high','2026-09-01','2026-10-08',45,22.5,'房屋安全鉴定',today,today),
            ('XM2026004','AA学校抗震鉴定','区教育局','抗震鉴定','孙工','completed',100,'low','2026-06-01','2026-09-10',68,68,'抗震鉴定',today,today),
        ]:
            c.execute('INSERT OR IGNORE INTO projects VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', p)
    if not c.execute('SELECT COUNT(*) FROM staff').fetchone()[0]:
        for s in [
            ('EMP001','张建国','技术部','总工程师','138****1234','zhang@example.com',json.dumps(['高级工程师','注册结构工程师']),'2018-03-15','active','user'),
            ('EMP002','李明华','检测部','检测主管','139****5678','li@example.com',json.dumps(['检测师','无损检测II级']),'2019-06-01','active','user'),
            ('EMP003','王小红','咨询部','咨询工程师','137****9012','wang@example.com',json.dumps(['造价工程师']),'2020-01-10','active','user'),
            ('EMP004','刘强','检测部','检测员','136****3456','liu@example.com',json.dumps(['检测师']),'2021-09-01','active','user'),
        ]:
            c.execute('INSERT OR IGNORE INTO staff VALUES (?,?,?,?,?,?,?,?,?,?)', s)
    if not c.execute('SELECT COUNT(*) FROM equipment').fetchone()[0]:
        for e in [
            ('SB001','万能试验机','WE-1000','normal','一楼实验室A','有效','2027-03-15','2026-08-01','2026-11-01',285000,today),
            ('SB002','回弹仪','HJ-2250','normal','检测设备组','有效','2027-01-20','2026-07-15','2026-10-15',3200,today),
            ('SB003','钢筋扫描仪','CSS-2','warning','现场检测组','即将到期','2026-10-01','2026-06-01','2026-09-01',45000,today),
        ]:
            c.execute('INSERT OR IGNORE INTO equipment VALUES (?,?,?,?,?,?,?,?,?,?,?)', e)
    # 初始化角色权限
    role_perms = {
        'admin':   {'dashboard':(1,1,1,1),'projects':(1,1,1,1),'inspections':(1,1,1,1),'hr':(1,1,1,1),'finance':(1,1,1,1),'equipment':(1,1,1,1),'customers':(1,1,1,1),'compliance':(1,1,1,1),'knowledge':(1,1,1,0),'agents':(1,1,1,1),'settings':(1,1,1,1)},
        'manager': {'dashboard':(1,0,0,0),'projects':(1,1,1,0),'inspections':(1,1,1,0),'hr':(1,0,0,0),'finance':(1,0,0,0),'equipment':(1,1,1,0),'customers':(1,1,1,0),'compliance':(1,0,0,0),'knowledge':(1,1,1,0),'agents':(1,0,0,0),'settings':(0,0,0,0)},
        'staff':   {'dashboard':(1,0,0,0),'projects':(1,0,0,0),'inspections':(1,1,1,0),'hr':(0,0,0,0),'finance':(0,0,0,0),'equipment':(1,0,0,0),'customers':(1,0,0,0),'compliance':(1,0,0,0),'knowledge':(1,1,0,0),'agents':(1,0,0,0),'settings':(0,0,0,0)},
        'guest':   {'dashboard':(1,0,0,0),'projects':(1,0,0,0),'inspections':(1,0,0,0),'hr':(0,0,0,0),'finance':(0,0,0,0),'equipment':(0,0,0,0),'customers':(0,0,0,0),'compliance':(1,0,0,0),'knowledge':(1,0,0,0),'agents':(1,0,0,0),'settings':(0,0,0,0)},
    }
    for role, mods in role_perms.items():
        for mod, (cv,cc,cu,cd) in mods.items():
            c.execute("INSERT OR IGNORE INTO role_permissions (role,module,can_view,can_create,can_update,can_delete) VALUES (?,?,?,?,?,?)", (role,mod,cv,cc,cu,cd))
    # 初始化默认用户
    default_users = [
        ("admin","admin123","张建国","admin","技术部","总工程师","zhang@example.com","138****1234","admin"),
        ("manager","mgr12345","李明华","manager","检测部","检测主管","li@example.com","139****5678","manager"),
        ("staff01","staff123","王小红","staff","咨询部","咨询工程师","wang@example.com","137****9012","staff"),
        ("staff02","staff456","刘强","staff","检测部","检测员","liu@example.com","136****3456","staff"),
        ("guest","guest123","访客用户","guest",None,"访客",None,None,"guest"),
    ]
    for u in default_users:
        c.execute("INSERT OR IGNORE INTO users (username,password,name,role,dept,position,email,phone,avatar,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)", (u[0],u[1],u[2],u[3],u[4],u[5],u[6],u[7],u[8],"active",today))
    
    conn.commit()
    conn.close()
    print(f"DB initialized: {DB_PATH}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title='建检智管 API', description='建筑行业检测及信息咨询公司 AI企业应用系统', version='1.2.0', lifespan=lifespan)

app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_credentials=True, allow_methods=['*'], allow_headers=['*'])


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# ==================== RBAC 认证 ====================
# 简易 session token (生产环境应使用 JWT)
_active_sessions = {}

def _hash_password(pwd):
    return pwd  # 演示用明文，生产环境用 bcrypt

def _verify_token(token):
    return _active_sessions.get(token)

def _get_user_permissions(role):
    conn = get_db()
    rows = conn.execute(
        "SELECT module, can_view, can_create, can_update, can_delete FROM role_permissions WHERE role=?",
        (role,)
    ).fetchall()
    conn.close()
    perms = {}
    for r in rows:
        d = dict(r)
        perms[d['module']] = {
            'can_view': d['can_view'],
            'can_create': d['can_create'],
            'can_update': d['can_update'],
            'can_delete': d['can_delete'],
        }
    return perms


@app.get('/api/auth/permissions')
def get_permissions(token: str = Query(None)):
    """获取当前用户权限"""
    if not token:
        raise HTTPException(status_code=401, detail="未登录")
    user = _verify_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Token无效")
    return {'permissions': _get_user_permissions(user['role']), 'user': {k: v for k, v in user.items() if k != 'password'}}


@app.post('/api/auth/login')
def login(data: dict):
    """用户登录"""
    username = data.get('username', '').strip()
    password = data.get('password', '')
    conn = get_db()
    row = conn.execute("SELECT * FROM users WHERE username=? AND password=? AND status='active'", (username, password)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    user = dict(row)
    # 生成session token
    token = secrets.token_hex(32)
    _active_sessions[token] = user
    # 更新last_login
    conn = get_db()
    conn.execute("UPDATE users SET last_login=? WHERE id=?", (datetime.now().isoformat(), user['id']))
    conn.commit()
    conn.close()
    return {
        'token': token,
        'user': {k: v for k, v in user.items() if k != 'password'},
        'permissions': _get_user_permissions(user['role'])
    }


@app.post('/api/auth/logout')
def logout(token: str = Body(...)):
    """退出登录"""
    _active_sessions.pop(token, None)
    return {'message': '已退出'}


def require_auth(token: str = Header(None)):
    """依赖注入：验证token"""
    if not token:
        raise HTTPException(status_code=401, detail="未授权")
    user = _verify_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Token无效或已过期")
    return user


def require_permission(module: str, action: str = 'view'):
    """依赖注入：检查权限 (action: view/create/update/delete)"""
    def _check(token: str = Header(None)):
        if not token:
            raise HTTPException(status_code=401, detail="未授权")
        user = _verify_token(token)
        if not user:
            raise HTTPException(status_code=401, detail="Token无效")
        perms = _get_user_permissions(user['role'])
        mod_perm = perms.get(module, {})
        key = f'can_{action}'
        if not mod_perm.get(key, 0):
            raise HTTPException(status_code=403, detail=f"无{module}模块{action}权限")
        return user
    return _check



# ==================== 项目管理 ====================
@app.get('/api/projects')
def list_projects(status: str = Query(None), search: str = Query(None)):
    conn = get_db()
    wheres, ps = [], []
    if status:
        wheres.append('status=?')
        ps.append(status)
    if search:
        for col in ('id', 'name', 'client', 'lead', 'type'):
            wheres.append(f'{col} LIKE ?')
            ps.append(f'%{search}%')
    sql = 'SELECT * FROM projects'
    if wheres:
        sql += ' WHERE ' + ' AND '.join(wheres)
    sql += ' ORDER BY created_at DESC'
    rows = conn.execute(sql, ps).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post('/api/projects')
def create_project(data: dict):
    conn = get_db()
    now = datetime.now().isoformat()
    pid = f"XM{datetime.now().strftime('%Y%m%d')}{len(conn.execute('SELECT * FROM projects').fetchall()) + 1:03d}"
    data['id'] = pid
    data['created_at'] = data['updated_at'] = now
    for k, v in [('progress', 0), ('risk', 'low'), ('budget', 0), ('paid', 0), ('status', 'pending')]:
        data.setdefault(k, v)
    keys = list(data.keys())
    placeholders = ','.join(['?'] * len(keys))
    conn.execute(f"INSERT INTO projects ({','.join(keys)}) VALUES ({placeholders})", list(data.values()))
    conn.commit()
    conn.close()
    return {'id': pid, 'message': '项目创建成功'}

@app.put('/api/projects/{project_id}')
def update_project(project_id: str, data: dict):
    conn = get_db()
    data['updated_at'] = datetime.now().isoformat()
    sets = ','.join([f'{k}=?' for k in data.keys()])
    conn.execute(f'UPDATE projects SET {sets} WHERE id=?', list(data.values()) + [project_id])
    conn.commit()
    conn.close()
    return {'message': '项目更新成功'}

@app.delete('/api/projects/{project_id}')
def delete_project(project_id: str):
    conn = get_db()
    conn.execute('DELETE FROM projects WHERE id=?', (project_id,))
    conn.commit()
    conn.close()
    return {'message': '项目删除成功'}

# ==================== 检测业务 ====================
@app.get('/api/inspections')
def list_inspections(status: str = Query(None), search: str = Query(None)):
    conn = get_db()
    wheres, ps = [], []
    if status:
        wheres.append('status=?')
        ps.append(status)
    if search:
        for col in ('id', 'name', 'client', 'examiner'):
            wheres.append(f'{col} LIKE ?')
            ps.append(f'%{search}%')
    sql = 'SELECT * FROM inspections'
    if wheres:
        sql += ' WHERE ' + ' AND '.join(wheres)
    sql += ' ORDER BY created_at DESC'
    rows = conn.execute(sql, ps).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post('/api/inspections')
def create_inspection(data: dict):
    conn = get_db()
    now = datetime.now().isoformat()
    iid = f"JC{datetime.now().strftime('%Y%m%d')}{len(conn.execute('SELECT * FROM inspections').fetchall()) + 1:03d}"
    data['id'] = iid
    data['created_at'] = data['updated_at'] = now
    for k, v in [('status', 'pending'), ('progress', 0), ('result', '-')]:
        data.setdefault(k, v)
    keys = list(data.keys())
    placeholders = ','.join(['?'] * len(keys))
    conn.execute(f"INSERT INTO inspections ({','.join(keys)}) VALUES ({placeholders})", list(data.values()))
    conn.commit()
    conn.close()
    return {'id': iid, 'message': '检测任务创建成功'}

@app.put('/api/inspections/{inspection_id}')
def update_inspection(inspection_id: str, data: dict):
    conn = get_db()
    data['updated_at'] = datetime.now().isoformat()
    sets = ','.join([f'{k}=?' for k in data.keys()])
    conn.execute(f'UPDATE inspections SET {sets} WHERE id=?', list(data.values()) + [inspection_id])
    conn.commit()
    conn.close()
    return {'message': '检测任务更新成功'}

# ==================== 人力资源 ====================
@app.get('/api/staff')
def list_staff(dept: str = Query(None), search: str = Query(None)):
    conn = get_db()
    wheres, ps = [], []
    if dept:
        wheres.append('dept=?')
        ps.append(dept)
    if search:
        for col in ('id', 'name', 'position'):
            wheres.append(f'{col} LIKE ?')
            ps.append(f'%{search}%')
    sql = 'SELECT * FROM staff'
    if wheres:
        sql += ' WHERE ' + ' AND '.join(wheres)
    sql += ' ORDER BY id'
    rows = conn.execute(sql, ps).fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        if d['certs']:
            try:
                d['certs'] = json.loads(d['certs'])
            except Exception:
                d['certs'] = []
        result.append(d)
    return result

@app.post('/api/staff')
def create_staff(data: dict):
    conn = get_db()
    eid = f"EMP{len(conn.execute('SELECT * FROM staff').fetchall()) + 1:03d}"
    data['id'] = eid
    data.setdefault('certs', json.dumps([]))
    data.setdefault('status', 'active')
    data.setdefault('avatar', 'user')
    keys = list(data.keys())
    placeholders = ','.join(['?'] * len(keys))
    conn.execute(f"INSERT INTO staff ({','.join(keys)}) VALUES ({placeholders})", list(data.values()))
    conn.commit()
    conn.close()
    return {'id': eid, 'message': '员工添加成功'}


# ==================== 数字员工日志 ====================
@app.get('/api/agent-logs')
def list_agent_logs(agent: str = Query(None), limit: int = Query(50)):
    conn = get_db()
    if agent:
        rows = conn.execute('SELECT * FROM agent_logs WHERE agent=? ORDER BY created_at DESC LIMIT ?', (agent, limit)).fetchall()
    else:
        rows = conn.execute('SELECT * FROM agent_logs ORDER BY created_at DESC LIMIT ?', (limit,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post('/api/agent-logs')
def create_agent_log(data: dict):
    conn = get_db()
    data['created_at'] = datetime.now().isoformat()
    keys = list(data.keys())
    placeholders = ','.join(['?'] * len(keys))
    conn.execute(f"INSERT INTO agent_logs ({','.join(keys)}) VALUES ({placeholders})", list(data.values()))
    conn.commit()
    conn.close()
    return {'message': '日志记录成功'}

# ==================== 健康检查 ====================
@app.get('/api/health')
def health_check():
    return {'status': 'ok', 'version': '1.2.0', 'timestamp': datetime.now().isoformat()}


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)


# ==================== 财务管理 ====================
@app.get('/api/transactions')
def list_transactions(type_: str = Query(None, alias='type'), search: str = Query(None)):
    conn = get_db()
    wheres, ps = [], []
    if type_:
        wheres.append('type=?')
        ps.append(type_)
    if search:
        for col in ('id', 'name', 'account', 'source'):
            wheres.append(f'{col} LIKE ?')
            ps.append(f'%{search}%')
    sql = 'SELECT * FROM transactions'
    if wheres:
        sql += ' WHERE ' + ' AND '.join(wheres)
    sql += ' ORDER BY date DESC'
    rows = conn.execute(sql, ps).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post('/api/transactions')
def create_transaction(data: dict):
    conn = get_db()
    now = datetime.now().isoformat()
    tid = f"SR{datetime.now().strftime('%Y%m%d')}{len(conn.execute('SELECT * FROM transactions').fetchall()) + 1:03d}"
    data['id'] = tid
    data['created_at'] = now
    data.setdefault('status', 'pending')
    keys = list(data.keys())
    placeholders = ','.join(['?'] * len(keys))
    conn.execute(f"INSERT INTO transactions ({','.join(keys)}) VALUES ({placeholders})", list(data.values()))
    conn.commit()
    conn.close()
    return {'id': tid, 'message': '记录成功'}

# ==================== 设备管理 ====================
@app.get('/api/equipment')
def list_equipment(status: str = Query(None), search: str = Query(None)):
    conn = get_db()
    wheres, ps = [], []
    if status:
        wheres.append('status=?')
        ps.append(status)
    if search:
        for col in ('id', 'name', 'model'):
            wheres.append(f'{col} LIKE ?')
            ps.append(f'%{search}%')
    sql = 'SELECT * FROM equipment'
    if wheres:
        sql += ' WHERE ' + ' AND '.join(wheres)
    sql += ' ORDER BY id'
    rows = conn.execute(sql, ps).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post('/api/equipment')
def create_equipment(data: dict):
    conn = get_db()
    eid = f"SB{len(conn.execute('SELECT * FROM equipment').fetchall()) + 1:03d}"
    data['id'] = eid
    data['created_at'] = datetime.now().isoformat()
    data.setdefault('status', 'normal')
    data.setdefault('value', 0)
    keys = list(data.keys())
    placeholders = ','.join(['?'] * len(keys))
    conn.execute(f"INSERT INTO equipment ({','.join(keys)}) VALUES ({placeholders})", list(data.values()))
    conn.commit()
    conn.close()
    return {'id': eid, 'message': '设备添加成功'}

@app.put('/api/equipment/{equipment_id}')
def update_equipment(equipment_id: str, data: dict):
    conn = get_db()
    sets = ','.join([f'{k}=?' for k in data.keys()])
    conn.execute(f'UPDATE equipment SET {sets} WHERE id=?', list(data.values()) + [equipment_id])
    conn.commit()
    conn.close()
    return {'message': '设备更新成功'}

@app.delete('/api/equipment/{equipment_id}')
def delete_equipment(equipment_id: str):
    conn = get_db()
    conn.execute('DELETE FROM equipment WHERE id=?', (equipment_id,))
    conn.commit()
    conn.close()
    return {'message': '设备删除成功'}

# ==================== 客户管理 ====================
@app.get('/api/customers')
def list_customers(search: str = Query(None)):
    conn = get_db()
    wheres, ps = [], []
    if search:
        for col in ('id', 'name', 'contact', 'type'):
            wheres.append(f'{col} LIKE ?')
            ps.append(f'%{search}%')
    sql = 'SELECT * FROM customers'
    if wheres:
        sql += ' WHERE ' + ' AND '.join(wheres)
    sql += ' ORDER BY id'
    rows = conn.execute(sql, ps).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post('/api/customers')
def create_customer(data: dict):
    conn = get_db()
    cid = f"KH{len(conn.execute('SELECT * FROM customers').fetchall()) + 1:03d}"
    data['id'] = cid
    for k, v in [('projects', 0), ('amount', 0), ('rating', 3), ('status', 'active')]:
        data.setdefault(k, v)
    keys = list(data.keys())
    placeholders = ','.join(['?'] * len(keys))
    conn.execute(f"INSERT INTO customers ({','.join(keys)}) VALUES ({placeholders})", list(data.values()))
    conn.commit()
    conn.close()
    return {'id': cid, 'message': '客户添加成功'}

@app.put('/api/customers/{customer_id}')
def update_customer(customer_id: str, data: dict):
    conn = get_db()
    sets = ','.join([f'{k}=?' for k in data.keys()])
    conn.execute(f'UPDATE customers SET {sets} WHERE id=?', list(data.values()) + [customer_id])
    conn.commit()
    conn.close()
    return {'message': '客户更新成功'}

@app.delete('/api/customers/{customer_id}')
def delete_customer(customer_id: str):
    conn = get_db()
    conn.execute('DELETE FROM customers WHERE id=?', (customer_id,))
    conn.commit()
    conn.close()
    return {'message': '客户删除成功'}

# ==================== 知识管理 ====================
@app.get('/api/knowledge')
def list_knowledge(category: str = Query(None), search: str = Query(None)):
    conn = get_db()
    wheres, ps = [], []
    if category and category != 'all':
        wheres.append('category=?')
        ps.append(category)
    if search:
        wheres.append('(title LIKE ? OR tags LIKE ?)')
        ps.extend([f'%{search}%', f'%{search}%'])
    sql = 'SELECT * FROM knowledge'
    if wheres:
        sql += ' WHERE ' + ' AND '.join(wheres)
    sql += ' ORDER BY updated DESC'
    rows = conn.execute(sql, ps).fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        if d['tags']:
            try:
                d['tags'] = json.loads(d['tags'])
            except Exception:
                d['tags'] = []
        result.append(d)
    return result

@app.post('/api/knowledge')
def create_knowledge(data: dict):
    conn = get_db()
    now = datetime.now().isoformat()
    data['tags'] = json.dumps(data.get('tags', []))
    data['hits'] = data.get('hits', 0)
    data['created'] = now
    data['updated'] = now
    keys = list(data.keys())
    placeholders = ','.join(['?'] * len(keys))
    conn.execute(f"INSERT INTO knowledge ({','.join(keys)}) VALUES ({placeholders})", list(data.values()))
    conn.commit()
    conn.close()
    return {'message': '知识文档添加成功'}

@app.put('/api/knowledge/{doc_id}')
def update_knowledge(doc_id: int, data: dict):
    conn = get_db()
    data['updated'] = datetime.now().isoformat()
    if 'tags' in data and isinstance(data['tags'], list):
        data['tags'] = json.dumps(data['tags'])
    sets = ','.join([f'{k}=?' for k in data.keys()])
    conn.execute(f'UPDATE knowledge SET {sets} WHERE id=?', list(data.values()) + [doc_id])
    conn.commit()
    conn.close()
    return {'message': '知识文档更新成功'}

@app.delete('/api/knowledge/{doc_id}')
def delete_knowledge(doc_id: int):
    conn = get_db()
    conn.execute('DELETE FROM knowledge WHERE id=?', (doc_id,))
    conn.commit()
    conn.close()
    return {'message': '知识文档删除成功'}


# ==================== 财务统计 ====================
@app.get('/api/finance/stats')
def finance_stats():
    conn = get_db()
    transactions = conn.execute('SELECT * FROM transactions').fetchall()
    projects = conn.execute('SELECT * FROM projects').fetchall()
    
    total_income = sum(t['amount'] for t in transactions if t['type'] == 'income')
    total_expense = sum(t['amount'] for t in transactions if t['type'] == 'expense')
    ar_amount = sum(t['amount'] for t in transactions if t['type'] == 'income' and t['status'] == 'pending')
    
    month_start = date.today().replace(day=1).isoformat()
    month_income = sum(t['amount'] for t in transactions if t['type'] == 'income' and t['date'] and t['date'] >= month_start)
    month_expense = sum(t['amount'] for t in transactions if t['type'] == 'expense' and t['date'] and t['date'] >= month_start)
    
    # Income by account category
    income_by_account = {}
    for t in transactions:
        if t['type'] == 'income':
            acc = t['account']
            income_by_account[acc] = income_by_account.get(acc, 0) + t['amount']
    
    # Expense by account category
    expense_by_account = {}
    for t in transactions:
        if t['type'] == 'expense':
            acc = t['account']
            expense_by_account[acc] = expense_by_account.get(acc, 0) + t['amount']
    
    # Monthly trend (last 6 months)
    monthly = {}
    for t in transactions:
        if t['date']:
            month = t['date'][:7]
            if month not in monthly:
                monthly[month] = {'income': 0, 'expense': 0}
            if t['type'] == 'income':
                monthly[month]['income'] += t['amount']
            else:
                monthly[month]['expense'] += t['amount']
    
    months = sorted(monthly.keys())[-6:]
    monthly_trend = {
        'months': [m[5:7] + '月' for m in months],
        'income': [round(monthly[m]['income']/10000, 1) for m in months],
        'expense': [round(monthly[m]['expense']/10000, 1) for m in months]
    }
    
    profit_rate = round((total_income - total_expense) / total_income * 100, 1) if total_income else 0
    
    conn.close()
    return {
        'total_income': round(total_income / 10000, 1),
        'total_expense': round(total_expense / 10000, 1),
        'profit': round((total_income - total_expense) / 10000, 1),
        'profit_rate': profit_rate,
        'ar_amount': round(ar_amount / 10000, 1),
        'month_income': round(month_income / 10000, 1),
        'month_expense': round(month_expense / 10000, 1),
        'income_by_account': {k: round(v/10000,1) for k, v in income_by_account.items()},
        'expense_by_account': {k: round(v/10000,1) for k, v in expense_by_account.items()},
        'monthly_trend': monthly_trend,
        'collection_rate': round((total_income - ar_amount) / total_income * 100, 1) if total_income else 0
    }
# ==================== 统计API ====================
@app.get('/api/stats/dashboard')
def dashboard_stats():
    conn = get_db()
    projects = conn.execute('SELECT * FROM projects').fetchall()
    inspections = conn.execute('SELECT * FROM inspections').fetchall()
    transactions = conn.execute('SELECT * FROM transactions').fetchall()
    equipment = conn.execute('SELECT * FROM equipment').fetchall()
    staff = conn.execute("SELECT * FROM staff WHERE status='active'").fetchall()
    total_income = sum(t['amount'] for t in transactions if t['type'] == 'income')
    total_expense = sum(t['amount'] for t in transactions if t['type'] == 'expense')
    ar_amount = sum(t['amount'] for t in transactions if t['type'] == 'income' and t['status'] == 'pending')
    month_start = date.today().replace(day=1).isoformat()
    recent_income = sum(t['amount'] for t in transactions if t['type'] == 'income' and t['date'] and t['date'] >= month_start)
    recent_expense = sum(t['amount'] for t in transactions if t['type'] == 'expense' and t['date'] and t['date'] >= month_start)
    stats = {
        'projects': {'total': len(projects), 'active': len([p for p in projects if p['status'] == 'active']), 'completed': len([p for p in projects if p['status'] == 'completed']), 'high_risk': len([p for p in projects if p['risk'] == 'high'])},
        'inspections': {'total': len(inspections), 'completed': len([i for i in inspections if i['status'] == 'completed']), 'in_progress': len([i for i in inspections if i['status'] == 'testing'])},
        'finance': {'total_income': round(total_income/10000,1), 'total_expense': round(total_expense/10000,1), 'profit': round((total_income-total_expense)/10000,1), 'ar_amount': round(ar_amount/10000,1), 'month_income': round(recent_income/10000,1), 'month_expense': round(recent_expense/10000,1)},
        'equipment': {'total': len(equipment), 'normal': len([e for e in equipment if e['status'] == 'normal']), 'warning': len([e for e in equipment if e['status'] == 'warning'])},
        'staff': {'total': len(staff), 'tech': len([s for s in staff if s['dept'] in ('技术部','检测部')])},
    }
    conn.close()
    return stats

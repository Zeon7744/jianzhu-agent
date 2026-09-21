from fastapi import FastAPI, HTTPException, Query, Body, Header
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import sqlite3
import json
import os
from datetime import datetime, date
import secrets
from typing import List, Optional
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))
from agent import AGENT_PROFILES, get_agent, list_agents, AgentBrain, KnowledgeRetriever, AgentCollaborator, agent_message_bus
from health import get_system_health, get_database_health, get_api_health, run_startup_self_check

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
        ("contracts", "id TEXT PRIMARY KEY, name TEXT, type TEXT, project_id TEXT, customer_id TEXT, amount REAL DEFAULT 0, sign_date TEXT, start_date TEXT, end_date TEXT, payment_terms TEXT, status TEXT DEFAULT 'pending', created_at TEXT"),
        ("reports", "id TEXT PRIMARY KEY, title TEXT, type TEXT, inspection_id TEXT, project_id TEXT, report_no TEXT, pages INTEGER DEFAULT 0, issue_date TEXT, reviewer TEXT, confidentiality TEXT DEFAULT 'internal', status TEXT DEFAULT 'draft', created_at TEXT, updated_at TEXT"),
        ("suppliers", "id TEXT PRIMARY KEY, name TEXT, type TEXT, contact TEXT, phone TEXT, email TEXT, main_products TEXT DEFAULT '[]', rating INTEGER DEFAULT 3, status TEXT DEFAULT 'active', created_at TEXT"),
        ("materials", "id TEXT PRIMARY KEY, name TEXT, spec TEXT, category TEXT, price REAL DEFAULT 0, stock INTEGER DEFAULT 0, min_stock INTEGER DEFAULT 5, unit TEXT DEFAULT '个', status TEXT DEFAULT 'normal', created_at TEXT"),
        ("procurement", "id TEXT PRIMARY KEY, material_id TEXT, supplier_id TEXT, quantity REAL DEFAULT 0, unit_price REAL DEFAULT 0, amount REAL DEFAULT 0, order_date TEXT, expected_date TEXT, actual_date TEXT, status TEXT DEFAULT 'pending', created_at TEXT"),
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
            ('EMP001','张建国','技术部','总工程师','138****1234','zhang@example.com',json.dumps(['高级工程师','注册结构工程师']),5,'active',today),
            ('SP002','华检检测设备公司','检测设备供应商','钱经理','139****0002','qian@hjset.com',json.dumps(['压力试验机','回弹仪']),5,'active',today),
            ('SP002','华检检测设备公司','检测设备供应商','钱经理','139****0002','qian@hjset.com',json.dumps(['压力试验机','回弹仪']),5,'active',today),
            ('SP003','绿源环保科技','环保材料供应商','孙经理','137****0003','sun@lyhb.com',json.dumps(['甲醛检测仪','PM2.5监测仪']),4,'active',today),
            ('SP004','恒通五金机电','五金机电供应商','周经理','136****0004','zhou@htjd.com',json.dumps(['钻头','耗材']),4,'active',today),
            ('SP005','安防卫士科技','安防设备供应商','吴经理','135****0005','wu@afws.com',json.dumps(['消防检测设备']),3,'active',today),
            ('SP006','鑫达化工产品','化工材料供应商','郑经理','134****0006','zheng xd@hdhg.com',json.dumps(['化学试剂']),3,'inactive',today),
            ('SP007','美居装饰材料','装饰材料供应商','冯经理','133****0007','feng@mjzl.com',json.dumps(['涂料','板材']),4,'active',today),
            ('SP008','精仪仪表仪器','仪器仪表供应商','何经理','132****0008','he@jyyq.com',json.dumps(['水准仪','全站仪']),5,'active',today),
        ]:
            c.execute('INSERT OR IGNORE INTO suppliers (id,name,type,contact,phone,email,main_products,rating,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)', sp)
    # 初始化材料数据
    if not c.execute('SELECT COUNT(*) FROM materials').fetchone()[0]:
        for mt in [
            ('MAT001','混凝土试块标准养护箱','HBY-40B','检测设备',0,3,1,28500,today),
            ('MAT002','回弹仪标准弹击锤','HJ-2250配件','检测耗材',0,20,5,3200,today),
            ('MAT003','钢筋扫描仪探头','CSS-2专用','检测设备',0,15,3,45000,today),
            ('MAT004','甲醛检测采样管','10ml标准','室内检测耗材',0,100,20,28,today),
            ('MAT005','PM2.5滤膜','20*25cm','室内检测耗材',0,50,10,156,today),
            ('MAT006','水泥取样器','标准型','地基检测',0,8,2,1200,today),
            ('MAT007','钢筋保护层厚度检测仪','ZBL-R6200','检测设备',0,5,1,35000,today),
            ('MAT008','超声波测厚仪','CT-2006','检测设备',0,12,3,8500,today),
            ('MAT009','无损检测耦合剂','500ml/瓶','检测耗材',0,30,10,85,today),
            ('MAT010','混凝土回弹仪标定锤','标准器','检测设备',0,2,1,12000,today),
            ('MAT011','全站仪棱镜组','标准配置','测量设备',0,6,2,28000,today),
            ('MAT012','应力应变仪传感器','动态应变','检测设备',0,10,3,6500,today),
        ]:
            c.execute('INSERT OR IGNORE INTO materials (id,name,spec,category,price,stock,min_stock,unit,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)', mt)
    # 初始化采购单数据
    if not c.execute('SELECT COUNT(*) FROM procurement').fetchone()[0]:
        for po in [
            ('PO2026001','MAT002','SP002',20,3200,64000,'2026-09-01','2026-09-15','2026-09-14','received',today),
            ('PO2026002','MAT004','SP003',100,28,2800,'2026-09-10','2026-09-20','', 'pending',today),
            ('PO2026003','MAT005','SP003',50,156,7800,'2026-09-12','2026-09-25','', 'pending',today),
            ('PO2026004','MAT006','SP001',8,1200,9600,'2026-09-05','2026-09-18','', 'shipped',today),
            ('PO2026005','MAT009','SP002',30,85,2550,'2026-09-15','2026-09-30','', 'pending',today),
            ('PO2026006','MAT011','SP008',6,28000,168000,'2026-08-20','2026-09-05','2026-09-04','received',today),
            ('PO2026007','MAT003','SP002',3,45000,135000,'2026-09-08','2026-09-22','', 'pending',today),
        ]:
            c.execute('INSERT OR IGNORE INTO procurement (id,material_id,supplier_id,quantity,unit_price,amount,order_date,expected_date,actual_date,status,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)', po)
    conn.commit()
    conn.close()
    print(f"DB initialized: {DB_PATH}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动自检
    print("[Self-Check] Starting system initialization...")
    init_db()
    check_result = run_startup_self_check()
    print(f"[Self-Check] Status: {check_result['overall_status']}")
    for check in check_result.get("checks", []):
        status = check.get("status", "?")
        name = check.get("name", "unknown")
        print(f"  [{status.upper()}] {name}")
    for err in check_result.get("errors", []):
        print(f"  [ERROR] {err}")
    for warn in check_result.get("warnings", []):
        print(f"  [WARN] {warn}")
    yield


app = FastAPI(title='建检智管 API', description='建筑行业检测及信息咨询公司 AI企业应用系统', version='2.1.0', lifespan=lifespan)

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


# ==================== Agent 实例 ====================
_agent_brain = AgentBrain()
_knowledge_retriever = KnowledgeRetriever()
_agent_collaborator = AgentCollaborator(_agent_brain)


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
    return {'status': 'ok', 'version': '2.1.0', 'timestamp': datetime.now().isoformat()}



# ==================== 系统健康检查API ====================
@app.get('/api/system/health')
def system_health():
    """系统全面健康检查"""
    sys_health = get_system_health()
    db_health = get_database_health()
    api_health = get_api_health()
    
    overall = "healthy"
    if sys_health["status"] == "error" or db_health["status"] == "error" or api_health["status"] == "error":
        overall = "error"
    elif sys_health["status"] == "warning" or db_health["status"] == "warning" or api_health["status"] == "degraded":
        overall = "warning"
    
    return {
        "status": overall,
        "system": sys_health,
        "database": db_health,
        "api": api_health,
        "timestamp": datetime.now().isoformat(),
    }


@app.get('/api/system/startup-check')
def startup_check():
    """启动自检报告"""
    report = run_startup_self_check()
    return report


@app.get('/api/system/info')
def system_info():
    """系统信息"""
    import platform
    conn = get_db()
    table_counts = {}
    for row in conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").fetchall():
        try:
            cnt = conn.execute("SELECT COUNT(*) FROM [" + row["name"] + "]").fetchone()[0]
            table_counts[row["name"]] = cnt
        except:
            table_counts[row["name"]] = -1
    conn.close()
    
    return {
        "version": "2.1.0",
        "platform": platform.platform(),
        "python": platform.python_version(),
        "db_path": str(DB_PATH),
        "tables": table_counts,
        "agents_count": len(AGENT_PROFILES),
        "agent_names": list(AGENT_PROFILES.keys()),
    }


# ==================== Agent AI API ====================
@app.post('/api/agents/chat')
def agent_chat(data: dict):
    """Agent对话 - 基于真实数据的智能回复"""
    agent_name = data.get("agent", "智管")
    message = data.get("message", "")
    context = data.get("context", {})
    
    if not message:
        agent = get_agent(agent_name)
        if agent:
            return {
                "agent": agent_name,
                "reply": f"您好！我是{agent['name']}（{agent['role']}），{agent['desc']}。请问有什么可以帮您？",
                "intent": "greeting",
                "suggestions": ["请帮我分析经营状况", "有什么风险需要注意", "今日工作建议"],
            }
        return {"agent": agent_name, "reply": "您好！请告诉我您需要什么帮助。", "intent": "greeting"}
    
    result = _agent_brain.analyze(agent_name, message, context)
    related_knowledge = _knowledge_retriever.get_related_knowledge(agent_name, context)
    
    suggestions = result.get("suggestions", [])[:3] if result.get("suggestions") else ["请提供更多细节以便我给出更精准的分析"]
    
    return {
        "agent": agent_name,
        "reply": result["summary"],
        "intent": result["intent"],
        "risks": result.get("risks", []),
        "opportunities": result.get("opportunities", []),
        "suggestions": suggestions,
        "related_knowledge": related_knowledge[:3],
        "metrics": result.get("data_points", {}),
    }


@app.post('/api/agents/collaborative-analysis')
def agent_collaborative_analysis(data: dict):
    """多Agent协作分析"""
    query = data.get("query", "")
    primary_agent = data.get("primary_agent", "智管")
    include_agents = data.get("include_agents", [])
    
    if not query:
        raise HTTPException(status_code=400, detail="查询内容不能为空")
    
    result = _agent_collaborator.collaborative_analysis(query, primary_agent, include_agents)
    return result


@app.get('/api/agents/list')
def list_agents_api():
    """获取所有Agent列表"""
    agents = list_agents()
    return {"agents": agents, "count": len(agents)}


@app.get('/api/agents/{agent_name}/history')
def agent_history(agent_name: str, limit: int = Query(20)):
    """获取Agent交互历史"""
    messages = agent_message_bus.get_agent_history(agent_name, limit)
    return {"agent": agent_name, "messages": messages, "count": len(messages)}


@app.post('/api/agents/{agent_name}/knowledge')
def agent_knowledge(agent_name: str, data: dict = None):
    """为Agent获取相关知识"""
    kb = _knowledge_retriever
    d = data or {}
    query = d.get("query", "")
    if query:
        results = kb.search(query, limit=5)
    else:
        results = kb.get_related_knowledge(agent_name)
    return {"agent": agent_name, "knowledge": results, "count": len(results)}


@app.post('/api/agents/alert')
def agent_proactive_alert(data: dict):
    """主动预警"""
    alert_type = data.get("type", "risk_alert")
    content = data.get("content", "")
    severity = data.get("severity", "normal")
    result = _agent_collaborator.proactive_alert(alert_type, content, severity)
    return result


@app.get('/api/agents/messages')
def agent_messages(msg_type: str = Query(None), limit: int = Query(50)):
    """获取Agent消息总线记录"""
    messages = agent_message_bus.get_messages(msg_type=msg_type, limit=limit)
    return {"messages": messages, "count": len(messages)}


@app.get('/api/knowledge/search')
def knowledge_search_api(category: str = Query(None), search: str = Query(None), limit: int = Query(10)):
    """知识库搜索API"""
    kb = _knowledge_retriever
    if search:
        results = kb.search(search, category, limit)
    elif category:
        results = kb.get_by_category(category, limit)
    else:
        results = kb.get_all_categories()
        return {"categories": results, "count": len(results)}
    return {"results": results, "count": len(results)}


@app.post('/api/knowledge/{doc_id}/hit')
def knowledge_hit(doc_id: int):
    """增加文档访问量"""
    _knowledge_retriever.increment_hits(doc_id)
    return {"message": "访问量已更新"}


# ==================== 财务管理 ====================


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



# ==================== 合同管理 ====================
@app.get('/api/contracts')
def list_contracts(project_id: str = Query(None), search: str = Query(None)):
    conn = get_db()
    wheres, ps = [], []
    if project_id:
        wheres.append('project_id=?')
        ps.append(project_id)
    if search:
        for col in ('id', 'name', 'customer_id'):
            wheres.append(f'{col} LIKE ?')
            ps.append(f'%{search}%')
    sql = 'SELECT * FROM contracts'
    if wheres:
        sql += ' WHERE ' + ' AND '.join(wheres)
    sql += ' ORDER BY sign_date DESC'
    rows = conn.execute(sql, ps).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post('/api/contracts')
def create_contract(data: dict):
    conn = get_db()
    cid = f"HT{datetime.now().strftime('%Y%m%d')}{len(conn.execute('SELECT * FROM contracts').fetchall()) + 1:03d}"
    data['id'] = cid
    data['created_at'] = datetime.now().isoformat()
    data.setdefault('status', 'pending')
    keys = list(data.keys())
    placeholders = ','.join(['?'] * len(keys))
    conn.execute(f"INSERT INTO contracts ({','.join(keys)}) VALUES ({placeholders})", list(data.values()))
    conn.commit()
    conn.close()
    return {'id': cid, 'message': '合同创建成功'}

@app.put('/api/contracts/{contract_id}')
def update_contract(contract_id: str, data: dict):
    conn = get_db()
    data['updated_at'] = datetime.now().isoformat()
    sets = ','.join([f'{k}=?' for k in data.keys()])
    conn.execute(f'UPDATE contracts SET {sets} WHERE id=?', list(data.values()) + [contract_id])
    conn.commit()
    conn.close()
    return {'message': '合同更新成功'}

@app.delete('/api/contracts/{contract_id}')
def delete_contract(contract_id: str):
    conn = get_db()
    conn.execute('DELETE FROM contracts WHERE id=?', (contract_id,))
    conn.commit()
    conn.close()
    return {'message': '合同删除成功'}

# ==================== 检测报告 ====================
@app.get('/api/reports')
def list_reports(inspection_id: str = Query(None), project_id: str = Query(None), status: str = Query(None)):
    conn = get_db()
    wheres, ps = [], []
    if inspection_id:
        wheres.append('inspection_id=?')
        ps.append(inspection_id)
    if project_id:
        wheres.append('project_id=?')
        ps.append(project_id)
    if status:
        wheres.append('status=?')
        ps.append(status)
    sql = 'SELECT * FROM reports'
    if wheres:
        sql += ' WHERE ' + ' AND '.join(wheres)
    sql += ' ORDER BY created_at DESC'
    rows = conn.execute(sql, ps).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post('/api/reports')
def create_report(data: dict):
    conn = get_db()
    rid = f"RP{datetime.now().strftime('%Y%m%d')}{len(conn.execute('SELECT * FROM reports').fetchall()) + 1:03d}"
    data['id'] = rid
    now = datetime.now().isoformat()
    data['created_at'] = data['updated_at'] = now
    data.setdefault('status', 'draft')
    data.setdefault('pages', 0)
    keys = list(data.keys())
    placeholders = ','.join(['?'] * len(keys))
    conn.execute(f"INSERT INTO reports ({','.join(keys)}) VALUES ({placeholders})", list(data.values()))
    conn.commit()
    conn.close()
    return {'id': rid, 'message': '报告创建成功'}

@app.put('/api/reports/{report_id}')
def update_report(report_id: str, data: dict):
    conn = get_db()
    data['updated_at'] = datetime.now().isoformat()
    sets = ','.join([f'{k}=?' for k in data.keys()])
    conn.execute(f'UPDATE reports SET {sets} WHERE id=?', list(data.values()) + [report_id])
    conn.commit()
    conn.close()
    return {'message': '报告更新成功'}

@app.delete('/api/reports/{report_id}')
def delete_report(report_id: str):
    conn = get_db()
    conn.execute('DELETE FROM reports WHERE id=?', (report_id,))
    conn.commit()
    conn.close()
    return {'message': '报告删除成功'}

# ==================== 供应商管理 ====================
@app.get('/api/suppliers')
def list_suppliers(search: str = Query(None)):
    conn = get_db()
    wheres, ps = [], []
    if search:
        for col in ('id', 'name', 'type', 'contact'):
            wheres.append(f'{col} LIKE ?')
            ps.append(f'%{search}%')
    sql = 'SELECT * FROM suppliers'
    if wheres:
        sql += ' WHERE ' + ' AND '.join(wheres)
    sql += ' ORDER BY rating DESC'
    rows = conn.execute(sql, ps).fetchall()
    conn.close()
    result = []
    for r in rows:
        d = dict(r)
        if d.get('main_products'):
            try:
                d['main_products'] = json.loads(d['main_products'])
            except Exception:
                d['main_products'] = []
        result.append(d)
    return result

@app.post('/api/suppliers')
def create_supplier(data: dict):
    conn = get_db()
    sid = f"SP{len(conn.execute('SELECT * FROM suppliers').fetchall()) + 1:03d}"
    data['id'] = sid
    data['created_at'] = datetime.now().isoformat()
    data.setdefault('main_products', json.dumps([]))
    data.setdefault('rating', 3)
    data.setdefault('status', 'active')
    keys = list(data.keys())
    placeholders = ','.join(['?'] * len(keys))
    conn.execute(f"INSERT INTO suppliers ({','.join(keys)}) VALUES ({placeholders})", list(data.values()))
    conn.commit()
    conn.close()
    return {'id': sid, 'message': '供应商添加成功'}

@app.put('/api/suppliers/{supplier_id}')
def update_supplier(supplier_id: str, data: dict):
    conn = get_db()
    if 'main_products' in data and isinstance(data['main_products'], list):
        data['main_products'] = json.dumps(data['main_products'])
    sets = ','.join([f'{k}=?' for k in data.keys()])
    conn.execute(f'UPDATE suppliers SET {sets} WHERE id=?', list(data.values()) + [supplier_id])
    conn.commit()
    conn.close()
    return {'message': '供应商更新成功'}

@app.delete('/api/suppliers/{supplier_id}')
def delete_supplier(supplier_id: str):
    conn = get_db()
    conn.execute('DELETE FROM suppliers WHERE id=?', (supplier_id,))
    conn.commit()
    conn.close()
    return {'message': '供应商删除成功'}

# ==================== 装修材料 ====================
@app.get('/api/materials')
def list_materials(category: str = Query(None), search: str = Query(None)):
    conn = get_db()
    wheres, ps = [], []
    if category and category != 'all':
        wheres.append('category=?')
        ps.append(category)
    if search:
        for col in ('id', 'name', 'spec'):
            wheres.append(f'{col} LIKE ?')
            ps.append(f'%{search}%')
    sql = 'SELECT * FROM materials'
    if wheres:
        sql += ' WHERE ' + ' AND '.join(wheres)
    sql += ' ORDER BY id'
    rows = conn.execute(sql, ps).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post('/api/materials')
def create_material(data: dict):
    conn = get_db()
    mid = f"MAT{len(conn.execute('SELECT * FROM materials').fetchall()) + 1:03d}"
    data['id'] = mid
    data['created_at'] = datetime.now().isoformat()
    data.setdefault('price', 0)
    data.setdefault('stock', 0)
    data.setdefault('min_stock', 5)
    data.setdefault('status', 'normal')
    data.setdefault('unit', '个')
    keys = list(data.keys())
    placeholders = ','.join(['?'] * len(keys))
    conn.execute(f"INSERT INTO materials ({','.join(keys)}) VALUES ({placeholders})", list(data.values()))
    conn.commit()
    conn.close()
    return {'id': mid, 'message': '材料添加成功'}

@app.put('/api/materials/{material_id}')
def update_material(material_id: str, data: dict):
    conn = get_db()
    sets = ','.join([f'{k}=?' for k in data.keys()])
    conn.execute(f'UPDATE materials SET {sets} WHERE id=?', list(data.values()) + [material_id])
    conn.commit()
    conn.close()
    return {'message': '材料更新成功'}

@app.delete('/api/materials/{material_id}')
def delete_material(material_id: str):
    conn = get_db()
    conn.execute('DELETE FROM materials WHERE id=?', (material_id,))
    conn.commit()
    conn.close()
    return {'message': '材料删除成功'}

# ==================== 采购管理 ====================
@app.get('/api/procurement')
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
    return [dict(r) for r in rows]

@app.post('/api/procurement')
def create_procurement(data: dict):
    conn = get_db()
    pid = f"PO{datetime.now().strftime('%Y%m%d')}{len(conn.execute('SELECT * FROM procurement').fetchall()) + 1:03d}"
    data['id'] = pid
    data['created_at'] = datetime.now().isoformat()
    data.setdefault('status', 'pending')
    keys = list(data.keys())
    placeholders = ','.join(['?'] * len(keys))
    conn.execute(f"INSERT INTO procurement ({','.join(keys)}) VALUES ({placeholders})", list(data.values()))
    conn.commit()
    conn.close()
    return {'id': pid, 'message': '采购单创建成功'}

# ==================== 业务统计API ====================
@app.get('/api/stats/business')
def business_stats():
    conn = get_db()
    contracts = conn.execute('SELECT * FROM contracts').fetchall()
    reports = conn.execute('SELECT * FROM reports').fetchall()
    suppliers = conn.execute("SELECT * FROM suppliers WHERE status='active'").fetchall()
    materials = conn.execute('SELECT * FROM materials').fetchall()
    procurement = conn.execute('SELECT * FROM procurement').fetchall()
    
    total_contract_amount = sum(ct['amount'] for ct in contracts)
    signed_contracts = len([ct for ct in contracts if ct['status'] == 'signed'])
    pending_contracts = len([ct for ct in contracts if ct['status'] == 'pending'])
    
    completed_reports = len([rp for rp in reports if rp['status'] == 'completed'])
    in_progress_reports = len([rp for rp in reports if rp['status'] in ('testing', 'reporting')])
    
    low_stock = len([mt for mt in materials if mt['stock'] <= mt['min_stock']])
    total_material_value = sum(mt['price'] * mt['stock'] for mt in materials)
    
    pending_orders = len([po for po in procurement if po['status'] == 'pending'])
    total_procurement = sum(po['amount'] for po in procurement)
    
    conn.close()
    return {
        'contracts': {'total': len(contracts), 'signed': signed_contracts, 'pending': pending_contracts, 'total_amount': round(total_contract_amount/10000, 1)},
        'reports': {'total': len(reports), 'completed': completed_reports, 'in_progress': in_progress_reports},
        'suppliers': {'total': len(suppliers), 'active': len(suppliers)},
        'materials': {'total': len(materials), 'low_stock': low_stock, 'total_value': round(total_material_value/10000, 1)},
        'procurement': {'total': len(procurement), 'pending': pending_orders, 'total_amount': round(total_procurement/10000, 1)},
    }

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


# ==================== 质量管理体系 API ====================
@app.get('/api/quality-checks')
def get_quality_checks(project_id: str = None, result: str = None):
    conn = get_db()
    conn.row_factory = sqlite3.Row
    query = 'SELECT * FROM quality_checks WHERE 1=1'
    params = []
    if project_id:
        query += ' AND project_id = ?'
        params.append(project_id)
    if result:
        query += ' AND result = ?'
        params.append(result)
    query += ' ORDER BY created_at DESC'
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post('/api/quality-checks')
def create_quality_check(body: dict):
    today = date.today().isoformat()
    qc_id = body.get('id', f'QC{datetime.now().strftime("%Y%m%d%H%M%S")}')
    conn = get_db()
    try:
        conn.execute(
            'INSERT INTO quality_checks (id, project_id, check_type, check_item, standard, result, status, inspector, plan_date, notes, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
            (qc_id, body.get('project_id'), body.get('check_type'), body.get('check_item'),
             body.get('standard'), body.get('result', '待检'), body.get('status', 'pending'),
             body.get('inspector'), body.get('plan_date'), body.get('notes', ''), today, today)
        )
        conn.commit()
        conn.close()
        return {'id': qc_id, 'message': '创建成功'}
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=400, detail=str(e))

@app.put('/api/quality-checks/{qc_id}')
def update_quality_check(qc_id: str, body: dict):
    today = date.today().isoformat()
    conn = get_db()
    try:
        conn.execute(
            'UPDATE quality_checks SET result=?, status=?, inspector=?, actual_date=?, notes=?, updated_at=? WHERE id=?',
            (body.get('result'), body.get('status', 'completed'), body.get('inspector'),
             body.get('actual_date'), body.get('notes'), today, qc_id)
        )
        conn.commit()
        conn.close()
        return {'message': '更新成功'}
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=400, detail=str(e))

@app.delete('/api/quality-checks/{qc_id}')
def delete_quality_check(qc_id: str):
    conn = get_db()
    conn.execute('DELETE FROM quality_checks WHERE id=?', (qc_id,))
    conn.commit()
    conn.close()
    return {'message': '删除成功'}


# ==================== 安全管理 API ====================
@app.get('/api/safety-records')
def get_safety_records(project_id: str = None, level: str = None):
    conn = get_db()
    conn.row_factory = sqlite3.Row
    query = 'SELECT * FROM safety_records WHERE 1=1'
    params = []
    if project_id:
        query += ' AND project_id = ?'
        params.append(project_id)
    if level:
        query += ' AND level = ?'
        params.append(level)
    query += ' ORDER BY created_at DESC'
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post('/api/safety-records')
def create_safety_record(body: dict):
    today = date.today().isoformat()
    sid = body.get('id', f'SF{datetime.now().strftime("%Y%m%d%H%M%S")}')
    conn = get_db()
    try:
        conn.execute(
            'INSERT INTO safety_records (id, project_id, hazard_type, description, level, status, assigned_to, deadline, created_at) VALUES (?,?,?,?,?,?,?,?,?)',
            (sid, body.get('project_id'), body.get('hazard_type'), body.get('description'),
             body.get('level', 'medium'), body.get('status', 'open'), body.get('assigned_to'),
             body.get('deadline'), today)
        )
        conn.commit()
        conn.close()
        return {'id': sid, 'message': '创建成功'}
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=400, detail=str(e))

@app.put('/api/safety-records/{sf_id}')
def update_safety_record(sf_id: str, body: dict):
    today = date.today().isoformat()
    conn = get_db()
    try:
        conn.execute(
            'UPDATE safety_records SET status=?, resolution=?, resolved_date=?, updated_at=? WHERE id=?',
            (body.get('status', 'resolved'), body.get('resolution', ''), today, sf_id)
        )
        conn.commit()
        conn.close()
        return {'message': '更新成功'}
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=400, detail=str(e))

@app.delete('/api/safety-records/{sf_id}')
def delete_safety_record(sf_id: str):
    conn = get_db()
    conn.execute('DELETE FROM safety_records WHERE id=?', (sf_id,))
    conn.commit()
    conn.close()
    return {'message': '删除成功'}


# ==================== 预算管理 API ====================
@app.get('/api/budget-items')
def get_budget_items(project_id: str = None):
    conn = get_db()
    conn.row_factory = sqlite3.Row
    query = 'SELECT * FROM budget_items WHERE 1=1'
    params = []
    if project_id:
        query += ' AND project_id = ?'
        params.append(project_id)
    query += ' ORDER BY created_at DESC'
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.post('/api/budget-items')
def create_budget_item(body: dict):
    today = date.today().isoformat()
    bid = body.get('id', f'BGT{datetime.now().strftime("%Y%m%d%H%M%S")}')
    conn = get_db()
    try:
        conn.execute(
            'INSERT INTO budget_items (id, project_id, category, item, budget, actual, unit, quantity, created_at) VALUES (?,?,?,?,?,?,?,?,?)',
            (bid, body.get('project_id'), body.get('category'), body.get('item'),
             body.get('budget', 0), body.get('actual', 0), body.get('unit', '元'),
             body.get('quantity', 0), today)
        )
        conn.commit()
        conn.close()
        return {'id': bid, 'message': '创建成功'}
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=400, detail=str(e))

@app.put('/api/budget-items/{bg_id}')
def update_budget_item(bg_id: str, body: dict):
    conn = get_db()
    try:
        conn.execute(
            'UPDATE budget_items SET category=?, item=?, budget=?, actual=?, unit=?, quantity=? WHERE id=?',
            (body.get('category'), body.get('item'), body.get('budget', 0),
             body.get('actual', 0), body.get('unit', '元'), body.get('quantity', 0), bg_id)
        )
        conn.commit()
        conn.close()
        return {'message': '更新成功'}
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=400, detail=str(e))

@app.delete('/api/budget-items/{bg_id}')
def delete_budget_item(bg_id: str):
    conn = get_db()
    conn.execute('DELETE FROM budget_items WHERE id=?', (bg_id,))
    conn.commit()
    conn.close()
    return {'message': '删除成功'}


# ==================== 质量管理统计分析 ====================
@app.get('/api/stats/quality')
def quality_stats():
    conn = get_db()
    total = conn.execute('SELECT COUNT(*) FROM quality_checks').fetchone()[0]
    passed = conn.execute("SELECT COUNT(*) FROM quality_checks WHERE result='合格'").fetchone()[0]
    failed = conn.execute("SELECT COUNT(*) FROM quality_checks WHERE result='不合格'").fetchone()[0]
    pending = conn.execute("SELECT COUNT(*) FROM quality_checks WHERE result='待检'").fetchone()[0]
    by_type = {}
    for r in conn.execute('SELECT check_type, COUNT(*) as cnt FROM quality_checks GROUP BY check_type'):
        by_type[r['check_type']] = r['cnt']
    conn.close()
    return {
        'total': total, 'passed': passed, 'failed': failed, 'pending': pending,
        'pass_rate': round(passed / total * 100, 1) if total else 0,
        'by_type': by_type
    }

@app.get('/api/stats/safety')
def safety_stats():
    conn = get_db()
    total = conn.execute('SELECT COUNT(*) FROM safety_records').fetchone()[0]
    open_h = conn.execute("SELECT COUNT(*) FROM safety_records WHERE status='open' AND level='high'").fetchone()[0]
    open_m = conn.execute("SELECT COUNT(*) FROM safety_records WHERE status='open' AND level='medium'").fetchone()[0]
    open_l = conn.execute("SELECT COUNT(*) FROM safety_records WHERE status='open' AND level='low'").fetchone()[0]
    resolved = conn.execute("SELECT COUNT(*) FROM safety_records WHERE status='resolved'").fetchone()[0]
    conn.close()
    return {
        'total': total, 'open': open_h + open_m + open_l, 'resolved': resolved,
        'high_open': open_h, 'medium_open': open_m, 'low_open': open_l
    }


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

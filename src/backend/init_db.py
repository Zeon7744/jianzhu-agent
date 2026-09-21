# -*- coding: utf-8 -*-
"""初始化数据库 - 跨平台版本 (Windows/Linux/macOS)"""
import sqlite3
import json
from datetime import date
from pathlib import Path

# 跨平台路径: Windows/Linux/macOS 均可运行
BASE_DIR = Path(__file__).parent.parent
DB_PATH = str(BASE_DIR / "data" / "db" / "jianjian.db")

today = date.today().isoformat()

conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

# 创建基础表（如不存在）
c.execute("""CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY, name TEXT, client TEXT, type TEXT, lead TEXT,
    status TEXT DEFAULT 'pending', progress INTEGER DEFAULT 0,
    risk TEXT DEFAULT 'low', start_date TEXT, end_date TEXT,
    budget REAL DEFAULT 0, paid REAL DEFAULT 0,
    description TEXT, created_at TEXT, updated_at TEXT
)""")
c.execute("""CREATE TABLE IF NOT EXISTS inspections (
    id TEXT PRIMARY KEY, name TEXT, project_id TEXT, client TEXT, method TEXT,
    status TEXT DEFAULT 'pending', progress INTEGER DEFAULT 0,
    examiner TEXT, result TEXT, plan_date TEXT,
    created_at TEXT, updated_at TEXT
)""")
c.execute("""CREATE TABLE IF NOT EXISTS staff (
    id TEXT PRIMARY KEY, name TEXT, dept TEXT, position TEXT,
    phone TEXT, email TEXT, certs TEXT DEFAULT '[]',
    join_date TEXT, status TEXT DEFAULT 'active', avatar TEXT DEFAULT 'user'
)""")
c.execute("""CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY, type TEXT, name TEXT, amount REAL,
    date TEXT, account TEXT, source TEXT,
    status TEXT DEFAULT 'pending', created_at TEXT
)""")
c.execute("""CREATE TABLE IF NOT EXISTS equipment (
    id TEXT PRIMARY KEY, name TEXT, model TEXT,
    status TEXT DEFAULT 'normal', location TEXT,
    cert_status TEXT, cert_due TEXT, last_maint TEXT,
    next_maint TEXT, value REAL DEFAULT 0, created_at TEXT
)""")
c.execute("""CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY, name TEXT, type TEXT, contact TEXT,
    phone TEXT, email TEXT, projects INTEGER DEFAULT 0,
    amount REAL DEFAULT 0, rating INTEGER DEFAULT 3,
    last_contact TEXT, status TEXT DEFAULT 'active'
)""")
c.execute("""CREATE TABLE IF NOT EXISTS knowledge (
    id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, category TEXT,
    tags TEXT DEFAULT '[]', content TEXT, hits INTEGER DEFAULT 0,
    author TEXT, updated TEXT, created TEXT
)""")
c.execute("""CREATE TABLE IF NOT EXISTS agent_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT, agent TEXT, action TEXT,
    content TEXT, result TEXT, created_at TEXT
)""")
c.execute("""CREATE TABLE IF NOT EXISTS contracts (
    id TEXT PRIMARY KEY, name TEXT, type TEXT, project_id TEXT,
    customer_id TEXT, amount REAL DEFAULT 0, sign_date TEXT,
    start_date TEXT, end_date TEXT, payment_terms TEXT,
    status TEXT DEFAULT 'pending', created_at TEXT
)""")
c.execute("""CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY, title TEXT, type TEXT, inspection_id TEXT,
    project_id TEXT, report_no TEXT, pages INTEGER DEFAULT 0,
    issue_date TEXT, reviewer TEXT, confidentiality TEXT DEFAULT 'internal',
    status TEXT DEFAULT 'draft', created_at TEXT, updated_at TEXT
)""")
c.execute("""CREATE TABLE IF NOT EXISTS suppliers (
    id TEXT PRIMARY KEY, name TEXT, type TEXT, contact TEXT,
    phone TEXT, email TEXT, main_products TEXT DEFAULT '[]',
    rating INTEGER DEFAULT 3, status TEXT DEFAULT 'active', created_at TEXT
)""")
c.execute("""CREATE TABLE IF NOT EXISTS materials (
    id TEXT PRIMARY KEY, name TEXT, spec TEXT, category TEXT,
    price REAL DEFAULT 0, stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 5, unit TEXT DEFAULT '个',
    status TEXT DEFAULT 'normal', created_at TEXT
)""")
c.execute("""CREATE TABLE IF NOT EXISTS procurement (
    id TEXT PRIMARY KEY, material_id TEXT, supplier_id TEXT,
    quantity REAL DEFAULT 0, unit_price REAL DEFAULT 0,
    amount REAL DEFAULT 0, order_date TEXT, expected_date TEXT,
    actual_date TEXT, status TEXT DEFAULT 'pending', created_at TEXT
)""")
c.execute("""CREATE TABLE IF NOT EXISTS quality_checks (
    id TEXT PRIMARY KEY, project_id TEXT, check_type TEXT,
    check_item TEXT, standard TEXT, result TEXT, status TEXT,
    inspector TEXT, plan_date TEXT, notes TEXT,
    created_at TEXT, updated_at TEXT
)""")
c.execute("""CREATE TABLE IF NOT EXISTS safety_records (
    id TEXT PRIMARY KEY, project_id TEXT, hazard_type TEXT,
    description TEXT, level TEXT, status TEXT,
    assigned_to TEXT, deadline TEXT,
    created_at TEXT
)""")
c.execute("""CREATE TABLE IF NOT EXISTS budget_items (
    id TEXT PRIMARY KEY, project_id TEXT, category TEXT,
    item TEXT, budget REAL, actual REAL, unit TEXT,
    quantity REAL, created_at TEXT
)""")
c.execute("""CREATE TABLE IF NOT EXISTS policies (
    id TEXT PRIMARY KEY, title TEXT, category TEXT, level TEXT,
    department TEXT, version TEXT, effective_date TEXT,
    expiry_date TEXT, author TEXT, approver TEXT,
    status TEXT, content TEXT, attachments TEXT,
    created_at TEXT, updated_at TEXT
)""")
c.execute("""CREATE TABLE IF NOT EXISTS qualifications (
    id TEXT PRIMARY KEY, name TEXT, type TEXT, cert_no TEXT,
    issuer TEXT, issue_date TEXT, expiry_date TEXT,
    status TEXT, scope TEXT, renewal_note TEXT, created_at TEXT
)""")
c.execute("""CREATE TABLE IF NOT EXISTS training_records (
    id TEXT PRIMARY KEY, staff_id TEXT, staff_name TEXT,
    course_name TEXT, trainer TEXT, start_date TEXT,
    end_date TEXT, hours INTEGER, result TEXT,
    cert_obtained TEXT, created_at TEXT
)""")
c.execute("""CREATE TABLE IF NOT EXISTS business_processes (
    id TEXT PRIMARY KEY, name TEXT, category TEXT,
    step_count INTEGER, owner TEXT, sla_hours INTEGER,
    status TEXT, description TEXT, created_at TEXT
)""")
c.execute("""CREATE TABLE IF NOT EXISTS process_steps (
    id TEXT PRIMARY KEY, process_id TEXT, step_num INTEGER,
    name TEXT, owner_role TEXT, input_req TEXT,
    output_req TEXT, sla_hours INTEGER,
    check_items TEXT, created_at TEXT
)""")
c.execute("""CREATE TABLE IF NOT EXISTS org_departments (
    id TEXT PRIMARY KEY, name TEXT, parent_id TEXT,
    manager TEXT, manager_id TEXT, headcount INTEGER,
    description TEXT, created_at TEXT, updated_at TEXT
)""")
c.execute("""CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'staff', dept TEXT,
    position TEXT, email TEXT, phone TEXT,
    avatar TEXT DEFAULT 'user', status TEXT DEFAULT 'active',
    last_login TEXT, created_at TEXT
)""")
c.execute("""CREATE TABLE IF NOT EXISTS role_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT, role TEXT NOT NULL,
    module TEXT NOT NULL, can_view INTEGER DEFAULT 1,
    can_create INTEGER DEFAULT 0, can_update INTEGER DEFAULT 0,
    can_delete INTEGER DEFAULT 0, UNIQUE(role, module)
)""")

today = date.today().isoformat()

# 初始化用户数据
if not c.execute('SELECT COUNT(*) FROM users').fetchone()[0]:
    users = [
        ('admin', 'admin123', '张建国', 'admin', '总经理办公室', '总经理', 'admin@jianjian.com', '138****1234', '2024-01-01'),
        ('manager', 'mgr12345', '李明华', 'manager', '检测部', '检测主管', 'mgr@jianjian.com', '139****5678', '2024-01-01'),
        ('staff01', 'staff123', '刘强', 'staff', '检测部', '检测员', 'staff01@jianjian.com', '136****3456', '2024-06-01'),
        ('guest', 'guest123', '访客用户', 'guest', None, None, 'guest@jianjian.com', '', '2024-01-01'),
    ]
    for u in users:
        c.execute('INSERT OR IGNORE INTO users (username,password,name,role,dept,position,email,phone,created_at) VALUES (?,?,?,?,?,?,?,?,?)',
                  (*u, today))
    print(f"Initialized {len(users)} users")

# 初始化角色权限
if not c.execute('SELECT COUNT(*) FROM role_permissions').fetchone()[0]:
    modules = [
        'dashboard', 'projects', 'inspections', 'hr', 'finance', 'equipment',
        'customers', 'compliance', 'knowledge', 'agents', 'settings',
        'contracts', 'reports', 'trade', 'materials', 'procurement', 'budget',
        'policies', 'qualifications', 'training', 'organization',
    ]
    perms = {
        'admin':   {m: (1, 1, 1, 1) for m in modules},
        'manager': {m: (1, 1, 1, 0) for m in modules if m not in ('settings',)},
        'staff':   {m: (1, 0, 0, 0) for m in ['dashboard', 'projects', 'inspections', 'equipment',
                                                 'customers', 'compliance', 'knowledge', 'agents',
                                                 'contracts', 'reports', 'materials', 'budget']},
        'guest':   {m: (1, 0, 0, 0) for m in ['dashboard', 'projects', 'inspections',
                                                 'compliance', 'knowledge', 'agents', 'reports']},
    }
    for role, mp in perms.items():
        for module, (cv, cc, cu, cd) in mp.items():
            c.execute('INSERT OR IGNORE INTO role_permissions (role,module,can_view,can_create,can_update,can_delete) VALUES (?,?,?,?,?,?)',
                      (role, module, cv, cc, cu, cd))
    print(f"Initialized role permissions for {len(perms)} roles")

conn.commit()
conn.close()
print(f'DB initialized at: {DB_PATH}')

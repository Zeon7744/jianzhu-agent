import sqlite3
import json
from datetime import date
DB_PATH = r"D:\项目\开发部\开发git\02\建筑行业检测及信息咨询公司agent\src\data\db\jianjian.db"
today = date.today().isoformat()
conn = sqlite3.connect(DB_PATH)
c = conn.cursor()
c.execute("CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, name TEXT, client TEXT, type TEXT, lead TEXT, status TEXT DEFAULT 'pending', progress INTEGER DEFAULT 0, risk TEXT DEFAULT 'low', start_date TEXT, end_date TEXT, budget REAL DEFAULT 0, paid REAL DEFAULT 0, description TEXT, created_at TEXT, updated_at TEXT)")
c.execute("CREATE TABLE IF NOT EXISTS inspections (id TEXT PRIMARY KEY, name TEXT, project_id TEXT, client TEXT, method TEXT, status TEXT DEFAULT 'pending', progress INTEGER DEFAULT 0, examiner TEXT, result TEXT, plan_date TEXT, created_at TEXT, updated_at TEXT)")
c.execute("CREATE TABLE IF NOT EXISTS staff (id TEXT PRIMARY KEY, name TEXT, dept TEXT, position TEXT, phone TEXT, email TEXT, certs TEXT DEFAULT '[]', join_date TEXT, status TEXT DEFAULT 'active', avatar TEXT DEFAULT 'user')")
c.execute("CREATE TABLE IF NOT EXISTS transactions (id TEXT PRIMARY KEY, type TEXT, name TEXT, amount REAL, date TEXT, account TEXT, source TEXT, status TEXT DEFAULT 'pending', created_at TEXT)")
c.execute("CREATE TABLE IF NOT EXISTS equipment (id TEXT PRIMARY KEY, name TEXT, model TEXT, status TEXT DEFAULT 'normal', location TEXT, cert_status TEXT, cert_due TEXT, last_maint TEXT, next_maint TEXT, value REAL DEFAULT 0, created_at TEXT)")
c.execute("CREATE TABLE IF NOT EXISTS customers (id TEXT PRIMARY KEY, name TEXT, type TEXT, contact TEXT, phone TEXT, email TEXT, projects INTEGER DEFAULT 0, amount REAL DEFAULT 0, rating INTEGER DEFAULT 3, last_contact TEXT, status TEXT DEFAULT 'active')")
c.execute("CREATE TABLE IF NOT EXISTS knowledge (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, category TEXT, tags TEXT DEFAULT '[]', content TEXT, hits INTEGER DEFAULT 0, author TEXT, updated TEXT, created TEXT)")
c.execute("CREATE TABLE IF NOT EXISTS agent_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, agent TEXT, action TEXT, content TEXT, result TEXT, created_at TEXT)")
projects = [('XM2026001','XX大厦主体结构检测','XX地产集团','结构检测','李工','active',75,'medium','2026-08-01','2026-10-15',85,51,'主体结构检测',today,today),('XM2026002','YY桥梁荷载试验','市交通局','桥梁检测','王工','report',90,'low','2026-07-15','2026-09-30',120,120,'桥梁荷载试验',today,today),('XM2026003','ZZ小区房屋安全鉴定','ZZ街道办','安全鉴定','赵工','active',45,'high','2026-09-01','2026-10-08',45,22.5,'房屋安全鉴定',today,today),('XM2026004','AA学校抗震鉴定','区教育局','抗震鉴定','孙工','completed',100,'low','2026-06-01','2026-09-10',68,68,'抗震鉴定',today,today)]
for p in projects: c.execute('INSERT OR IGNORE INTO projects VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', p)
staff = [('EMP001','张建国','技术部','总工程师','138****1234','zhang@example.com',json.dumps(['高级工程师','注册结构工程师']),'2018-03-15','active','user'),('EMP002','李明华','检测部','检测主管','139****5678','li@example.com',json.dumps(['检测师','无损检测II级']),'2019-06-01','active','user'),('EMP003','王小红','咨询部','咨询工程师','137****9012','wang@example.com',json.dumps(['造价工程师']),'2020-01-10','active','user'),('EMP004','刘强','检测部','检测员','136****3456','liu@example.com',json.dumps(['检测师']),'2021-09-01','active','user')]
for s in staff: c.execute('INSERT OR IGNORE INTO staff VALUES (?,?,?,?,?,?,?,?,?,?)', s)
equipment = [('SB001','万能试验机','WE-1000','normal','一楼实验室A','有效','2027-03-15','2026-08-01','2026-11-01',285000,today),('SB002','回弹仪','HJ-2250','normal','检测设备组','有效','2027-01-20','2026-07-15','2026-10-15',3200,today),('SB003','钢筋扫描仪','CSS-2','warning','现场检测组','即将到期','2026-10-01','2026-06-01','2026-09-01',45000,today)]
for e in equipment: c.execute('INSERT OR IGNORE INTO equipment VALUES (?,?,?,?,?,?,?,?,?,?,?)', e)
conn.commit(); conn.close(); print('DB initialized:', DB_PATH)

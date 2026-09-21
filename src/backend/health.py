"""
系统健康检查模块
提供启动自检、运行时健康监控、性能指标收集
"""
import os
import sqlite3
import psutil
import platform
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List


# 跨平台路径: Windows/Linux/macOS 均可运行
DB_PATH = str(Path(__file__).parent.parent / 'data' / 'db' / 'jianjian.db')
START_TIME = time.time()


def get_system_health() -> Dict[str, Any]:
    """
    系统级健康检查
    包括：进程状态、内存、CPU、磁盘、网络
    """
    health = {
        "timestamp": datetime.now().isoformat(),
        "uptime_seconds": round(time.time() - START_TIME, 1),
        "system": {
            "platform": platform.system(),
            "python_version": platform.python_version(),
            "machine": platform.machine(),
        },
        "process": {
            "pid": os.getpid(),
            "memory_mb": round(psutil.Process().memory_info().rss / 1024 / 1024, 1),
            "cpu_percent": psutil.cpu_percent(interval=0.1),
        },
        "disk": {},
        "status": "healthy",
        "checks": [],
    }
    
    # 磁盘检查
    try:
        disk = psutil.disk_usage("/")
        health["disk"] = {
            "total_gb": round(disk.total / 1024**3, 1),
            "used_gb": round(disk.used / 1024**3, 1),
            "free_gb": round(disk.free / 1024**3, 1),
            "percent": disk.percent,
        }
        if disk.percent > 90:
            health["status"] = "warning"
            health["checks"].append({"name": "disk_space", "status": "warning", "message": "磁盘空间不足"})
        else:
            health["checks"].append({"name": "disk_space", "status": "ok", "message": "磁盘空间正常"})
    except Exception as e:
        health["checks"].append({"name": "disk_space", "status": "error", "message": str(e)})
    
    # 内存检查
    try:
        mem = psutil.virtual_memory()
        health["memory"] = {
            "total_gb": round(mem.total / 1024**3, 1),
            "available_gb": round(mem.available / 1024**3, 1),
            "percent": mem.percent,
        }
        if mem.percent > 90:
            health["status"] = "warning"
            health["checks"].append({"name": "memory", "status": "warning", "message": "内存使用率过高"})
        else:
            health["checks"].append({"name": "memory", "status": "ok", "message": "内存使用正常"})
    except Exception as e:
        health["checks"].append({"name": "memory", "status": "error", "message": str(e)})
    
    # CPU检查
    try:
        cpu_count = psutil.cpu_count()
        cpu_percent = psutil.cpu_percent(interval=0.5)
        health["cpu"] = {
            "cores": cpu_count,
            "percent": cpu_percent,
        }
        if cpu_percent > 80:
            health["status"] = "warning"
            health["checks"].append({"name": "cpu", "status": "warning", "message": f"CPU使用率{cpu_percent}%"})
        else:
            health["checks"].append({"name": "cpu", "status": "ok", "message": f"CPU使用率{cpu_percent}%"})
    except Exception as e:
        health["checks"].append({"name": "cpu", "status": "error", "message": str(e)})
    
    return health


def get_database_health() -> Dict[str, Any]:
    """数据库健康检查"""
    result = {
        "status": "healthy",
        "checks": [],
        "tables": {},
        "connection": "ok",
    }
    
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # 检查数据库文件
        if os.path.exists(DB_PATH):
            size_mb = os.path.getsize(DB_PATH) / 1024 / 1024
            result["db_file"] = {
                "path": str(DB_PATH),
                "size_mb": round(size_mb, 2),
                "exists": True,
            }
        else:
            result["db_file"] = {"exists": False}
            result["status"] = "error"
            conn.close()
            return result
        
        # 检查表结构完整性
        expected_tables = [
            "users", "role_permissions", "projects", "inspections",
            "staff", "transactions", "equipment", "customers",
            "knowledge", "agent_logs", "contracts", "reports",
            "suppliers", "materials", "procurement",
        ]
        
        actual_tables = [r[0] for r in cursor.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
        ).fetchall()]
        
        missing = [t for t in expected_tables if t not in actual_tables]
        if missing:
            result["status"] = "warning"
            result["checks"].append({
                "name": "table_integrity",
                "status": "warning",
                "message": f"缺少表: {', '.join(missing)}",
            })
        else:
            result["checks"].append({
                "name": "table_integrity",
                "status": "ok",
                "message": f"全部{len(expected_tables)}张表存在",
            })
        
        # 检查数据量
        for table in expected_tables:
            if table in actual_tables:
                try:
                    count = cursor.execute(f"SELECT COUNT(*) FROM [{table}]").fetchone()[0]
                    result["tables"][table] = count
                except Exception:
                    result["tables"][table] = -1
        
        # 检查关键表数据量
        critical_checks = [
            ("users", 1),
            ("role_permissions", 1),
            ("projects", 1),
        ]
        for table, min_count in critical_checks:
            count = result["tables"].get(table, 0)
            if count < min_count:
                result["checks"].append({
                    "name": f"{table}_data",
                    "status": "warning",
                    "message": f"{table}表数据不足（{count}条，期望>= {min_count}）",
                })
            else:
                result["checks"].append({
                    "name": f"{table}_data",
                    "status": "ok",
                    "message": f"{table}表数据正常（{count}条）",
                })
        
        conn.close()
        
    except Exception as e:
        result["status"] = "error"
        result["connection"] = f"error: {str(e)}"
        result["checks"].append({"name": "database_connection", "status": "error", "message": str(e)})
    
    return result


def get_api_health() -> Dict[str, Any]:
    """API服务健康检查"""
    import urllib.request
    import json
    
    endpoints = [
        "/api/health",
        "/api/projects",
        "/api/inspections",
        "/api/staff",
        "/api/contracts",
        "/api/reports",
        "/api/suppliers",
        "/api/materials",
        "/api/procurement",
        "/api/stats/dashboard",
        "/api/stats/business",
        "/api/finance/stats",
    ]
    
    result = {
        "status": "healthy",
        "endpoints": {},
        "checks": [],
    }
    
    for ep in endpoints:
        try:
            req = urllib.request.Request(f"http://localhost:8000{ep}")
            resp = urllib.request.urlopen(req, timeout=3)
            data = json.loads(resp.read())
            result["endpoints"][ep] = {"status": "ok", "code": resp.status}
        except Exception as e:
            result["endpoints"][ep] = {"status": "error", "error": str(e)[:100]}
            result["status"] = "degraded"
            result["checks"].append({
                "name": f"api_{ep}",
                "status": "error",
                "message": f"{ep}: {str(e)[:50]}",
            })
    
    # 检查是否有足够端点正常
    ok_count = sum(1 for v in result["endpoints"].values() if v["status"] == "ok")
    if ok_count < len(endpoints) * 0.8:
        result["status"] = "degraded"
        result["checks"].append({
            "name": "api_overall",
            "status": "warning",
            "message": f"仅{ok_count}/{len(endpoints)}个API端点正常",
        })
    else:
        result["checks"].append({
            "name": "api_overall",
            "status": "ok",
            "message": f"{ok_count}/{len(endpoints)}个API端点正常",
        })
    
    return result


def run_startup_self_check() -> Dict[str, Any]:
    """
    启动自检 - 系统启动时执行完整健康检查
    返回详细自检报告
    """
    report = {
        "timestamp": datetime.now().isoformat(),
        "phase": "startup",
        "overall_status": "healthy",
        "checks": [],
        "warnings": [],
        "errors": [],
    }
    
    # Phase 1: 文件系统检查
    phase1 = {
        "name": "file_system",
        "status": "ok",
        "details": {},
    }
    
    required_files = {
        "db": str(DB_PATH),
    }
    
    all_ok = True
    for label, path in required_files.items():
        exists = os.path.exists(path)
        phase1["details"][label] = {"exists": exists, "path": path}
        if not exists:
            all_ok = False
            phase1["status"] = "error"
            report["errors"].append(f"必需文件缺失: {label} -> {path}")
    
    if all_ok:
        report["checks"].append(phase1)
    
    # Phase 2: 数据库检查
    db_health = get_database_health()
    if db_health["status"] != "healthy":
        report["overall_status"] = db_health["status"]
    report["checks"].append(db_health)
    
    # Phase 3: 依赖模块检查
    phase3 = {
        "name": "dependencies",
        "status": "ok",
        "modules": {},
    }
    deps = ["fastapi", "uvicorn", "sqlite3", "echarts"]
    for dep in deps:
        try:
            if dep == "sqlite3":
                __import__(dep)
                phase3["modules"][dep] = "ok"
            elif dep == "echarts":
                # 前端依赖，跳过后端检查
                phase3["modules"][dep] = "skipped"
            else:
                __import__(dep)
                phase3["modules"][dep] = "ok"
        except ImportError as e:
            phase3["modules"][dep] = f"missing: {e}"
            phase3["status"] = "warning"
            report["warnings"].append(f"依赖模块缺失: {dep}")
    
    report["checks"].append(phase3)
    
    # Phase 4: Agent模块检查
    phase4 = {
        "name": "agent_module",
        "status": "ok",
        "agents_loaded": 0,
    }
    try:
        from .agents import AGENT_PROFILES, list_agents
        agents = list_agents()
        phase4["agents_loaded"] = len(agents)
        phase4["agent_names"] = [a["name"] for a in agents]
        report["checks"].append(phase4)
    except Exception as e:
        phase4["status"] = "error"
        phase4["error"] = str(e)
        report["overall_status"] = "error"
        report["errors"].append(f"Agent模块加载失败: {e}")
        report["checks"].append(phase4)
    
    # Phase 5: 数据一致性检查
    phase5 = {
        "name": "data_consistency",
        "status": "ok",
        "checks": [],
    }
    try:
        import sqlite3
        conn = sqlite3.connect(DB_PATH)
        
        # 检查合同与项目关联
        contracts = conn.execute("SELECT project_id FROM contracts").fetchall()
        projects = conn.execute("SELECT id FROM projects").fetchall()
        project_ids = {p["id"] for p in projects}
        orphaned_contracts = [c["project_id"] for c in contracts if c["project_id"] and c["project_id"] not in project_ids and c["project_id"] != ""]
        if orphaned_contracts:
            phase5["checks"].append({
                "name": "contract_project_refs",
                "status": "warning",
                "message": f"{len(orphaned_contracts)}个合同引用了不存在的项目",
            })
            report["warnings"].append(f"合同引用了不存在的项目: {orphaned_contracts[:3]}")
        else:
            phase5["checks"].append({"name": "contract_project_refs", "status": "ok"})
        
        # 检查报告与检测任务关联
        reports = conn.execute("SELECT inspection_id FROM reports").fetchall()
        inspections = conn.execute("SELECT id FROM inspections").fetchall()
        inspection_ids = {i["id"] for i in inspections}
        orphaned_reports = [r["inspection_id"] for r in reports if r["inspection_id"] and r["inspection_id"] not in inspection_ids and r["inspection_id"] != ""]
        if orphaned_reports:
            phase5["checks"].append({
                "name": "report_inspection_refs",
                "status": "warning",
                "message": f"{len(orphaned_reports)}个报告引用了不存在的检测任务",
            })
        else:
            phase5["checks"].append({"name": "report_inspection_refs", "status": "ok"})
        
        conn.close()
        report["checks"].append(phase5)
    except Exception as e:
        phase5["status"] = "error"
        phase5["error"] = str(e)
        report["checks"].append(phase5)
    
    # 更新总体状态
    if report["errors"]:
        report["overall_status"] = "error"
    elif report["warnings"]:
        report["overall_status"] = "warning"
    
    return report


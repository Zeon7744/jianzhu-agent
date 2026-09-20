from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import sqlite3
import json
import os
from datetime import datetime
import sys
sys.path.insert(0, os.path.dirname(__file__))
# Use inline init instead
from typing import List, Optional

# 数据库初始化
DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'db', 'jianjian.db')

async def lifespan(app: FastAPI):
    pass
    yield
@asynccontextmanager

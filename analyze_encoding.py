# -*- coding: utf-8 -*-
import sys
sys.path.insert(0, r'D:\项目\开发部\开发git\02\建筑行业检测及信息咨询公司agent\src\backend')

# Read the existing agents.py as bytes to detect encoding
with open(r'D:\项目\开发部\开发git\02\建筑行业检测及信息咨询公司agent\src\backend\agent\agents.py', 'rb') as f:
    raw = f.read()

# Check BOM
has_bom = raw.startswith(b'\xef\xbb\xbf')
print(f'Has BOM: {has_bom}')
print(f'First 200 bytes repr: {raw[:200]}')

# Try to decode as utf-8
try:
    text = raw.decode('utf-8')
    print('UTF-8 decode OK')
except:
    text = raw.decode('gbk', errors='replace')
    print('Decoded as GBK')

# Find the last agent entry before COLLABORATION_MATRIX
import re
# Find all "id": "AG..." patterns
ids = re.findall(r'"id":\s*"AG(\d+)"', text)
print(f'Existing agent IDs: {ids}')
print(f'Total agents found: {len(ids)}')

# Find position to insert (before COLLABORATION_MATRIX)
col_idx = text.find('COLLABORATION_MATRIX')
print(f'COLLABORATION_MATRIX at position: {col_idx}')

# Also find ANALYSIS_TEMPLATES position in brain.py
brain_path = r'D:\项目\开发部\开发git\02\建筑行业检测及信息咨询公司agent\src\backend\agent\brain.py'
with open(brain_path, 'rb') as f:
    brain_raw = f.read()
brain_ids = re.findall(r'"id":\s*"AG(\d+)"', brain_raw.decode('utf-8', errors='replace'))
print(f'Brain.py agent IDs: {brain_ids}')

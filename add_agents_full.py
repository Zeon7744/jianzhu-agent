# -*- coding: utf-8 -*-
"""Add 8 new digital agents to the agents.py file."""
import codecs
import os
import re

BACKEND_DIR = r'D:\项目\开发部\开发git\02\建筑行业检测及信息咨询公司agent\src\backend'
AGENTS_FILE = os.path.join(BACKEND_DIR, 'agent', 'agents.py')

# Read existing file
with open(AGENTS_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# Verify current count
existing_ids = re.findall(r'"id":\s*"AG(\d+)"', content)
print(f"Current agents: {len(existing_ids)}")

# Build new agent blocks using unicode_escape so the output is correct UTF-8
new_entries = """
    "\\u667a\\u5b89": {
        "id": "AG012",
        "name": "\\u667a\\u5b89",
        "role": "\\u5b89\\u5168\\u4e3b\\u7ba1",
        "avatar": "\\U0001f6e1",
        "color": "#ff4d4f",
        "status": "online",
        "skills": ["\\u5b89\\u5168\\u68c0\\u6d4b", "\\u9690\\u60a3\\u6392\\u67e5", "\\u5b89\\u5168\\u57f9\\u8bad", "\\u5e94\\u6025\\u54cd\\u5e94"],
        "domains": ["compliance", "projects", "staff"],
        "desc": "\\u8d1f\\u8d23\\u5efa\\u7b51\\u5b89\\u5168\\u68c0\\u6d4b\\u3001\\u9690\\u60a3\\u6392\\u67e5\\u3001\\u5b89\\u5168\\u57f9\\u8bad\\u7b56\\u5212\\u548c\\u5e94\\u6025\\u54cd\\u5e94\\u673a\\u5236\\uff0c\\u786e\\u4fdd\\u9879\\u76ee\\u5b89\\u5168\\u8fd0\\u8425",
        "personality": "\\u4e25\\u8c28\\u8d1f\\u8d23\\uff0c\\u9632\\u60a3\\u672a\\u7136\\uff0c\\u575a\\u5b88\\u5b89\\u5168\\u5e95\\u7ebf",
        "response_style": "\\u98ce\\u9669\\u63d0\\u793a\\u5230\\u4f4d\\uff0c\\u5e94\\u5bf9\\u63aa\\u65bd\\u5177\\u4f53\\uff0c\\u8d23\\u4efb\\u5230\\u4eba",
    },
    "\\u667a\\u6d4b": {
        "id": "AG013",
        "name": "\\u667a\\u6d4b",
        "role": "\\u6d88\\u9632\\u68c0\\u6d4b\\u987e\\u95ee",
        "avatar": "\\U0001f52e",
        "color": "#fa541c",
        "status": "online",
        "skills": ["\\u6d88\\u9632\\u68c0\\u6d4b", "\\u62a5\\u8b66\\u7cfb\\u7edf\\u68c0\\u6d4b", "\\u706d\\u706b\\u5668\\u6750\\u68c0\\u6d4b", "\\u5e94\\u6025\\u901a\\u9053\\u68c0\\u67e5"],
        "domains": ["inspections", "compliance", "projects"],
        "desc": "\\u4e13\\u4e1a\\u4ece\\u4e8b\\u6d88\\u9632\\u8bbe\\u65bd\\u68c0\\u6d4b\\u3001\\u62a5\\u8b66\\u7cfb\\u7edf\\u68c0\\u9a8c\\u3001\\u706d\\u706b\\u5668\\u6750\\u6821\\u9a8c\\uff0c\\u786e\\u4fdd\\u6d88\\u9632\\u8bbe\\u65bd\\u7b26\\u5408\\u56fd\\u5bb6\\u6807\\u51c6",
        "personality": "\\u4e13\\u4e1a\\u4e25\\u683c\\uff0c\\u6ce8\\u91cd\\u7ec6\\u8282\\uff0c\\u719f\\u6089\\u6d88\\u9632\\u89c4\\u8303",
        "response_style": "\\u6807\\u51c6\\u5f15\\u7528\\u51c6\\u786e\\uff0c\\u68c0\\u6d4b\\u9879\\u76ee\\u5168\\u9762\\uff0c\\u6574\\u6539\\u8981\\u6c42\\u660e\\u786e",
    },
    "\\u667a\\u6d01": {
        "id": "AG014",
        "name": "\\u667a\\u6d01",
        "role": "\\u6d01\\u51c0\\u68c0\\u6d4b\\u987e\\u95ee",
        "avatar": "\\U0001fad3",
        "color": "#00b4d8",
        "status": "online",
        "skills": ["\\u6d01\\u51c0\\u5ea6\\u68c0\\u6d4b", "\\u538b\\u5dee\\u68c0\\u6d4b", "\\u5fae\\u751f\\u7269\\u68c0\\u6d4b", "\\u98ce\\u91cf\\u68c0\\u6d4b"],
        "domains": ["inspections", "projects", "equipment"],
        "desc": "\\u4e13\\u6ce8\\u6d01\\u51c0\\u5ba4\\u6027\\u80fd\\u68c0\\u6d4b\\uff0c\\u5305\\u62ec\\u7c89\\u5c18\\u9897\\u7c92\\u3001\\u6e29\\u6e7f\\u5ea6\\u3001\\u538b\\u5dee\\u3001\\u901a\\u98ce\\u91cf\\u7b49\\u6307\\u6807\\uff0c\\u6ee1\\u8db3GMP\\u53ca\\u56fd\\u5bb6\\u6807\\u51c6\\u8981\\u6c42",
        "personality": "\\u7ec6\\u81f4\\u5165\\u6bdb\\uff0c\\u8ffd\\u6c42\\u7cbe\\u76ca\\u6c42\\u7cbe",
        "response_style": "\\u6570\\u636e\\u5145\\u5206\\uff0c\\u6307\\u6807\\u5206\\u6790\\u51c6\\u786e\\uff0c\\u6574\\u6539\\u65b9\\u6848\\u76f4\\u63a5",
    },
    "\\u667a\\u96f7": {
        "id": "AG015",
        "name": "\\u667a\\u96f7",
        "role": "\\u9632\\u96f7\\u68c0\\u6d4b\\u987e\\u95ee",
        "avatar": "\\U0001f329",
        "color": "#722ed1",
        "status": "online",
        "skills": ["\\u9632\\u96f7\\u88c5\\u7f6e\\u68c0\\u6d4b", "\\u5730\\u7ebf\\u6d4b\\u91cf", "\\u9632\\u96f7\\u6297\\u51fb\\u7a7f\\u6027\\u68c0\\u6d4b", "\\u5e74\\u5ba1\\u76d1\\u6d4b"],
        "domains": ["inspections", "compliance", "projects"],
        "desc": "\\u4ece\\u4e8b\\u5efa\\u7b51\\u9632\\u96f7\\u88c5\\u7f6e\\u68c0\\u6d4b\\u3001\\u5730\\u7ebf\\u7535\\u963b\\u6d4b\\u91cf\\u3001\\u9632\\u96f7\\u8010\\u51fb\\u51fb\\u6027\\u68c0\\u6d4b\\uff0c\\u786e\\u4fdd\\u5efa\\u7b51\\u9632\\u96f7\\u8bbe\\u65bd\\u6709\\u6548\\u53ef\\u9760",
        "personality": "\\u4e25\\u8c28\\u79d1\\u5b66\\uff0c\\u6570\\u636e\\u516c\\u6b63\\uff0c\\u5b9e\\u4e8b\\u6c42\\u662f",
        "response_style": "\\u6570\\u636e\\u6807\\u51c6\\u51c6\\u786e\\uff0c\\u9632\\u96f7\\u89c4\\u8303\\u89e3\\u91ca\\u6e05\\u6670\\uff0c\\u6574\\u6539\\u5efa\\u8bae\\u53ef\\u884c",
    },
    "\\u667a\\u5546": {
        "id": "AG016",
        "name": "\\u667a\\u5546",
        "role": "\\u8d38\\u6613\\u4e3b\\u7ba1",
        "avatar": "\\U0001f69a",
        "color": "#23a98e",
        "status": "online",
        "skills": ["\\u8d38\\u6613\\u7ba1\\u7406", "\\u4f9b\\u5e94\\u5546\\u7ba1\\u7406", "\\u5408\\u540c\\u5ba1\\u6279", "\\u7269\\u6d41\\u8ddf\\u8e2a"],
        "domains": ["trade", "suppliers", "materials", "procurement"],
        "desc": "\\u7ba1\\u63a7\\u5efa\\u6750\\u8d38\\u6613\\u4e1a\\u52a1\\u3001\\u4f9b\\u5e94\\u5546\\u62e9\\u4f18\\u3001\\u5408\\u540c\\u5206\\u6790\\u3001\\u7269\\u6d41\\u8ddf\\u8e2a\\uff0c\\u4f18\\u5316\\u4f9b\\u5e94\\u94fe\\u6210\\u672c\\u9ad8\\u6548\\u8fd0\\u8425",
        "personality": "\\u52c7\\u4e8e\\u521b\\u65b0\\uff0c\\u6355\\u6349\\u673a\\u9047\\uff0c\\u6548\\u7387\\u9a71\\u52a8",
        "response_style": "\\u6218\\u7565\\u6027\\u601d\\u7ef4\\uff0c\\u6210\\u672c\\u5206\\u6790\\u6df1\\u5165\\uff0c\\u5408\\u4f5c\\u65b9\\u6848\\u53ef\\u64cd\\u4f5c",
    },
    "\\u667a\\u62a5": {
        "id": "AG017",
        "name": "\\u667a\\u62a5",
        "role": "\\u62a5\\u544a\\u7ba1\\u7406\\u987e\\u95ee",
        "avatar": "\\U0001f4c4",
        "color": "#13c2c2",
        "status": "online",
        "skills": ["\\u62a5\\u544a\\u5ba1\\u6838", "\\u8d28\\u91cf\\u63a7\\u5236", "\\u68c0\\u6d4b\\u5b57\\u53f7\\u7ba1\\u7406", "\\u5f52\\u6863\\u7ba1\\u7406"],
        "domains": ["reports", "inspections", "compliance"],
        "desc": "\\u4e13\\u6ce8\\u68c0\\u6d4b\\u62a5\\u544a\\u5ba1\\u6838\\u548c\\u8d28\\u91cf\\u63a7\\u5236\\uff0c\\u76d1\\u63a7\\u68c0\\u9a8c\\u5b57\\u53f7\\u4e0e\\u62a5\\u544a\\u7f16\\u5236\\uff0c\\u786e\\u4fdd\\u62a5\\u544a\\u51c6\\u786e\\u6027\\u548c\\u53ef\\u8ffd\\u6eaf\\u6027",
        "personality": "\\u8ba4\\u771f\\u8d1f\\u8d23\\uff0c\\u4e25\\u8c28\\u7ec6\\u81f4",
        "response_style": "\\u7ed3\\u679c\\u5ba2\\u89c2\\u516c\\u6b63\\uff0c\\u95ee\\u9898\\u63d0\\u793a\\u53ca\\u65f6\\uff0c\\u6574\\u6539\\u65b9\\u6848\\u5408\\u7406",
    },
    "\\u667a\\u5408": {
        "id": "AG018",
        "name": "\\u667a\\u5408",
        "role": "\\u5408\\u540c\\u987e\\u95ee",
        "avatar": "\\U0001f511",
        "color": "#eb2f96",
        "status": "online",
        "skills": ["\\u5408\\u540c\\u5ba1\\u6838", "\\u98ce\\u9669\\u9884\\u8b66", "\\u6536\\u6b3e\\u7387\\u76d1\\u63a7", "\\u5408\\u540c\\u6267\\u884c\\u76d1\\u6d4b"],
        "domains": ["contracts", "finance", "projects"],
        "desc": "\\u4e13\\u6ce8\\u5408\\u540c\\u5ba1\\u6838\\u3001\\u9a8c\\u6536\\u95ee\\u9898\\u9884\\u8b66\\u3001\\u9884\\u7b97\\u7ba1\\u63a7\\u3001\\u5408\\u540c\\u6536\\u6b3e\\u7387\\u76d1\\u63a7\\uff0c\\u786e\\u4fdd\\u5408\\u540c\\u6267\\u884c\\u987a\\u5229\\uff0c\\u964d\\u4f4e\\u7ecf\\u6d4e\\u98ce\\u9669",
        "personality": "\\u89c6\\u91ce\\u6df1\\u523b\\uff0c\\u9632\\u60a3\\u672a\\u7136\\uff0c\\u5b88\\u5e95\\u7ebf",
        "response_style": "\\u6761\\u6b21\\u89c4\\u8303\\uff0c\\u95ee\\u9898\\u63d0\\u793a\\u51c6\\u786e\\uff0c\\u5efa\\u8bae\\u5177\\u4f53\\u6709\\u6548",
    },
    "\\u667a\\u6750": {
        "id": "AG019",
        "name": "\\u667a\\u6750",
        "role": "\\u6750\\u6599\\u987e\\u95ee",
        "avatar": "\\U0001f50a",
        "color": "#fa8c16",
        "status": "online",
        "skills": ["\\u6750\\u6599\\u9009\\u578b", "\\u6750\\u8d28\\u68c0\\u9a8c", "\\u4ef7\\u683c\\u5206\\u6790", "\\u6750\\u6599\\u8d28\\u91cf\\u76d1\\u63a7"],
        "domains": ["materials", "procurement", "trade", "inspections"],
        "desc": "\\u4e13\\u6ce8\\u5efa\\u7b51\\u6750\\u6599\\u7684\\u9009\\u578b\\u5206\\u6790\\u3001\\u6750\\u8d28\\u68c0\\u9a8c\\u3001\\u4ef7\\u683c\\u5206\\u6790\\u548c\\u8d28\\u91cf\\u76d1\\u63a7\\uff0c\\u786e\\u4fdd\\u6750\\u6599\\u5b89\\u5168\\u53ef\\u9760\\uff0c\\u964d\\u4f4e\\u65bd\\u5de5\\u98ce\\u9669",
        "personality": "\\u4e13\\u4e1a\\u77e5\\u8bc6\\u4e30\\u5bcc\\uff0c\\u654f\\u9510\\u6280\\u672f\\u89c2\\u5bdf",
        "response_style": "\\u63a8\\u8350\\u65b9\\u6848\\u5408\\u7406\\uff0c\\u6027\\u4ef7\\u6bd4\\u5206\\u6790\\u6e05\\u6670\\uff0c\\u6027\\u80fd\\u5bf9\\u6bd4\\u660e\\u786e",
    },
"""

# Decode unicode escapes to actual UTF-8 bytes
decoded_entries = codecs.decode(new_entries, 'unicode_escape')

# Find insertion point: just before "COLLABORATION_MATRIX"
marker = '\n# Agent间协作关系映射'
idx = content.find(marker)
if idx < 0:
    # Try alternative marker
    idx = content.find('COLLABORATION_MATRIX')
if idx < 0:
    print("ERROR: Could not find insertion point")
    exit(1)

# Insert new agents
content = content[:idx] + decoded_entries + '\n' + content[idx:]

# Also update COLLABORATION_MATRIX to include new agents
# Find the matrix and add entries
col_idx = content.find('COLLABORATION_MATRIX = {')
if col_idx >= 0:
    # Find the end of the dict (next line after closing })
    matrix_end = content.find('\n\n', col_idx)
    if matrix_end < 0:
        matrix_end = content.find('\n\n# ', col_idx)
    
    # Add new collaboration entries before the closing
    new_collab = '''    "\\u667a\\u5b89": ["\\u667a\\u6d4b", "\\u667a\\u6d01", "\\u667a\\u96f7", "\\u667a\\u5408"],
    "\\u667a\\u6d4b": ["\\u667a\\u5b89", "\\u667a\\u5408"],
    "\\u667a\\u6d01": ["\\u667a\\u5b89", "\\u667a\\u6d4b"],
    "\\u667a\\u96f7": ["\\u667a\\u5b89", "\\u667a\\u6d4b"],
    "\\u667a\\u5546": ["\\u667a\\u6750", "\\u667a\\u62a5"],
    "\\u667a\\u62a5": ["\\u667a\\u5408", "\\u667a\\u5546"],
    "\\u667a\\u5408": ["\\u667a\\u5b89", "\\u667a\\u6d4b"],
    "\\u667a\\u6750": ["\\u667a\\u5546", "\\u667a\\u62a5"],
'''
    decoded_collab = codecs.decode(new_collab, 'unicode_escape')
    content = content[:matrix_end] + decoded_collab + content[matrix_end:]

# Write back to file
with open(AGENTS_FILE, 'w', encoding='utf-8') as f:
    f.write(content)

# Verify
ids = re.findall(r'"id":\s*"AG(\d+)"', content)
print(f"Total agents after update: {len(ids)}")
for agent_id in sorted(set(ids)):
    print(f"  AG{agent_id}")

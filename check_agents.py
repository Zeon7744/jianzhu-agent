import sys
sys.path.insert(0, r'D:\项目\开发部\开发git\02\建筑行业检测及信息咨询公司agent\src\backend')
from agent.agents import list_agents, get_agent
agents = list_agents()
print(f'Total agents: {len(agents)}')
for a in agents:
    print(f'  {a["id"]} | {a["name"]} | {a["role"]}')

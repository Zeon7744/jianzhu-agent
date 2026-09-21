# 建检智管 - AI Agent 模块
# 包含：数字员工定义、推理引擎、知识库检索、协作通信

from .agents import AGENT_PROFILES, get_agent, list_agents
from .brain import AgentBrain
from .knowledge import KnowledgeRetriever
from .collaboration import AgentCollaborator, agent_message_bus

__all__ = [
    'AGENT_PROFILES', 'get_agent', 'list_agents',
    'AgentBrain', 'KnowledgeRetriever',
    'AgentCollaborator', 'agent_message_bus',
]

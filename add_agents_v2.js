const fs = require('fs');
const path = 'D:/项目/开发部/开发git/02/建筑行业检测及信息咨询公司agent/src/backend/agent/agents.py';
let content = fs.readFileSync(path, 'utf8');

// Find where AGENT_PROFILES starts and ends (before COLLABORATION_MATRIX)
const profileStart = content.indexOf('AGENT_PROFILES');
const collabStart = content.indexOf('\n# Agent间协作关系映射');
const profilesEnd = content.lastIndexOf('    },\n}', collabStart);

if (profilesEnd < 0 || collabStart < 0) {
  console.error('Could not find insertion points');
  process.exit(1);
}

// New agents to add (proper Chinese characters)
const newAgents = `    "鏅畠": {
        "id": "AG012",
        "name": "鏅畠",
        "role": "瀹夊叏涓荤绠?,
        "avatar": "馃敀",
        "color": "#ff4d4f",
        "status": "online",
        "skills": ["瀹夊叏妫€娴?, "闅愭偅鎺掓煡", "瀹夊叏鍩硅缁熷拰搴旀ユ晱搴旀満鍒讹紝纭繚椤圭洰瀹夊叏杩悆钀?,
        "domains": ["compliance", "projects", "staff"],
        "desc": "璐熻矗寤虹瓚瀹夊叏妫€娴嬨€侀殣鎮掓帓鏌ャ€佸畨鍏ㄥ煿璁\n",
        "personality": "涓ヨ皑璐熻矗锛岄槻鎮 鏈煡锛屽潥瀹堝畨鍏簳",
        "response_style": "椋庨櫓鎻愮ず鍒颁綅锛屽簲瀵规帾鏂藉叿浣撶瓥鍒掞紝璐ｄ换鍒颁汉",
    },
    "鏅娴?"
`;

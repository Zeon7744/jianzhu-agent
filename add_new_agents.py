# -*- coding: utf-8 -*-
import sys
sys.path.insert(0, r'D:\项目\开发部\开发git\02\建筑行业检测及信息咨询公司agent\src\backend')

from agent.agents import AGENT_PROFILES, COLLABORATION_MATRIX, MESSAGE_PROTOCOLS, list_agents

# Use \u escapes for Chinese to avoid encoding issues
# 鏅畠 = \u667a\u5b89
# 鏅娴 = \u667a\u6d4b (消防)
# 鏅洁 = \u667a\u6d01 (洁净)
# 鏅烽雷 = \u667a\u96f7 (防雷)
# 鏅啋 = \u667a\u5546 (商贸)
# 鏅 姹 = \u667a\u62a5 (报告)
# 鏅鍚� = \u667a\u5408 (合同)
# 鏅\u6750 = \u667a\u6750 (材料)

AN  = '\u667a\u5b89'   # 鏅畠
CE  = '\u667a\u6d4b'   # 鏅 娴?
JIE = '\u667a\u6d01'   # 鏅 娲x7e
LEI = '\u667a\u96f7'   # 鏅 闆?
MAO = '\u667a\u5546'   # 鏅 啋
BAO = '\u667a\u62a5'   # 鏅 姹?
HE  = '\u667a\u5408'   # 鏅 鍚?
CAI = '\u667a\u6750'   # 鏅 鏉?

new_agents = {
    AN: {
        "id": "AG012", "name": AN, "role": "瀹夊叏涓荤鐞?,
        "avatar": "\U0001f6e1", "color": "#ff4d4f", "status": "online",
        "skills": ["瀹夊叏妫€娴?, "闅愭偅鎺掓煡", "瀹夊叏鍩硅缁熷拰搴旀ユ晱搴旀満鍒讹紝纭繚椤圭洰瀹夊叏杩悆钀?"],
        "domains": ["compliance", "projects", "staff"],
        "desc": "璐熻矗寤虹瓚瀹夊叏妫€娴嬨€侀殣鎮掓帓鏌ャ€佸畨鍏ㄥ煿璁绛栧垝鍜屽簲鎬搴旂浡鍒讹紝纭繚椤圭洰瀹夊叏杩悆钀?",
        "personality": "涓ヨ皑璐熻矗锛岄槻镇 鏈煡锛屽潥瀹堝畨鍏簳",
        "response_style": "椋庨櫓鎻愮ず鍒颁綅锛屽簲瀵规帾鏂藉叿浣撶瓥鍒掞紝璐ｄ换鍒颁汉",
    },
    CE: {
        "id": "AG013", "name": CE, "role": "娑堥槻妫€娴嬮【闂?",
        "avatar": "\U0001f52e", "color": "#fa541c", "status": "online",
        "skills": ["娑堥槻妫€娴?, "鎶ヨ 绯荤粺妫€娴?, "鐏灭伃鍣ㄦ潗妫€娴?, "搴旀€鏁忓簲閫氶亾妫€鏌?"],
        "domains": ["inspections", "compliance", "projects"],
        "desc": "涓撲笟浠庝簨娑堥槻璁炬柦妫€娴嬨€佹姤璀︾郴缁熸瑙勮寖",
        "personality": "涓撲笟涓ユ牸锛屾敞閲嶇粏鑺傦紝鐔熸倝娑堥槻瑙勮寖",
        "response_style": "鏍囧噯寮曠敤鍑嗙‘锛屾ā鍨嬪疄渚嬪熀纭€鏁版嵁鍏ㄩ潰锛屾暣鏀硅鏂圭洿鎺?",
    },
    JIE: {
        "id": "AG014", "name": JIE, "role": "娲佸噣妫€娴嬮【闂?",
        "avatar": "\U0001fad3", "color": "#00b4d8", "status": "online",
        "skills": ["娲佸噣搴6;鍘嬪樊妫€娴?, "寰敓鐗╂娴?, "椋庨噺妫€娴?"],
        "domains": ["inspections", "projects", "equipment"],
        "desc": "涓撴敞娲佸噣瀹ゆ性妫€娴嬶紝鍖呮嫭绮夊皹棰楃矑銆佹俯婀垮害銆佸帇宸銆侀馃棿鍔涳紝婊¤冻GMP鍙婂浗瀹舵爣鍑嗘要�",
        "personality": "缁嗚嚧鍏瘺锛岃拷姹傜簿鐩婃眰绮?,
        "response_style": "鏁版嵁鍏呭垎锛屾寚鏍囧垎鏋愬噯纭紝鏁存敼鏂妗堢洿鎺?",
    },
    LEI: {
        "id": "AG015", "name": LEI, "role": "闃查浘妫€娴嬮【闂?",
        "avatar": "\U0001f329", "color": "#722ed1", "status": "online",
        "skills": ["闃查浘瑁呯疆妫€娴?, "鍦扮嚎娴?, "闃查浘鎶楀嚮绌挎€ф娴?, "骞村鍒判旂綉",
        "domains": ["inspections", "compliance", "projects"],
        "desc": "浠庝簨寤虹瓚闃查浘瑁呯疆妫€娴嬨€佸湴绾跨數闃绘祴閲忋€侀槻闆捐€愬啿鍑绘€ф娴嬶紝纭繚寤虹瓚闃查浘璁炬柦鏈夋晥鍙彲闈",
        "personality": "涓ヨ皑绉戝锛屾暟鎹叕姝o紝瀹炰簨姹傛槸",
        "response_style": "鏁版嵁鏍囧噯鍑嗙 '锛岄槻闆惧 涔夎В閲婃竻鏅帮紝鏁存敼寤鸿鍙彲琛?",
    },
    MAO: {
        "id": "AG016", "name": MAO, "role": "璐告槗涓荤鐞?,
        "avatar": "\U0001f69a", "color": "#23a98e", "status": "online",
        "skills": ["璐告槗绠″, "渚涘簲鍟嗙鍚堝悓瀹℃壒", "鐗╂祦璺熻釜"],
        "domains": ["trade", "suppliers", "materials", "procurement"],
        "desc": "绠℃帶寤烘潗璐告槗涓氬姟銆佷緵搴斿晢鎷╀紭銆佸悎鍚屽鍒嗘瀽銆佺墿娴佽窡韪傦紝浼樺寲渚涘簲閾炬垚鏈珮鏁堣繍钀?",
        "personality": "鍕囦簬鍒涙柊锛岄攣鎹掓満閬囷紝鏁堢巼椹卞姩",
        "response_style": "鎴樼暐鎬濈淮锛屾垚鏈垎鏋愭繁鍏ワ紝鍚堜綔鏂妗堝彲鎿嶄綔",
    },
    BAO: {
        "id": "AG017", "name": BAO, "role": "鎶ュ憡绠＄悊椤鹃棶",
        "avatar": "\U0001f4c4", "color": "#13c2c2", "status": "online",
        "skills": ["鎶ュ憡瀹℃牳", "璐ㄩ噺鎺у埗", "妫€娴嫈鍙蜂浜岀璁板綍绠″浔", "褰掓。绠″浔"],
        "domains": ["reports", "inspections", "compliance"],
        "desc": "涓撴敞妫€娴嫈娔妗堣川閲忔帶鍒讹紝鐩戞帶楠妫€娴嫈鍙风鎶ュ憡缂栧埗",
        "personality": "璁ょ湡璐熻矗锛屼弗璋ㄧ粏鑷?,
        "response_style": "缁撴灉瀹㈣傚叕姝o紝闂棰樻彁绀哄強鏃讹紝鏁存敼鏂妗堝悎鐞?",
    },
    HE: {
        "id": "AG018", "name": HE, "role": "鍚堝悓椤鹃棶",
        "avatar": "\U0001f511", "color": "#eb2f96", "status": "online",
        "skills": ["鍚堝悓瀹℃牳", "椋庨櫓棰勮", "鏀 鐜 鐩戞帶", "鍚堝悓鎵ц鐩戞娴嬬洃鎺",
        "domains": ["contracts", "finance", "projects"],
        "desc": "涓撴敞鍚堝悓瀹℃牳銆侀獙鏀堕棶棰樺拰棰勭畻绠 鍚堝悓鏀 鐜 鐩戞帶锛岀 ‘淇濆悎鍚屾墽琛岄『鍒╋紝闄嶄綆缁忔祹椋庨櫓",
        "personality": "瑙嗛噹娣卞埢锛岄槻镇 鏈煡锛岀 瀹堝簳绾?,
        "response_style": "鏉 °鐩戞帶瑙勮寖锛岄棶棰樻彁绀哄噯纭紝寤鸿鍏蜂綋鏈夋晥",
    },
    CAI: {
        "id": "AG019", "name": CAI, "role": "鏉愭枡椤鹃棶",
        "avatar": "\U0001f50a", "color": "#fa8c16", "status": "online",
        "skills": ["鏉愭枡閫夊瀷", "鏉愯川妫楠?", "浠锋牸鍒嗘瀽", "鏉愭枡璐ㄩ噺鐩戞帶"],
        "domains": ["materials", "procurement", "trade", "inspections"],
        "desc": "涓撴敞寤虹瓚鏉愭枡鐨勯€夊瀷鍒嗘瀽銆佹潗璐ㄦ鍙樸€佷环鏍煎拰璐ㄩ噺鐩戞帶锛岀 ‘淇濇潗鏂欏畨鍏ㄥ彲闈狅紝闄嶄綆鏂藉伐椋庨櫓",
        "personality": "涓撲笟鐭ヨ瘑涓板瘜锛屾晫閿 鎶€鏈潵鏂?",
        "response_style": "鎺ㄨ崘鏂妗堝悎鐞嗭紝鎬т环姣斿垎鏋愭竻鏅帮紝鎬ц兘瀵 姣旀槑纭?",
    },
}

for name, profile in new_agents.items():
    AGENT_PROFILES[name] = profile
    print(f"  Added: {profile['id']} | {name} | {profile['role']}")

print(f"\nTotal agents: {len(AGENT_PROFILES)}")

# Update collaboration matrix
COLLABORATION_MATRIX[AN] = [CE, JIE, LEI, HE]
COLLABORATION_MATRIX[CE] = [AN, HE]
COLLABORATION_MATRIX[JIE] = [AN, CE]
COLLABORATION_MATRIX[LEI] = [AN, CE]
COLLABORATION_MATRIX[MAO] = [CAI, BAO]
COLLABORATION_MATRIX[BAO] = [HE, MAO]
COLLABORATION_MATRIX[HE] = [AN, CE]
COLLABORATION_MATRIX[CAI] = [MAO, BAO]

# Add message protocols
MESSAGE_PROTOCOLS["safety_alert"] = {"sender": "*", "recipients": [AN, HE], "priority": "high"}
MESSAGE_PROTOCOLS["fire_inspection"] = {"sender": "*", "recipients": [CE, AN], "priority": "high"}
MESSAGE_PROTOCOLS["cleanroom_request"] = {"sender": "*", "recipients": [JIE, AN], "priority": "normal"}
MESSAGE_PROTOCOLS["lightning_request"] = {"sender": "*", "recipients": [LEI, AN], "priority": "normal"}
MESSAGE_PROTOCOLS["trade_opportunity"] = {"sender": "*", "recipients": [MAO, CAI], "priority": "medium"}
MESSAGE_PROTOCOLS["report_review"] = {"sender": "*", "recipients": [BAO, HE], "priority": "normal"}

print("Collaboration matrix and protocols updated.")

# Persist changes to file
agents_path = r'D:\项目\开发部\开发git\02\建筑行业检测及信息咨询公司agent\src\backend\agent\agents.py'
# Read existing file, replace the dict content
with open(agents_path, 'r', encoding='utf-8') as f:
    old_content = f.read()

# Write updated profiles to file by replacing the AGENT_PROFILES dict
import re
# Find the dict content between AGENT_PROFILES = { and the closing } before COLLABORATION_MATRIX
pattern = r"(AGENT_PROFILES: Dict\[str, dict\] = \{)(.*?)(\n\n# Agent)"
replacement = r'\1' + old_content[old_content.find('{')+1:old_content.find('COLLABORATION_MATRIX')].rstrip() + '\n' + r'\3'

# Actually, simpler: just write the full updated file
lines = old_content.split('\n')
# Find start and end of dict
start_idx = None
end_idx = None
for i, line in enumerate(lines):
    if 'AGENT_PROFILES: Dict[str, dict] = {' in line:
        start_idx = i
    if start_idx is not None and line.strip() == '}' and i > start_idx:
        end_idx = i
        break

if start_idx is not None and end_idx is not None:
    # Rebuild the dict with all agents
    # Collect all agent entries from old content between { and }
    agent_block = '\n'.join(lines[start_idx+1:end_idx])
    
    # We'll just do a full file rewrite
    pass

print("\nAll agents:")
for a in list_agents():
    print(f"  {a['id']} | {a['name']} | {a['role']}")
